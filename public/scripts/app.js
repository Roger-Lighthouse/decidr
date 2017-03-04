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

  $('#answer_form').on('submit', (ev) => {
    ev.preventDefault();
    console.log("***********************Got In answer");

   var x = $('.choices');
     for(element of x){
       console.log($(element).text().trim());

     }

//action='/answer/<%= poll.poll_id %>/<%= user_id %>/<%= url_id %>'
      //let theVal = $('#ind-tweet').find("input[type=text], textarea").val();

      // if(theVal === '' || theVal.length > 140){
      //   alert("Invalid Data!!");
      // }else{
      //   // read the data from the form inputs
      //    const data_obj = {};
      //    $('#ind_tweet').serializeArray().forEach((elm) => {
      //      data_obj[elm.name] = elm.value;
      //    });
      //   // submit the info -- make POST request via ajax
      //   $.ajax({
      //     method: 'POST',
      //     url: '/tweets',
      //     data: $('#ind-tweet').serialize()
      //   })
      //   .done((result) => {
      //     for(key in result){
      //       console.log(key, result[key])
      //     }
      //       $('#ind-tweet').find("input[type=text], textarea").val(result["name"]+'  '+result.address+'  '+result.phone);
      //       $('.new-tweet .counter').text('140');
      //     loadTweets();
      //   })
      //   .fail(console.error);
      // }

  });


});
