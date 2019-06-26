/**
 * onExportButtonClick - Helper function for annotation menu components.
 * Calls ExportCallbackOrComponent if it is a funciton, or sets
 * this.state.exporting to true if it is a component.
 *
 * @returns {null}
 */
export default function onExportButtonClick() {
  const { ExportCallbackOrComponent } = this.props;

  if (ExportCallbackOrComponent.prototype.isReactComponent) {
    this.setState({ exporting: true });
  } else {
    ExportCallbackOrComponent();
  }
}
