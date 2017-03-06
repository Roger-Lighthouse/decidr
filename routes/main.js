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
    const pollId = generateRandomString({});
    const creatorUrl = generateRandomString({});

    knex.table('users')
    .insert({
      'id'   : req.session.user_id,
      'email': req.body.email
    })
    .then( (id) => {
      // console.log(`Users Inserted Account ${id}`);
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

      for (let option of req.body.option.slice(0,-1)) {
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
    knex.select('id', 'creator_id', 'creator_url')
      .from("poll")
      .where('id', req.params.pollId)
      .then((results) => {
        res.render("invitations", results[0]);
    })
  });

  router.post("/invitations/:pollId/:userId/:urlId", (req, res) => {
    const emails = req.body.email.slice(0,-1);

    for (let email of emails) {
      let id;
      const invite_url = generateRandomString({});
      let key = checkEmails(knex, req.body.email);
      if (key) {
        id = key;
        knex.table('invite').insert({
          poll_id    : req.params.pollId,
          user_id    : key,
          invite_url : invite_url
        });
      } else {
        id = generateRandomString({});

        knex.table('users').insert( { id: id, email: email } )
        .then( () => {
          return knex.table('invite').insert({
            poll_id    : req.params.pollId,
            user_id    : id,
            invite_url : invite_url
          });
        });
      }

      // mail gun code to email invited users
      helper.sendEmail(email, "Poll Invite!!", 'Poll ID:' + req.params.pollId + '   UserID:' +
        id + '  URL: ' + `/answer/${req.params.pollId}/${id}/${invite_url}`);

    }
    //console.log('invites:',invite);

    res.redirect(`/answer/${req.params.pollId}/${req.params.userId}/${req.params.urlId}`);
  });

  // Reponse Page
  router.get("/answer/:pollId/:userId/:urlId", (req, res) => {
    const resLocals = {
      user_id : req.params.userId,
      url_id  : req.params.urlId
    };

    // check to make sure user is invited and is using the correct urlId
    knex.select().from('invite')
      .where('poll_id', req.params.pollId)
      .andWhere('user_id', req.params.userId)
      .andWhere('invite_url', req.params.urlId)
    .then( (result) => {
      console.log('check if they were invited result:', result);
      if (result.length === 0) {
        // change this to a proper error later
        res.status(400).send(`<h1>400 Error: </h1><p>You do not have access to this poll.</p><a href='/'>Try starting a new poll.</a>`);
      };

      // Check to see if user has voted already
      return knex.select().from('selection')
        .where('poll_id', req.params.pollId)
        .andWhere('user_id', req.params.userId)
    })
    .then( (result) => {
      console.log('check if they voted already result:', result);
      if (result.length !== 0) {
        // change this to a proper error later
        res.status(400).send(`<h1>400 Error: </h1><p>You have already voted in this poll.</p><a href='/'>Try starting a new poll.</a>`);
      }
    })
    .then( () => {
      return knex.select('email').from('users').where('id', req.params.userId);
    })
    .then( (result) => {
      resLocals['user_mail'] = result[0].email;
      return knex.select().from('poll').where('id', req.params.pollId);
    })
    .then( (result) => {
      resLocals['poll'] = result[0];
      return knex.select().from('choice').where('poll_id', req.params.pollId);
    })
    .then( (results) => {
      resLocals['choices'] = results;
      // console.log('choices:', results);
      // console.log('resLocal.poll:',resLocals.poll);
      res.render("answer", resLocals);
    });
  });


  router.post("/answer/:pollId/:userId/:urlId", (req, res) => {
    // check to make sure user is invited and is using the correct urlId
    knex.select().from('invite')
      .where('poll_id', req.params.pollId)
      .andWhere('user_id', req.params.userId)
      .andWhere('invite_url', req.params.urlId)
    .then( (result) => {
      console.log('check if they were invited result:', result);
      if (result.length === 0) {
        // change this to a proper error later
        res.status(400).send(`<h1>400 Error: </h1><p>You do not have access to this poll.</p><a href='/'>Try starting a new poll.</a>`);
      };

      // Check to see if user has voted already
      return knex.select().from('selection')
        .where('poll_id', req.params.pollId)
        .andWhere('user_id', req.params.userId)
    })
    .then( (result) => {
      console.log('check if they voted already result:', result);
      if (result.length !== 0) {
        // change this to a proper error later
        res.status(400).send(`<h1>400 Error: </h1><p>You have already voted in this poll.</p><a href='/'>Try starting a new poll.</a>`);
      }
    })
    .then( () => {
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

      return knex.table('selection').insert(multiRowInsert);
    })
    .then( () => {
      return knex.table('poll').where('id',req.params.pollId).andWhere('creator_id', req.params.userId);
    })
    .then( (result) => {
      console.log('check if the user is the creator result:', result);
      if (result.length === 0) {
        // res.redirect('/thanks');
        return res.send({redirect:'/thanks'});
      } else {
        // res.redirect(`/result/${req.params.pollId}/${req.params.userId}/${req.params.urlId}`);
        return res.send({redirect: `/result/${req.params.pollId}/${req.params.userId}/${req.params.urlId}`});
      }
    })
  })


  router.get('/thanks', (req, res) => {
    res.render('thanks_for_vote');
  });

  // Results page
  router.get("/result/:pollId/:userId/:urlId", (req, res) => {
    knex.select().from('poll')
      .where('id', req.params.pollId)
      .andWhere('creator_id', req.params.userId)
      .andWhere('creator_url', req.params.urlId)
    .then( (result) => {
      if (result.length === 0) {
        // change this to a proper error later
        res.status(400).send(`<h1>400 Error: </h1><p>You do not have access to this poll's results.</p><a href='/'>Try starting a new poll.</a>`);
      }
    });

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


