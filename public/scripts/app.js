$(() => {
  // $.ajax({
  //   method: "GET",
  //   url: "/api/users"
  // }).done((users) => {
  //   for(user of users) {
  //     $("<div>").text(user.name).appendTo($("body"));
  //   }
  // });;

  // console.log(dataHTML);
});



//The email function requires 3 parameters, to(email), subject, and html(text).
//Put this into an object and then call stringify() on it.
//If the text sends successfully, no data comes back to done().

/*
  $.ajax({
    method: "POST",
    url: "/notify/send_email"
    data: {to: '<to>', subject: '<subject>', html: '<html>'}.stringify()
  }).done((data) => {
      console.log(data);
     $("<div>").text(data.message).appendTo($("body"));
  };
*/

//The text functions requires 2 parameters, phone and message.
//Put this into an object and then call stringify() on it.
//If the text sends successfully, no data comes back to done().

/*
  $.ajax({
    method: "POST",
    url: "/notify/send_text"
    data: {phone: '<target phone', message: '<target message>'}.stringify()
  }).done() => {
    //Ok you handle it here
  };
*/
