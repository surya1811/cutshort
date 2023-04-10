const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const User = require('../models/user');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Users API', () => {
  let userId;

  before(async () => {
    // Create a new user for testing
    const user = new User({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password',
      role:'user'
    });
    await user.save();
    userId = user._id.toString();
  });

  after(async () => {
    // Remove the test user
    await User.findByIdAndRemove(userId);
  });

  describe('getUserById', () => {
    it('should return a user by ID', (done) => {
      chai.request(app)
        .get(`/users/${userId}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body._id).to.equal(userId);
          expect(res.body.name).to.equal('John Doe');
          expect(res.body.email).to.equal('johndoe@example.com');
          done();
        });
    });

    it('should return an error if user ID is invalid', (done) => {
      chai.request(app)
        .get('/users/invalidId')
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.be.an('object');
          expect(res.body.error).to.equal('Cast to ObjectId failed for value "invalidId" (type string) at path "_id" for model "User"');
          done();
        });
    });
  });


    describe('searchUsers', () => {
      it('should return matching users', (done) => {
        chai.request(app)
          .get('/users/search/john')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body.currentPage).to.equal(1);
            expect(res.body.totalPages).to.equal(1);
            expect(res.body.users).to.be.an('array');
            expect(res.body.users.length).to.equal(1);
            expect(res.body.users[0]._id).to.equal(userId);
            expect(res.body.users[0].name).to.equal('John Doe');
            expect(res.body.users[0].email).to.equal('johndoe@example.com');
            done();
          });
      });
  
      it('should return an empty array if no users are found', (done) => {
        chai.request(app)
          .get('/users/search/invalidquery')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body.currentPage).to.equal(1);
            expect(res.body.totalPages).to.equal(0);
            expect(res.body.users).to.be.an('array');
            expect(res.body.users.length).to.equal(0);
            done();
          });
      });
    });
  

});
