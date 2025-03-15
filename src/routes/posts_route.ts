import express from "express";
const router = express.Router();
import postsController from "../controllers/posts_controller";
import { authMiddleware } from "../controllers/auth_controller";
import { upload } from "../file_upload_service";

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: The Posts API
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
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the post
 *           example: My first post
 *         content:
 *           type: string
 *           description: The content of the post
 *           example: This is the content of my first post.
 *         senderId:
 *           type: string
 *           description: The ID of the user who created the post
 *           example: user123
 *       required:
 *         - title
 *         - content
 *         - senderId
 */

/**
 * @swagger
 * /posts/:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get("/", authMiddleware, postsController.getAll.bind(postsController));

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The post object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found.
 */
router.get("/:id", authMiddleware, postsController.getById.bind(postsController));

/**
 * @swagger
 * /posts/:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: Post created successfully.
 */
router.post("/", authMiddleware, upload.single("image"), postsController.create.bind(postsController));

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: Post updated successfully.
 *       404:
 *         description: Post not found.
 */
router.put("/:id", authMiddleware, upload.single("image"), postsController.updateItem.bind(postsController));

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully.
 *       404:
 *         description: Post not found.
 */
router.delete("/:id", authMiddleware, postsController.deleteItem.bind(postsController));

router.put("/removeImage/:id", authMiddleware, postsController.removeImage.bind(postsController));

export default router;
