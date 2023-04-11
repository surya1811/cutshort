//file
const chai = require('chai');
const expect = chai.expect;
const app = require('../app');
const Todo = require('../models/todo');
const request = require('supertest')(app);
const Chance = require('chance');
const chance = new Chance();
describe('Todo API', () => {
  let accessToken;
  let refreshToken;
  let userId;
  let todoId;

  
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
  describe('POST /todos', () => {
    it('should return a 201 status code and the created todo', (done) => {
      request
        .post('/todos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Test Todo', description: 'This is a test todo' ,user:userId})
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.statusCode).to.equal(201);
          expect(res.body).to.have.property('_id');
          const responseBody = JSON.parse(res.text);
          todoId = responseBody._id;
          expect(res.body.title).to.equal('Test Todo');
          expect(res.body.description).to.equal('This is a test todo');
          done();
        });
    });

  

  it('should return 401 if user is not authenticated', async () => {
      request
        .post('/todos')
        .set('Authorization', `Bearer wrongtoken`)
        .send({ title: 'Test Todo', description: 'This is a test todo' ,user:userId})
        .end((err, res) => {
         
          expect(err).to.be.null;
          expect(res.statusCode).to.equal(401);
        });
  });
});

  describe('GET /todos', () => {
    it('should return all todos of a user', async () => {
        request
          .get('/todos')
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

});