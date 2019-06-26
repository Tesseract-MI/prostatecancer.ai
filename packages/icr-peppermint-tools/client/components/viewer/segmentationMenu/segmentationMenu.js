import React from "react";
import MenuIOButtons from "../common/MenuIOButtons.js";
import SegmentationMenuDeleteConfirmation from "./SegmentationMenuDeleteConfirmation.js";
import SegmentationMenuListItem from "./SegmentationMenuListItem.js";
import SegmentationMenuListBody from "./SegmentationMenuListBody.js";
import SegmentationMenuListHeader from "./SegmentationMenuListHeader.js";
import BrushSettings from "./BrushSettings.js";
import { cornerstone, cornerstoneTools } from "meteor/ohif:cornerstone";
import { OHIF } from "meteor/ohif:core";
import getActiveSeriesInstanceUid from "../../../lib/util/getActiveSeriesInstanceUid.js";
import {
  newSegmentInput,
  editSegmentInput
} from "../../../lib/util/brushMetadataIO.js";
import deleteSegment from "../../../lib/util/deleteSegment.js";
import onIOCancel from "../common/helpers/onIOCancel.js";
import onImportButtonClick from "../common/helpers/onImportButtonClick.js";
import onExportButtonClick from "../common/helpers/onExportButtonClick.js";
import "./segmentationMenu.styl";

const brushModule = cornerstoneTools.store.modules.brush;

/**
 * @class SegmentationMenu - Renders a menu for importing, exporting, creating
 * and renaming Segments. As well as setting configuration settings for
 * the Brush tools.
 */
export default class SegmentationMenu extends React.Component {
  constructor(props = {}) {
    super(props);

    this.onNewSegmentButtonClick = this.onNewSegmentButtonClick.bind(this);
    this.onSegmentChange = this.onSegmentChange.bind(this);
    this.onShowHideClick = this.onShowHideClick.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    this.confirmDeleteOnDeleteClick = this.confirmDeleteOnDeleteClick.bind(
      this
    );
    this.onDeleteCancelClick = this.onDeleteCancelClick.bind(this);
    this.onDeleteConfirmClick = this.onDeleteConfirmClick.bind(this);
    this.onImportButtonClick = onImportButtonClick.bind(this);
    this.onExportButtonClick = onExportButtonClick.bind(this);
    this.onIOComplete = this.onIOComplete.bind(this);
    this.onIOCancel = onIOCancel.bind(this);
    this._importMetadata = this._importMetadata.bind(this);
    this._visableSegmentsForElement = this._visableSegmentsForElement.bind(
      this
    );
    this._segments = this._segments.bind(this);

    this.state = {
      importMetadata: { name: "", label: "" },
      segments: [],
      visibleSegments: [],
      deleteConfirmationOpen: false,
      segmentToDelete: 0,
      activeSegmentIndex: 0,
      importing: false,
      exporting: false
    };
  }

  /**
   * componentDidMount - Grabs the segments from the brushStore and
   * populates state.
   *
   * @returns {null}
   */
  componentDidMount() {
    this._seriesInstanceUid = getActiveSeriesInstanceUid();

    if (!this._seriesInstanceUid) {
      return;
    }

    const importMetadata = this._importMetadata();
    const segments = this._segments();
    const visibleSegments = this._visableSegmentsForElement();

    this.setState({
      importMetadata,
      segments,
      visibleSegments,
      activeSegmentIndex: brushModule.state.drawColorId
    });
  }

  /**
   * onIOComplete - A callback executed on succesful completion of an
   * IO opperation. Recalculates the Segmentation state.
   *
   * @returns {type}  description
   */
  onIOComplete() {
    const importMetadata = this._importMetadata();
    const segments = this._segments();
    const visibleSegments = this._visableSegmentsForElement();

    this.setState({
      importMetadata,
      segments,
      visibleSegments,
      activeSegmentIndex: brushModule.state.drawColorId,
      importing: false,
      exporting: false
    });
  }

  /**
   * onNewSegmentButtonClick - Callback that adds a new segment to the
   * active series.
   *
   * @returns {null}
   */
  onNewSegmentButtonClick() {
    const seriesInstanceUid = getActiveSeriesInstanceUid();

    let segmentMetadata =
      brushModule.state.segmentationMetadata[seriesInstanceUid];

    if (!segmentMetadata) {
      brushModule.state.segmentationMetadata[seriesInstanceUid] = [];
      segmentMetadata =
        brushModule.state.segmentationMetadata[seriesInstanceUid];
    }

    const colormap = cornerstone.colors.getColormap(
      brushModule.state.colorMapId
    );
    const numberOfColors = colormap.getNumberOfColors();

    for (let i = 0; i < numberOfColors; i++) {
      if (!segmentMetadata[i]) {
        newSegmentInput(i);
        break;
      }
    }
  }

  /**
   * onSegmentChange - Callback that changes the active segment being drawn.
   *
   * @param  {Number} segmentIndex The index of the segment to set active.
   * @returns {null}
   */
  onSegmentChange(segmentIndex) {
    brushModule.state.drawColorId = segmentIndex;

    this.setState({ activeSegmentIndex: segmentIndex });
  }

  /**
   * onShowHideClick - Callback that toggles visibility of a segment.
   *
   * @param  {Number} segmentIndex The index of the segemnt to toggle.
   * @returns {null}
   */
  onShowHideClick(segmentIndex) {
    const { visibleSegments } = this.state;

    visibleSegments[segmentIndex] = !visibleSegments[segmentIndex];

    const activeEnabledElement = OHIF.viewerbase.viewportUtils.getEnabledElementForActiveElement();
    const enabledElementUID = activeEnabledElement.uuid;

    brushModule.setters.brushVisibilityForElement(
      enabledElementUID,
      segmentIndex,
      visibleSegments[segmentIndex]
    );

    cornerstone.updateImage(activeEnabledElement.element);

    this.setState({ visibleSegments });
  }

