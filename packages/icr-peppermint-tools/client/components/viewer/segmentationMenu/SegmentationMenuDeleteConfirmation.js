import React from "react";
import "./segmentationMenu.styl";

/**
 * @class SegmentationMenuDeleteConfirmation - Renders a confirmation dialog for
 * confirmation of segment deletion.
 */
export default class SegmentationMenuDeleteConfirmation extends React.Component {
  constructor(props = {}) {
    super(props);
  }

  render() {
    const {
      segmentLabel,
      onDeleteConfirmClick,
      onDeleteCancelClick
    } = this.props;

    return (
      <div>
        <div>
          <h5>Warning!</h5>
          <p>
            Are you sure you want to delete {segmentLabel}? This cannot be
            undone.
          </p>
        </div>
        <div className="seg-delete-horizontal-box">
          <a className="btn btn-sm btn-primary" onClick={onDeleteConfirmClick}>
            <i className="fa fa fa-check-circle fa-2x" />
          </a>
          <a className="btn btn-sm btn-primary" onClick={onDeleteCancelClick}>
            <i className="fa fa fa-times-circle fa-2x" />
          </a>
        </div>
      </div>
    );
  }
}
