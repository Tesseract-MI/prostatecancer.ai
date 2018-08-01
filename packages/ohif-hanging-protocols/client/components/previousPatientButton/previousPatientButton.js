Template.previousPatientButton.events({
    'click #previousPatient'(event) {
        // Stop here if the tool is disabled
        if ($(event.currentTarget).hasClass('disabled')) {
            return;
        }

        // Hide the button's Bootstrap tooltip in case it was shown
        $(event.currentTarget).tooltip('hide');

        let patientName = OHIF.viewer.Studies.all()[0]['patientName'];
        const studies = window.sessionStorage.getItem("studies");

        if (studies) {
            JSON.parse(studies).find((element, index, array) => {
                if (element.patientName === patientName && index-1 >= 0) {
                    window.location.href = '/viewer/' + array[index-1]['studyInstanceUid'];
                }
            });
        }
    }
});
