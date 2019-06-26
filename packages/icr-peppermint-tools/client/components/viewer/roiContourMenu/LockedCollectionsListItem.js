import React from "react";
import { cornerstoneTools } from "meteor/ohif:cornerstone";
import getBrushSegmentColor from "../../../lib/util/getBrushSegmentColor.js";
import { OHIF } from "meteor/ohif:core";

import "./roiContourMenu.styl";

const modules = cornerstoneTools.store.modules;

/**
 * @class LockedCollectionsListItem - Renders metadata for an individual locked
 * ROIContour Collection.
 */
export default class LockedCollectionsListItem extends React.Component {
  constructor(props = {}) {
    super(props);

    const visible = this.props.collection.metadata.visible;

    this.state = {
      expanded: false,
      visible
    };

    this.onToggleVisibilityClick = this.onToggleVisibilityClick.bind(this);
    this.onShowHideClick = this.onShowHideClick.bind(this);
  }

  /**
   * onToggleVisibilityClick - Callback that toggles the expands/collapses the
   * list of collection metadata.
   *
   * @returns {null}
   */
  onToggleVisibilityClick() {
    const { expanded } = this.state;

    this.setState({ expanded: !expanded });
  }

  /**
   * onShowHideClick - Toggles the visibility of the collections ROI Contours.
   *
   * @returns {null}
   */
  onShowHideClick() {
    const { collection, seriesInstanceUid } = this.props;
    const { visible } = this.state;
    const structureSet = modules.freehand3D.getters.structureSet(
      seriesInstanceUid,
      collection.metadata.uid
    );

    structureSet.visible = !visible;
    this.setState({ visible: !visible });

    // Update viewport.
    const element = OHIF.viewerbase.viewportUtils.getActiveViewportElement();

    cornerstone.updateImage(element);
  }

  render() {
    const { collection, onUnlockClick, seriesInstanceUid } = this.props;
    const { expanded, visible } = this.state;

    const metadata = collection.metadata;
    const ROIContourArray = collection.ROIContourArray;

    const visibleButton = expanded ? "fa fa-minus-square" : "fa fa-plus-square";
    const showHideIcon = visible ? "fa fa-eye" : "fa fa-eye-slash";

    return (
      <React.Fragment>
        <tr className="roi-list-header">
          <td className="centered-cell">
            <a
              className="btn btn-sm btn-secondary"
              onClick={this.onToggleVisibilityClick}
            >
              <i className={visibleButton} />
            </a>
          </td>
          <th colSpan="2">{metadata.name}</th>
          <td className="centered-cell">
            <a
              className="btn btn-sm btn-secondary"
              onClick={this.onShowHideClick}
            >
              <i className={showHideIcon} />
            </a>
          </td>
          <td className="centered-cell">
            <a
              className="btn btn-sm btn-secondary"
              onClick={() => {
                onUnlockClick(metadata.uid);
              }}
            >
              <i className="fa fa-unlock" />
            </a>
          </td>
        </tr>

        {expanded && (
          <React.Fragment>
            <tr>
              <th />
              <th>Name</th>
              <th className="centered-cell">Contours</th>
            </tr>
            {ROIContourArray.map(roiContour => (
              <tr key={roiContour.metadata.uid}>
                <td className="left-aligned-cell">
                  <i
                    className="fa fa-square"
                    style={{ color: roiContour.metadata.color }}
                  />
                </td>
                <td className="left-aligned-cell">
                  {roiContour.metadata.name}
                </td>
                <td className="centered-cell">
                  {roiContour.metadata.polygonCount}
                </td>
              </tr>
            ))}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}
