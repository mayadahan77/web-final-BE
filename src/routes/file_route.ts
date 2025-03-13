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
export = router;
