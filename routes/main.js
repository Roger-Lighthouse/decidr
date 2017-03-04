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
const users = {};//{b0BmHg: { id: 'b0BmHg', email: '1@test.com' },
  // dAatr7: { id: 'dAatr7', email: 'a@test.com' },
  // NFpKw4: { id: 'NFpKw4', email: 'b@test.com' },
  // spLX8Q: { id: 'spLX8Q', email: 'c@test.com' },
  // Hyhfj4: { id: 'Hyhfj4', email: 'd@test.com' }};
const invite = { 'sLFxN1':
  { 'b0BmHg':'X7aBJj',
    'dAatr7':'dAatr7',
    'NFpKw4':'NFpKw4',
    'spLX8Q':'spLX8Q',
    'Hyhfj4':'Hyhfj4'}};
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
const selection = {'sLFxN1': {} };

module.exports = (knex) => {

  // Home page aka create poll
  router.get("/", (req, res) => {
    res.render("index");
  });
  router.post("/", (req, res) => {
    if (!(req.body.email
        && req.body.question
        && req.body.date)) {
      res.status(400).send(`<h1>400 Error: </h1><p>Left field blank.</p><a href='/'>Try starting again.</a>`);
    } else if (!checkEmails(knex, req.body.email)) {
      const id = generateRandomString(users);
      users[id] = { 'id':id,
                    'email': req.body.email};
      req.session.user_id = id;
    } else {
      req.session.user_id = checkEmails(knex, req.body.email);
    }

    // mailgun goes here. After confirmation:
    const pollId = generateRandomString(poll);
    const creatorUrl = generateRandomString({});

    knex.table('users')
    .insert({
      'id'   : req.session.user_id,
      'email': req.body.email
    })
    .then( (id) => {
      console.log(`Users Inserted Account ${id}`);


      poll[pollId] = {
        poll_id: pollId,
        creator_user_id: req.session.user_id,
        datetime_created: Date.now(),
        datetime_closed: null,
        datetime_event: req.body.date,
        question: req.body.question,
        creator_url: creatorUrl
      };

      return knex.table('poll')
      .insert({
        'id'          : pollId,
        'creator_id'  : req.session.user_id,
        'creator_url' : creatorUrl,
        'created'     : new Date(),
        'question'    : req.body.question,
        'event'       : req.body.datetime,
        'closed'      : null
      });
    })
    .then( (id) => {
      console.log(`Poll Inserted Account ${id}`);
      knex.select().from('poll').then((result) => {console.log(result);});

      return knex.table('invite')
      .insert({
        'poll_id'     : pollId,
        'user_id'     : req.session.user_id,
        'invite_url'  : creatorUrl,
      })
    })
    .then( (id) => {
      console.log(`Invite Inserted Account ${id}`);

      invite[pollId] = {};
      invite[pollId][req.session.user_id] = creatorUrl;
      choice[pollId] = {};
      selection[pollId] = {};
      const multiRowInsert = [];

      for (let option of req.body.option) {
        let choice_id = generateRandomString({});
        choice[pollId][choice_id] = {
          id                  : choice_id,
          poll_id             : pollId,
          choice_name         : option,
          choice_description  : ''
        };
        multiRowInsert.push({
          'id'          : choice_id,
          'poll_id'     : pollId,
          'name'        : option,
          'description' : ''
        });
      }

      return knex.table('choice')
        .insert(multiRowInsert)
    })
    .then((id) => {
      console.log(`Choice Inserted Account ${id}`);
      res.redirect(`/invitations/${pollId}/${req.session.user_id}/${creatorUrl}`);
    })
    .catch( (err) => {
      console.error('erroring out:', err);
    });

  });

  // Invitations Page
  router.get("/invitations/:pollId/:userId/:urlId", (req, res) => {
    knex.select('id', 'creator_id', 'creator_url')
      .from("poll")
      .where('id', req.params.pollId)
      .then((results) => {
        console.log('poll results:', results);
        res.render("invitations", results[0]);
    })
    // res.render("invitations", poll[req.params.pollId]);

  });

  router.post("/invitations/:pollId/:userId/:urlId", (req, res) => {
    const emails = req.body.email;

    for (let email of emails) {
      let key = checkEmails(knex, req.body.email);
      if (key) {
        invite[req.params.pollId][key] = generateRandomString({});
      } else {
        const id = generateRandomString(users);
        users[id] = { id    : id,
                      email : email};
        const invite_url = generateRandomString({});
        invite[req.params.pollId][id] = invite_url;

        knex.table('users').insert({id:id,email:email})
        .then(()=>{
          return knex.table('invite').insert({poll_id:req.params.pollId,user_id:id,invite_url:invite_url});
        });
      }
      // mail gun code goes here or after the curly bracket
    }
    console.log('invites:',invite);

    res.redirect(`/answer/${req.params.pollId}/${req.params.userId}/${req.params.urlId}`);
  });

  // Reponse Page http://localhost:8080/answer/sLFxN1/b0BmHg/X7aBJj
  router.get("/answer/:pollId/:userId/:urlId", (req, res) => {
    // console.log(invite[req.params.pollId]);
    // if (!(invite[req.params.pollId]
    //     && invite[req.params.pollId][req.params.userId]
    //     && req.params.urlId === invite[req.params.pollId][req.params.userId])) {
    //   // change this to a proper error later
    //   res.status(400).send(`<h1>400 Error: </h1><p>Left field blank.</p><a href='/'>Try starting again.</a>`);
    // }

    knex.select().from('invite')
      .where('poll_id', req.params.pollId)
      .andWhere('user_id', req.params.userId)
      .andWhere('invite_url', req.params.urlId)
    .then( (result) => {
      if (result.length === 0) {
        // change this to a proper error later
        res.status(400).send(`<h1>400 Error: </h1><p>Left field blank.</p><a href='/'>Try starting again.</a>`);
      }
    });


    const choices = [];
    for (let key of Object.keys(choice[req.params.pollId])) {
      choices.push([choice[req.params.pollId][key].choice_name, key]);
    }

    const resLocals = {
      user_id: req.params.userId,
      url_id: req.params.urlId
    };
    knex.select().from('poll').where('id', req.params.pollId)
    .then( (result) => {
      resLocals['poll'] = result[0];
      return knex.select().from('choice').where('poll_id', req.params.pollId);
    })
    .then( (results) => {
      resLocals['choices'] = results;
      console.log('choices:', results);
      console.log('resLocal.poll:',resLocals.poll);
      res.render("answer", resLocals);
    })

    // const resLocals = {
    //   poll: poll[req.params.pollId],
    //   choices: choices,
    //   user_id: req.params.userId,
    //   url_id: req.params.urlId
    // };

  });

  router.post("/answer/:pollId/:userId/:urlId", (req, res) => {
    selection[req.params.pollId][req.params.userId] = {};

    const multiRowInsert = [];
    for (let rank of Object.keys(req.body)) {
      let choice_id = req.body[rank];
      selection[req.params.pollId][req.params.userId][choice_id] = Number(rank);
      multiRowInsert.push({
        poll_id: req.params.pollId,
        user_id: req.params.userId,
        choice_id: choice_id,
        rank: Number(rank)
      })
    }

    knex.table('selection').insert(multiRowInsert)
    .then( () => {
      res.redirect(`/result/${req.params.pollId}/${req.params.userId}/${req.params.urlId}`)
    })
  });

  // Results page
  router.get("/result/:pollId/:userId/:urlId", (req, res) => {
    // console.log('invite:', invite);
    // console.log('polls:', poll);
    // console.log('users:', users);
    // console.log('choice:', choice);
    console.log('selection:', selection);


    const score = {};
    let numOfChoices;
    let poll_users;
    let votes;
    // const numOfChoices = Object.keys(choice[req.params.pollId]).length;
    knex.select('id','name','description').from('choice').where('poll_id',req.params.pollId)
    .then( (results) => {
      numOfChoices = results.length;
      // for (let option of Object.keys(choice[req.params.pollId])) {
      //   score[option] = 0;
      // };'
      for (let choice of results) {
        score[choice.id] = 0;
      };

      return knex.select('user_id').from('invite').where('poll_id', req.params.pollId);
    })
    .then( (results) => {
      // const poll_users = Object.keys(invite[req.params.pollId]);
      poll_users = results;

      return knex.select().from('selection').where('poll_id', req.params.pollId);
    })
    .then( (results) => {
      for (let selected of results) {
        score[selected.choice_id] += numOfChoices - selected.rank;
      }

      // for (let user of poll_users) {
      //   if (selection[req.params.pollId][user]) {
      //     votes[0] += 1;
      //     Object.keys(selection[req.params.pollId][user]).forEach( (elm) => {
      //       score[elm] += numOfChoices - selection[req.params.pollId][user][elm];
      //     });
      //   };
      // };

      return knex.countDistinct('user_id').from('selection').where('poll_id', req.params.pollId);
    })
    .then( (user_count) => {
      console.log('votes:',user_count);
      votes = [user_count[0], poll_users.length];

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
    })

  });


  return router;
}
