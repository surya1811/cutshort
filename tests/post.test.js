const request = require("supertest");
const { beforeAll } = require('mocha');

const app = require("../app");
const mongoose = require("mongoose");
const Post = require("../models/post");

describe("Post API tests", () => {
  let authToken;
  let postId;

  beforeAll(async () => {
    // connect to test database
    await mongoose.connect(process.env.TEST_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    // login and get auth token
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'password' });

    authToken = res.body.token;

    // create a post for the user
    post = new Post({
      title: 'Test Post',
      body: 'This is a test post',
      postedBy: mongoose.Types.ObjectId(),
    });
    await post.save();
  });

  describe("POST /posts", () => {
    it("should create a new post", async () => {
      const res = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Test post", body: "This is a test post" });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe("Test post");
      expect(res.body.body).toBe("This is a test post");
      expect(res.body.postedBy).toBeTruthy();
      postId = res.body._id;
    });

    it("should return an error when title is missing", async () => {
      const res = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ body: "This is a test post" });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Title is required");
    });
  });

  describe("GET /posts", () => {
    it("should get all posts by the authenticated user", async () => {
      const res = await request(app)
        .get("/posts")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe("Test post");
    });
  });

  describe("GET /posts/:postId", () => {
    it("should get a post by ID", async () => {
      const res = await request(app)
        .get(`/posts/${postId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Test post");
    });

    it("should return an error when post ID is invalid", async () => {
      const res = await request(app)
        .get("/posts/invalid-id")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(500);
      expect(res.body.error).toBe(
        'Cast to ObjectId failed for value "invalid-id" at path "_id" for model "Post"'
      );
    });
  });

  describe("authFindById", () => {
    let post;
    test("should return the post with populated fields", async () => {
      const result = await authFindById(post._id);
      expect(result._id.toString()).toEqual(post._id.toString());
      expect(result.title).toEqual(post.title);
      expect(result.body).toEqual(post.body);
      expect(result.postedBy._id.toString()).toEqual(post.postedBy.toString());
      expect(result.postedBy.name).toBeTruthy();
      expect(result.comments).toBeTruthy();
    });

    test("should throw an error if the post does not exist", async () => {
      await expect(authFindById(mongoose.Types.ObjectId())).rejects.toThrow();
    });
  });

  describe("PUT /posts/:postId", () => {
    it("should update a post", async () => {
      const update = {
        title: "Updated Test Post",
        body: "This is an updated test post",
      };
      const res = await request(app)
        .put(`/posts/${post._id}`)
        .send(update)
        .expect(200);
      expect(res.body.title).toEqual(update.title);
      expect(res.body.body).toEqual(update.body);
    });

    it("should return an error when updating a non-existent post", async () => {
      const update = {
        title: "Updated Test Post",
        body: "This is an updated test post",
      };
      const res = await request(app)
        .put(`/posts/${mongoose.Types.ObjectId()}`)
        .send(update)
        .expect(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("DELETE /posts/:postId", () => {
    it("should delete a post", async () => {
      const res = await request(app)
        .delete(`/posts/${post._id}`)
        .set("Authorization", `Bearer ${process.env.JWT_TOKEN}`)
        .expect(200);
      expect(res.body.message).toBeDefined();
    });

    it("should return an error when deleting a non-existent post", async () => {
      const res = await request(app)
        .delete(`/posts/${mongoose.Types.ObjectId()}`)
        .set("Authorization", `Bearer ${process.env.JWT_TOKEN}`)
        .expect(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("POST /posts/:postId/comment", () => {
    test("should add a comment to the post", async () => {
      const res = await request(app)
        .post(`/posts/${post._id}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ text: "This is a test comment" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.comments.length).toEqual(1);
      expect(res.body.comments[0].text).toEqual("This is a test comment");
    });

    test("should return an error if the post does not exist", async () => {
      const res = await request(app)
        .post(`/posts/${mongoose.Types.ObjectId()}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ text: "This is a test comment" });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual("Failed to add comment");
    });
  });
});
