import { NextFunction, Request, Response } from "express";
import userModel, { IUser } from "../models/users_model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Document } from "mongoose";
<<<<<<< HEAD
import { OAuth2Client } from "google-auth-library/build/src/auth/oauth2client";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleSignin = async (req: Request, res: Response) => {
  const credential = req.body.credential;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log(payload);

    const email = payload?.email;
    const name = payload?.name;
    let user = await userModel.findOne({ email: email });
    if (user == null) {
      user = await userModel.create({
        email: email,
        userName: email,
        fullName: name,
        imgUrl: payload?.picture,
        password: "google-signin",
      });
    }
    const tokens = await generateToken(user._id);
    if (!tokens) {
      res.status(500).send("Server Error");
      return;
    }
    if (!user.refreshToken) {
      user.refreshToken = [];
    }
    user.refreshToken.push(tokens.refreshToken);
    await user.save();
    res.status(200).send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: user,
    });
  } catch (err) {
    res.status(400).send(`error missing email or password, ${err}`);
  }
};
=======
>>>>>>> main

const register = async (req: Request, res: Response) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
<<<<<<< HEAD
    let imgUrl = req.body.imgUrl;
    if (!imgUrl) imgUrl = null;

=======
>>>>>>> main
    const user = await userModel.create({
      email: req.body.email,
      userName: req.body.userName,
      fullName: req.body.fullName,
      password: hashedPassword,
<<<<<<< HEAD
      imgUrl: imgUrl,
      refreshToken: [],
    });

    const tokens = await generateToken(user._id.toString());
    if (!tokens) {
      res.status(500).json({ message: "Error generating token" });
    } else {
      user.refreshToken = [tokens?.refreshToken];
      await user.save();
    }

    res.status(200).send({ ...user.toObject(), accessToken: tokens?.accessToken });
=======
    });
    res.status(200).send(user);
>>>>>>> main
  } catch (err) {
    res.status(400).send(err);
  }
};

type tTokens = {
  accessToken: string;
  refreshToken: string;
};
<<<<<<< HEAD
const generateToken = async (userId: string): Promise<tTokens | null> => {
=======
const generateToken = (userId: string): tTokens | null => {
>>>>>>> main
  if (!process.env.TOKEN_SECRET) {
    return null;
  }
  // generate token
  const random = Math.random().toString();
  const accessToken = jwt.sign(
    {
      _id: userId,
      random: random,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRES }
  );
  const refreshToken = jwt.sign(
    {
      _id: userId,
      random: random,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
  );
  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

const login = async (req: Request, res: Response) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      res.status(400).send("wrong userName or password");
      return;
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      res.status(400).send("wrong userName or password");
      return;
    }
    if (!process.env.TOKEN_SECRET) {
      res.status(500).send("Server Error");
      return;
    }

<<<<<<< HEAD
    const tokens = await generateToken(user._id);
=======
    const tokens = generateToken(user._id);
>>>>>>> main
    if (!tokens) {
      res.status(500).send("Server Error");
      return;
    }
    if (!user.refreshToken) {
      user.refreshToken = [];
    }
    user.refreshToken.push(tokens.refreshToken);
    await user.save();
    res.status(200).send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
<<<<<<< HEAD
      user: user,
=======
      _id: user._id,
>>>>>>> main
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

type tUser = Document<unknown, {}, IUser> &
  IUser &
  Required<{
    _id: string;
  }> & {
    __v: number;
  };
const verifyRefreshToken = (refreshToken: string | undefined) => {
  return new Promise<tUser>((resolve, reject) => {
    //get refresh token from body
    if (!refreshToken) {
      reject("fail");
      return;
    }
    //verify token
    if (!process.env.TOKEN_SECRET) {
      reject("fail");
      return;
    }
    jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err: any, payload: any) => {
      if (err) {
        reject("fail");
        return;
      }
      //get the user id fromn token
      const userId = payload._id;
      try {
        //get the user form the db
        const user = await userModel.findById(userId);
        if (!user) {
          reject("fail");
          return;
        }
        if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
          user.refreshToken = [];
          await user.save();
          reject("fail");
          return;
        }
        const tokens = user.refreshToken!.filter((token) => token !== refreshToken);
        user.refreshToken = tokens;
        resolve(user);
      } catch (err) {
        reject("fail");
        return;
      }
    });
  });
};
const logout = async (req: Request, res: Response) => {
  try {
    const user = await verifyRefreshToken(req.body.refreshToken);
    await user.save();
    res.status(200).send("success");
  } catch (err) {
    res.status(400).send("fail");
  }
};
const refresh = async (req: Request, res: Response) => {
  try {
    const user = await verifyRefreshToken(req.body.refreshToken);
    if (!user) {
      res.status(400).send("fail");
      return;
    }
<<<<<<< HEAD
    const tokens = await generateToken(user._id);
=======
    const tokens = generateToken(user._id);
>>>>>>> main
    if (!tokens) {
      res.status(500).send("Server Error");
      return;
    }
    if (!user.refreshToken) {
      user.refreshToken = [];
    }
    user.refreshToken.push(tokens.refreshToken);
    await user.save();
    res.status(200).send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      _id: user._id,
    });
    //send new token
  } catch (err) {
<<<<<<< HEAD
    res.status(400).send(err);
=======
    res.status(400).send("fail");
>>>>>>> main
  }
};

type Payload = {
  _id: string;
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
<<<<<<< HEAD
  const authorization = req.header("Authorization");
=======
  const authorization = req.header("authorization");
>>>>>>> main
  const token = authorization && authorization.split(" ")[1];

  if (!token) {
    res.status(401).send("Access Denied");
    return;
  }
  if (!process.env.TOKEN_SECRET) {
    res.status(500).send("Server Error");
    return;
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
    if (err) {
      res.status(401).send("Access Denied");
      return;
    }
    req.params.userId = (payload as Payload)._id;
    next();
  });
};

export default {
  register,
  login,
<<<<<<< HEAD
  googleSignin,
=======
>>>>>>> main
  refresh,
  logout,
};
