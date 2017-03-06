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

  $('#answer_form').submit((ev) => {
    ev.preventDefault();
    console.log("***********************Got In answer");
    let data = [];
    let x = $('.choices');
    let pollId = $('.choices').attr('data-pollId');
    let userId = $('.choices').attr('data-user_id');
    let urlId = $('.choices').attr('data-url_id');

    for (let i = 0; i < x.length; i++) {
      let element = x[i];
      // let name = $(element).text().trim();
      let choice_id = $(element).attr('name');
      let rank = x.length - i; 
      data[i] = {
        choice_id: choice_id, 
        rank: rank, 
        poll_Id: pollId, 
        user_id: userId}; 
      }

    $.ajax({
      type: 'POST',
      url: `/answer/${pollId}/${userId}/${urlId}`,
      data: JSON.stringify(data),
      headers: {
        'ContextType': 'application/json',
      }
    })      
    .done((response) => {
      debugger; 
      console.log('response', response.redirect);
      if (response.redirect) {
          window.location.href = response.redirect;
          console.log('response inside if');
      }
      console.log('response finished');
    })
    .fail(console.error('test'));
  });


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
});
