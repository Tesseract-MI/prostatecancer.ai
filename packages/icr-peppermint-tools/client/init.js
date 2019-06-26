import { cornerstoneTools } from "meteor/ohif:cornerstone";
import freehand3DModule from "./lib/modules/freehand3DModule.js";
import extendBrushModule from "./lib/modules/extendBrushModule.js";

const modules = cornerstoneTools.store.modules;

export default function initialise(configuration = {}) {
  const brushModule = cornerstoneTools.store.modules.brush;

  const config = Object.assign({}, defaultConfig, configuration);

  extendBrushModule(brushModule, config);

  cornerstoneTools.register("module", "freehand3D", freehand3DModule);
  const freehand3DStore = modules.freehand3D;
  freehand3DStore.state.interpolate = config.interpolate;
  freehand3DStore.state.displayStats = config.showFreehandStats;
}

const defaultConfig = {
  maxRadius: 64,
  holeFill: 2,
  holeFillRange: [0, 20],
  strayRemove: 5,
  strayRemoveRange: [0, 99],
  interpolate: false,
  showFreehandStats: false,
  gates: [
    {
      //https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4309522/
      name: "adipose",
      range: [-190, -30]
    },
    {
      //https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4309522/
      name: "muscle",
      range: [-29, 150]
    },
    {
      name: "bone",
      range: [150, 2000]
    },
    {
      name: "custom",
      range: [0, 100]
    }
  ]
};
