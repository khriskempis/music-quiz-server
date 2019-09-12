"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");

const { User, UserLog, PracticeTest, Test } = require("./models");
const { localStrategy, jwtStrategy } = require("../auth");

const router = express.Router();

const jsonParser = bodyParser.json();

// Post to register a new user

router.post("/", jsonParser, (req, res) => {
  const requiredFields = ["name", "email", "password"];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Missing field",
      location: missingField
    });
  }

  const stringFields = ["name", "email", "password"];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== "string"
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Incorrect field type: expected string",
      location: nonStringField
    });
  }

  const explicitlyTrimmedFields = ["email", "password"];
  const nonTrimmedField = explicitlyTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Cannot start or end with whitespace",
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    name: {
      min: 1
    },
    email: {
      min: 1
    },
    password: {
      min: 6,
      max: 30
    }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      "min" in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  );

  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      "max" in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
        : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let { name, email, password } = req.body;

  name = name.trim();

  return User.find({ email })
    .countDocuments()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: "ValidationError",
          message: "Email exists already",
          location: "email"
        });
      }
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        name,
        email,
        userName: "",
        password: hash,
        userLog: [],
        practiceTests: [],
        tests: []
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      if (err.reason === "ValidationError") {
        return res.status(err.code).json(err);
      }
      res
        .status(500)
        .json({ code: 500, message: "Error: could not create user" });
    });
});

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate("jwt", { session: false });

router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    res.status(200).json(user);
  } catch (err) {
    res.status(422).json({ message: "could not find user" });
  }

  // ADD VALIDATION

  // return User.findById(req.params.id)
  //   .then(user => {
  //     if(!user){
  //       return Promise.reject({
  //         code: 422,
  //         reason: "ValidationError",
  //         message: "User does not exist"
  //       })
  //     }
  //     return res.json(user.serialize())
  //   })
  //   .catch(err => {
  //     // if(err){
  //     //    return Promise.reject({
  //     //      code: 422,
  //     //      reason: "CastError",
  //     //      error: err
  //     //    })
  //     // }
  //     res.status(500).json({
  //       code: 500,
  //       message: "Internal Server Error",
  //       error: err
  //     })
  //   })
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(422).json({ code: 422, error: err });
  }
});

router.delete("/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(422).json({
        code: 422,
        message: "User does not exist"
      });
    } else {
      let deletedUser = await User.findOneAndDelete(userId);
      res.status(200).json({ message: "User deleted", data: deletedUser });
    }
  } catch (err) {
    res.status(422).json({ code: 422, error: err });
  }
});

// User Log

router.post("/user-log", jsonParser, async (req, res) => {
  const userId = req.body.userId;
  console.log(userId);
  try {
    const newLog = await UserLog.create({
      user: userId,
      date: new Date()
    });
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $push: {
          userLog: newLog._id
        }
      }
    ).exec();
    res.status(201).json({ message: "User logged in on " + newLog.date, user });
  } catch (err) {
    res.status(422).json({ message: "Could not register log", error: err });
  }
});

router.get("/user-log/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId)
      .select("userLog")
      .populate("userLog", "date");

    res.status(200).json(user);
  } catch (err) {
    res
      .status(422)
      .json({ message: "could not retrieve user logs", error: err });
  }
});

// Practice Tests Log

router.post("/practice-test", jsonParser, async (req, res) => {
  let { user, score } = req.body;

  try {
    const newPracticeTest = await PracticeTest.create({
      user,
      date: new Date(),
      score
    });
    const currentUser = await User.findByIdAndUpdate(
      { _id: user },
      {
        $push: {
          practiceTests: newPracticeTest._id
        }
      }
    ).exec();

    return res
      .status(200)
      .json({ message: "practice test logged", currentUser, newPracticeTest });
  } catch (err) {
    res.status(422).json({ message: "could not log test", error: err });
  }
});

router.get("/practice-tests/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId)
      .select("practiceTests")
      .populate("practiceTests", "date score");

    res.status(200).json(user);
  } catch (err) {
    res.status(422).json({ message: "could not find user" });
  }
  // try{
  //   const practiceTests = await PracticeTest.find({})
  //   return res.status(200).json(practiceTests);
  // } catch(err) {
  //   res.status(422).json({message: "could not find any practice tests"})
  // }
});

// Tests Log

router.post("/test", jsonParser, async (req, res) => {
  let { user, score } = req.body;

  try {
    const newTest = await Test.create({
      user,
      date: new Date(),
      score
    });
    const currentUser = await User.findByIdAndUpdate(
      { _id: user },
      {
        $push: {
          tests: newTest._id
        }
      }
    ).exec();

    return res
      .status(201)
      .json({ message: "test logged", currentUser, newTest });
  } catch (err) {
    res.status(422).json({ message: "could not log test", error: err });
  }
});

router.get("/test/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId)
      .select("tests")
      .populate("tests", "date score")
      .exec();

    res.status(200).json({ message: "Test Logs", user });
  } catch (err) {
    res.status(422).json({ message: "could not retrieve test", error: err });
  }
});

module.exports = { router };

// app.get('/api/protected', jwtAuth, (req, res) => {
//   return res.json({
//     data: 'rosebud'
//   })
// });
