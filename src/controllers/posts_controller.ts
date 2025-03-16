import { Request, Response } from "express";
import postModel, { IPost } from "../models/posts_model";
import BaseController from "./base_controller";
import userModel from "../models/users_model";
import commentModel from "../models/comments_model";
import { base } from "../file_upload_service";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
import userModel from "../models/users_model";
import commentModel from "../models/comments_model";
import { base } from "../file_upload_service";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class PostsController extends BaseController<IPost> {
  constructor() {
    super(postModel);
  }

  async create(req: Request, res: Response) {
    const userId = req.params.userId;
    const image = req.file ? base + req.file?.path : null;
    const image = req.file ? base + req.file?.path : null;
    const post = {
      ...req.body,
      imgUrl: image,
      imgUrl: image,
      senderId: userId,
    };
    req.body = post;

    const body = req.body;
    try {
      const createdPost = await this.model.create(body);
      if (process.env.NODE_ENV !== "test") {
        const query = "Generate a short 10 words comment content about this post title:" + createdPost.title;

        const chatGPTResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          store: true,
          messages: [
            { role: "system", content: "You are a helpful assistant that comments on posts." },
            { role: "user", content: query },
          ],
        });

        const chatGPTComment = chatGPTResponse.choices[0]?.message?.content || "Interesting post!";
        const cleanedText = chatGPTComment.replace(/^"|"$/g, "");

        const newComment = {
          postId: createdPost._id,
          content: cleanedText,
          senderId: "ChatGPT",
        };
        try {
          await commentModel.create(newComment);
        } catch (error) {
          res.status(400).send(error);
        }
      }
      res.status(201).send(createdPost);
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async getAll(req: Request, res: Response) {
    const filter = req.query.sender;
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
      let items;
      let totalItems;
      if (filter) {
        items = await this.model.find({ senderId: filter }).sort({ createdAt: -1 }).skip(skip).limit(limit);
        totalItems = await this.model.countDocuments({ senderId: filter });
      } else {
        items = await this.model.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        totalItems = await this.model.countDocuments();
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
      res.send({
        totalItems,
        items: populatedItems,
      });
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

  async updateItem(req: Request, res: Response) {
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

  async removeImage(req: Request, res: Response) {
    const postId = req.params.id;

    try {
      const post = await postModel.findByIdAndUpdate(postId, { imgUrl: null }, { new: true });
      if (!post) {
        res.status(404).send(`${postId ? "Post" : "User"} not found`);
        return;
      }
      res.status(200).send(post);
    } catch (error) {
      res.status(500).send(error);
    }
  }
}

export default new PostsController();
