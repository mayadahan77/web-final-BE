import { Request, Response } from "express";
import commentsModel, { IComments } from "../models/comments_model";
import BaseController from "./base_controller";
import userModel from "../models/users_model";
import { base } from "../file_upload_service";

class CommentsController extends BaseController<IComments> {
  constructor() {
    super(commentsModel);
  }

  private async populateComment(item: IComments) {
    if (item.senderId !== "ChatGPT") {
      const user = await userModel.findOne({ _id: item.senderId });
      return {
        ...item.toObject(),
        senderName: user?.fullName,
        senderProfile: user?.imgUrl,
      };
    } else {
      return {
        ...item.toObject(),
        senderName: "ChatGPT",
        senderProfile: base + "public/chatgpt.png",
      };
    }
  }

  async create(req: Request, res: Response) {
    const userId = req.params.userId;
    const post = {
      ...req.body,
      senderId: userId,
    };
    req.body = post;
    const body = req.body;
    try {
      const item = await this.model.create(body);
      const populatedItem = await this.populateComment(item);
      res.status(201).send(populatedItem);
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async getCommentsByPostId(req: Request, res: Response) {
    const filter = req.params.id;
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
      if (filter) {
        const items = await this.model.find({ postId: filter }).skip(skip).limit(limit);
        const totalItems = await this.model.countDocuments({ postId: filter });
        const populatedItems = await Promise.all(items.map(this.populateComment.bind(this)));
        res.send({
          totalItems,
          items: populatedItems,
        });
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async updateItem(req: Request, res: Response) {
    const id = req.params.id;
    const body = req.body;

    try {
      const updatedComment = await this.model.findByIdAndUpdate(id, body, { new: true });
      if (!updatedComment) {
        res.status(404).send("Comment not found");
        return;
      }

      const populatedItem = await this.populateComment(updatedComment);
      res.status(200).send(populatedItem);
    } catch (error) {
      res.status(400).send(error);
    }
  }
}

export default new CommentsController();
