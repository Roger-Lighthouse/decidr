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
    data={}
    var x = $('.choices');
    let i = 0;
    for(let element of x){
      i++
      let ans = $(element).text().trim();
      // data[$(element).attr('name')] = ans;
      data[i] = $(element).attr('name');
      console.log($(element).text().trim());
     }
    let pollId = $('.choices').attr('data-pollId');
    let userId = $('.choices').attr('data-user_id');
    let urlId = $('.choices').attr('data-url_id');

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
    $.ajax({
      method: 'POST',
      url: '/answer/' + pollId +'/' + userId +'/' +urlId,
      data: data                // {id:5, value: 'nut'}                    //$('.choices').serializeArray()
    })
    .done((response) => {
      console.log('response'response);
      if (response.redirect) {
          window.location.href = response.redirect;
      }
    })
    .fail(console.error);


  });


});
