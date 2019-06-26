/**
 * Extracts the seriesInstanceUid from an image, given the imageId.
 *
 * @param {String} imageId The ID of the image being queried.
 */
export default function getSeriesInstanceUidFromImageId(imageId) {
  const metaData = OHIF.viewer.metadataProvider.getMetadata(imageId);
  return metaData.series.seriesInstanceUid;
}
