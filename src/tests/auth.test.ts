import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel from "../models/posts_model";
import { Express } from "express";
import userModel, { IUser } from "../models/users_model";

let app: Express;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await userModel.deleteMany();
  await postModel.deleteMany();
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

const baseUrl = "/auth";

type User = IUser & {
  accessToken?: string;
  refreshToken?: string;
};

const testUser: User = {
  email: "test@user.com",
  userName: "tests user",
  password: "testpassword",
  fullName: "john lenon",
};

describe("Auth Tests", () => {
  test("Auth test register", async () => {
    const response = await request(app)
      .post(baseUrl + "/register")
      .send(testUser);
    expect(response.statusCode).toBe(200);
  });

  test("Auth test register fail", async () => {
    const response = await request(app)
      .post(baseUrl + "/register")
      .send(testUser);
    expect(response.statusCode).not.toBe(200);
  });

  test("Auth test register fail", async () => {
    const response = await request(app)
      .post(baseUrl + "/register")
      .send({
        email: "sdsdfsd",
      });
    expect(response.statusCode).not.toBe(200);
    const response2 = await request(app)
      .post(baseUrl + "/register")
      .send({
        email: "",
        password: "sdfsd",
      });
    expect(response2.statusCode).not.toBe(200);
  });

  test("Check tokens are not the same", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send({
        emailOrUserName: testUser.email,
        password: testUser.password,
      });
    const accessToken = response.body.accessToken;
    const refreshToken = response.body.refreshToken;

    expect(accessToken).not.toBe(testUser.accessToken);
    expect(refreshToken).not.toBe(testUser.refreshToken);
  });

  test("Auth test login fail", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send({
        emailOrUserName: testUser.email,
        password: "khkjhk",
      });
    expect(response.statusCode).not.toBe(200);

    const response2 = await request(app)
      .post(baseUrl + "/login")
      .send({
        emailOrUserName: "dsfasd",
        password: "sdfsd",
      });
    expect(response2.statusCode).not.toBe(200);
  });

  test("Test logout", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send({
        emailOrUserName: testUser.email,
        password: testUser.password,
      });
    expect(response.statusCode).toBe(200);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;

    const response2 = await request(app)
      .post(baseUrl + "/logout")
      .send({
        refreshToken: testUser.refreshToken,
      });
    expect(response2.statusCode).toBe(200);

    const response3 = await request(app)
      .post(baseUrl + "/refresh")
      .send({
        refreshToken: testUser.refreshToken,
      });
    expect(response3.statusCode).not.toBe(200);
  });

  test("Auth test register missing fields", async () => {
    const response = await request(app)
      .post(baseUrl + "/register")
      .send({});
    expect(response.statusCode).toBe(400);
  });

  test("Auth test register invalid email format", async () => {
    const response = await request(app)
      .post(baseUrl + "/register")
      .send({ ...testUser, email: "invalidEmail" });
    expect(response.statusCode).toBe(400);
  });

  test("Auth test login missing fields", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send({});
    expect(response.statusCode).toBe(400);
  });

  test("Auth test login with unregistered email", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send({ emailOrUserName: "unknown@user.com", password: "password" });
    expect(response.statusCode).toBe(400);
  });

  test("Auth test login invalid password", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send({ emailOrUserName: testUser.email, password: "wrongpassword" });
    expect(response.statusCode).toBe(400);
  });

  test("Auth refresh token invalid token", async () => {
    const response = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshToken: "invalidtoken" });
    expect(response.statusCode).toBe(400);
  });

  test("Auth logout missing refresh token", async () => {
    const response = await request(app)
      .post(baseUrl + "/logout")
      .send({});
    expect(response.statusCode).toBe(400);
  });

  test("Auth middleware server error without TOKEN_SECRET", async () => {
    const originalTokenSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;

    const response = await request(app)
      .get("/posts")
      .set({ authorization: `JWT ${testUser.accessToken}` });

    process.env.TOKEN_SECRET = originalTokenSecret;

    expect(response.statusCode).toBe(500);
  });

  test("Auth refresh server error without TOKEN_SECRET", async () => {
    const originalTokenSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;

    const response = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshToken: testUser.refreshToken });

    process.env.TOKEN_SECRET = originalTokenSecret;

    expect(response.statusCode).toBe(400);
  });

  test("Auth refresh token success", async () => {
    // Log in to get a valid refresh token
    const loginResponse = await request(app)
      .post(baseUrl + "/login")
      .send({
        emailOrUserName: testUser.email,
        password: testUser.password,
      });
    expect(loginResponse.statusCode).toBe(200);
    testUser.refreshToken = loginResponse.body.refreshToken;

    // Use the refresh token to generate new tokens
    const refreshResponse = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshToken: testUser.refreshToken });
    expect(refreshResponse.statusCode).toBe(200);
    expect(refreshResponse.body.accessToken).toBeDefined();
    expect(refreshResponse.body.refreshToken).toBeDefined();
  });

  test("Auth refresh token missing refreshToken", async () => {
    const response = await request(app)
      .post(baseUrl + "/refresh")
      .send({});
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("fail");
  });

  test("Auth test login with username", async () => {
    // Log in using the username instead of the email
    const response = await request(app)
      .post(baseUrl + "/login")
      .send({
        emailOrUserName: testUser.userName, // Use the username here
        password: testUser.password,
      });

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });

  test("Auth test login with invalid username or email", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send({
        emailOrUserName: "nonexistentuser",
        password: testUser.password,
      });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("wrong userName or password");
  });

  test("Auth test login with missing TOKEN_SECRET", async () => {
    const originalTokenSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;

    const response = await request(app)
      .post(baseUrl + "/login")
      .send({
        emailOrUserName: testUser.email,
        password: testUser.password,
      });

    process.env.TOKEN_SECRET = originalTokenSecret;

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe("Server Error");
  });

  test("Auth test refresh token with valid token", async () => {
    // Log in to get a valid refresh token
    const loginResponse = await request(app)
      .post(baseUrl + "/login")
      .send({
        emailOrUserName: testUser.email,
        password: testUser.password,
      });
    expect(loginResponse.statusCode).toBe(200);
    const refreshToken = loginResponse.body.refreshToken;

    // Use the refresh token to generate new tokens
    const refreshResponse = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshToken });

    expect(refreshResponse.statusCode).toBe(200);
    expect(refreshResponse.body.accessToken).toBeDefined();
    expect(refreshResponse.body.refreshToken).toBeDefined();
  });

  test("Auth test logout with invalid refresh token", async () => {
    const response = await request(app)
      .post(baseUrl + "/logout")
      .send({
        refreshToken: "invalidtoken",
      });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("fail");
  });

  test("Auth test Google Sign-In missing credential", async () => {
    const response = await request(app)
      .post(baseUrl + "/googleSignin")
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("error missing email or password");
  });

  test("Auth test server error when TOKEN_SECRET is missing", async () => {
    const originalTokenSecret = process.env.TOKEN_SECRET;

    delete process.env.TOKEN_SECRET;

    const response = await request(app)
      .post(baseUrl + "/login")
      .send({
        emailOrUserName: testUser.email,
        password: testUser.password,
      });

    process.env.TOKEN_SECRET = originalTokenSecret;

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe("Server Error");
  });
});
