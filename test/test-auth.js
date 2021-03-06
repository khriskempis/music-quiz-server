'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('Auth endpoints', function () {
  const name = 'exampleUser';
  const email = 'test@email.com'
  const password = 'examplePass';

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function () {
    return User.hashPassword(password).then(password =>
      User.create({
        name,
        email,
        password,
      })
    );
  });

  afterEach(function () {
    return User.remove({});
  });

  describe('/api/auth/login', function(){
    it('should reject requests with no credentials', function(){
      return chai.request(app)
        .post('/api/auth/login')
        .then(() => 
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError){
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(400);
        })
    });
    it('Should reject requests with incorrect email', function () {
      return chai
        .request(app)
        .post('/api/auth/login')
        .send({ email: 'wrongEmail', password })
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with incorrect passwords', function () {
      return chai
        .request(app)
        .post('/api/auth/login')
        .send({ email, password: 'wrongPassword' })
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    // it('Should return a valid auth token', function () {
    //   return chai
    //     .request(app)
    //     .post('/api/auth/login')
    //     .send({ email, password })
    //     .then(res => {
    //       expect(res).to.have.status(200);
    //       expect(res.body).to.be.an('object');
    //       const token = res.body.authToken;
    //       expect(token).to.be.a('string');
    //       const payload = jwt.verify(token, JWT_SECRET, {
    //         algorithm: ['HS256']
    //       });
    //       expect(payload.user).to.deep.equal({
    //         name,
    //         email,
    //       });
    //     });
    // });
  });

  describe('/api/auth/refresh', function () {
    it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .post('/api/auth/refresh')
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with an invalid token', function () {
      const token = jwt.sign(
        {
          name,
          email,
        },
        'wrongSecret',
        {
          algorithm: 'HS256',
          expiresIn: '7d'
        }
      );

      return chai
        .request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    // it('Should reject requests with an expired token', function () {
    //   const token = jwt.sign(
    //     {
    //       user: {
    //         name,
    //         email
    //       },
    //     },
    //     JWT_SECRET,
    //     {
    //       algorithm: 'HS256',
    //       subject: email,
    //       expiresIn: Math.floor(Date.now() / 1000) - 50 // Expired ten seconds ago
    //     }
    //   );

    //   return chai
    //     .request(app)
    //     .post('/api/auth/refresh')
    //     .set('authorization', `Bearer ${token}`)
    //     .then(() =>
    //       expect.fail(null, null, 'Request should not succeed')
    //     )
    //     .catch(err => {
    //       if (err instanceof chai.AssertionError) {
    //         throw err;
    //       }

    //       const res = err.response;
    //       expect(res).to.have.status(401);
    //     });
    // });
    // it('Should return a valid auth token with a newer expiry date', function () {
    //   const token = jwt.sign(
    //     {
    //       user: {
    //         name,
    //         email
    //       }
    //     },
    //     JWT_SECRET,
    //     {
    //       algorithm: 'HS256',
    //       subject: name,
    //       expiresIn: '7d'
    //     }
    //   );
    //   const decoded = jwt.decode(token);

    //   return chai
    //     .request(app)
    //     .post('/api/auth/refresh')
    //     .set('authorization', `Bearer ${token}`)
    //     .then(res => {
    //       expect(res).to.have.status(200);
    //       expect(res.body).to.be.an('object');
    //       const token = res.body.authToken;
    //       expect(token).to.be.a('string');
    //       const payload = jwt.verify(token, JWT_SECRET, {
    //         algorithm: ['HS256']
    //       });
    //       expect(payload.user).to.deep.equal({
    //         name,
    //         email
    //       });
    //       expect(payload.exp).to.be.at.least(decoded.exp);
    //     });
    // });
  });
});