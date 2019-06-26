import React from "react";
import MenuIOButtons from "../common/MenuIOButtons.js";
import WorkingCollectionList from "./WorkingCollectionList.js";
import LockedCollectionsList from "./LockedCollectionsList.js";
import RoiContourSettings from "./RoiContourSettings.js";
import { cornerstone, cornerstoneTools } from "meteor/ohif:cornerstone";
import { OHIF } from "meteor/ohif:core";
import getActiveSeriesInstanceUid from "../../../lib/util/getActiveSeriesInstanceUid.js";
import {
  createNewVolume,
  setVolumeName
} from "../../../lib/util/freehandNameIO.js";
import unlockStructureSet from "../../../lib/util/unlockStructureSet.js";
import onIOCancel from "../common/helpers/onIOCancel.js";
import onImportButtonClick from "../common/helpers/onImportButtonClick.js";
import onExportButtonClick from "../common/helpers/onExportButtonClick.js";
import "./roiContourMenu.styl";

const modules = cornerstoneTools.store.modules;

/**
 * @class RoiContourMenu - Renders a menu for importing, exporting, creating
 * and renaming ROI Contours. As well as setting configuration settings for
 * the Freehand3Dtool.
 */
export default class RoiContourMenu extends React.Component {
  constructor(props = {}) {
    super(props);

    this.state = {
      workingCollection: [],
      lockedCollections: [],
      unlockConfirmationOpen: false,
      roiCollectionToUnlock: "",
      activeROIContourIndex: 0,
      importing: false,
      exporting: false
    };

    this.onNewRoiButtonClick = this.onNewRoiButtonClick.bind(this);
    this.onRoiChange = this.onRoiChange.bind(this);
    this.onRenameButtonClick = this.onRenameButtonClick.bind(this);
    this.confirmUnlockOnUnlockClick = this.confirmUnlockOnUnlockClick.bind(
      this
    );
    this.onUnlockCancelClick = this.onUnlockCancelClick.bind(this);
    this.onUnlockConfirmClick = this.onUnlockConfirmClick.bind(this);
    this.onIOComplete = this.onIOComplete.bind(this);
    this.onIOCancel = onIOCancel.bind(this);
    this.onImportButtonClick = onImportButtonClick.bind(this);
    this.onExportButtonClick = onExportButtonClick.bind(this);
    this._workingCollection = this._workingCollection.bind(this);
    this._lockedCollections = this._lockedCollections.bind(this);
  }

  /**
   * componentDidMount - Grabs the ROI Contours from the freehand3D store and
   * populates state.
   *
   * @returns {null}
   */
  componentDidMount() {
    const seriesInstanceUid = getActiveSeriesInstanceUid();

    if (!seriesInstanceUid) {
      return;
    }

    this._seriesInstanceUid = seriesInstanceUid;

    const freehand3DStore = modules.freehand3D;

    let activeROIContourIndex = 0;

    if (modules.freehand3D.getters.series(seriesInstanceUid)) {
      activeROIContourIndex = freehand3DStore.getters.activeROIContourIndex(
        this._seriesInstanceUid
      );
    }

    const workingCollection = this._workingCollection();
    const lockedCollections = this._lockedCollections();

    this.setState({
      workingCollection,
      lockedCollections,
      activeROIContourIndex
    });
  }

  /**
   * onIOComplete - A callback executed on succesful completion of an
   * IO opperation. Recalculates the ROI Contour Collection state.
   *
   * @returns {type}  description
   */
  onIOComplete() {
    const freehand3DStore = modules.freehand3D;

    let activeROIContourIndex = 0;

    const seriesInstanceUid = this._seriesInstanceUid;

    if (modules.freehand3D.getters.series(seriesInstanceUid)) {
      activeROIContourIndex = freehand3DStore.getters.activeROIContourIndex(
        seriesInstanceUid
      );
    }

    const workingCollection = this._workingCollection();
    const lockedCollections = this._lockedCollections();

    this.setState({
      workingCollection,
      lockedCollections,
      activeROIContourIndex,
      importing: false,
      exporting: false
    });
  }

