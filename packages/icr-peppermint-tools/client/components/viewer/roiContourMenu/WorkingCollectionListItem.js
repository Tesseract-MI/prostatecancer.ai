import React from "react";

import "./roiContourMenu.styl";

/**
 * @class WorkingCollectionListItem - Renders metadata for the working
 * ROIContour Collection.
 */
export default class WorkingCollectionListItem extends React.Component {
  constructor(props = {}) {
    super(props);
  }

  render() {
    const {
      roiContourIndex,
      metadata,
      onRoiChange,
      onRenameButtonClick,
      activeROIContourIndex
    } = this.props;

    const checked = activeROIContourIndex === roiContourIndex;
    const name = metadata.name;
    const polygonCount = metadata.polygonCount;
    const roiContourColor = metadata.color;

    return (
      <tr>
        <td className="left-aligned-cell">
          <i className="fa fa-square" style={{ color: roiContourColor }} />{" "}
          <input
            type="radio"
            checked={checked}
            onChange={() => onRoiChange(roiContourIndex)}
          />
        </td>
        <td className="left-aligned-cell">
          <a
            className="roi-contour-menu-name-link"
            onClick={() => {
              onRenameButtonClick(metadata);
            }}
          >
            {name}
          </a>
        </td>
        <td>{polygonCount}</td>
      </tr>
    );
  }
}
