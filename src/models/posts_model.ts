import mongoose from "mongoose";

export interface IPost {
  title: string;
  content: string;
  senderId: string;
}

const postSchema = new mongoose.Schema<IPost>({
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
  }
});

const postModel = mongoose.model<IPost>("Post", postSchema);
export default postModel;
