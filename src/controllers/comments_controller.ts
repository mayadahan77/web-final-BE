import { Request, Response } from "express";
import commentsModel, { IComments } from "../models/comments_model";
import BaseController from "./base_controller";
import userModel from "../models/users_model";

class CommentsController extends BaseController<IComments> {
  constructor() {
    super(commentsModel);
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
      const user = await userModel.findOne({ _id: item.senderId });
      const populatedItem = {
        ...item.toObject(),
        senderName: user?.fullName,
        senderProfile: user?.imgUrl,
      };
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
        const populatedItems = await Promise.all(
          items.map(async (i) => {
            const user = await userModel.findOne({ _id: i.senderId });
            return {
              ...i.toObject(),
              senderName: user?.fullName,
              senderProfile: user?.imgUrl,
            };
          })
        );
        res.send({
          totalItems,
          items: populatedItems,
        });
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }
}

export default new CommentsController();
