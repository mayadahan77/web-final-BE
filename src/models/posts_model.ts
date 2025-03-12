import mongoose from "mongoose";

export interface IPost {
  title: string;
  content: string;
  senderId: string;
  imgUrl: string;
  usersIdLikes?: string[];
  updatedAt?: Date;
}

const postSchema = new mongoose.Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    imgUrl: {
      type: String,
    },
    usersIdLikes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true } // This adds createdAt and updatedAt automatically
);

const postModel = mongoose.model<IPost>("Post", postSchema);
export default postModel;
