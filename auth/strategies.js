'use strict';

const {Strategy: LocalStrategy} = require('passport-local');

const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const { User } = require('../users/models');
const { JWT_SECRET } = require('../config');


// localStrategy looks for username, but because Im only requiring an email to authenticate, 
// I need to pass in options to change email in the usernameField

const localStrategy = new LocalStrategy({usernameField: "email", passwordField: "password"}, (email, password, callback) => {
  let user;
  User.findOne({email: email})
    .then(_user => {
      user = _user;
      if(!user){
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect email or password'
        })
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if(!isValid){
        return Promise.reject({
          reason: "LoginError",
          message: 'Incorrect email or password'
        });
      }
      return callback(null, user);
    })
    .catch(err => {
      if(err.reason === 'LoginError'){
        return callback(null, false, err);
      }
      return callback(err, false);
    });
});

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    // Look for the JWT as Bearer auth header
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    // Only allow HS256 tokens - the same as the ones we issue
    algorithms: ['HS256']
  },
  (payload, done) => {
    done(null, payload.user);
  }
);

module.exports = { localStrategy, jwtStrategy };