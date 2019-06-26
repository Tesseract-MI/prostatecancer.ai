import { cornerstoneTools } from "meteor/ohif:cornerstone";
import { OHIF } from "meteor/ohif:core";
import getSeriesInstanceUidFromImageId from "./getSeriesInstanceUidFromImageId.js";

const modules = cornerstoneTools.store.modules;
const globalToolStateManager =
  cornerstoneTools.globalImageIdSpecificToolStateManager;

/**
 * Unlock a structureSet, moving them to the working directory
 * so that they may be edited
 *
 * @param {string} seriesInstanceUid  The UID of the series on which the ROIs
 *                                    reside.
 * @param {string} structureSetUid    The uid of the newly created structureSet.
 */
export default function(seriesInstanceUid, structureSetUid) {
  const freehand3DStore = modules.freehand3D;
  const structureSet = freehand3DStore.getters.structureSet(
    seriesInstanceUid,
    structureSetUid
  );

  const ROIContourCollection = structureSet.ROIContourCollection;

  const workingStructureSet = freehand3DStore.getters.structureSet(
    seriesInstanceUid
  );

  // Create new ROIContours in the working directory.
  for (let i = 0; i < ROIContourCollection.length; i++) {
    const ROIContour = ROIContourCollection[i];

    freehand3DStore.setters.ROIContour(
      seriesInstanceUid,
      "DEFAULT",
      ROIContour.name,
      {
        uid: ROIContour.uid,
        polygonCount: ROIContour.polygonCount,
        color: ROIContour.color
      }
    );
  }

  const toolStateManager = globalToolStateManager.saveToolState();

  Object.keys(toolStateManager).forEach(elementId => {
    // Only get polygons from this series
    if (getSeriesInstanceUidFromImageId(elementId) === seriesInstanceUid) {
      // grab the freehand tool for this DICOM instance

      if (
        toolStateManager &&
        toolStateManager[elementId] &&
        toolStateManager[elementId].freehandMouse
      ) {
        const toolState = toolStateManager[elementId].freehandMouse;
        const toolData = toolState.data;

        movePolygonsInInstance(
          workingStructureSet,
          toolData,
          seriesInstanceUid
        );
      }
    }
  });

  // Remove named structureSet.
  freehand3DStore.setters.deleteStructureSet(
    seriesInstanceUid,
    structureSetUid
  );

  if (workingStructureSet.activeROIContourIndex === null) {
    workingStructureSet.activeROIContourIndex = 0;
  }
}

/**
 * Moves the ROIs defined by the seriesInstanceUid, roiCollectionName
 * and exportMask from the working directory to a new named roiCollection.
 *
 * @param  {Object} exportData  An object containing the required information
 *                              to execute the move opperation.
 */
function movePolygonsInInstance(
  workingStructureSet,
  toolData,
  seriesInstanceUid
) {
  const freehand3DStore = modules.freehand3D;

  for (let i = 0; i < toolData.length; i++) {
    const data = toolData[i];

    const referencedROIContour = freehand3DStore.getters.ROIContour(
      seriesInstanceUid,
      "DEFAULT",
      data.ROIContourUid
    );

    const referencedStructureSet = freehand3DStore.getters.structureSet(
      seriesInstanceUid,
      "DEFAULT"
    );

    data.structureSetUid = "DEFAULT";
    data.referencedROIContour = referencedROIContour;
    data.referencedStructureSet = referencedStructureSet;
  }
}
