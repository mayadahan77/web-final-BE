import { Request, Response } from "express";
import userModel, { IUser } from "../models/users_model";
import BaseController from "./base_controller";
import bcrypt from "bcrypt";
import { base } from "../file_upload_service";

class UsersController extends BaseController<IUser> {
  constructor() {
    super(userModel);
  }

  async create(req: Request, res: Response) {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = {
      ...req.body,
      password: hashedPassword,
    };
    req.body = user;
    super.create(req, res);
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
        res.status(200).send(rs);
      }
      return;
    } catch (error) {
      res.status(400).send(error);
    }
  }
}

export default new UsersController();
