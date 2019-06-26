/**
 * onImportButtonClick - Helper function for annotation menu components.
 * Calls ImportCallbackOrComponent if it is a funciton, or sets
 * this.state.importing to true if it is a component.
 *
 * @returns {null}
 */
export default function onImportButtonClick() {
  console.log(this);

  const { ImportCallbackOrComponent } = this.props;

  if (ImportCallbackOrComponent.prototype.isReactComponent) {
    this.setState({ importing: true });
  } else {
    ImportCallbackOrComponent();
  }
}
