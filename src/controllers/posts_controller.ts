import { Request, Response } from "express";
import postModel, { IPost } from "../models/posts_model";
import BaseController from "./base_controller";
import userModel from "../models/users_model";
import commentModel from "../models/comments_model";

class PostsController extends BaseController<IPost> {
  constructor() {
    super(postModel);
  }

  async create(req: Request, res: Response) {
    const userId = req.params.userId;
    const post = {
      ...req.body,
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
        items = await this.model.find({ senderId: filter });
      } else {
        items = await this.model.find();
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
}

export default new PostsController();
