import { Request, Response } from "express";
import userModel, { IUser } from "../models/users_model";
import BaseController from "./base_controller";
import bcrypt from "bcrypt";

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
}

export default new UsersController();
