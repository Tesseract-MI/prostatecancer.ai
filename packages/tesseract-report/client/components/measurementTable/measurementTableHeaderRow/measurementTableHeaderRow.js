import { Template } from 'meteor/templating';
import { OHIF } from 'meteor/ohif:core';
import { Viewerbase } from 'meteor/ohif:viewerbase';

Template.measurementTableHeaderRow.helpers({
    fiducialsCount() {
        const studyInstanceUid = window.location.pathname.split('/')[2];
        return fiducialsCollection.find({'studyInstanceUid': studyInstanceUid}).count();
    },
});
