import React from "react";
import { cornerstone, cornerstoneTools } from "meteor/ohif:cornerstone";

const modules = cornerstoneTools.store.modules;

import "./roiContourMenu.styl";

/**
 * @class RoiContourSettings - A component that allows the user to change
 * configuration of the freehand3D tools.
 */
export default class RoiContourSettings extends React.Component {
  constructor(props = {}) {
    super(props);

    const { interpolate, displayStats } = modules.freehand3D.state;

    this.state = {
      interpolate,
      displayStats
    };

    this.onDisplayStatsToggleClick = this.onDisplayStatsToggleClick.bind(this);
    this.onInterpolateToggleClick = this.onInterpolateToggleClick.bind(this);
  }

  /**
   * onDisplayStatsToggleClick - A Callback that toggles the display of stats
   * window on the Freehand3DTool.
   *
   * @returns {null}
   */
  onDisplayStatsToggleClick() {
    modules.freehand3D.setters.toggleDisplayStats();

    this.setState({ displayStats: modules.freehand3D.state.displayStats });
  }

  /**
   * onInterpolateToggleClick - A callback that toggles interpolation mode for
   * the Freehand3DTool.
   *
   * @returns {null}
   */
  onInterpolateToggleClick() {
    modules.freehand3D.setters.toggleInterpolate();

    this.setState({ interpolate: modules.freehand3D.state.interpolate });
  }

  render() {
    const { interpolate, displayStats } = this.state;

    return (
      <div className="roi-contour-menu-footer">
        <h3>Settings</h3>
        <a
          className="btn btn-sm btn-secondary"
          onClick={this.onInterpolateToggleClick}
        >
          <div className="roi-contour-menu-option">
            <svg>
              <use
                xlinkHref={
                  interpolate
                    ? "packages/icr_peppermint-tools/assets/icons.svg#icon-freehand-interpolate-on"
                    : "packages/icr_peppermint-tools/assets/icons.svg#icon-freehand-interpolate-off"
                }
              />
            </svg>
            <label>Interpolation</label>
          </div>
        </a>
        <a
          className="btn btn-sm btn-secondary"
          onClick={this.onDisplayStatsToggleClick}
        >
          <div className="roi-contour-menu-option">
            <svg>
              <use
                xlinkHref={
                  displayStats
                    ? "packages/icr_peppermint-tools/assets/icons.svg#icon-freehand-stats-on"
                    : "packages/icr_peppermint-tools/assets/icons.svg#icon-freehand-stats-off"
                }
              />
            </svg>
            <label>Stats</label>
          </div>
        </a>
      </div>
    );
  }
}
