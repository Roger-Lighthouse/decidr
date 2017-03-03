"use strict";

const generateRandomString = require('../lib/generateRandomString');
const checkEmails = require('../lib/checkEmails');
const express = require('express');
const router  = express.Router();
const fs = require('fs');

const poll = {sLFxN1:
   { poll_id: 'sLFxN1',
     creator_user_id: 'b0BmHg',
     datetime_created: 1488498640532,
     datetime_closed: null,
     datetime_event: '2017-03-02',
     question: '1',
     creator_url: 'X7aBJj'}};
const users = {b0BmHg: { id: 'b0BmHg', email: '1@test.com' },
  dAatr7: { id: 'dAatr7', email: 'a@test.com' },
  NFpKw4: { id: 'NFpKw4', email: 'b@test.com' },
  spLX8Q: { id: 'spLX8Q', email: 'c@test.com' },
  Hyhfj4: { id: 'Hyhfj4', email: 'd@test.com' }};
const invites = { 'sLFxN1': [ 'dAatr7', 'NFpKw4', 'spLX8Q', 'Hyhfj4' ] };
const choice = { 'sLFxN1':
   { 'fOavU9':
      { id: 'fOavU9',
        poll_id: 'sLFxN1',
        choice_name: 'one',
        choice_description: '' },
     '3l5D14':
      { id: '3l5D14',
        poll_id: 'sLFxN1',
        choice_name: 'two',
        choice_description: '' },
     '2JnOxu':
      { id: '2JnOxu',
        poll_id: 'sLFxN1',
        choice_name: 'three',
        choice_description: '' },
     '0qFQGp':
      { id: '0qFQGp',
        poll_id: 'sLFxN1',
        choice_name: 'four',
        choice_description: '' },
     'FcAgK2':
      { id: 'FcAgK2',
        poll_id: 'sLFxN1',
        choice_name: 'five',
        choice_description: '' } } };
const selection = {};

module.exports = () => {

  // Home page aka create poll
  router.get("/", (req, res) => {
    res.render("index");
  });
  router.post("/", (req, res) => {
    if (!(req.body.email
        && req.body.question
        && req.body.date)) {
      res.status(400).send(`<h1>400 Error: </h1><p>Left field blank.</p><a href='/'>Try starting again.</a>`);
    } else if (!checkEmails(users, req.body.email)) {
      const id = generateRandomString(users);
      users[id] = { 'id':id,
                    'email': req.body.email};
      req.session.user_id = id;
    } else {
      req.session.user_id = checkEmails(users, req.body.email);
    }

    // mailgun goes here. After confirmation:
    const pollId = generateRandomString(poll);
    const creatorUrl = generateRandomString({});
    poll[pollId] = {
      poll_id: pollId,
      creator_user_id: req.session.user_id,
      datetime_created: Date.now(),
      datetime_closed: null,
      datetime_event: req.body.date,
      question: req.body.question,
      creator_url: creatorUrl
    };
    invites[pollId] = [];
    choice[pollId] = {};
    for (let option of req.body.option) {
      let choice_id = generateRandomString({});
      choice[pollId][choice_id] = {
        id: choice_id,
        poll_id: pollId,
        choice_name: option,
        choice_description: ''
      };
    }

    res.redirect(`/invitations/${pollId}/${req.session.user_id}/${creatorUrl}`);
  });


  // // Poll Confirmations Page - consider using ajax
  // router.get("/confirm", (req, res) => {
  //   res.render("poll_invitations_confirm");
  // });


  // Invitations Page
  router.get("/invitations/:pollId/:userId/:urlId", (req, res) => {
    res.render("invitations", poll[req.params.pollId]);
  });
  router.post("/invitations/:pollId/:userId/:urlId", (req, res) => {
    const emails = req.body.email;

    for (let email of emails) {
      let key = checkEmails(users, req.body.email);
      if (key) {
        invites[req.params.pollId].push(key);
      } else {
        const id = generateRandomString(users);
        users[id] = { id: id,
                      email: email};
        invites[req.params.pollId].push(id);
      }
      // mail gun code goes here or after the curly bracket
    }

    res.redirect(`/answer/${req.params.pollId}/${req.params.userId}/${req.params.urlId}`);
  });

  // Reponse Page http://localhost:8080/answer/sLFxN1/b0BmHg/X7aBJj
  router.get("/answer/:pollId/:userId/:urlId", (req, res) => {
    console.log('invites:', invites);
    console.log('polls:', poll);
    console.log('users', users);
    console.log('choice', choice);

    const choices = [];
    for (let key of Object.keys(choice[req.params.pollId])) {
      choices.push([
        choice[req.params.pollId][key].choice_name,
        key
        ]);
    }

    const resLocals = {
      poll: poll[req.params.pollId],
      choices: choices,
      user_id: req.params.userId,
      url_id: req.params.urlId
    };
    console.log('test:',resLocals.poll);
    res.render("answer", resLocals);
  });

  router.post("/answer/:pollId/:userId/:urlId", (req, res) => {
    console.log('req.body:', req.body);
    // const optionOrder = req.body.option_order;
    // res.redirect("/result/${req.params.pollId}/${req.params.pollId}/${req.params.pollId}") // /result/:pollId/:userId/:urlId
  });

  // Results page /result/:pollId/:userId/:urlId
  router.get("/result/:pollId/:userId/:urlId", (req, res) => {
    res.render("result");
  });


  return router;
}
