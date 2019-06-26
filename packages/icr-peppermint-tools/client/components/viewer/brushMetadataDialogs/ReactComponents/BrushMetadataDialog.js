import React from "react";
import GeneralAnatomyList from "../../../../lib/GeneralAnatomylist.js";
import { cornerstone, cornerstoneTools } from "meteor/ohif:cornerstone";

const brushModule = cornerstoneTools.store.modules.brush;

const categories = GeneralAnatomyList.SegmentationCodes.Category;

const validIcon = "fa fa-check fa-2x";
const invalidIcon = "fa fa-times fa-2x";

const validColor = "limegreen";
const invalidColor = "firebrick";

/**
 * @class BrushMetadataDialog - A component that allows the user to input
 * metadata for a segmentation.
 */
export default class BrushMetadataDialog extends React.Component {
  constructor(props = {}) {
    super(props);

    let categoryUID = "T-D0050";
    let typeUID = "T-D0050";
    let modifierUID = null;

    if (this.props.metadata) {
      const metadata = this.props.metadata;

      this._maskName = metadata.SegmentLabel;

      categoryUID = metadata.SegmentedPropertyCategoryCodeSequence.CodeValue;
      typeUID = metadata.SegmentedPropertyTypeCodeSequence.CodeValue;

      if (
        metadata.SegmentedPropertyTypeCodeSequence
          .SegmentedPropertyTypeModifierCodeSequence
      ) {
        modifierUID =
          metadata.SegmentedPropertyTypeCodeSequence
            .SegmentedPropertyTypeModifierCodeSequence.CodeValue;
      }
    } else {
      this._maskName = "";
    }

    this.state = {
      validName: false,
      validType: false,
      categoryUID,
      typeUID,
      modifierUID
    };

    this.onCancelButtonClick = this.onCancelButtonClick.bind(this);
    this.onConfirmButtonClick = this.onConfirmButtonClick.bind(this);
    this.onTextInputChange = this.onTextInputChange.bind(this);
    this.onCategoryChange = this.onCategoryChange.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onModifierChange = this.onModifierChange.bind(this);

    this._validLabelIndicator = this._validLabelIndicator.bind(this);
    this._isValidInput = this._isValidInput.bind(this);
    this._confirmButtonClasses = this._confirmButtonClasses.bind(this);
    this._segmentColor = this._segmentColor.bind(this);
    this._closeDialog = this._closeDialog.bind(this);
  }

  /**
   * onTextInputChange - A callback that checks the validity of the input
   * segment label.
   *
   * @param  {object} evt The event.
   * @returns {null}
   */
  onTextInputChange(evt) {
    const { validName } = this.state;
    const name = evt.target.value;

    this._maskName = name;

    if (name.length > 0 && !validName) {
      this.setState({ validName: true });
    } else if (name.length === 0 && validName) {
      this.setState({ validName: false });
    }
  }

  /**
   * onCategoryChange - A callback that updates the category state on select.
   *
   * @param  {object} evt The event.
   * @returns {null}
   */
  onCategoryChange(evt) {
    const categoryUID = evt.target.value;

    const category = categories.find(
      categoriesI => categoriesI.CodeValue === categoryUID
    );
    const firstType = category.Type[0];

    const typeUID = firstType.CodeValue;

    let modifierUID = null;

    if (firstType.Modifier) {
      modifierUID = firstType.Modifier[0].CodeValue;
    }

    this.setState({ categoryUID, typeUID, modifierUID });
  }

  /**
   * onTypeChange - A callback that changes the type state on select.
   *
   * @param  {object} evt The event.
   * @returns {null}
   */
  onTypeChange(evt) {
    const { categoryUID } = this.state;
    const typeUID = evt.target.value;

    const category = categories.find(
      categoriesI => categoriesI.CodeValue === categoryUID
    );

    const types = category.Type;
    const type = types.find(typesI => typesI.CodeValue === typeUID);

    let modifierUID = null;

    if (type.Modifier) {
      modifierUID = type.Modifier[0].CodeValue;
    }

    this.setState({ typeUID, modifierUID });
  }

  /**
   * onModifierChange - A callback that changes the modifier state on select.
   *
   * @param  {object} evt The event.
   * @returns {null}
   */
  onModifierChange(evt) {
    const modifierUID = evt.target.value;

    this.setState({ modifierUID });
  }

  /**
   * onCancelButtonClick - A callback that closes the dialog.
   *
   * @returns {null}
   */
  onCancelButtonClick() {
    this.props.callback(null);
    this._closeDialog();
  }

  /**
   * onConfirmButtonClick - A callback that sets the segment metadat and closes
   * the dialog.
   *
   * @returns {null}
   */
  onConfirmButtonClick() {
    const { categoryUID, typeUID, modifierUID } = this.state;
    const { segIndex } = this.props;
    const data = {
      label: this._maskName,
      categoryUID,
      typeUID,
      modifierUID,
      segIndex
    };

    this.props.callback(data);
    this._closeDialog();
  }

