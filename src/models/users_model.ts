import mongoose from "mongoose";

export interface IUser {
  email: string;
  userName: string;
  password: string;
  fullName: string;
  _id?: string;
  refreshToken?: string[];
<<<<<<< HEAD
  imgUrl?: string;
=======
>>>>>>> main
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
<<<<<<< HEAD
  fullName: {
    type: String,
    required: true,
=======
  fullName:{
    type:String,
    required: true,
    unique: true,
>>>>>>> main
  },
  password: {
    type: String,
    required: true,
  },
<<<<<<< HEAD
  imgUrl: {
    type: String,
  },
=======
>>>>>>> main
  refreshToken: {
    type: [String],
    default: [],
  },
});

const userModel = mongoose.model<IUser>("User", userSchema);
export default userModel;
