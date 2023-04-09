const request = require('supertest');
const app = require('../app');
const User = require('../models/user');
const mongoose = require('mongoose');

describe('User routes', () => {
  let db;

  beforeAll(async () => {
    db = await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /users/:userId', () => {
    let user;

    beforeEach(async () => {
      user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
      });
      await user.save();
    });

    afterEach(async () => {
      await User.deleteMany({});
    });

    it('should return a user by id', async () => {
      const res = await request(app).get(`/users/${user._id}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(user._id.toString());
      expect(res.body.name).toBe(user.name);
      expect(res.body.email).toBe(user.email);
    });

    it('should return an error if user is not found', async () => {
      const res = await request(app).get('/users/123');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User not found');
    });
  });

  describe('GET /users/search/:q', () => {
    beforeEach(async () => {
      const user1 = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
      });
      const user2 = new User({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password',
      });
      await user1.save();
      await user2.save();
    });

    afterEach(async () => {
      await User.deleteMany({});
    });

    it('should return users matching the search query', async () => {
      const res = await request(app).get('/users/search/doe');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].name).toBe('John Doe');
      expect(res.body[1].name).toBe('Jane Doe');
    });

    it('should return an empty array if no users match the search query', async () => {
      const res = await request(app).get('/users/search/foo');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });
});