  /**
   * _closeDialog - Closes the dialog.
   *
   * @returns {null}
   */
  _closeDialog() {
    const dialog = document.getElementById("brushMetadataDialog");

    dialog.close();
  }

  /**
   * _validLabelIndicator - If the label input is valid, returns a Font Awesome
   * green checkmark, otherwise returns a Font Awesome red cross.
   *
   * @returns {object} The Font Awesome class info.
   */
  _validLabelIndicator() {
    if (this._isValidInput()) {
      return {
        iconClasses: `${validIcon} brush-metadata-validity-indicator`,
        color: validColor
      };
    }

    return {
      iconClasses: `${invalidIcon} brush-metadata-validity-indicator`,
      color: invalidColor
    };
  }

  /**
   * _isValidInput - Returns true if the input label is valid.
   *
   * @returns {Boolean} True if the label input is valid.
   */
  _isValidInput() {
    return this._maskName.length > 0;
  }

  /**
   * _confirmButtonClasses - Returns a string of classes for the confirm button
   * depending on current state.
   *
   * @returns {String} The classes for the confirm button.
   */
  _confirmButtonClasses() {
    if (this._isValidInput()) {
      return "brush-metadata-new-button btn btn-sm btn-primary";
    }

    return "brush-metadata-new-button-invalid btn btn-sm btn-primary";
  }

  /**
   * _segmentColor - Returns the segment's color.
   *
   * @returns {String} The color.
   */
  _segmentColor() {
    const { segIndex } = this.props;

    const colormap = cornerstone.colors.getColormap(
      brushModule.state.colorMapId
    );

    if (!colormap) {
      return;
    }
    const colorArray = colormap.getColor(segIndex);

    return `rgba(
      ${colorArray[[0]]}, ${colorArray[[1]]}, ${colorArray[[2]]}, 1.0
    )`;
  }

  render() {
    const { segIndex } = this.props;
    const { categoryUID, typeUID, modifierUID } = this.state;
    const defaultName = this._maskName;

    const segmentIndexText = `Segment ${segIndex + 1}`;

    const validLabelIndicator = this._validLabelIndicator();

    const categorySelect = (
      <React.Fragment>
        <label>Category</label>
        <select
          className="form-themed form-control"
          onChange={this.onCategoryChange}
          value={categoryUID}
        >
          {categories.map(category => (
            <option key={category.CodeValue} value={category.CodeValue}>
              {category.CodeMeaning}
            </option>
          ))}
        </select>
      </React.Fragment>
    );

    const category = categories.find(
      categoriesI => categoriesI.CodeValue === categoryUID
    );
    const types = category.Type;

    const typeSelect = (
      <React.Fragment>
        <label>Type</label>
        <select
          className="form-themed form-control"
          onChange={this.onTypeChange}
          value={typeUID}
        >
          {types.map(type => (
            <option key={type.CodeValue} value={type.CodeValue}>
              {type.CodeMeaning}
            </option>
          ))}
        </select>
      </React.Fragment>
    );

    const type = types.find(typesI => typesI.CodeValue === typeUID);

    let modifierSelect;

    if (type.Modifier) {
      const modifiers = type.Modifier;

      modiferSelect = (
        <React.Fragment>
          <label>Modifier</label>
          <select
            className="form-themed form-control"
            onChange={this.onModifierChange}
            value={modifierUID}
          >
            {modifiers.map(modifier => (
              <option key={modifier.CodeValue} value={modifier.CodeValue}>
                {modifier.CodeMeaning}
              </option>
            ))}
          </select>
        </React.Fragment>
      );
    }

    return (
      <div>
        <div className="brush-metadata-horizontal-box">
          <h3 style={{ border: `2px solid ${this._segmentColor()}` }}>
            {segmentIndexText}
          </h3>
          <a
            className="btn btn-sm btn-secondary"
            onClick={this.onCancelButtonClick}
          >
            <i className="fa fa-times-circle fa-2x" />
          </a>
        </div>

        <hr />

        <div className="brush-metadata-vert-box">
          <label htmlFor="brushMetadataLabelInput">Label</label>

          <div className="brush-metadata-horizontal-box">
            <input
              name="brushMetadataLabelInput"
              className="brush-metadata-input brush-metadata-label-input form-themed form-control"
              onChange={this.onTextInputChange}
              type="text"
              autoComplete="off"
              defaultValue={defaultName}
              placeholder="Enter Segmentation Label.."
              tabIndex="1"
            />
            <i
              className={validLabelIndicator.iconClasses}
              style={{ color: validLabelIndicator.color }}
            />
          </div>

          <div>
            {categorySelect}
            {typeSelect}
            {modiferSelect}
          </div>
        </div>

        <hr />
        <a
          className={this._confirmButtonClasses()}
          onClick={this.onConfirmButtonClick}
        >
          <i className="fa fa fa-check-circle fa-2x" />
        </a>
      </div>
    );
  }
}
