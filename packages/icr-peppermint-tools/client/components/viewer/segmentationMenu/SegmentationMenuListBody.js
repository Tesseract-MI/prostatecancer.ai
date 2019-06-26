import React from "react";
import SegmentationMenuListItem from "./SegmentationMenuListItem.js";

import "./segmentationMenu.styl";

/**
 * @class SegmentationMenuListBody - Renders a list of SegmentationMenuListItems,
 * displaying the metadata of segments.
 */
export default class SegmentationMenuListBody extends React.Component {
  constructor(props = {}) {
    super(props);
  }

  render() {
    const {
      segments,
      visibleSegments,
      activeSegmentIndex,
      onNewSegmentButtonClick,
      onSegmentChange,
      onShowHideClick,
      onEditClick,
      onDeleteClick
    } = this.props;

    return (
      <React.Fragment>
        {segments.map(segment => (
          <SegmentationMenuListItem
            key={`${segment.metadata.SegmentLabel}_${segment.index}`}
            segmentIndex={segment.index}
            metadata={segment.metadata}
            visible={visibleSegments[segment.index]}
            onSegmentChange={onSegmentChange}
            onShowHideClick={onShowHideClick}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            checked={segment.index === activeSegmentIndex}
          />
        ))}
        <tr>
          <th />
          <th>
            <a
              className="segmentation-menu-new-button btn btn-sm btn-primary"
              onClick={onNewSegmentButtonClick}
            >
              <i className="fa fa-plus-circle" /> Segment
            </a>
          </th>
        </tr>
      </React.Fragment>
    );
  }
}
