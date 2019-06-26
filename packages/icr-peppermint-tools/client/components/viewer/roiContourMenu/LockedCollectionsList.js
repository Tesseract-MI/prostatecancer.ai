import React from "react";
import LockedCollectionsListItem from "./LockedCollectionsListItem.js";

import "./roiContourMenu.styl";

/**
 * @class LockedCollectionsList - Renders a list of LockedCollectionsListItems,
 * displaying metadata of locked ROIContour Collections.
 */
export default class LockedCollectionsList extends React.Component {
  constructor(props = {}) {
    super(props);
  }

  render() {
    const { lockedCollections, onUnlockClick, seriesInstanceUid } = this.props;

    return (
      <React.Fragment>
        {lockedCollections.map(collection => (
          <LockedCollectionsListItem
            key={collection.metadata.uid}
            collection={collection}
            onUnlockClick={onUnlockClick}
            seriesInstanceUid={seriesInstanceUid}
          />
        ))}
      </React.Fragment>
    );
  }
}
