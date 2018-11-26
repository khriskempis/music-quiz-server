'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const { NoteCard } = require('./models');
 
const router = express.Router();

const jsonParser = bodyParser.json();

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

router.get('/:test', (req,res)=> {
  return NoteCard.find({
    clef: req.params.test
  })
  .then(data => {
    return res.json(data.map(noteCard => noteCard.serialize()))
  })
  .catch(err => {
    return res.status(422).json({code: 422, error: err})
  })
})

module.exports = { router }