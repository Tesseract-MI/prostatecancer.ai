import React from "react";
import { cornerstoneTools } from "meteor/ohif:cornerstone";

const brushModule = cornerstoneTools.store.modules.brush;
const brushState = brushModule.state;

import "./segmentationMenu.styl";

const minGateSeperation = 10;

/**
 * @class BrushSettings - A component that allows the user to change
 * configuration of the Brush tools.
 */
export default class BrushSettings extends React.Component {
  constructor(props = {}) {
    super(props);

    const customGateRange = brushModule.getters.customGateRange();

    this.state = {
      holeFill: brushState.holeFill,
      strayRemove: brushState.strayRemove,
      activeGate: brushState.activeGate,
      customGateRangeMin: customGateRange[0],
      customGateRangeMax: customGateRange[1]
    };

    this.onGateChange = this.onGateChange.bind(this);
    this.onCustomGateMinChange = this.onCustomGateMinChange.bind(this);
    this.onCustomGateMaxChange = this.onCustomGateMaxChange.bind(this);
    this.onHoleFillChange = this.onHoleFillChange.bind(this);
    this.onStrayRemoveChange = this.onStrayRemoveChange.bind(this);
  }

  /**
   * onGateChange - Callback that changes the active gate of the Smart CT Brush.
   *
   * @param  {type} evt description
   * @returns {type}     description
   */
  onGateChange(evt) {
    const val = evt.target.value;

    this.setState({ activeGate: val });
    brushState.activeGate = val;
  }

  /**
   * onCustomGateMinChange - Changes the minimum value of a
   * custom Smart CT Gate.
   *
   * @param  {object} evt The event.
   * @returns {null}
   */
  onCustomGateMinChange(evt) {
    let val = Number(evt.target.value);

    const customRangeMax = this.state.customGateRangeMax;

    if (val > customRangeMax - minGateSeperation) {
      val = customRangeMax - minGateSeperation;
      evt.target.value = val;
    }

    this.setState({ customGateRangeMin: val });
    brushModule.setters.customGateRange(val, null);
  }

  /**
   * onCustomGateMaxChange - Changes the maximum value of a
   * custom Smart CT Gate.
   *
   * @param  {object} evt The event.
   * @returns {null}
   */
  onCustomGateMaxChange(evt) {
    let val = Number(evt.target.value);

    const customRangeMin = this.state.customGateRangeMin;

    if (val < customRangeMin + minGateSeperation) {
      val = customRangeMin + minGateSeperation;
      evt.target.value = val;
    }

    this.setState({ customGateRangeMax: val });
    brushModule.setters.customGateRange(null, val);
  }

  /**
   * onHoleFillChange - Changes the value of the hole fill parameter for the
   * Smart CT and Auto brushes.
   *
   * @param  {object} evt The event.
   * @returns {null}
   */
  onHoleFillChange(evt) {
    const val = Number(evt.target.value);

    this.setState({ holeFill: val });
    brushState.holeFill = val;
  }

  /**
   * onStrayRemoveChange - Changes the balue of the stray remove parameter for
   * the Smart CT and Auto brushes.
   *
   * @param  {object} evt The event.
   * @returns {null}
   */
  onStrayRemoveChange(evt) {
    const val = Number(evt.target.value);

    this.setState({ strayRemove: val });
    brushState.strayRemove = val;
  }

  render() {
    const holeFillRange = brushState.holeFillRange;
    const strayRemoveRange = brushState.strayRemoveRange;

    const {
      holeFill,
      strayRemove,
      activeGate,
      customGateRangeMin,
      customGateRangeMax
    } = this.state;

    const gates = brushState.gates;

    const holeFillLabel =
      holeFill === 0
        ? "Don't fill holes."
        : `Fill holes <${holeFill}% area of primary region.`;

    const strayRemoveLabel =
      strayRemove === 0
        ? "Paint all non-primary regions."
        : `Don't paint regions <${strayRemove}% area of primary region.`;

    let customGates = null;

    if (activeGate === "custom") {
      const customRange = brushModule.getters.customGateRange();

      customGates = (
        <div>
          <div className="brush-settings-horizontal-box">
            <label htmlFor="customGateMin">Min:</label>
            <input
              className="form-themed form-control"
              type="range"
              id="start"
              name="customGateMin"
              min={-1024}
              max={3072}
              defaultValue={customRange[0]}
              onChange={this.onCustomGateMinChange}
            />
          </div>
          <div className="brush-settings-horizontal-box">
            <label htmlFor="customGateMax">Max:</label>
            <input
              className="form-themed form-control"
              type="range"
              id="start"
              name="customGateMax"
              min={-1024}
              max={3072}
              defaultValue={customRange[1]}
              onChange={this.onCustomGateMaxChange}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="segmentation-menu-footer">
        <h3> Smart CT Gate Selection</h3>
        <select
          className="form-themed form-control"
          onChange={this.onGateChange}
          value={activeGate}
        >
          {gates.map(gate => (
            <option key={gate.name} value={gate.name}>{`${gate.name} [${
              gate.range[0]
            }, ${gate.range[1]}]`}</option>
          ))}
        </select>

        {customGates}

        <h3> Smart/Auto Gate Settings </h3>
        <label htmlFor="holeFill">{holeFillLabel}</label>
        <input
          className="form-themed form-control"
          type="range"
          id="start"
          name="holeFill"
          min={holeFillRange[0]}
          defaultValue={holeFill}
          max={holeFillRange[1]}
          onChange={this.onHoleFillChange}
        />
        <label htmlFor="strayRemove">{strayRemoveLabel}</label>
        <input
          className="form-themed form-control"
          type="range"
          id="start"
          name="strayRemove"
          min={strayRemoveRange[0]}
          defaultValue={strayRemove}
          max={strayRemoveRange[1]}
          onChange={this.onStrayRemoveChange}
        />
      </div>
    );
  }
}
