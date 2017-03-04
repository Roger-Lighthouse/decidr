
"use strict";

const express = require('express');
const router  = express.Router();
const Mailgun  = require('mailgun-js');
const twilCli  = require('../twilio/twilioClient');
const mailgun = require("../notify/mailgun");
const fake_db = require("../db/fake_db");


module.exports = () => {

/*
 router.get("/test_email", (req, res) => {
   console.log("Got into post send_email");
   let to =  'apple@whiteshark.ca';  //req.body.to;
   let subject = 'Email Using Routes';  //req.body.subject;
   let html = 'Test Test Test';  //req.body.html

   var data = {
     from: process.env.mailgun_from_who,
     to: to,
     subject: subject,
     html: html
   };
   //var mailgun = new Mailgun({apiKey: process.env.api_key, domain: process.env.domain});

   mailgun.messages().send(data, function (err, body) {
     if(err){
       res.status(500).json({ error: err.message });
     }else{
       res.status(201);
     }
   });
 });
*/
 router.get("/result", (req, res) =>{
   res.render("result", fake_db);
 });

 router.get("/poll_results", (req, res) =>{
   res.render("poll_results", fake_db);
 });


 router.post("/send_email", (req, res) => {
   let to =  req.body.to;
   let subject = req.body.subject;
   let html = req.body.html

   var data = {
     from: process.env.mailgun_from_who,
     to: req.body.to,
     subject: req.body.subject,
     text: req.body.text
   };

   mailgun.messages().send(data, function (err, body) {
     if(err){
      res.status(500).json({ error: err.message });
     }else{
        res.status(201).json({message: "Email sent successfully"});
     }
     });
 });



 router.post("/send_text", (req, res) => {
   const phone = req.body.phone;
   const message = req.body.message;
   const message1 = twilCli.sendSms(phone, message, function (err, body) {
     if(err){
       res.status(500).json({ error: err.message });
     }else{
      res.status(201);
     }
   });


 });

  return router;
};
