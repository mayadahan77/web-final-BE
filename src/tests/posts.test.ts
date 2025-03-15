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
  const res = await request(app).post("/auth/login").send(testUser);
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
    console.log("Created postId in beforeEach:", postId);
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
    console.log("Deleting postId:", postId); // Add logging here
    const response = await request(app)
      .delete(`/posts/${postId}`)
      .set({ authorization: `JWT ${testUser.token}` });
    expect(response.statusCode).toBe(200);
    const response2 = await request(app)
      .get(`/posts/${postId}`)
      .set({ authorization: `JWT ${testUser.token}` });
    expect(response2.statusCode).toBe(404);
  });
});
