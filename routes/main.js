"use strict";

const generateRandomString = require('../lib/generateRandomString');
const checkEmails = require('../lib/checkEmails');
const express = require('express');
const router  = express.Router();
const fs = require('fs');
const fake_db = require('../db/fake_db');
const helper = require('../routes/helper');


module.exports = (knex) => {

  // Home page aka create poll
  router.get("/", (req, res) => {
    res.render("index");
  });

  router.post("/", (req, res) => {
    // let users = fake_db.users;
    if (!(req.body.email
        && req.body.question
        && req.body.date)) {
      res.status(400).send(`<h1>400 Error: </h1><p>Left field blank.</p><a href='/'>Try starting again.</a>`);
    } else if (!checkEmails(knex, req.body.email)) {
      const id = generateRandomString({});
      // users[id] = { 'id':id,
      //               'email': req.body.email};
      req.session.user_id = id;
    } else {
      req.session.user_id = checkEmails(knex, req.body.email);
    }

    // mailgun goes here. After confirmation:
    // edit to user database
    // let poll = fake_db.poll;
    const pollId = generateRandomString({});
    const creatorUrl = generateRandomString({});
    // fake_db.poll[pollId] = {
    //   poll_id: pollId,
    //   creator_user_id: req.session.user_id,
    //   datetime_created: Date.now(),
    //   datetime_closed: null,
    //   datetime_event: req.body.date,
    //   question: req.body.question,
    //   creator_url: creatorUrl
    // };
    // fake_db.invite[pollId] = {};
    // fake_db.invite[pollId][req.session.user_id] = creatorUrl;
    // fake_db.choice[pollId] = {};
    // fake_db.selection[pollId] = {};
    // for (let option of req.body.option) {
    //   let choice_id = generateRandomString({});
    //   fake_db.choice[pollId][choice_id] = {
    //     id: choice_id,
    //     poll_id: pollId,
    //     choice_name: option,
    //     choice_description: ''
    //   };
    // }
    //

    knex.table('users')
    .insert({
      'id'   : req.session.user_id,
      'email': req.body.email
    })
    .then( (id) => {
      // console.log(`Users Inserted Account ${id}`);
      // poll[pollId] = {
      //   poll_id: pollId,
      //   creator_user_id: req.session.user_id,
      //   datetime_created: Date.now(),
      //   datetime_closed: null,
      //   datetime_event: req.body.date,
      //   question: req.body.question,
      //   creator_url: creatorUrl
      // };

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
      // console.log(`Poll Inserted Account ${id}`);
      // knex.select().from('poll').then((result) => {console.log(result);});

      return knex.table('invite')
      .insert({
        'poll_id'     : pollId,
        'user_id'     : req.session.user_id,
        'invite_url'  : creatorUrl,
      });
    })
    .then( (id) => {
      // console.log(`Invite Inserted Account ${id}`);
      const multiRowInsert = [];

      for (let option of req.body.option) {
        let choice_id = generateRandomString({});
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
      // console.log(`Choice Inserted Account ${id}`);
      res.redirect(`/invitations/${pollId}/${req.session.user_id}/${creatorUrl}`);
    })
    .catch( (err) => {
      console.error('erroring out:', err);
    });

  });

  // Invitations Page
  router.get("/invitations/:pollId/:userId/:urlId", (req, res) => {
    // let poll = fake_db.poll;
    // res.render("invitations", poll[req.params.pollId]);
    knex.select('id', 'creator_id', 'creator_url')
      .from("poll")
      .where('id', req.params.pollId)
      .then((results) => {
        // console.log('poll results:', results);
        res.render("invitations", results[0]);
    })
  });

  router.post("/invitations/:pollId/:userId/:urlId", (req, res) => {
    const emails = req.body.email;

    for (let email of emails) {
      // fake db code

      // let users = fake_db.users;
      // let invite = fake_db.invite;
      // let key = checkEmails(users, req.body.email);
      // let userId;
      // if (key) {
      //   invite[req.params.pollId][key] = generateRandomString({});
      //   userId=key;
      // } else {
      //   const id = generateRandomString(users);
      //   users[id] = { id: id,
      //                 email: email};
      //   invite[req.params.pollId][id] = generateRandomString({});
      //   userId=id;

      let key = checkEmails(knex, req.body.email);
      if (key) {
        // invite[req.params.pollId][key] = generateRandomString({});
        knex.table('invite').insert({
          poll_id    : req.params.pollId,
          user_id    : key,
          invite_url : generateRandomString({})
        });
      } else {
        const id = generateRandomString({});
        // users[id] = { id    : id,
        //               email : email};
        const invite_url = generateRandomString({});
        // invite[req.params.pollId][id] = invite_url;

        knex.table('users').insert({id:id,email:email})
        .then(()=>{
          return knex.table('invite').insert({
            poll_id    : req.params.pollId,
            user_id    : id,
            invite_url : invite_url
          });
        });
      }
      // console.log('invite', invite_url)
      // sendEmail: (email, 'Decidr Poll' , invite_url);
      
      // // mail gun code goes here as it loops through every user
      // email //email
      // req.params.pollId //poll_id
      // userId // user_id
      // invite[req.params.pollId][userId] //url code/id
      // helper.sendEmail(email, "Poll Invite!!", 'Poll ID:' + req.params.pollId + '   UserID:' +
      //   userId + '  URL:' + invite[req.params.pollId][userId]);

    }
    //console.log('invites:',invite);

    res.redirect(`/answer/${req.params.pollId}/${req.params.userId}/${req.params.urlId}`);
  });

  // Reponse Page http://localhost:8080/answer/sLFxN1/b0BmHg/X7aBJj
  router.get("/answer/:pollId/:userId/:urlId", (req, res) => {
    //   let invite = fake_db.invite;
    //   if (!(invite[req.params.pollId]
    //     && invite[req.params.pollId][req.params.userId]
    //     && req.params.urlId === invite[req.params.pollId][req.params.userId])) {
    //   // change this to a proper error later
    //   res.status(400).send(`<h1>400 Error: </h1><p>Left field blank.</p><a href='/'>Try starting again.</a>`);
    // }

    // let choice = fake_db.choice;
    // let poll =fake_db.poll;
    // const choices = [];
    // for (let key of Object.keys(choice[req.params.pollId])) {
    //   choices.push([fake_db.choice[req.params.pollId][key].choice_name, key]);
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
      // console.log('choices:', results);
      // console.log('resLocal.poll:',resLocals.poll);
      res.render("answer", resLocals);
    })
  });


  router.post("/answer/:pollId/:userId/:urlId", (req, res) => {
    console.log('res.body', req.body);
    // let selection = fake_db.selection;
    // selection[req.params.pollId][req.params.userId] = {};

    const multiRowInsert = [];
    for (let rank of Object.keys(req.body)) {
      let choice_id = req.body[rank];
      // selection[req.params.pollId][req.params.userId][choice_id] = Number(rank);
      multiRowInsert.push({
        poll_id: req.params.pollId,
        user_id: req.params.userId,
        choice_id: choice_id,
        rank: Number(rank)
      })
    }
    console.log('multiRowInsert:',multiRowInsert);
    // const client = {name: "Any Time", address: "46 Spadina Avenue", phone: "647-342-3363"};
    //     res.status(201).json(client);

    knex.table('selection').insert(multiRowInsert)
    .then( () => {
      return res.redirect(`/result/${req.params.pollId}/${req.params.userId}/${req.params.urlId}`);
    })
  });



  // Results page
  router.get("/result/:pollId/:userId/:urlId", (req, res) => {
    // console.log('invite:', invite);
    // console.log('polls:', poll);
    // console.log('users:', users);
    // console.log('choice:', choice);
    //console.log('selection:', selection);

    const score = {};
    let numOfChoices;
    let poll_users;
    let votes;
    const resLocals = {
      user_id: req.params.userId,
      url_id: req.params.urlId
    };
    knex.select().from('poll').where('id', req.params.pollId)
    .then( (result) => {
      resLocals['poll'] = result[0];
      console.log(1);
      return knex.distinct('id','name','description').from('choice').where('poll_id', req.params.pollId);
    })
    .then( (results) => {
      resLocals['choice'] = results;
      return knex.select('id','name','description').from('choice').where('poll_id',req.params.pollId);
    })
    .then( (results) => {
      numOfChoices = results.length;
      for (let choice of results) {
        score[choice.id] = 0;
      };
      return knex.select('user_id').from('invite').where('poll_id', req.params.pollId);
    })
    .then( (results) => {
      poll_users = results;
      return knex.select().from('selection').where('poll_id', req.params.pollId);
    })
    .then( (results) => {
      for (let selected of results) {
        score[selected.choice_id] += numOfChoices - selected.rank;
      };
      return knex.countDistinct('user_id').from('selection').where('poll_id', req.params.pollId);
    })
    .then( (user_count) => {
      console.log('votes:',user_count);
      votes = [user_count[0].count, poll_users.length];

      const choicesRankOrder = [];
      Object.keys(score).forEach( (elm) => {
        choicesRankOrder.push([elm, score[elm]]);
      });
      choicesRankOrder.sort( (a, b) => { return b[1] - a[1] });
      // console.log('score_ranked:', choicesRankOrder);

      resLocals.rank_order = choicesRankOrder;
      resLocals.votes = votes;

      console.log('resLocals:',resLocals);
      res.render("result", resLocals);
    })

  });


  return router;
}


