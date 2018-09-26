import { OHIF } from 'meteor/ohif:core';
import { cornerstoneTools, cornerstone } from 'meteor/ohif:cornerstone';
import { $ } from 'meteor/jquery';

const probeSynchronizer = new cornerstoneTools.Synchronizer('cornerstonenewimage', cornerstoneTools.stackImagePositionSynchronizer);
const toolsToSync = ['fiducial', 'aiFiducial', 'scrollSync'];

$('body').on('syncViewports', (event) => {
  const activeTool = OHIF.viewerbase.toolManager.getActiveTool();
  if (toolsToSync.includes(activeTool)) {

    probeSynchronizer.destroy();

    const activeViewportIndex = Session.get('activeViewport');
    const newIndex = OHIF.viewerbase.layoutManager.viewportData[activeViewportIndex]['currentImageIdIndex'];

    $('.imageViewerViewport').each((index, ele) => {
      try {
        cornerstone.getEnabledElement(ele);
        probeSynchronizer.add(ele);
      } catch (error) {
        return;
      }
    });

    $('.imageViewerViewport').promise().done(() => {
      try {
        const element = $('.imageViewerViewport')[activeViewportIndex];
        const stackSize = cornerstone.getEnabledElement(element).toolStateManager.toolState.stack.data[0].imageIds.length;

        let randInt = null;
        while (randInt === null || randInt === newIndex) {
          randInt = Math.round(Math.random() * (stackSize - 1));
        }

        cornerstoneTools.scrollToIndex(element, randInt);
        cornerstoneTools.scrollToIndex(element, newIndex);
      } catch (error) {
        return;
      }
    });
  } else if (probeSynchronizer) {
    probeSynchronizer.destroy();
  }
});

export { sync };
