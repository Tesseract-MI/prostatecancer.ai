import React from "react";
import "./menuIOButtons.styl";

/**
 * @class MenuIOButtons - Renders Import and/or Export buttons if
 * this.props.ImportCallbackOrComponent and/or
 * this.props.ExportCallbackOrComponent are defined.
 */
export default class MenuIOButtons extends React.Component {
  constructor(props = {}) {
    super(props);
  }

  render() {
    const {
      ImportCallbackOrComponent,
      ExportCallbackOrComponent,
      onImportButtonClick,
      onExportButtonClick
    } = this.props;

    if (!ImportCallbackOrComponent && !ExportCallbackOrComponent) {
      return null;
    }

    return (
      <div>
        {ImportCallbackOrComponent && (
          <a className="btn btn-sm btn-primary" onClick={onImportButtonClick}>
            Import
          </a>
        )}
        {ExportCallbackOrComponent && (
          <a className="btn btn-sm btn-primary" onClick={onExportButtonClick}>
            Export
          </a>
        )}
      </div>
    );
  }
}
