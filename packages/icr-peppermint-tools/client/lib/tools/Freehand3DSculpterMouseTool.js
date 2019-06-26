import { cornerstoneTools } from "meteor/ohif:cornerstone";
import interpolate from "../util/freehandInterpolate/interpolate.js";

const FreehandSculpterMouseTool = cornerstoneTools.FreehandSculpterMouseTool;
const toolColors = cornerstoneTools.toolColors;
const modules = cornerstoneTools.store.modules;
const state = cornerstoneTools.store.state;
const getToolState = cornerstoneTools.getToolState;

export default class Freehand3DSculpterMouseTool extends FreehandSculpterMouseTool {
  constructor(configuration = {}) {
    const defaultConfig = {
      name: "FreehandSculpterMouse",
      referencedToolName: "FreehandMouse",
      configuration: getDefaultFreehandSculpterMouseToolConfiguration()
    };
    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);

    // Create bound functions for private event loop.
    this.activeMouseUpCallback = this.activeMouseUpCallback.bind(this);
  }

  /**
   * Select the freehand tool to be edited. Don't allow selecting of locked
   * ROIContours.
   *
   * @private
   * @param {Object} eventData - Data object associated with the event.
   */
  _selectFreehandTool(eventData) {
    const config = this.configuration;
    const element = eventData.element;
    const closestToolIndex = this._getClosestFreehandToolOnElement(
      element,
      eventData
    );

    if (closestToolIndex === undefined) {
      return;
    }

    const toolState = cornerstoneTools.getToolState(
      element,
      this.referencedToolName
    );

    const toolData = toolState.data[closestToolIndex];

    const isLocked = toolData.referencedStructureSet.isLocked;

    if (isLocked) {
      return;
    }

    config.hoverColor = toolData.referencedROIContour.color;

    config.currentTool = closestToolIndex;
  }

  /**
   * Event handler for MOUSE_UP during the active loop.
   *
   * @param {Object} evt - The event.
   */
  _activeEnd(evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const config = this.configuration;

    this._active = false;

    state.isMultiPartToolActive = false;

    this._getMouseLocation(eventData);
    this._invalidateToolData(eventData);

    config.mouseUpRender = true;

    this._deactivateSculpt(element);

    const toolData = getToolState(element, this.referencedToolName);
    const data = toolData.data[config.currentTool];

    if (modules.freehand3D.getters.interpolate()) {
      interpolate(data);
    }

    // Update the image
    cornerstone.updateImage(eventData.element);

    preventPropagation(evt);
  }

  /**
   * Invalidate the freehand tool data, tirggering re-calculation of statistics.
   *
   * @private @override
   * @param {Object} eventData - Data object associated with the event.
   */
  _invalidateToolData(eventData) {
    const config = this.configuration;
    const element = eventData.element;
    const toolData = getToolState(element, this.referencedToolName);
    const data = toolData.data[config.currentTool];

    data.invalidated = true;
    data.interpolated = false;
  }
}

/**
 * Returns the default freehandSculpterMouseTool configuration.
 *
 * @return {Object} The default configuration object.
 */
function getDefaultFreehandSculpterMouseToolConfiguration() {
  return {
    mouseLocation: {
      handles: {
        start: {
          highlight: true,
          active: true
        }
      }
    },
    minSpacing: 1,
    currentTool: null,
    dragColor: toolColors.getActiveColor(),
    hoverColor: toolColors.getToolColor(),

    /* --- Hover options ---
    showCursorOnHover:        Shows a preview of the sculpting radius on hover.
    limitRadiusOutsideRegion: Limit max toolsize outside the subject ROI based
                              on subject ROI area.
    hoverCursorFadeAlpha:     Alpha to fade to when tool very distant from
                              subject ROI.
    hoverCursorFadeDistance:  Distance from ROI in which to fade the hoverCursor
                              (in units of radii).
    */
    showCursorOnHover: true,
    limitRadiusOutsideRegion: true,
    hoverCursorFadeAlpha: 0.5,
    hoverCursorFadeDistance: 1.2
  };
}

function preventPropagation(evt) {
  evt.stopImmediatePropagation();
  evt.stopPropagation();
  evt.preventDefault();
}
