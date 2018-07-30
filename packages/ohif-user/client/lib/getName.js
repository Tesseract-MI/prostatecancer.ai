import { Meteor } from 'meteor/meteor';
import { OHIF } from 'meteor/ohif:core';

OHIF.user.getName = () => {
    const user = Meteor.user();
    if (!user) return '';
    const nameSplit = Meteor.user().profile.fullName.split(' ');
    const firstName = nameSplit[0];
    return firstName
};
