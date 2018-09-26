import { cornerstoneTools, cornerstone } from 'meteor/ohif:cornerstone';
import { OHIF } from 'meteor/ohif:core';
import { Session } from 'meteor/session';

const toolType = 'fiducial';

function getFidKey() {
  const studyInstanceUid = OHIF.viewerbase.layoutManager.viewportData[Session.get('activeViewport')]['studyInstanceUid'].toString();
  return 'fid.' + studyInstanceUid;
}

function draw (context, fn) {
  context.save();
  fn(context);
  context.restore();
}

function getNewContext (canvas) {
  const context = canvas.getContext('2d');
  context.setTransform(1, 0, 0, 1, 0, 0);
  return context;
}

function increaseFidByOne() {
  const fid = Session.get(getFidKey());

  if (fid) {
    Session.set(getFidKey(), fid+1);
  } else {
    Session.set(getFidKey(), 1);
  }
}

// /////// BEGIN ACTIVE TOOL ///////
function createNewMeasurement (mouseEventData) {

  increaseFidByOne();
  const fid = Session.get(getFidKey());

  // Create the measurement data for this tool with the end handle activated
  const measurementData = {
    toolType: toolType,
    id: fid,
    visible: true,
    active: false,
    color: undefined,
    handles: {
      end: {
        x: mouseEventData.currentPoints.image.x,
        y: mouseEventData.currentPoints.image.y,
        highlight: true,
        active: true
      }
    }
  };

  return measurementData;
}
// /////// END ACTIVE TOOL ///////

// /////// BEGIN IMAGE RENDERING ///////
function pointNearTool (element, data, coords) {
  if (data.visible === false) {
    return false;
  }

  const endCanvas = cornerstone.pixelToCanvas(element, data.handles.end);


  return cornerstoneMath.point.distance(endCanvas, coords) < 5;
}

function onImageRendered (e) {
  const eventData = e.detail;

  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);

  if (!toolData) {
    return;
  }

  // We have tool data for this element - iterate over each one and draw it
  const context = getNewContext(eventData.canvasContext.canvas);

  const fontHeight = cornerstoneTools.textStyle.getFontSize();

  for (let i = 0; i < toolData.data.length; i++) {
    const data = toolData.data[i];

    if (data.visible === false) {
      continue;
    }

    draw(context, (context) => {

      const color = cornerstoneTools.toolColors.getColorIfActive(data);

      // Draw the handles
      cornerstoneTools.drawHandles(context, eventData, data.handles, color);

      const x = Math.round(data.handles.end.x);
      const y = Math.round(data.handles.end.y);
      let storedPixels;

      let text,
        str;

      if (x >= 0 && y >= 0 && x < eventData.image.columns && y < eventData.image.rows) {
        if (eventData.image.color) {
          text = `${x}, ${y}`;
          storedPixels = cornerstoneTools.getRGBPixels(eventData.element, x, y, 1, 1);
          str = `R: ${storedPixels[0]} G: ${storedPixels[1]} B: ${storedPixels[2]}`;
        } else {
          storedPixels = cornerstone.getStoredPixels(eventData.element, x, y, 1, 1);
          const sp = storedPixels[0];
          const mo = sp * eventData.image.slope + eventData.image.intercept;
          const suv = cornerstoneTools.calculateSUV(eventData.image, sp);

          // Draw text
          // text = `${x}, ${y}`;
          text = `finding ${data.id}`;
          str = `SP: ${sp} MO: ${parseFloat(mo.toFixed(3))}`;
          if (suv) {
            str += ` SUV: ${parseFloat(suv.toFixed(3))}`;
          }
        }

        const coords = {
          // Translate the x/y away from the cursor
          x: data.handles.end.x,
          y: data.handles.end.y
        };
        const textCoords = cornerstone.pixelToCanvas(eventData.element, coords);

        // cornerstoneTools.drawTextBox(context, str, textCoords.x, textCoords.y + fontHeight + 5, color);
        cornerstoneTools.drawTextBox(context, text, textCoords.x, textCoords.y, color);
      }
    });
  }
}
// /////// END IMAGE RENDERING ///////

// Module exports
cornerstoneTools.fiducial = cornerstoneTools.mouseButtonTool({
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  toolType
});

cornerstoneTools.fiducialTouch = cornerstoneTools.touchTool({
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  toolType
});
