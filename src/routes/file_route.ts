import express from "express";
const router = express.Router();
import userModel from "../models/users_model";
import { base, upload } from "../file_upload_service";

/**
 * @swagger
 * tags:
 *   name: File
 *   description: The File Upload API
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /file:
 *   post:
 *     summary: Upload a file
 *     description: Upload a file and update the user's profile image URL.
 *     tags: [File]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload.
 *               userId:
 *                 type: string
 *                 description: The ID of the user whose profile image is being updated.
 *                 example: 60d0fe4f5311236168a109ca
 *     responses:
 *       200:
 *         description: File uploaded successfully and user profile updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: The URL of the uploaded file.
 *                   example: http://localhost:3000/public/uploads/1681234567890.png
 *                 user:
 *                   type: object
 *                   description: The updated user object.
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request or file upload failed.
 *       500:
 *         description: Server error.
 */
router.post("/", upload.single("file"), async (req, res) => {
  console.log("router.post(/file: " + base + req.file?.path);
  const updatedBody = {
    imgUrl: base + req.file?.path,
  };
  const user = await userModel.findByIdAndUpdate(req.body?.userId, updatedBody, { new: true });
  res.status(200).send({ url: base + req.file?.path, user: user?.toObject() });
});

export = router;
