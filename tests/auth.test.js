require('dotenv').config();
const chai = require('chai');
const expect = chai.expect;
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { generateNewAccessToken } = require('../controllers/auth');
const Chance = require('chance');
const chance = new Chance();
describe('Auth API', () => {
  let accessToken;
  const email = chance.email();

  describe('POST /auth/register', () => {
    it('should register a new user and return access and refresh tokens', async () => {
      const res = await supertest(app)
        .post('/auth/register')
        .send({
          email,
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
 const testEmail=chance.email();
  describe('POST /auth/generateNewAccessToken', () => {
    it('should generate a new access token and return a response with status 200', async () => {
      const refreshToken = 'some-refresh-token';
  
      // create a test user
      const user = new User({
       email: testEmail,
        password: 'password',
        name: 'Test User',
        role: 'user'
      });
      await user.save();
  
      // generate a refresh token for the test user
      const refreshTokenData = { userId: user.id, type: 'refresh' };
      const refreshTokenOptions = { expiresIn: '1h' };
      const testRefreshToken = jwt.sign(refreshTokenData, process.env.REFRESH_TOKEN_SECRET, refreshTokenOptions);
  
      // replace the request body with the test refresh token
      const req = {
        body: {
          token: testRefreshToken
        }
      };
  
      // mock the response object
      const res = {
        status: (statusCode) => {
          expect(statusCode).to.equal(200);
          return {
            json: (responseBody) => {
              expect(responseBody).to.have.property('accessToken');
              expect(responseBody.accessToken).to.be.a('string');
            }
          };
        }
      };
  
      await generateNewAccessToken(req, res);
  
      // delete the test user
      await User.deleteOne({ testEmail});
    });
  
    it('should return a 400 error if the refresh token is invalid', async () => {
      const res = await supertest(app)
        .post('/auth/generateNewAccessToken')
        .send({ token: 'invalidtoken' })
        .expect(400);
  
      expect(res.body.error).to.be.a('object');
    });
  });
  
  after(async () => {
    // delete the test user
    await User.deleteOne({ email: 'test1@example.com' });
  });
});
