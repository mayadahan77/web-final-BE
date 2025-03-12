import { Request, Response } from "express";
import postModel, { IPost } from "../models/posts_model";
import BaseController from "./base_controller";
import userModel from "../models/users_model";
import commentModel from "../models/comments_model";
import { base } from "../file_upload_service";

class PostsController extends BaseController<IPost> {
  constructor() {
    super(postModel);
  }

  async create(req: Request, res: Response) {
    const userId = req.params.userId;
    const image = req.file ? base + req.file?.path : null;
    const post = {
      ...req.body,
      imgUrl: image,
      senderId: userId,
    };
    req.body = post;
    super.create(req, res);
  }

  async getAll(req: Request, res: Response) {
    const filter = req.query.sender;
    try {
      let items;
      if (filter) {
        items = await this.model.find({ senderId: filter }).sort({ createdAt: -1 });
      } else {
        items = await this.model.find().sort({ createdAt: -1 });
      }
      const populatedItems = await Promise.all(
        items.map(async (i) => {
          const user = await userModel.findOne({ _id: i.senderId });
          const commentsCount = await commentModel.countDocuments({ postId: i._id });
          return {
            ...i.toObject(),
            senderName: user?.fullName,
            senderProfile: user?.imgUrl,
            commentsCount: commentsCount,
          };
        })
      );
      res.send(populatedItems);
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const item = await this.model.findById(id);
      if (item != null) {
        const user = await userModel.findOne({ _id: item.senderId });
        const commentsCount = await commentModel.countDocuments({ postId: item._id });
        const populatedItem = {
          ...item.toObject(),
          senderName: user?.fullName,
          senderProfile: user?.imgUrl,
          commentsCount: commentsCount,
        };

        res.send(populatedItem);
      } else {
        res.status(404).send("not found");
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async updateItem(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    let body = {};
    if (req.file) {
      body = {
        ...req.body,
        imgUrl: base + req.file?.path,
      };
    } else {
      body = req.body;
    }
    try {
      const rs = await this.model.findByIdAndUpdate(id, body, { new: true });
      if (!rs) {
        res.status(404).send();
      } else {
        const user = await userModel.findOne({ _id: rs.senderId });
        const commentsCount = await commentModel.countDocuments({ postId: rs._id });
        const populatedItem = {
          ...rs.toObject(),
          senderName: user?.fullName,
          senderProfile: user?.imgUrl,
          commentsCount: commentsCount,
        };

        res.send(populatedItem);
      }
      return;
    } catch (error) {
      res.status(400).send(error);
    }
  }
}

export default new PostsController();
