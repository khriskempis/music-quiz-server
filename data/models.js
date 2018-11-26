'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise

const NoteCardSchema = mongoose.Schema({
  imgUrl: {
    type: String,
    required: true
  },
  noteId: {
    type: String,
    required: true,
    unique: true,

  },
  note: {
    type: String, 
    required: true
  },
  clef: {
    type: String,
    required: true
  }
})

NoteCardSchema.methods.serialize = function(){
  return {
    id: this._id,
    imgUrl: this.imgUrl,
    noteId: this.noteId,
    note: this.note,
    clef: this.clef
  }
}

const NoteCard = mongoose.model('NoteCard', NoteCardSchema);

module.exports = { NoteCard }