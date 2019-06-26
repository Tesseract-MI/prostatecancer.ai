import { cornerstoneTools } from "meteor/ohif:cornerstone";

const modules = cornerstoneTools.store.modules;

export default function() {
  const masks = _getUnsavedMasks();
  const contours = _getUnsavedContours();

  return {
    masks,
    contours,
    hasUnsavedRegions: masks.length || contours.length ? true : false
  };
}

function _getUnsavedContours() {
  const freehandModule = modules.freehand3D;
  const getStructureSet = freehandModule.getters.structureSet;
  const seriesCollection = freehandModule.state.seriesCollection;
  const unsavedContours = [];

  seriesCollection.forEach(series => {
    const seriesInstanceUid = series.uid;
    const activeStructureSet = getStructureSet(seriesInstanceUid);

    if (activeStructureSet.ROIContourCollection.length) {
      unsavedContours.push(seriesInstanceUid);
    }
  });

  return unsavedContours;
}

function _getUnsavedMasks() {
  const brushModule = modules.brush;
  const segmentationMetadata = brushModule.state.segmentationMetadata;

  const unsavedMasks = [];

  Object.keys(segmentationMetadata).forEach(seriesInstanceUid => {
    const importMetadata = brushModule.getters.importMetadata(
      seriesInstanceUid
    );

    // If the segmentation is "imported" and not "modified", its saved.
    if (importMetadata && !importMetadata.modified) {
      return;
    }

    unsavedMasks.push(seriesInstanceUid);
  });

  return unsavedMasks;
}
