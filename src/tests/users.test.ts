import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import userModel, { IUser } from "../models/users_model";
import { Express } from "express";
import bcrypt from "bcrypt";

let app: Express;

type User = IUser & { token?: string };
const testUser: User = {
  email: "testuser@example.com",
  userName: "testuser",
  password: "testpassword",
  fullName: "Test User",
};

const secondUser: User = {
  email: "seconduser@example.com",
  userName: "seconduser",
  password: "secondpassword",
  fullName: "Second User",
};

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await userModel.deleteMany();

  // Register and login the test user
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

let secondUserId = "";

describe("Users Tests with Authentication", () => {
  // test("Get all users (initially one user)", async () => {
  //   const response = await request(app)
  //     .get("/users")
  //     .set({ authorization: `JWT ${testUser.token}` });
  //   expect(response.statusCode).toBe(200);
  //   expect(response.body.length).toBe(1);
  //   expect(response.body[0].email).toBe(testUser.email);
  // });

  test("Create a new user and check password encryption", async () => {
    const response = await request(app)
      .post("/users")
      .set({ authorization: `JWT ${testUser.token}` })
      .send(secondUser);
    secondUserId = response.body._id;
    expect(response.statusCode).toBe(201);
    expect(response.body.email).toBe(secondUser.email);
    expect(response.body.userName).toBe(secondUser.userName);
    expect(response.body.fullName).toBe(secondUser.fullName);

    // Check password is encrypted in the database
    const createdUser = await userModel.findById(secondUserId);
    expect(createdUser).toBeDefined();
    expect(createdUser!.password).not.toBe(secondUser.password);
    const passwordMatches = await bcrypt.compare(secondUser.password, createdUser!.password);
    expect(passwordMatches).toBe(true);
  });

  test("Get user by ID", async () => {
    const response = await request(app)
      .get(`/users/${secondUserId}`)
      .set({ authorization: `JWT ${testUser.token}` });
    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe(secondUser.email);
    expect(response.body.userName).toBe(secondUser.userName);
    expect(response.body.fullName).toBe(secondUser.fullName);
  });

  test("Update user", async () => {
    const response = await request(app)
      .put(`/users/${secondUserId}`)
      .set({ authorization: `JWT ${testUser.token}` })
      .send({ fullName: "Updated User" });
    expect(response.statusCode).toBe(200);

    const getResponse = await request(app)
      .get(`/users/${secondUserId}`)
      .set({ authorization: `JWT ${testUser.token}` });
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body.fullName).toBe("Updated User");
  });

  // test("Delete user", async () => {
  //   const response = await request(app)
  //     .delete(`/users/${secondUserId}`)
  //     .set({ authorization: `JWT ${testUser.token}` });
  //   expect(response.statusCode).toBe(200);

  //   const getResponse = await request(app)
  //     .get(`/users/${secondUserId}`)
  //     .set({ authorization: `JWT ${testUser.token}` });
  //   expect(getResponse.statusCode).toBe(404);
  // });

  // test("Get all users (after deletion)", async () => {
  //   const response = await request(app)
  //     .get("/users")
  //     .set({ authorization: `JWT ${testUser.token}` });
  //   expect(response.statusCode).toBe(200);
  //   expect(response.body.length).toBe(1);
  //   expect(response.body[0].email).toBe(testUser.email);
  // });
});
