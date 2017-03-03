$(() => {
  const list = $('.list');
  const add = $('.add');
  const field = $('.field');
  let index = 2;

  $('.field').focusin((e) => {
    $('.field').last().addClass('unfaded').addClass('transition');
    let emails = $("[type='email']").toArray();
    if (field !== '' && emails[emails.length - 1].value) {
      e.preventDefault(); 
      index += 1; 

      $('.field').append(`<div class="empty-space"></div><p class="field faded transition none">Invite ${index}: <input type='email' name="email" placeholder="email"></p>`);
      $('.field').last().slideDown('fast', function() {
        $('.field').first().addClass('transition').removeClass('faded').addClass('unfaded').removeClass('field');
      $(emails[emails.length - 1]).focus();
      })
    }
  });
  
  $('.field').focusout((e) => {
    let emails = $("[type='email']").toArray();
    if (field !== '' && emails[emails.length - 1].value) {
      e.preventDefault(); 
      index += 1; 

      $('.field').append(`<div class="empty-space"></div><p class="field faded transition none">Invite ${index}: <input type='email' name="email" placeholder="email"></p>`);
      $('.field').last().slideDown('fast', function() {
        $('.field').first().addClass('transition').removeClass('faded').addClass('unfaded').removeClass('field');
      $(emails[emails.length - 1]).focus();
      })
    }
  })
}); 
