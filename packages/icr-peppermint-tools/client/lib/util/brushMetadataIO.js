import { cornerstoneTools } from "meteor/ohif:cornerstone";
import getActiveSeriesInstanceUid from "./getActiveSeriesInstanceUid.js";
import generateBrushMetadata from "../../lib/util/generateBrushMetadata.js";

const brushModule = cornerstoneTools.store.modules.brush;

export function newSegmentInput(segIndex, metadata) {
  brushMetdataInput(segIndex, metadata, segmentInputCallback);
}

export function editSegmentInput(segIndex, metadata) {
  brushMetdataInput(segIndex, metadata, segmentInputCallback);
}

function segmentInputCallback(data) {
  if (!data) {
    return;
  }

  const { label, categoryUID, typeUID, modifierUID, segIndex } = data;

  const seriesInstanceUid = getActiveSeriesInstanceUid();
  const metadata = generateBrushMetadata(
    label,
    categoryUID,
    typeUID,
    modifierUID
  );

  brushModule.setters.metadata(seriesInstanceUid, segIndex, metadata);
  brushModule.state.drawColorId = segIndex;

  // JamesAPetts
  Session.set("refreshSegmentationMenu", Math.random().toString());
}

/**
 * Opens the brushMetadata dialog.
 *
 */
function brushMetdataInput(segIndex, metadata, callback) {
  const brushMetadataDialog = document.getElementById("brushMetadataDialog");
  const dialogData = Blaze.getData(brushMetadataDialog);

  dialogData.brushMetadataDialogSegIndex.set(segIndex);
  dialogData.brushMetadataDialogMetadata.set(metadata);
  dialogData.brushMetadataDialogCallback.set(callback);

  brushMetadataDialog.showModal();
}
