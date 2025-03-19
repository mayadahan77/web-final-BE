import mongoose, { Document } from "mongoose";

export interface IComments extends Document {
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

const commentModel = mongoose.model<IComments>("Comment", commentSchema);
export default commentModel;
