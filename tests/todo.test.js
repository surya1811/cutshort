const app = require('../app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const Todo = require('../models/todo');
const authenticateUser =require('../middleware/authMiddleware')

chai.use(chaiHttp);
const expect = chai.expect;

describe('Todo API', () => {
  let authToken;
  let todoId;

  before(async () => {
    // Create a new user and get authentication token
    const user = { email: 'testuser@example.com', password: 'testpassword' };
    const response = await chai.request(app)
      .post('/auth/register')
      .send(user);
    authToken = response.body.accessToken;
    
  });

  after(async () => {
    // Delete the test user
    await Todo.deleteMany({});
  });

  describe('POST /todos', () => {
    it('should create a new todo', async () => {
      const todo = { title: 'Test Todo', description: 'Test Todo Description' };
      const response = await chai.request(app)
        .post('/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todo);
      expect(response).to.have.status(201);
      expect(response.body).to.have.property('title', 'Test Todo');
      expect(response.body).to.have.property('description', 'Test Todo Description');
      expect(response.body).to.have.property('user');
      todoId = response.body._id;
    });

    it('should return a 401 error if no auth token is provided', async () => {
      const todo = { title: 'Test Todo', description: 'Test Todo Description' };
      const response = await chai.request(app)
        .post('/todos')
        .send(todo);
      expect(response).to.have.status(401);
      expect(response.body).to.have.property('error', 'Unauthorized');
    });
  });

  describe('GET /todos', () => {
    it('should return all todos of a user', async () => {
      const response = await chai.request(app)
        .get('/todos')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response).to.have.status(200);
      expect(response.body).to.be.an('array');
      expect(response.body).to.have.lengthOf(1);
    });
  });

  describe('GET /todos/:todoId', () => {
    it('should return a todo by id', async () => {
      const response = await chai.request(app)
        .get(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response).to.have.status(200);
      expect(response.body).to.have.property('title', 'Test Todo');
      expect(response.body).to.have.property('description', 'Test Todo Description');
      expect(response.body).to.have.property('_id', todoId);
      expect(response.body).to.have.property('user');
    });

    it('should return a 400 error if todo id is invalid', async () => {
      const response = await chai.request(app)
        .get('/todos/invalidid')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response).to.have.status(400);
      expect(response.body).to.have.property('error', 'Todo not found');
    });
  });

  describe('PUT /todos/:todoId', () => {
    it('should update a todo with valid input', (done) => {
      const updatedTodo = {
        title: 'Updated Todo',
        description: 'Updated Description',
      };

      chai.request(app)
        .put(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedTodo)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('_id').equal(todoId);
          res.body.should.have.property('title').equal(updatedTodo.title);
          res.body.should.have.property('description').equal(updatedTodo.description);
          res.body.should.have.property('user').equal('testuser');
          done();
        });
    });

    it('should return a 400 error if the todo ID is invalid', (done) => {
      const updatedTodo = {
        title: 'Updated Todo',
        description: 'Updated Description',
      };

      chai.request(app)
        .put('/todos/invalidid')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedTodo)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return a 400 error if the todo does not belong to the authenticated user', (done) => {
      const updatedTodo = {
        title: 'Updated Todo',
        description: 'Updated Description',
      };

      chai.request(app)
        .put(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${jwt.sign({ user: { _id: 'differentuser' } }, process.env.ACCESS_TOKEN_SECRET)}`)
        .send(updatedTodo)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return a 400 error if the todo does not exist', (done) => {
      const updatedTodo = {
        title: 'Updated Todo',
        description: 'Updated Description',
      };

      chai.request(app)
        .put(`/todos/${jwt.sign({ user: { _id: 'testuser' } }, process.env.ACCESS_TOKEN_SECRET)}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedTodo)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});