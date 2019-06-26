import { OHIF } from "meteor/ohif:core";
import getSeriesInstanceUidFromEnabledElement from "./getSeriesInstanceUidFromEnabledElement.js";

/**
 * @static Returns the seriesInstanceUid of the active element.
 * @public
 *
 * @return {String} The seriesInstanceUid for the active element.
 */
export default function getActiveSeriesInstanceUid() {
  const activeEnabledElement = OHIF.viewerbase.viewportUtils.getEnabledElementForActiveElement();

  return getSeriesInstanceUidFromEnabledElement(activeEnabledElement);
}
