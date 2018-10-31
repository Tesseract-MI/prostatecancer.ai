Template.feedbackButton.events({
    'click #feedback'(event) {
      // Stop here if the tool is disabled
      if ($(event.currentTarget).hasClass('disabled')) {
          return;
      }

      // Hide the button's Bootstrap tooltip in case it was shown
      $(event.currentTarget).tooltip('hide');
    }
});

Template.feedbackButton.helpers({
  showFeedback: function (){
    return Session.get('getFeedback');
  }
});
