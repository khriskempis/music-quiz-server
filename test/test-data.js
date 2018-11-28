'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const { NoteCard } = require('../data');
const { TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe('/api/data', function(){
  const imgUrl = "testImg.com";
  const noteId = "testA4";
  const note = "testA";
  const clef = "testTreble";

  const validationError = "ValidationError";
  const missingField = "Missing Field"

  before(function(){
    return runServer(TEST_DATABASE_URL);
  });

  after(function(){
    return closeServer();
  })

  beforeEach(function(){});

  afterEach(function(){
    return NoteCard.remove({})
  })

  describe('/api/data/', function(){
    describe('POST', function(){
      it('should reject note card with missing imgUrl', function(){
        return chai.request(app)
          .post('/api/data')
          .send({
            noteId,
            note,
            clef
          })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError){
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal(missingField);
            expect(res.body.location).to.equal("imgUrl");
          });
      });
      it('should reject note card with missing noteId', () => {
        return chai.request(app)
          .post('/api/data')
          .send({
            imgUrl,
            note,
            clef
          })
          .then(() => {
            expect.fail(null, null, 'Request should not succeed')
          })
          .catch(err => {
            if(err instanceof chai.AssertionError){
              throw err
            }

            const res = err.response
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal(missingField);
            expect(res.body.location).to.equal('noteId');
          });
      });
      it('should reject note card with missing note', () => {
        return chai.request(app)
          .post('/api/data')
          .send({
            imgUrl,
            noteId,
            clef
          })
          .then(() => {
            expect.fail(null, null, 'Request should not succeed')
          })
          .catch(err => {
            if(err instanceof chai.AssertionError){
              throw err
            }

            const res = err.response
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal(missingField);
            expect(res.body.location).to.equal('note');
          });
      });
      it('should reject note card with missing clef', () => {
        return chai.request(app)
          .post('/api/data')
          .send({
            imgUrl,
            noteId,
            note
          })
          .then(() => {
            expect.fail(null, null, 'Request should not succeed')
          })
          .catch(err => {
            if(err instanceof chai.AssertionError){
              throw err
            }

            const res = err.response
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal(missingField);
            expect(res.body.location).to.equal('clef');
          });
      });
      it('should reject note card with non-string imgUrl', ()=> {
        return chai.request(app)
          .post('/api/data')
          .send({
            imgUrl: 1234,
            noteId,
            note,
            clef
          })
          .then(() => {
            expect.fail(null, null, 'Request should not succeed')
          })
          .catch(err => {
            if(err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal('Incorrect Field Type: expected String');
            expect(res.body.location).to.equal("imgUrl")
          });
      });
      it('should reject note card with non-string noteId', ()=> {
        return chai.request(app)
          .post('/api/data')
          .send({
            imgUrl,
            noteId: 1234,
            note,
            clef
          })
          .then(() => {
            expect.fail(null, null, 'Request should not succeed')
          })
          .catch(err => {
            if(err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal('Incorrect Field Type: expected String');
            expect(res.body.location).to.equal("noteId")
          });
      });
      it('should reject note card with non-string note', ()=> {
        return chai.request(app)
          .post('/api/data')
          .send({
            imgUrl,
            noteId,
            note: 1234,
            clef
          })
          .then(() => {
            expect.fail(null, null, 'Request should not succeed')
          })
          .catch(err => {
            if(err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal('Incorrect Field Type: expected String');
            expect(res.body.location).to.equal("note")
          });
      });
      it('should reject note card with non-string clef', ()=> {
        return chai.request(app)
          .post('/api/data')
          .send({
            imgUrl,
            noteId,
            note,
            clef: 1234
          })
          .then(() => {
            expect.fail(null, null, 'Request should not succeed')
          })
          .catch(err => {
            if(err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal(validationError);
            expect(res.body.message).to.equal('Incorrect Field Type: expected String');
            expect(res.body.location).to.equal("clef")
          });
      });
      it('should reject note card with duplicate note card', ()=> {
        return NoteCard.create({
          imgUrl,
          noteId,
          note,
          clef
        })
        .then(()=>
          chai.request(app)
            .post('/api/data')
            .send({
              imgUrl,
              noteId,
              note,
              clef
            })
        )
        .then(()=> {
          expect.fail(null, null, 'Request should not succeed')
        })
        .catch(err => {
          if (err instanceof chai.AssertionError){
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal(validationError);
          expect(res.body.message).to.equal('Note Card already exists');
        })
      });
      it('should create a new note card', ()=> {
        return chai.request(app)
          .post('/api/data')
          .send({
            imgUrl,
            noteId,
            note,
            clef
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'id',
              'imgUrl',
              'noteId',
              'note',
              'clef'
            );
            expect(res.body.imgUrl).to.equal(imgUrl);
            expect(res.body.noteId).to.equal(noteId);
            expect(res.body.note).to.equal(note);
            expect(res.body.clef).to.equal(clef);
            return NoteCard.findOne({
              noteId
            });
          })
          .then(noteCard => {
            expect(noteCard).to.not.be.null;
            expect(noteCard.imgUrl).to.equal(imgUrl);
            expect(noteCard.noteId).to.equal(noteId);
            expect(noteCard.note).to.equal(note);
            expect(noteCard.clef).to.equal(clef);
          })
      });
    });

    // describe('GET', ()=> {
    //   it('should return items in database', ()=> {
    //     return NoteCard.create({
    //       imgUrl,
    //       noteId,
    //       note,
    //       clef
    //     })
    //     .then(()=> {
    //       return chai.request(app)
    //         .get('/api/data/bass')

    //     })
    //   })
    // })
  })
});