  /**
   * onEditClick - A callback that triggers metadata input for a segment.
   *
   * @param  {Number} segmentIndex The index of the segment metadata to edit.
   * @param  {object}   metadata     The current metadata of the segment.
   * @returns {null}
   */
  onEditClick(segmentIndex, metadata) {
    editSegmentInput(segmentIndex, metadata);
  }

  /**
   * confirmDeleteOnDeleteClick - A callback that triggers confirmation of segment deletion.
   *
   * @param  {Number} segmentIndex The index of the segment being deleted.
   * @returns {null}
   */
  confirmDeleteOnDeleteClick(segmentIndex) {
    this.setState({
      deleteConfirmationOpen: true,
      segmentToDelete: segmentIndex
    });
  }

  /**
   * onDeleteConfirmClick - A callback that deletes a segment form the series.
   *
   * @returns {null}
   */
  onDeleteConfirmClick() {
    const { segmentToDelete } = this.state;

    deleteSegment(this._seriesInstanceUid, segmentToDelete);

    const segments = this._segments();
    const visibleSegments = this._visableSegmentsForElement();

    this.setState({
      deleteConfirmationOpen: false,
      segments,
      visibleSegments
    });
  }

  /**
   * onDeleteCancelClick - A callback that closes the delete confirmation window
   * and aborts deletion.
   *
   * @returns {null}
   */
  onDeleteCancelClick() {
    this.setState({
      deleteConfirmationOpen: false
    });
  }

  /**
   * _importMetadata - Returns the import metadata for the active series.
   *
   * @returns {object} The importMetadata.
   */
  _importMetadata() {
    const seriesInstanceUid = this._seriesInstanceUid;
    const importMetadata = brushModule.getters.importMetadata(
      seriesInstanceUid
    );

    if (importMetadata) {
      return {
        label: importMetadata.label,
        type: importMetadata.type,
        name: importMetadata.name,
        modified: importMetadata.modified ? "true" : " false"
      };
    }

    return {
      name: "New Segmentation Collection",
      label: ""
    };
  }

  /**
   * _visableSegmentsForElement - Returns an array of visible segments for the
   * active series.
   *
   * @returns {Boolean[]} An array of visible segments.
   */
  _visableSegmentsForElement() {
    const seriesInstanceUid = this._seriesInstanceUid;

    if (!seriesInstanceUid) {
      return;
    }

    const segmentMetadata =
      brushModule.state.segmentationMetadata[seriesInstanceUid];

    const activeEnabledElement = OHIF.viewerbase.viewportUtils.getEnabledElementForActiveElement();
    const enabledElementUID = activeEnabledElement.uuid;
    const visible = brushModule.getters.visibleSegmentationsForElement(
      enabledElementUID
    );

    const visableSegmentsForElement = [];

    for (let i = 0; i < visible.length; i++) {
      visableSegmentsForElement.push(visible[i]);
    }

    return visableSegmentsForElement;
  }

  /**
   * _segments - Returns an array of segment metadata for the active series.
   *
   * @returns {object[]} An array of segment metadata.
   */
  _segments() {
    const seriesInstanceUid = this._seriesInstanceUid;

    if (!seriesInstanceUid) {
      return;
    }

    const segmentMetadata =
      brushModule.state.segmentationMetadata[seriesInstanceUid];

    const segments = [];

    if (!segmentMetadata) {
      return segments;
    }

    for (let i = 0; i < segmentMetadata.length; i++) {
      if (segmentMetadata[i]) {
        segments.push({
          index: i,
          metadata: segmentMetadata[i]
        });
      }
    }

    return segments;
  }

  render() {
    const {
      importMetadata,
      segments,
      visibleSegments,
      deleteConfirmationOpen,
      segmentToDelete,
      activeSegmentIndex,
      importing,
      exporting
    } = this.state;

    const { ImportCallbackOrComponent, ExportCallbackOrComponent } = this.props;

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
    } else if (deleteConfirmationOpen) {
      const segmentLabel = segments.find(
        segment => segment.index === segmentToDelete
      ).metadata.SegmentLabel;

      component = (
        <SegmentationMenuDeleteConfirmation
          segmentLabel={segmentLabel}
          onDeleteConfirmClick={onDeleteConfirmClick}
          onDeleteCancelClick={onDeleteCancelClick}
        />
      );
    } else {
      component = (
        <div className="segmentation-menu-component">
          <div className="segmentation-menu-list">
            <div className="segmentation-menu-header">
              <h3>Segments</h3>
              <MenuIOButtons
                ImportCallbackOrComponent={ImportCallbackOrComponent}
                ExportCallbackOrComponent={ExportCallbackOrComponent}
                onImportButtonClick={this.onImportButtonClick}
                onExportButtonClick={this.onExportButtonClick}
              />
            </div>
            <table className="peppermint-table">
              <tbody>
                <SegmentationMenuListHeader importMetadata={importMetadata} />
                <SegmentationMenuListBody
                  segments={segments}
                  visibleSegments={visibleSegments}
                  activeSegmentIndex={activeSegmentIndex}
                  onNewSegmentButtonClick={this.onNewSegmentButtonClick}
                  onSegmentChange={this.onSegmentChange}
                  onShowHideClick={this.onShowHideClick}
                  onEditClick={this.onEditClick}
                  onDeleteClick={this.confirmDeleteOnDeleteClick}
                />
              </tbody>
            </table>
          </div>
          <BrushSettings />
        </div>
      );
    }

    return <React.Fragment>{component}</React.Fragment>;
  }
}
