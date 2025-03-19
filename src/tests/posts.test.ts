import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel from "../models/posts_model";
import { Express } from "express";
import userModel, { IUser } from "../models/users_model";

let app: Express;

type User = IUser & { token?: string };
const testUser: User = {
  email: "test@user.com",
  userName: "tests user",
  password: "testpassword",
  fullName: "john lenon",
};

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await postModel.deleteMany();
  await userModel.deleteMany();
  await request(app).post("/auth/register").send(testUser);
  const res = await request(app).post("/auth/login").send({
    emailOrUserName: testUser.email,
    password: testUser.password,
  });
  testUser.token = res.body.accessToken;
  testUser._id = res.body._id;
  expect(testUser.token).toBeDefined();
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

describe("Post Controller Tests", () => {
  let postId = "";

  beforeAll(async () => {
    const response = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + testUser.token })
      .send({
        title: "Test Post",
        content: "Test Content",
      });
    postId = response.body._id;
    console.log("Created postId:", postId);
    expect(postId).toBeDefined();
  });

  test("Create a post", async () => {
    const response = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + testUser.token })
      .send({
        title: "Test Post",
        content: "Test Content",
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Test Post");
    expect(response.body.content).toBe("Test Content");
  });

  test("Get post by ID", async () => {
    const response = await request(app)
      .get(`/posts/${postId}`)
      .set({ authorization: `JWT ${testUser.token}` });
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("Test Post");
    expect(response.body.content).toBe("Test Content");
  });

  test("Get post by ID failed", async () => {
    const response = await request(app)
      .get(`/posts/1234`)
      .set({ authorization: `JWT ${testUser.token}` });
    expect(response.statusCode).toBe(400);
  });

  test("Get posts by senderId that does not have posts", async () => {
    const response = await request(app)
      .get("/posts?sender=noPosts")
      .set({ authorization: `JWT ${testUser.token}` });
    expect(response.statusCode).toBe(200);
    expect(response.body.totalItems).toBe(0);
  });

  test("Create another post", async () => {
    const response = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + testUser.token })
      .send({
        title: "Test Post 2",
        content: "Test Content 2",
      });
    expect(response.statusCode).toBe(201);
  });

  test("Get all posts (non-empty)", async () => {
    const response = await request(app)
      .get("/posts")
      .set({ authorization: `JWT ${testUser.token}` });
    expect(response.statusCode).toBe(200);
    expect(response.body.totalItems).toBe(3);
  });

  test("Create post fail (missing fields)", async () => {
    const response = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + testUser.token })
      .send({
        title: "Incomplete Post",
      });
    expect(response.statusCode).toBe(400);
  });

  test("Update post and then Get updated post by ID", async () => {
    const response = await request(app)
      .put(`/posts/${postId}`)
      .set({ authorization: `JWT ${testUser.token}` })
      .send({
        title: "Updated Test Post",
        content: "Updated Content",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("Updated Test Post");
    expect(response.body.content).toBe("Updated Content");

    const response2 = await request(app)
      .get(`/posts/${postId}`)
      .set({ authorization: `JWT ${testUser.token}` });
    expect(response2.statusCode).toBe(200);
    expect(response2.body.title).toBe("Updated Test Post");
    expect(response2.body.content).toBe("Updated Content");
  });

  test("Update post failed post doesnt exists", async () => {
    const response = await request(app)
      .put(`/posts/1234`)
      .set({ authorization: `JWT ${testUser.token}` })
      .send({
        title: "Updated Test Post",
        content: "Updated Content",
      });
    expect(response.statusCode).toBe(400);
  });

  test("Delete post by ID", async () => {
    console.log("Deleting postId:", postId);
    const response = await request(app)
      .delete(`/posts/${postId}`)
      .set({ authorization: `JWT ${testUser.token}` });
    expect(response.statusCode).toBe(200);
    const response2 = await request(app)
      .get(`/posts/${postId}`)
      .set({ authorization: `JWT ${testUser.token}` });
    expect(response2.statusCode).toBe(404);
  });

  test("Upload an image for a post", async () => {
    const filePath = `${__dirname}/test_file.txt`; // Use a test file
    const response = await request(app)
      .post("/posts")
      .set({ authorization: `JWT ${testUser.token}` })
      .field("title", "Post with Uploaded Image")
      .field("content", "This post has an uploaded image")
      .attach("image", filePath); // Simulate file upload

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Post with Uploaded Image");
    expect(response.body.content).toBe("This post has an uploaded image");

    // Normalize the imgUrl to use forward slashes
    const normalizedImgUrl = response.body.imgUrl.replace(/\\/g, "/");
    expect(normalizedImgUrl).toMatch(/http:\/\/localhost:3000\/storage\/\d+\.txt/);

    // Verify the uploaded file exists in the database
    const postId = response.body._id;
    const getResponse = await request(app)
      .get(`/posts/${postId}`)
      .set({ authorization: `JWT ${testUser.token}` });
    expect(getResponse.statusCode).toBe(200);

    const normalizedImgUrl2 = getResponse.body.imgUrl.replace(/\\/g, "/");
    expect(normalizedImgUrl2).toMatch(/http:\/\/localhost:3000\/storage\/\d+\.txt/);
  });

  test("Remove image from a post", async () => {
    const filePath = `${__dirname}/test_file.txt`; // Use a test file
    const createResponse = await request(app)
      .post("/posts")
      .set({ authorization: `JWT ${testUser.token}` })
      .field("title", "Post with Image to Remove")
      .field("content", "This post has an image to remove")
      .attach("image", filePath); // Simulate file upload

    const postId = createResponse.body._id;

    // Normalize the imgUrl to use forward slashes
    const normalizedImgUrl = createResponse.body.imgUrl.replace(/\\/g, "/");
    expect(normalizedImgUrl).toMatch(/http:\/\/localhost:3000\/storage\/\d+\.txt/);

    // Remove the image
    const removeResponse = await request(app)
      .put(`/posts/removeImage/${postId}`)
      .set({ authorization: `JWT ${testUser.token}` });
    expect(removeResponse.statusCode).toBe(200);
    expect(removeResponse.body.imgUrl).toBeNull();

    // Verify the image is removed in the database
    const getResponse = await request(app)
      .get(`/posts/${postId}`)
      .set({ authorization: `JWT ${testUser.token}` });
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body.imgUrl).toBeNull();
  });

  test("Remove image from a non-existent post", async () => {
    const response = await request(app)
      .put("/posts/removeImage/invalidPostId")
      .set({ authorization: `JWT ${testUser.token}` });

    expect(response.statusCode).toBe(500);
  });

  test("Remove image from a post without authorization", async () => {
    const filePath = `${__dirname}/test_file.txt`; // Use a test file
    const createResponse = await request(app)
      .post("/posts")
      .set({ authorization: `JWT ${testUser.token}` })
      .field("title", "Post with Image to Remove Unauthorized")
      .field("content", "This post has an image to remove unauthorized")
      .attach("image", filePath); // Simulate file upload

    const postId = createResponse.body._id;

    const response = await request(app)
      .put(`/posts/removeImage/${postId}`) // Attempt to remove image without token
      .set({}); // No Authorization header

    expect(response.statusCode).toBe(401);
    expect(response.text).toBe("Access Denied");
  });

  test("Remove image from a post with invalid token", async () => {
    const filePath = `${__dirname}/test_file.txt`; // Use a test file
    const createResponse = await request(app)
      .post("/posts")
      .set({ authorization: `JWT ${testUser.token}` })
      .field("title", "Post with Image to Remove Invalid Token")
      .field("content", "This post has an image to remove invalid token")
      .attach("image", filePath); // Simulate file upload

    const postId = createResponse.body._id;

    const response = await request(app)
      .put(`/posts/removeImage/${postId}`) // Attempt to remove image with invalid token
      .set({ authorization: "JWT invalidtoken" });

    expect(response.statusCode).toBe(401);
    expect(response.text).toBe("Access Denied");
  });

  test("Auth middleware sends 401 when no token is provided", async () => {
    const response = await request(app)
      .get("/posts") // Attempt to access a protected route
      .set({}); // No Authorization header

    expect(response.statusCode).toBe(401);
    expect(response.text).toBe("Access Denied");
  });

  test("Auth middleware sends 401 when an invalid token is provided", async () => {
    const response = await request(app)
      .get("/posts") // Attempt to access a protected route
      .set({ authorization: "JWT invalidtoken" }); // Invalid token

    expect(response.statusCode).toBe(401);
    expect(response.text).toBe("Access Denied");
  });
});
