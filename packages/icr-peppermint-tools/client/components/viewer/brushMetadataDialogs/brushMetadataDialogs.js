import "./brushMetadataDialogs.html";
import BrushMetadataDialog from "./ReactComponents/BrushMetadataDialog.js";

Template.brushMetadataDialogs.onCreated(() => {
  const instance = Template.instance();

  // Used to remount component.
  instance.data.brushMetadataDialogSegIndex = new ReactiveVar();
  instance.data.brushMetadataDialogCallback = new ReactiveVar(() => {
    return;
  });
  instance.data.brushMetadataDialogMetadata = new ReactiveVar();
});

Template.brushMetadataDialogs.onRendered(() => {
  const instance = Template.instance();
  const id = "brushMetadataDialog";

  const dialog = instance.$("#" + id);
  instance.data.dialog = dialog;

  dialogPolyfill.registerDialog(dialog.get(0));
});

Template.brushMetadataDialogs.helpers({
  BrushMetadataDialog() {
    return BrushMetadataDialog;
  },
  segIndex() {
    const instance = Template.instance();

    return instance.data.brushMetadataDialogSegIndex.get();
  },
  metadata() {
    const instance = Template.instance();

    return instance.data.brushMetadataDialogMetadata.get();
  },
  callback() {
    const instance = Template.instance();

    return instance.data.brushMetadataDialogCallback.get();
  },
  id() {
    const instance = Template.instance();

    instance.data.brushMetadataDialogSegIndex.get();
    instance.data.brushMetadataDialogMetadata.get();
    instance.data.brushMetadataDialogCallback.get();

    return Math.random().toString();
  }
});
