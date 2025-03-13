import express from "express";
const router = express.Router();
<<<<<<< HEAD
import userModel from "../models/users_model";
import { base, upload } from "../file_upload_service";

router.post("/", upload.single("file"), async (req, res) => {
  console.log("router.post(/file: " + base + req.file?.path);
  const updatedBody = {
    imgUrl: base + req.file?.path,
  };
  const user = await userModel.findByIdAndUpdate(req.body?.userId, updatedBody, { new: true });
=======
import multer from "multer";
import userModel from "../models/users_model";

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
  const userBody = {
    imgUrl: base + req.file?.path,
  };
  const user = await userModel.findByIdAndUpdate(req.body?.userId, userBody, { new: true });
>>>>>>> 5ba6ed9903ae22c818647aae98281253ea656d71
  res.status(200).send({ url: base + req.file?.path, user: user?.toObject() });
});
export = router;
