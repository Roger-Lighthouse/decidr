$(() => {
  const list = $('.list');
  const add = $('.add');
  const field = $('.field');
  let index = 2;

  $(add).click((e) => {
    e.preventDefault(); 
    index += 1; 
    $('.field').append(`<div class="empty-space"></div><p class="field faded transition none">Invite ${index}: <input name="email" placeholder="email"></p>`);
    $('.field').last().slideDown('fast', function() {
      $('.field').first().addClass('transition').removeClass('faded').addClass('unfaded').removeClass('field');
    })
  })
}); 

// $(add_button).click(function(e){ //on add input button click
//         e.preventDefault();
//         if(x < max_fields){ //max input box allowed
//             x++; //text box increment
//             $(wrapper).append('<div><input type="text" name="mytext[]"/><a href="#" class="remove_field">Remove</a></div>'); //add input box
//         }
//     });
    
//     $(wrapper).on("click",".remove_field", function(e){ //user click on remove text
//         e.preventDefault(); $(this).parent('div').remove(); x--;
//     })