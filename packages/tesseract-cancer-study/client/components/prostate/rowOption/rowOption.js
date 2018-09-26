import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

const imgNameMap = {'Base': 'base', 'Mid': 'mid', 'Apex': 'apex', 'Seminal Vesicles': 'seminal_vesicles'};

Template.rowOption.onCreated(() => {
    const instance = Template.instance();
});

Template.rowOption.onRendered(() => {
    const instance = Template.instance();
});

Template.rowOption.events({

    'change .location'(event, instance) {
        let newElement = '<embed src="/images/' + imgNameMap[event.target.value] + '.svg" type="image/svg+xml" width="60%" class="img-responsive center-block" />';
        let elementId = event.currentTarget.id;
        $('#location-img-' + elementId).find(':first-child').remove();
        $('#location-img-' + elementId).append(newElement);
        $('#location-side-' + elementId).text('-');
        $('#location-pos-' + elementId).text('-');
    },

    'click .js-increment'(event, instance) {
        document.getElementById($($(event.currentTarget)[0].parentElement).siblings('input')[0].id).stepUp(1);
    },

    'click .js-decrement'(event, instance) {
        document.getElementById($($(event.currentTarget)[0].parentElement).siblings('input')[0].id).stepDown(1);
    }
});
