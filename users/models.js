'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

mongoose.Promise = global.Promise;

//  User LOG model

const UserLogSchema = mongoose.Schema({
  user: { type: ObjectId, ref: "User" },
  date: { type: String, required: true }
})

const UserLog = mongoose.model('UserLog', UserLogSchema)

// PRACTICE model

const PracticeTestSchema = mongoose.Schema({
  user: { type: ObjectId, ref: "User" },
  date: { type: String, required: true },
  score: { type: Number, required: true }
})

const PracticeTest = mongoose.model('PracticeTest', PracticeTestSchema)

// TEST model 

const TestSchema = mongoose.Schema({
  user: { type: ObjectId, ref: "User" },
  date: { type: String, required: true },
  score: { type: Number, required: true }
})

const Test = mongoose.model('Test', TestSchema)



// USER model 

const UserSchema = mongoose.Schema({
  name: {
    type: String, 
    required: true,
  }, 
  userName: { type: String },
  email: {
    type: String, 
    required: true
  },
  password: {
    type: String, 
    required: true
  },
  userLog: [{type: ObjectId, ref: "UserLog"}],
  practiceTests: [{type: ObjectId, ref: "PracticeTest"}],
  tests: [{type: ObjectId, ref: "Test"}]
});

UserSchema.methods.serialize = function() {
  return {
    id: this._id,
    name: this.name,
    userName: this.userName,
    email: this.email,
    userLog: this.userLog,
    practiceTests: this.practiceTests,
    tests: this.tests
  }
};

UserSchema.methods.validatePassword = function(password){
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password){
  return bcrypt.hash(password, 10);
}

const User = mongoose.model('User', UserSchema);


module.exports = {User, PracticeTest, Test, UserLog}
