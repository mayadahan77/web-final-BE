import mongoose from "mongoose";

export interface IUser {
  email: string;
  userName: string;
  password: string;
  fullName: string;
  _id?: string;
  refreshToken?: string[];
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  fullName:{
    type:String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: [String],
    default: [],
  },
});

const userModel = mongoose.model<IUser>("User", userSchema);
export default userModel;
