const app = require("../app");
const mongoose = require("mongoose");
const Post = require("../models/post");
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest')(app);
const Chance = require('chance');
const chance = new Chance();
describe("Post API tests", () => {
 
  let postId;
  let accessToken;
  let refreshToken;
  let userId;
  
  // Register user
  const email = chance.email();
  describe('POST /auth/register', () => {
    it('should return a 201 status code and access and refresh tokens', (done) => {
      request
        .post('/auth/register')
        .send({ email, password: 'password', name: 'Test User', role: 'user' })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.statusCode).to.equal(201);
          expect(res.body).to.have.property('accessToken');
          expect(res.body).to.have.property('refreshToken');
          accessToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
          done();
        });
    });
  });

  describe('POST /auth/login', () => {
    it('should return a 200 status code and access and refresh tokens', (done) => {
      request
        .post('/auth/login')
        .send({ email, password: 'password' })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('accessToken');
          expect(res.body).to.have.property('refreshToken');
          accessToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
          userId = res.body.userId; // set user ID for create todo test
          done();
        });
    });
  });


  
  describe("POST /posts", () => {
    it("should create a new post", async () => {
      request
        .post("/posts")
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: "Test post", body: "This is a test post" })
        .end((err, res) => {
          expect(res.statusCode).to.equal(201);
          expect(res.body).to.have.property('_id');
          expect(res.body.title).to.equal('Test post');
          expect(res.body.body).to.equal('This is a test post');
         postId = res.body._id;
    });
  });
  
  it('should return 401 if user is not authenticated', async () => {
    request
      .post('/posts')
      .set('Authorization', `Bearer wrongtoken`)
      .send({ title: 'Test post', body: 'This is a test post' ,user:userId})
      .end((err, res) => {
        expect(err).to.be.null;
          expect(res.statusCode).to.equal(401);
      });
});
});
  



  describe('GET /posts', () => {
    it('should return all posts of a user', async () => {
        request
          .get('/posts')
          .set('Authorization', `Bearer ${accessToken}`)
          .send()
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('array');
            done();
          });
  });
});


describe("GET /posts/:postId", () => {
  it("should get a post by ID", async () => {
    request
      .get(`/posts/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({user:userId})
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body.title).to.equal('Test post');
        expect(res.body.body).to.equal('This is a test post');
        done();
      });
  });
});
});
  