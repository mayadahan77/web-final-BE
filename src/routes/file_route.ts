import express from "express";
const router = express.Router();
import multer from "multer";
import userModel from "../models/users_model";
import postModel from "../models/posts_model";

const base = process.env.DOMAIN_BASE + "/";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname
      .split(".")
      .filter(Boolean) // removes empty extensions (e.g. `filename...txt`)
      .slice(1)
      .join(".");
    cb(null, Date.now() + "." + ext);
  },
});
const upload = multer({ storage: storage });

router.post("/", upload.single("file"), async (req, res) => {
  console.log("router.post(/file: " + base + req.file?.path);
  const updatedBody = {
    imgUrl: base + req.file?.path,
  };
  if (req.body?.postId) {
    const post = await postModel.findByIdAndUpdate(req.body?.postId, updatedBody, { new: true });
    res.status(200).send({ url: base + req.file?.path, post: post?.toObject() });
  } else {
    const user = await userModel.findByIdAndUpdate(req.body?.userId, updatedBody, { new: true });
    res.status(200).send({ url: base + req.file?.path, user: user?.toObject() });
  }
});
export = router;
