import { OHIF } from "meteor/ohif:core";

export default function getSeriesInstanceUidFromEnabledElement(enabledElement) {
  if (!enabledElement) {
    return;
  }

  const imageId = enabledElement.image.imageId;
  const metaData = OHIF.viewer.metadataProvider.getMetadata(imageId);

  return metaData.series.seriesInstanceUid;
}
