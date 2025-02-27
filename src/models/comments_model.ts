import mongoose from "mongoose";

export interface IComments {
  postId: string;
  content: string;
  senderId: string;
}

const commentSchema = new mongoose.Schema({
  postId: {
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
});

const commentModel = mongoose.model("Comment", commentSchema);
export default commentModel;
