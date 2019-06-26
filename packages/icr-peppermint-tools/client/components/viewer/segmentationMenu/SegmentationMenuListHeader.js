import React from "react";
import "./segmentationMenu.styl";

/**
 * @class SegmentationMenuListHeader - Renders the header for the
 * SegmentationMenuList table.
 */
export default class SegmentationMenuListHeader extends React.Component {
  constructor(props = {}) {
    super(props);
  }

  render() {
    const { importMetadata } = this.props;

    return (
      <React.Fragment>
        <tr>
          <th
            colSpan="3"
            className="left-aligned-cell segmentation-menu-list-bordered"
          >
            {importMetadata.name}
          </th>
          <th
            colSpan="2"
            className="right-aligned-cell segmentation-menu-list-bordered"
          >
            {importMetadata.label}
          </th>
        </tr>
        {importMetadata.type && (
          <tr>
            <th
              colSpan="3"
              className="left-aligned-cell segmentation-menu-list-bordered"
            >
              Type: {importMetadata.type}
            </th>
            <th
              colSpan="2"
              className="right-aligned-cell segmentation-menu-list-bordered"
            >
              Modified: {importMetadata.modified}
            </th>
          </tr>
        )}
        <tr className="segmentation-menu-list-bordered">
          <th>Paint</th>
          <th>Label</th>
          <th className="centered-cell">Type</th>
          <th className="centered-cell">Hide</th>
          <th className="centered-cell">Delete</th>
        </tr>
      </React.Fragment>
    );
  }
}
