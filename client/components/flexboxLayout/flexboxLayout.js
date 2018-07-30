import { Session } from 'meteor/session';

Template.flexboxLayout.events({
    'transitionend .sidebarMenu'(event) {
        if (!event.target.classList.contains('sidebarMenu')) {
            return;
        }

        window.ResizeViewportManager.handleResize();

        $('.roundedButtonWrapper[data-value="findings"]').click();
        if (Session.get('resultGenerated') === true) {
            $('.roundedButtonWrapper[data-value="result"]').removeClass('disabled');
        }
        else {
            $('.roundedButtonWrapper[data-value="result"]').addClass('disabled');
        }
    }
});

Template.flexboxLayout.helpers({
    leftSidebarOpen() {
        return Template.instance().data.state.get('leftSidebar');
    },

    rightSidebarOpen() {
        return Template.instance().data.state.get('rightSidebar');
    }
});
