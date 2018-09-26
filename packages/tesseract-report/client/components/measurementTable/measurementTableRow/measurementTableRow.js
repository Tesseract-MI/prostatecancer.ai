import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { OHIF } from 'meteor/ohif:core';
import { cornerstone } from 'meteor/ohif:cornerstone';

Template.measurementTableRow.onCreated(() => {
    const instance = Template.instance();
});

Template.measurementTableRow.onRendered(() => {
    const instance = Template.instance();
    const $row = instance.$('.measurementTableRow');
    $row.find('.measurementRowSidebar').click();
});

Template.measurementTableRow.events({

    'click .measurementRowSidebar'(event, instance) {
        const $row = instance.$('.measurementTableRow');
        const rowItem = instance.data.rowItem;

        $row.closest('.measurementTableView').find('.measurementTableRow').not($row).removeClass('active');
        $row.toggleClass('active');
        if (!$row.find('.measurementNumber').find('i').hasClass('fa-caret-down')) {
            $row.find('.measurementNumber').html('<i class="fa fa-caret-down" aria-hidden="true"></i>');
        }
        else {
            $row.find('.measurementNumber').html('<i class="fa fa-caret-right" aria-hidden="true"></i>');
        }
        $row.closest('.measurementTableView').find('.measurementNumber').not($row.find('.measurementNumber')).html('<i class="fa fa-caret-right" aria-hidden="true"></i>');

    },

    'click .js-toggle'(event, instance) {
        const $row = instance.$('.measurementTableRow');
        $row.find('.measurementRowSidebar').click();
    }
});
