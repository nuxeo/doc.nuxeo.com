'use strict';
/* eslint-env es6, browser, jquery */

var page_href = window.location.href;

var $prodpad_feedback = $('#prodpad_feedback');
var $required = $prodpad_feedback.find('[required]');
var $submit = $('#prodpad_feedback_submit');
$prodpad_feedback.on('change keyup', 'textarea, input', function() {
  var valid = true;
  $required.each(function() {
    var $this = $(this);
    if ($this.val().trim() === '') {
      valid = false;
    }
  });
  if (valid) {
    $submit.removeAttr('disabled').removeClass('disabled');
  } else {
    $submit.attr('disabled', 'disabled').addClass('disabled');
  }
});

$submit.on('click', function() {
  // Disable Inputs
  $submit
    .attr('disabled', 'disabled')
    .addClass('disabled')
    .text('Sending...');
  $prodpad_feedback
    .find('textarea, input')
    .attr('disabled', 'disabled')
    .addClass('disabled');

  var data = {
    name: $prodpad_feedback.find('[name="name"]').val(),
    email: $prodpad_feedback.find('[name="email"]').val(),
    feedback: $prodpad_feedback.find('[name="feedback"]').val(),
    products: [{ name: 'Documentation' }],
    tags: [{ name: 'Documentation' }],
    source: 'customer_feedback_widget',
    external_links: [
      {
        name: document.title || 'Documentation Source',
        url: page_href
      }
    ]
  };

  $.ajax({
    url:
      'https://api.prodpad.com/v1/feedbacks?apikey=43ebe94f3c4ff5ba36202a5757f9051ad4f7d87d1c3bae8882113efa56af8895',
    method: 'POST',
    data: data
  })
    .done(function() {
      // console.log('success', msg);
      $prodpad_feedback.find('form').slideUp();
      $prodpad_feedback.find('h3').text('Thank you - Feedback received');
      // .after('See your feedback here: ' + msg);
    })
    .fail(function(qXHR, textStatus) {
      $submit
        .removeAttr('disabled')
        .removeClass('disabled')
        .text('Submit Feedback');
      $prodpad_feedback
        .find('textarea, input')
        .removeAttr('disabled')
        .removeClass('disabled');
      alert('Request failed - Try again: ' + textStatus);
    });
});
