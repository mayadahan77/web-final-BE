import express from "express";
const router = express.Router();
import userModel from "../models/users_model";
import { base, upload } from "../file_upload_service";

router.post("/", upload.single("file"), async (req, res) => {
  console.log("router.post(/file: " + base + req.file?.path);
  const updatedBody = {
    imgUrl: base + req.file?.path,
  };
  const user = await userModel.findByIdAndUpdate(req.body?.userId, updatedBody, { new: true });
  res.status(200).send({ url: base + req.file?.path, user: user?.toObject() });
});

// router.put("/remove-img", upload.single("file"), async (req, res) => {
//   const userId = req.body?.userId;
//   const postId = req.body?.postId;

//   try {
//     const item = postId
//       ? await postModel.findByIdAndUpdate(postId, { imgUrl: null }, { new: true })
//       : await userModel.findByIdAndUpdate(userId, { imgUrl: null }, { new: true });
//     if (!item) {
//       res.status(404).send(`${postId ? "Post" : "User"} not found`);
//       return;
//     }
//     res.status(200).send(item);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

export = router;