  /**
   * onNewRoiButtonClick - Callback that adds a new ROIContour to the
   * active series.
   *
   * @returns {null}
   */
  onNewRoiButtonClick() {
    const callback = name => {
      // Create and activate new ROIContour
      const seriesInstanceUid = this._seriesInstanceUid;

      //Check if default structureSet exists for this series.
      if (!modules.freehand3D.getters.series(seriesInstanceUid)) {
        modules.freehand3D.setters.series(seriesInstanceUid);
      }

      const activeROIContourIndex = modules.freehand3D.setters.ROIContourAndSetIndexActive(
        seriesInstanceUid,
        "DEFAULT",
        name
      );

      const workingCollection = this._workingCollection();

      this.setState({ workingCollection, activeROIContourIndex });
    };

    createNewVolume(callback);
  }

  /**
   * onRoiChange - Callback that changes the active ROI Contour being drawn.
   *
   * @param  {Number} roiContourIndex The index of the ROI Contour.
   * @returns {null}
   */
  onRoiChange(roiContourIndex) {
    modules.freehand3D.setters.activeROIContourIndex(
      roiContourIndex,
      this._seriesInstanceUid
    );

    this.setState({ activeROIContourIndex: roiContourIndex });
  }

  /**
   * onRenameButtonClick - A callback that triggers name input for an ROIContour.
   *
   * @param  {object} metadata The current state of the contour's metadata.
   * @returns {null}
   */
  onRenameButtonClick(metadata) {
    const seriesInstanceUid = this._seriesInstanceUid;

    const callback = () => {
      const workingCollection = this._workingCollection();

      this.setState({ workingCollection });
    };

    setVolumeName(this._seriesInstanceUid, "DEFAULT", metadata.uid, callback);
  }

  /**
   * confirmUnlockOnUnlockClick - A callback that triggers confirmation of the
   * unlocking of an ROI Contour Collection.
   *
   * @param  {String} structureSetUid The UID of the structureSet.
   * @returns {null}
   */
  confirmUnlockOnUnlockClick(structureSetUid) {
    this.setState({
      unlockConfirmationOpen: true,
      roiCollectionToUnlock: structureSetUid
    });
  }

  /**
   * onUnlockConfirmClick - A callback that unlocks an ROI Contour Collection and
   * moves the ROI Contours to the working collection.
   *
   * @returns {type}  description
   */
  onUnlockConfirmClick() {
    const { roiCollectionToUnlock } = this.state;

    unlockStructureSet(this._seriesInstanceUid, roiCollectionToUnlock);

    const workingCollection = this._workingCollection();
    const lockedCollections = this._lockedCollections();

    this.setState({
      unlockConfirmationOpen: false,
      workingCollection,
      lockedCollections
    });
  }

  /**
   * onUnlockCancelClick - A callback that closes the unlock confirmation window
   * and aborts unlocking.
   *
   * @returns {null}
   */
  onUnlockCancelClick() {
    this.setState({ unlockConfirmationOpen: false });
  }

  /**
   * _workingCollection - Returns a list of the ROI Contours
   * in the working collection.
   *
   * @returns {object[]} An array of ROI Contours.
   */
  _workingCollection() {
    const freehand3DStore = modules.freehand3D;
    const seriesInstanceUid = this._seriesInstanceUid;

    let series = freehand3DStore.getters.series(seriesInstanceUid);

    if (!series) {
      freehand3DStore.setters.series(seriesInstanceUid);
      series = freehand3DStore.getters.series(seriesInstanceUid);
    }

    const structureSet = freehand3DStore.getters.structureSet(
      seriesInstanceUid
    );

    const ROIContourCollection = structureSet.ROIContourCollection;

    const workingCollection = [];

    for (let i = 0; i < ROIContourCollection.length; i++) {
      if (ROIContourCollection[i]) {
        workingCollection.push({
          index: i,
          metadata: ROIContourCollection[i]
        });
      }
    }

    return workingCollection;
  }

