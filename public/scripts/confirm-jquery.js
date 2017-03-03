$(() => {
  const list = $('.list');
  const add = $('.add');
  const field = $('.field');
  let index = 2;

  $('.field').focusin((e) => {
    $('.field').last().addClass('unfaded').addClass('transition');
    let options = $("[type='text']").toArray();
    console.log(emails)
    if (field !== '' && options[options.length - 1].value) {
      e.preventDefault(); 
      index += 1; 

      $('.field').append(`<div class="empty-space"></div><p class="field faded transition none">Option ${index}: <input type='text' name="text" placeholder="What do you want to do?"></p>`);
      $('.field').last().slideDown('fast', function() {
        $('.field').first().addClass('transition').removeClass('faded').addClass('unfaded').removeClass('field');
      $(options[options.length - 1]).focus();
      })
    }
  });
  
  $('.field').focusout((e) => {
    let options = $("[type='text']").toArray();
    if (field !== '' && options[options.length - 1].value) {
      e.preventDefault(); 
      index += 1; 

      $('.field').append(`<div class="empty-space"></div><p class="field faded transition none">Option ${index}: <input type='text' name="text" placeholder="What do you want to do?"></p>`);
      $('.field').last().slideDown('fast', function() {
        $('.field').first().addClass('transition').removeClass('faded').addClass('unfaded').removeClass('field');
      $(options[options.length - 1]).focus();
      })
    }
  })
}); 
