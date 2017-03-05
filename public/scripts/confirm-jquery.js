$(() => {
  
  $('#user-modal').click((e) => {
    $('#first').focus(); 
  });
  
  const list = $('.list');
  const add = $('.add');
  const field = $('.field');
  let index = 2;

  $('.field').keyup((e) => {
    $('.field').last().addClass('unfaded').addClass('transition');
    let options = $("[type='text']").toArray();
    if (field !== '' && options[options.length - 1].value) {
      e.preventDefault();
      index += 1; 

      $('.field').append(`<div class="empty-space">
          <div class='form-group field faded visible'>
            <label class='control-label'>Option ${index}: </label>
            <input class='col-xs-12 col-sm-6 form-control' type="text" name="option" placeholder='What do you want to do?'>
          </div>`);
      $('.field').last().slideDown('fast', function() {
        $('.field').first().addClass('transition').removeClass('faded').addClass('unfaded').removeClass('field');
      $(options[options.length - 1]).focus();
      })
    }
  });
}); 