  /**
   * _lockedCollections - Returns a list of locked ROI Contour Collections.
   *
   * @returns {object} An array of locked ROI Contour Collections.
   */
  _lockedCollections() {
    const freehand3DStore = modules.freehand3D;
    const seriesInstanceUid = this._seriesInstanceUid;

    let series = freehand3DStore.getters.series(seriesInstanceUid);

    if (!series) {
      freehand3DStore.setters.series(seriesInstanceUid);
      series = freehand3DStore.getters.series(seriesInstanceUid);
    }

    const structureSetCollection = series.structureSetCollection;
    const lockedCollections = [];

    for (let i = 0; i < structureSetCollection.length; i++) {
      const structureSet = structureSetCollection[i];

      if (structureSet.uid === "DEFAULT") {
        continue;
      }

      const ROIContourCollection = structureSet.ROIContourCollection;
      const ROIContourArray = [];

      for (let j = 0; j < ROIContourCollection.length; j++) {
        if (ROIContourCollection[j]) {
          ROIContourArray.push({
            index: j,
            metadata: ROIContourCollection[j]
          });
        }
      }

      lockedCollections.push({
        metadata: structureSet,
        ROIContourArray
      });
    }

    return lockedCollections;
  }

  render() {
    const {
      workingCollection,
      lockedCollections,
      unlockConfirmationOpen,
      roiCollectionToUnlock,
      activeROIContourIndex,
      importing,
      exporting
    } = this.state;

    const { ImportCallbackOrComponent, ExportCallbackOrComponent } = this.props;
    const freehand3DStore = modules.freehand3D;

    let component;

    if (importing) {
      component = (
        <ImportCallbackOrComponent
          onImportComplete={this.onIOComplete}
          onImportCancel={this.onIOCancel}
        />
      );
    } else if (exporting) {
      component = (
        <ExportCallbackOrComponent
          onExportComplete={this.onIOComplete}
          onExportCancel={this.onIOCancel}
        />
      );
    } else if (unlockConfirmationOpen) {
      const collection = freehand3DStore.getters.structureSet(
        this._seriesInstanceUid,
        roiCollectionToUnlock
      );

      const collectionName = collection.name;

      component = (
        <div>
          <div>
            <h5>Unlock</h5>
            <p>
              Unlock {collectionName} for editing? The ROIs will be moved to the
              Working ROI Collection.
            </p>
          </div>
          <div>
            <a
              className="btn btn-sm btn-primary"
              onClick={this.onUnlockConfirmClick}
            >
              <i className="fa fa fa-check-circle fa-2x" />
            </a>
            <a
              className="btn btn-sm btn-primary"
              onClick={this.onUnlockCancelClick}
            >
              <i className="fa fa fa-times-circle fa-2x" />
            </a>
          </div>
        </div>
      );
    } else {
      console.log(lockedCollections.length);

      component = (
        <div className="roi-contour-menu-component">
          <div className="roi-contour-menu-header">
            <h3>ROI Contour Collections</h3>
            <MenuIOButtons
              ImportCallbackOrComponent={ImportCallbackOrComponent}
              ExportCallbackOrComponent={ExportCallbackOrComponent}
              onImportButtonClick={this.onImportButtonClick}
              onExportButtonClick={this.onExportButtonClick}
            />
          </div>
          <div className="roi-contour-menu-collection-list-body">
            <table className="peppermint-table">
              <tbody>
                {this._seriesInstanceUid && (
                  <WorkingCollectionList
                    workingCollection={workingCollection}
                    activeROIContourIndex={activeROIContourIndex}
                    onRoiChange={this.onRoiChange}
                    onRenameButtonClick={this.onRenameButtonClick}
                    onNewRoiButtonClick={this.onNewRoiButtonClick}
                  />
                )}
                {lockedCollections.length !== 0 && (
                  <LockedCollectionsList
                    lockedCollections={lockedCollections}
                    onUnlockClick={this.confirmUnlockOnUnlockClick}
                    seriesInstanceUid={this._seriesInstanceUid}
                  />
                )}
              </tbody>
            </table>
          </div>
          <RoiContourSettings />
        </div>
      );
    }

    return <React.Fragment>{component}</React.Fragment>;
  }
}
