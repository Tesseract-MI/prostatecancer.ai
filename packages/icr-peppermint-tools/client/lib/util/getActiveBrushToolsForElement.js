import { cornerstoneTools } from 'meteor/ohif:cornerstone';

const BaseBrushTool = cornerstoneTools.import('base/BaseBrushTool');

export default function (element) {
  tools = cornerstoneTools.store.state.tools;

  tools = tools.filter(
    (tool) =>
      tool.element === element &&
      tool.mode === 'active'
  );

  return tools.filter(
    (tool) => tool instanceof BaseBrushTool
  );
}
