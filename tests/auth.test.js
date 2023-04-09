require('dotenv').config();
const chai = require('chai');
const expect = chai.expect;
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');

describe('Auth API', () => {
  let accessToken;

  before(async () => {
    // create a test user
    const user = new User({
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
      role: 'user'
    });
    await user.save();
  });

  describe('POST /auth/register', () => {
    it('should register a new user and return access and refresh tokens', async () => {
      const res = await supertest(app)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password',
          name: 'New User',
          role: 'user'
        })
        .expect(201);
      
      expect(res.body.accessToken).to.be.a('string');
      expect(res.body.refreshToken).to.be.a('string');
    });

    it('should return a 409 error if the user already exists', async () => {
      const res = await supertest(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password',
          name: 'Test User',
          role: 'user'
        })
        .expect(409);

      expect(res.body.message).to.equal('User already exists');
    });
  });

  describe('POST /auth/login', () => {
    it('should log in an existing user and return access and refresh tokens', async () => {
      const res = await supertest(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password'
        })
        .expect(200);

      expect(res.body.accessToken).to.be.a('string');
      expect(res.body.refreshToken).to.be.a('string');
      accessToken = res.body.accessToken;
    });

    it('should return a 401 error if the email or password is incorrect', async () => {
      const res = await supertest(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(res.body.message).to.equal('Invalid credentials');
    });
  });

  describe('POST /auth/token', () => {
    it('should generate a new access token using a refresh token', async () => {
      const res = await supertest(app)
        .post('/auth/token')
        .send({ token: accessToken })
        .expect(200);

      expect(res.body.accessToken).to.be.a('string');
    });

    it('should return a 400 error if the refresh token is invalid', async () => {
      const res = await supertest(app)
        .post('/auth/token')
        .send({ token: 'invalidtoken' })
        .expect(400);

      expect(res.body.error).to.be.a('object');
    });
  });

  after(async () => {
    // delete the test user
    await User.deleteOne({ email: 'test@example.com' });
  });
});
