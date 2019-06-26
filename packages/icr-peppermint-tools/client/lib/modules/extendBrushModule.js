export default function extendBrushModule(brushModule, config) {
  const brushState = brushModule.state;
  const getters = brushModule.getters;
  const setters = brushModule.setters;

  brushState.holeFill = config.holeFill;
  brushState.holeFillRange = config.holeFillRange;
  brushState.strayRemove = config.strayRemove;
  brushState.strayRemoveRange = config.strayRemoveRange;
  brushState.gates = config.gates;
  brushState.activeGate = brushState.gates[0].name;
  brushState.maxRadius = config.maxRadius;

  getters.activeGateRange = () => {
    const activeGate = brushState.activeGate;
    const gates = brushState.gates;

    const gateIndex = gates.findIndex(element => {
      return element.name === activeGate;
    });

    return brushState.gates[gateIndex].range;
  };

  getters.customGateRange = () => {
    const gates = brushState.gates;

    const gateIndex = gates.findIndex(element => {
      return element.name === "custom";
    });

    return brushState.gates[gateIndex].range;
  };

  setters.customGateRange = (min, max) => {
    const gates = brushState.gates;

    const gateIndex = gates.findIndex(element => {
      return element.name === "custom";
    });

    const customGateRange = brushState.gates[gateIndex].range;

    if (min !== null) {
      customGateRange[0] = min;
    }

    if (max !== null) {
      customGateRange[1] = max;
    }
  };

  getters.importMetadata = seriesInstanceUid => {
    if (
      brushModule.state.import &&
      brushModule.state.import[seriesInstanceUid]
    ) {
      return brushModule.state.import[seriesInstanceUid];
    }
  };

  setters.importMetadata = (seriesInstanceUid, metadata) => {
    // Store that we've imported a collection for this series.
    if (!brushModule.state.import) {
      brushModule.state.import = {};
    }

    brushModule.state.import[seriesInstanceUid] = metadata;
  };

  setters.importModified = seriesInstanceUid => {
    const importMetadata = brushModule.state.import[seriesInstanceUid];

    if (importMetadata.modified) {
      return;
    }

    importMetadata.modified = true;

    // JamesAPetts
    Session.set("refreshSegmentationMenu", Math.random().toString());
  };
}
