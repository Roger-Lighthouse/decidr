"use strict";

const generateRandomString = require('../lib/generateRandomString');
const checkEmails = require('../lib/checkEmails');
const express = require('express');
const router  = express.Router();
const fs = require('fs');
const fake_db = require('../db/fake_db');
const helper = require('../routes/helper');



module.exports = () => {

  // Home page aka create poll
  router.get("/", (req, res) => {
    res.render("index");
  });

  router.post("/", (req, res) => {
    let users = fake_db.users;
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
    let poll = fake_db.poll;
    const pollId = generateRandomString(poll);
    const creatorUrl = generateRandomString({});
    fake_db.poll[pollId] = {
      poll_id: pollId,
      creator_user_id: req.session.user_id,
      datetime_created: Date.now(),
      datetime_closed: null,
      datetime_event: req.body.date,
      question: req.body.question,
      creator_url: creatorUrl
    };
    fake_db.invite[pollId] = {};
    fake_db.invite[pollId][req.session.user_id] = creatorUrl;
    fake_db.choice[pollId] = {};
    fake_db.selection[pollId] = {};
    for (let option of req.body.option) {
      let choice_id = generateRandomString({});
      fake_db.choice[pollId][choice_id] = {
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
    let poll = fake_db.poll;
    res.render("invitations", poll[req.params.pollId]);
  });
  router.post("/invitations/:pollId/:userId/:urlId", (req, res) => {
    const emails = req.body.email;

    for (let email of emails) {
      let users = fake_db.users;
      let invite = fake_db.invite;
      let key = checkEmails(users, req.body.email);
      let userId;
      if (key) {
        invite[req.params.pollId][key] = generateRandomString({});
        userId=key;
      } else {
        const id = generateRandomString(users);
        users[id] = { id: id,
                      email: email};
        invite[req.params.pollId][id] = generateRandomString({});
        userId=id;
      }

      // mail gun code goes here as it loops through every user
      email //email
      req.params.pollId //poll_id
      userId // user_id
      invite[req.params.pollId][userId] //url code/id
      helper.sendEmail(email, "Poll Invite!!", 'Poll ID:' + req.params.pollId + '   UserID:' +
        userId + '  URL:' + invite[req.params.pollId][userId]);

    }
    //console.log('invites:',invite);


    res.redirect(`/answer/${req.params.pollId}/${req.params.userId}/${req.params.urlId}`);
  });

  // Reponse Page http://localhost:8080/answer/sLFxN1/b0BmHg/X7aBJj
  router.get("/answer/:pollId/:userId/:urlId", (req, res) => {
      let invite = fake_db.invite;
      if (!(invite[req.params.pollId]
        && invite[req.params.pollId][req.params.userId]
        && req.params.urlId === invite[req.params.pollId][req.params.userId])) {
      // change this to a proper error later
      res.status(400).send(`<h1>400 Error: </h1><p>Left field blank.</p><a href='/'>Try starting again.</a>`);
    }

    let choice = fake_db.choice;
    let poll =fake_db.poll;
    const choices = [];
    for (let key of Object.keys(choice[req.params.pollId])) {
      choices.push([fake_db.choice[req.params.pollId][key].choice_name, key]);
    }

    const resLocals = {
      poll: poll[req.params.pollId],
      choices: choices,
      user_id: req.params.userId,
      url_id: req.params.urlId
    };
    res.render("answer", resLocals);
  });


  router.post("/answer/:pollId/:userId/:urlId", (req, res) => {
    console.log('res.body', req.body);
    let selection = fake_db.selection;
    selection[req.params.pollId][req.params.userId] = {};

    for (let rank of Object.keys(req.body)) {
      let choice_id = req.body[rank];
      selection[req.params.pollId][req.params.userId][choice_id] = Number(rank);
    }

    res.redirect(`/result/${req.params.pollId}/${req.params.userId}/${req.params.urlId}`)
  });

  // Results page
  router.get("/result/:pollId/:userId/:urlId", (req, res) => {
    // console.log('invite:', invite);
    // console.log('polls:', poll);
    // console.log('users:', users);
    // console.log('choice:', choice);
    //console.log('selection:', selection);


    const score = {};
    const numOfChoices = Object.keys(choice[req.params.pollId]).length;
    for (let option of Object.keys(choice[req.params.pollId])) {
      score[option] = 0;
    };

    const poll_users = Object.keys(invite[req.params.pollId]);

    const votes = [0, poll_users.length];
    for (let user of poll_users) {
      if (selection[req.params.pollId][user]) {
        votes[0] += 1;
        Object.keys(selection[req.params.pollId][user]).forEach( (elm) => {
          score[elm] += numOfChoices - selection[req.params.pollId][user][elm];
        });
      };
    };

    const choicesRankOrder = [];
    Object.keys(score).forEach( (elm) => {
      choicesRankOrder.push([elm, score[elm]]);
    });
    choicesRankOrder.sort( (a, b) => { return b[1] - a[1] });
    // console.log('score_ranked:', choicesRankOrder);

    const resLocals = {
      poll: poll[req.params.pollId],
      choice: choice,
      rank_order: choicesRankOrder,
      votes: votes
    };
    res.render("result", resLocals);
  });


  return router;
}


/*
 const poll = {sLFxN1:
//    { poll_id: 'sLFxN1',
//      creator_user_id: 'b0BmHg',
//      datetime_created: 1488498640532,
//      datetime_closed: null,
//      datetime_event: '2017-03-02',
//      question: '1',
//      creator_url: 'X7aBJj'}};
// const users = {b0BmHg: { id: 'b0BmHg', email: '1@test.com' },
//   dAatr7: { id: 'dAatr7', email: 'a@test.com' },
//   NFpKw4: { id: 'NFpKw4', email: 'b@test.com' },
//   spLX8Q: { id: 'spLX8Q', email: 'c@test.com' },
//   Hyhfj4: { id: 'Hyhfj4', email: 'd@test.com' }};
// const invite = { 'sLFxN1': {
//                             'b0BmHg':'X7aBJj',
//                             'dAatr7':'dAatr7',
//                             'NFpKw4':'NFpKw4',
//                             'spLX8Q':'spLX8Q',
//                             'Hyhfj4':'Hyhfj4'}};
// const choice = { 'sLFxN1':
//    { 'fOavU9':
//       { id: 'fOavU9',
//         poll_id: 'sLFxN1',
//         choice_name: 'one',
//         choice_description: '' },
//      '3l5D14':
//       { id: '3l5D14',
//         poll_id: 'sLFxN1',
//         choice_name: 'two',
//         choice_description: '' },
//      '2JnOxu':
//       { id: '2JnOxu',
//         poll_id: 'sLFxN1',
//         choice_name: 'three',
//         choice_description: '' },
//      '0qFQGp':
//       { id: '0qFQGp',
//         poll_id: 'sLFxN1',
//         choice_name: 'four',
//         choice_description: '' },
//      'FcAgK2':
//       { id: 'FcAgK2',
//         poll_id: 'sLFxN1',
//         choice_name: 'five',
//         choice_description: '' } } };
// const selection = {'sLFxN1': {} };
*/