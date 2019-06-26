import "./freehandSetNameDialogs.html";
import FreehandSetNameDialog from "./ReactComponents/FreehandSetNameDialog.js";

Template.freehandSetNameDialogs.onCreated(() => {
  const instance = Template.instance();

  // Used to remount component.
  instance.data.freehandSetNameDialogDefaultName = new ReactiveVar("");
  instance.data.freehandSetNameDialogId = new ReactiveVar("");
  instance.data.freehandSetNameDialogCallback = new ReactiveVar(() => {
    return;
  });
});

Template.freehandSetNameDialogs.onRendered(() => {
  const instance = Template.instance();
  const id = "freehandSetNameDialog";

  const dialog = instance.$("#" + id);
  instance.data.dialog = dialog;

  dialogPolyfill.registerDialog(dialog.get(0));
});

Template.freehandSetNameDialogs.helpers({
  FreehandSetNameDialog() {
    return FreehandSetNameDialog;
  },
  id() {
    const instance = Template.instance();

    return instance.data.freehandSetNameDialogId.get();
  },
  defaultName() {
    const instance = Template.instance();

    return instance.data.freehandSetNameDialogDefaultName.get();
  },
  callback() {
    const instance = Template.instance();

    return instance.data.freehandSetNameDialogCallback.get();
  }
});
