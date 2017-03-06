$(function($){
  $("#answer_form").submit(function(){
    $.redirect('/answer/' + pollId +'/' + userId +'/' + urlId, {pollId:pollId, userId: userId, urlId: urlId}); 
  })
}); 

<!-- jquery redirect --> 
    <script src="jquery-XXX.js"></script>
    <script src="jquery.redirect.js"></script>
    
<script type="text/javascript" src="/scripts/jquery-send.js"></script>