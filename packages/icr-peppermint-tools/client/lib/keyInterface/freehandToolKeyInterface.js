import { cornerstoneTools } from "meteor/ohif:cornerstone";
import { createNewVolume } from "../util/freehandNameIO.js";
import { OHIF } from "meteor/ohif:core";
import isDialogOpen from "../util/isDialogOpen.js";

const getKeyFromKeyCode = cornerstoneTools.import("util/getKeyFromKeyCode");
const Mousetrap = require("mousetrap");
const BaseBrushTool = cornerstoneTools.import("base/BaseBrushTool");

// TODO -> Move all this to OHIF viewer keybindings if thats possible through a plugin?

Mousetrap.bind(
  ["n", "N", "ctrl", "del"],
  function(evt) {
    if (isDialogOpen()) {
      return;
    }

    const activeEnabledElement = OHIF.viewerbase.viewportUtils.getEnabledElementForActiveElement();
    const element = activeEnabledElement.element;
    const freehandTool = cornerstoneTools.getToolForElement(
      element,
      "freehandMouse"
    );

    const key = evt.key;
    let imageNeedsUpdate = false;

    switch (key) {
      case "n":
      case "N":
        if (freehandTool && freehandTool.mode === "active") {
          createNewVolume();
        }
        break;
      case "Control":
        freehandTool.configuration.alwaysShowHandles = false;
        imageNeedsUpdate = true;

        break;
      case "Delete":
        freehandTool.cancelDrawing(element);
        imageNeedsUpdate = true;
        break;
    }

    if (imageNeedsUpdate) {
      cornerstone.updateImage(element);
    }
  },
  "keyup"
);

Mousetrap.bind(
  ["ctrl"],
  function(evt) {
    if (isDialogOpen()) {
      return;
    }

    const activeEnabledElement = OHIF.viewerbase.viewportUtils.getEnabledElementForActiveElement();
    const element = activeEnabledElement.element;
    const freehandTool = cornerstoneTools.getToolForElement(
      element,
      "freehandMouse"
    );

    freehandTool.configuration.alwaysShowHandles = true;
    cornerstone.updateImage(element);
  },
  "keydown"
);
