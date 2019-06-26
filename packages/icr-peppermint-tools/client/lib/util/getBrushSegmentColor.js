import { cornerstone } from "meteor/ohif:cornerstone";

const brushModule = cornerstoneTools.store.modules.brush;

export default function getBrushSegmentColor(segmentIndex) {
  const colormap = cornerstone.colors.getColormap(brushModule.state.colorMapId);

  if (!colormap) {
    return;
  }

  const colorArray = colormap.getColor(segmentIndex);

  return `rgba(
    ${colorArray[[0]]}, ${colorArray[[1]]}, ${colorArray[[2]]}, 1.0
  )`;
}
