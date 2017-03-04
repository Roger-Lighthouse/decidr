const twilCli  = require('../twilio/twilioClient');
const Mailgun = require('mailgun-js');
const mailgun = new Mailgun({apiKey: process.env.api_key, domain: process.env.domain});

var helpers = {

  cleanDate: (date) => {
    var d = date.toString();
    return d.substring(0, 15);
  },

  cleanTime: (date) => {
    var d = date.toString();
    var hours = d.substring(16, 18);
    var hrs = Number(hours);
    var tday= "am";
    hrs = 14;
    if(hrs > 12){
         tday = 'pm'
         hrs -= 12;
    }
    var min = d.substring(19,21);
    return hrs + ':' + min + tday;
  },

  createDateObject: (year, month, day , hour, minute) => {
    let month1 = null;
    if(month === 'Jan'){
      month1 = 0;
    }else if(month === 'Feb'){
      month1 = 1;
    }else if(month === 'Mar'){
      month1 = 2;
    }else if(month === 'Apr'){
      month1 = 3;
    }else if(month === 'May'){
      month1 = 4;
    }else if(month === 'Jun'){
      month1 = 5;
    }else if(month === 'Jul'){
      month1 = 6;
    }else if(month === 'Aug'){
      month1 = 7;
    }else if(month === 'Sep'){
      month1 = 8;
    }else if(month === 'Oct'){
      month1 = 9;
    }else if(month === 'Nov'){
      month1 = 10;
    }else if(month === 'Dec'){
      month1 = 11;
    }
    return new Date(year, month1, day , hour, minute);
  },

  sendEmail: (to, subject, text) => {
     var data = {
       from: process.env.mailgun_from_who,
       to: to,
       subject: subject,
       text: text
     };
     mailgun.messages().send(data, function (err, body) {
      if(err){
       console.log(err.message);
      }
    });
  },

  sendText: (phone, message) => {
    twilCli.sendSms(phone, message, function (err, body) {
     if(err){
       console.log(err.message);
     }
    })
  }


};

//let d = x.createDateObject(2017, 'Mar' , 28, 10, 00);


module.exports = helpers;