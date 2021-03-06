'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

const { NoteCard } = require('./models');
 
const router = express.Router();

const jsonParser = bodyParser.json();


const asyncMiddleWare = fn => 
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  }



router.post('/', jsonParser, (req, res)=> {
  const requiredFields = ['imgUrl', 'noteId', 'note', 'clef'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if(missingField){
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing Field',
      location: missingField
    })
  }

  const stringFields = ['imgUrl', 'noteId', 'note', 'clef'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string');
  
  if(nonStringField){
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect Field Type: expected String',
      location: nonStringField
    })
  }

  let { imgUrl, noteId, note, clef } = req.body;

  imgUrl = imgUrl.trim();
  noteId = noteId.trim();
  note = note.trim();
  clef = clef.trim();

  return NoteCard.find({noteId})
    .countDocuments()
    .then(count => {
      if(count > 0){
        return Promise.reject({
          code: 422,
          reason: "ValidationError",
          message: "Note Card already exists",
        });
      }
      return NoteCard.create({
        imgUrl,
        noteId,
        note,
        clef
      })
    })
    .then(noteCard => {
      return res.status(201).json(noteCard.serialize());
    })
    .catch(err=> {
      if(err.reason === "ValidationError"){
        return res.status(err.code).json(err);
      }
      return res.status(500).json({code: 500, message: "Internal Server Error"})
    })
});

router.get('/type/:test', async (req,res)=> {
  const testType = req.params.test;

  let dbData

  try {
    if(testType === "cmajor"){
      dbData = await NoteCard.find({
        noteId: {
          $in : ["C4T","D4","E4","F4","G4","G3","F3","E3","D3","C3"]
        }
      })
    } else if(testType === "middle"){
      dbData = await NoteCard.find({
        noteId: {
          $in : ["C4T","D4","E4","F4","G4","C4","B3","A3","G3","F3"]
        }
      })

    } else {
      dbData = await NoteCard.find({
        clef: req.params.test
      })
    }

    let data = await dbData.map(noteCard => noteCard.serialize());
    return res.json(data);

  } catch(err) {
    return res.status(422).json({code: 422, err: err})
  }
})

router.get('/test/middle', (req, res)=> {
  return NoteCard.find({
    noteId: {
      $in : [
        "C4T",
        "D4",
        "E4",
        "F4",
        "G4",
        "C4",
        "B3",
        "A3",
        "G3",
        "F3"
      ]
    }
  })
  .then(data => {
    return res.json(data.map(noteCard => noteCard.serialize()))
  })
  .catch(err => {
    return res.status(422).json({code: 422, error: err})
  });
});

// router.get('/test/cmajor', (req, res)=> {
//   return NoteCard.find({
//     noteId : {
//       $in : [
//         "G4",
//         "F4"
//       ]
//     }
//   })
//   .then(data => {
//     return res.json(data.map(noteCard => noteCard.serialize()))
//   })
//   .catch(err => {
//     return res.status(422).json({code: 422, error: err})
//   })
// })

router.get('/test/cmajor-test', asyncMiddleWare(async (req, res, next)=> {
  // if there's an error thrown, asyncMiddleWare will pass it to next() and 
  // express will handle the error
  let dbData = await NoteCard.find({
    noteId : {
            $in : [
              "G4",
              "F4",
            ]
          }
  })
  let data = await dbData.map(noteCard => noteCard.serialize());
  res.json(data);
}))

module.exports = { router }