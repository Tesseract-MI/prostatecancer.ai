import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';
import { OHIF } from 'meteor/ohif:core';

Template.measurementTable.onCreated(() => {
    const instance = Template.instance();

    instance.data.measurementTableLayout = new ReactiveVar('comparison');

    // Run this computation every time table layout changes
    instance.autorun(() => {
        // Get the current table layout
        const tableLayout = instance.data.measurementTableLayout.get();
    });
});

Template.measurementTable.helpers({

    buttonGroupData() {
        const instance = Template.instance();
        return {
            value: instance.data.measurementTableLayout,
            options: [{
                value: 'aiModel',
                lgText: 'AI Settings',
                class: 'js-toggleable'
            }, {
                value: 'findings',
                lgText: 'Findings',
                class: 'js-toggleable'
            }, {
                value: 'result',
                lgText: 'Result',
                class: 'js-toggleable'
            }]
        };
    }
});
