import { cornerstone, cornerstoneTools } from "meteor/ohif:cornerstone";
import { OHIF } from "meteor/ohif:core";
import isDialogOpen from "../util/isDialogOpen.js";
import getActiveSeriesInstanceUid from "../util/getActiveSeriesInstanceUid.js";
import getActiveBrushToolsForElement from "../util/getActiveBrushToolsForElement.js";
import { newSegmentInput } from "../util/brushMetadataIO.js";

const getKeyFromKeyCode = cornerstoneTools.import("util/getKeyFromKeyCode");
const Mousetrap = require("mousetrap");
const BaseBrushTool = cornerstoneTools.import("base/BaseBrushTool");

const brushModule = cornerstoneTools.store.modules.brush;

Mousetrap.bind(["[", "]", "-", "=", "+", "n", "N"], function(evt) {
  if (isDialogOpen()) {
    return;
  }

  const activeEnabledElement = OHIF.viewerbase.viewportUtils.getEnabledElementForActiveElement();
  const element = activeEnabledElement.element;
  const activeBrushTools = getActiveBrushToolsForElement(element);

  if (!activeBrushTools.length) {
    return;
  }

  const brushTool = activeBrushTools[0];
  const key = evt.key;
  let imageNeedsUpdate = false;

  switch (key) {
    case "[":
      brushTool.previousSegmentation();
      imageNeedsUpdate = true;
      // JamesAPetts
      Session.set("refreshSegmentationMenu", Math.random().toString);
      break;
    case "]":
      brushTool.nextSegmentation();
      imageNeedsUpdate = true;
      // JamesAPetts
      Session.set("refreshSegmentationMenu", Math.random().toString);
      break;
    case "-":
      brushTool.decreaseBrushSize();
      imageNeedsUpdate = true;
      break;
    case "+":
    case "=":
      brushTool.increaseBrushSize();
      imageNeedsUpdate = true;
      break;
    case "n":
    case "N":
      newSegmentation();
      break;
  }

  if (imageNeedsUpdate) {
    cornerstone.updateImage(element);
  }
});

function newSegmentation() {
  const seriesInstanceUid = getActiveSeriesInstanceUid();

  let segMetadata = brushModule.state.segmentationMetadata[seriesInstanceUid];

  if (!segMetadata) {
    brushModule.state.segmentationMetadata[seriesInstanceUid] = [];
    segMetadata = brushModule.state.segmentationMetadata[seriesInstanceUid];
  }

  const colormap = cornerstone.colors.getColormap(brushModule.state.colorMapId);
  const numberOfColors = colormap.getNumberOfColors();

  for (let i = 0; i < numberOfColors; i++) {
    if (!segMetadata[i]) {
      brushModule.state.drawColorId = i;
      newSegmentInput(i);
      break;
    }
  }
}
