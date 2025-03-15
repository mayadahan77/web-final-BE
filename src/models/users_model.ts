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
<<<<<<< HEAD
  imgUrl?: string;
=======
>>>>>>> main
>>>>>>> 5ba6ed9903ae22c818647aae98281253ea656d71
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
>>>>>>> 5ba6ed9903ae22c818647aae98281253ea656d71
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
<<<<<<< HEAD
  imgUrl: {
    type: String,
  },
=======
>>>>>>> main
>>>>>>> 5ba6ed9903ae22c818647aae98281253ea656d71
  refreshToken: {
    type: [String],
    default: [],
  },
});

const userModel = mongoose.model<IUser>("User", userSchema);
export default userModel;
