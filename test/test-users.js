'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');
const { TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe('/api/users', function(){
  const name = "testName";
  const email = "test@email.com";
  const password = "testPassword";
  const name2 = "testName2";
  const email2 = "test2@email.com";
  const password2 = "test2Password";

  const validationError = "ValidationError";
  const missingField = "Missing field"

  before(function(){
    return runServer(TEST_DATABASE_URL);
  });

  after(function(){
    return closeServer();
  });

  beforeEach(function(){})
  
  afterEach(function(){
    return User.remove({});
  });

  describe('/api/users', function(){
    describe('POST', function(){
      it('should reject users with missing name', function(){
        return chai.request(app)
          .post('/api/users')
          .send({
            email,
            password,
          })
          .catch(err => {
            if(err instanceof chai.AssertionError){
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal(missingField);
            expect(res.body.location).to.equal('name');
          });
      });
      it('should reject users with missing email', function (){
        return chai.request(app)
          .post('/api/users')
          .send({
            name,
            password
          })
          .catch(err => {
            if(err instanceof chai.AssertionError){
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal(missingField);
            expect(res.body.location).to.equal('email');
          });
      });
      it('should reject users with missing password', function(){
        return chai.request(app)
          .post('/api/users')
          .send({
            name,
            email
          })
          .catch(err => {
            if(err instanceof chai.AssertionError){
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal(missingField);
            expect(res.body.location).to.equal('password')
          })
      });
      it('Should reject users with non-string name', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            name: 1234,
            email,
            password,
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('name');
          });
      });
      it('Should reject users with non-string password', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            name,
            email,
            password: 1234,
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with non-string name', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            email,
            password,
            name: 1234,
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('name');
          });
      });
      it('Should reject users with non-trimmed name', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            name: ` ${name} `,
            email,
            password,
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal(
              'Cannot start or end with whitespace'
            );
            expect(res.body.location).to.equal('name');
          });
      });
      it('Should reject users with non-trimmed password', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            name,
            email,
            password: ` ${password} `,
          })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal(
              'Cannot start or end with whitespace'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with empty name', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            name: '',
            email,
            password,
          })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal(
              'Must be at least 1 characters long'
            );
            expect(res.body.location).to.equal('name');
          });
      });
      it('Should reject users with password less than six characters', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            name,
            email,
            password: '12345',
          })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError)
            expect(res.body.message).to.equal(
              'Must be at least 6 characters long'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with password greater than 30 characters', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            name,
            email,
            password: new Array(31).fill('a').join(''),
          })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal(
              'Must be at most 30 characters long'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with duplicate email', function () {
        // Create an initial user
        return User.create({
          name,
          email,
          password,
        })
          .then(() =>
            // Try to create a second user with the same username
            chai.request(app).post('/api/users').send({
              name,
              email,
              password,
            })
          )
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal(
              'Email exists already'
            );
            expect(res.body.location).to.equal('email');
          });
      });
      it('Should create a new user', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            name,
            email,
            password,
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'name',
              'id',
              'email'
            );
            expect(res.body.name).to.equal(name);
            expect(res.body.email).to.equal(email);
            return User.findOne({
              email
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.name).to.equal(name);
            expect(user.email).to.equal(email);
            return user.validatePassword(password);
          })
          .then(passwordIsCorrect => {
            expect(passwordIsCorrect).to.be.true;
          });
      });
      it('Should trim firstName and lastName', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            email,
            password,
            name: ` ${name} `,
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'name',
              'id',
              'email',
            );
            expect(res.body.name).to.equal(name);
            expect(res.body.email).to.equal(email);
            return User.findOne({
              name
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.name).to.equal(name);
            expect(user.email).to.equal(email);
          });
      });
    })

  //   describe('GET', function(){
  //     const token = jwt.sign(
  //       {
  //         user: {
  //           name,
  //           email
  //         }
  //       },
  //       JWT_SECRET,
  //       {
  //         algorithm: 'HS256',
  //         subject: username,
  //         expiresIn: '7d'
  //       }
  //     );

  //     it('should reject access to unauthenticated user', ()=> {
        
  //     })
  //   })
  });


});