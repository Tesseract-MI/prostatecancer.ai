import { Session } from 'meteor/session';
// import { components as peppermintComponents } from "meteor/icr:peppermint-tools";

// const { RoiContourMenu, SegmentationMenu } = peppermintComponents;

let cornertoneNewImageActiveViewport = "CornerstoneNewImage0";

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
    },
    rightSidebarSegmentationMenu() {
        const leftSidebarValue = Template.instance().data.state.get('rightSidebar');

        if (leftSidebarValue === "segmentationMenu") {
          return true;
        }

        return;
    },
    rightSidebarReportMenu() {
        const leftSidebarValue = Template.instance().data.state.get('rightSidebar');

        if (leftSidebarValue === "hangingprotocols") {
          return true;
        }

        return;
    },
    SegmentationMenu() {
        return SegmentationMenu;
    },
    segmentationMenuId() {
        const instance = Template.instance();

        Session.get(cornertoneNewImageActiveViewport);

        const activeViewport = Session.get("activeViewport");

        cornerstoneNewImageActiveViewport = `CornerstoneNewImage${activeViewport}`;

        Session.get("refreshSegmentationMenu");

        return Math.random().toString();
    },
    segmentationMenuImportComponent() {
        return MaskImportList;
    },
    segmentationMenuExportComponent() {
        return MaskExportList;
    },
});
