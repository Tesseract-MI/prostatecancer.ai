import React from "react";
import WorkingCollectionListItem from "./WorkingCollectionListItem.js";

import "./roiContourMenu.styl";

/**
 * @class WorkingRoiCollectionList - Renders a list of
 * WorkingCollectionListItem, displaying metadata of the working ROIContour
 * Collection.
 */
export default class WorkingRoiCollectionList extends React.Component {
  constructor(props = {}) {
    super(props);
  }

  render() {
    const {
      workingCollection,
      activeROIContourIndex,
      onRoiChange,
      onRenameButtonClick,
      onNewRoiButtonClick
    } = this.props;

    return (
      <React.Fragment>
        <tr className="roi-list-header">
          <th />
          <th colSpan="4"> New ROI Contour Collection</th>
        </tr>

        <tr>
          <th>Draw</th>
          <th>Name</th>
          <th className="centered-cell">Contours</th>
        </tr>

        {workingCollection.map(roiContour => (
          <WorkingCollectionListItem
            key={roiContour.metadata.uid}
            roiContourIndex={roiContour.index}
            metadata={roiContour.metadata}
            activeROIContourIndex={activeROIContourIndex}
            onRoiChange={onRoiChange}
            onRenameButtonClick={onRenameButtonClick}
          />
        ))}

        <tr>
          <th />
          <th>
            <a
              className="roi-contour-menu-new-button btn btn-sm btn-primary"
              onClick={onNewRoiButtonClick}
            >
              <i className="fa fa-plus-circle" /> ROI
            </a>
          </th>
        </tr>
      </React.Fragment>
    );
  }
}
