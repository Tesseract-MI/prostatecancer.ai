import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';
import { OHIF } from 'meteor/ohif:core';
import { cornerstoneTools } from 'meteor/ohif:cornerstone';
import { $ } from 'meteor/jquery';
import { Mongo } from 'meteor/mongo';
import { Session } from 'meteor/session';
import { bindToMeasurementAdded } from '../../../lib/customCommands.js'

AiPredictions = new Mongo.Collection('aiPredictions', {connection: null});
Fiducials = new Mongo.Collection('fiducials');
UserData = new Mongo.Collection('user_data');

function getImageId() {
  var closest;
  imageIds.forEach(function(imageId) {
    var imagePlane = cornerstone.metaData.get('imagePlaneModule', imageId);
    var imgPosZ = imagePlane.imagePositionPatient[2];
    var distance = Math.abs(imgPosZ - imagePositionZ);
    if (distance < minDistance) {
      minDistance = distance;
      closest = imageId;
    }
  });

  return closest;
}

function wait(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, ms);
  });
}

function descriptionMap(seriesDescription) {
    if (seriesDescription.includes('t2_tse_tra')) {
        return 'tra';
    }
    else if (seriesDescription.includes('_ADC')) {
        return 'adc';
    }
    else if (seriesDescription.includes('_BVAL')) {
        return 'hbval';
    }
    else if (seriesDescription.includes('KTrans')) {
        return 'ktrans';
    }
}

async function displayFiducials(instance) {
  const patientName = instance.data.studies[0].patientName;
  const fiducials = Fiducials.find({ ProxID: patientName }).fetch();
  const ClinSigCounter = fiducials.filter(v => v.ClinSig).length;
  const studyInstanceUid = OHIF.viewerbase.layoutManager.viewportData[Session.get('activeViewport')]['studyInstanceUid'];
  const delay = 2000;

  if (!(fiducials.length)) {
      $('#feedback-section').append('<p class="text-bold text-center">No result available for this patient.</p>');
      return;
  }

  if ('pos' in fiducials[0]) {
      $('#probe').trigger("click");
      await wait(1);

      $('.imageViewerViewport').each((ind, ele) => {
          const imageId = cornerstone.getEnabledElement(ele).image.imageId;
          const seriesDescription = cornerstone.metaData.get('series', imageId)['seriesDescription'];
          fiducials.forEach(async (val, index) => {
              const imagePoint = val[descriptionMap(seriesDescription)];
              let imagaIndex = cornerstone.metaData.get('series', imageId).numImages - imagePoint.z - 1;
              if (descriptionMap(seriesDescription) === 'ktrans') {
                  imagaIndex = imagePoint.z;
              }
              function scroll() {
                return new Promise(resolve => {
                  setTimeout(() => {
                    cornerstoneTools.scrollToIndex(ele, imagaIndex);
                    resolve('resolved');
                  }, delay * (index + 1));
                });
              }

              const measurementData = {
                'f_id': val.fid,
                'ClinSig': val.ClinSig,
                'server': true,
                'visible': true,
                'active': true,
                'color': (val.ClinSig) ? '#ee6002' : '#90ee02',
                'invalidated': true,
                'handles': {
                  'end': {
                    'active': true,
                    'highlight': true,
                    'x': imagePoint.x,
                    'y': imagePoint.y
                  }
                }
              };
              await scroll();
              await wait((delay/2) * (index + 1));
              $(ele).off('cornerstonetoolsmeasurementadded');
              cornerstoneTools.addToolState(ele, 'probe', measurementData);
              cornerstone.updateImage(ele);
              bindToMeasurementAdded(ele);
          });
      });
  }

  $('#feedback-section').html('<br><br><br><br><br><br><br><p class="text-bold text-center">Fetching data from the server...</p>')

  setTimeout(() => {
    $('#feedback-section').html('<br><br><br><br><br><br><br><p class="text-bold text-center">Adding the true results to the views...</p>')
  }, delay);

  setTimeout(() => {
    $('#feedback-section').html('<br><br><br><br><br><br><br><p class="text-bold text-center">Calculating distances...</p>')
  }, (delay * (fiducials.length)) + delay);

  setTimeout(() => {
    $('#feedback-section').html('<p class="text-bold">Annotations:</p><p>Expert radiologist indicated <span class="text-color">' +
    fiducials.length.toString().concat((fiducials.length === 1) ? '</span> suspicious area ' : '</span> suspicious areas ') +
    'for this patient.' +
    '</p><br>' +
    '<p class="text-bold">Procedure:</p><p>The patient underwent MR-guidance biopsies.</p><br>' +
    '<p class="text-bold">Biopsy results:</p><p><span class="text-color">'.concat(
      ClinSigCounter,
      '</span> clinical significant',
      (ClinSigCounter === 1) ? ' finding ' : ' findings ',
      '(Gleason score 7 or higher) ',
      (ClinSigCounter <= 1) ? 'was ' : 'were ',
      'reported by pathology.'
    )
     +
    '</p><br>'.concat((!('pos' in fiducials[0])) ? '' :
    '<p class="text-bold">Analysis of your findings:</p>'.concat('<p>'.concat(findingsAnalysis(fiducials, studyInstanceUid, true)), '</p>'))
    );
  }, (delay * (fiducials.length)) + (2 * delay));

  $('#wwwc').trigger("click");
}

function findingsAnalysis(fiducials, studyInstanceUid, html = false) {

  let str = '';
  let dict = {};

  fiducials.forEach((val) => {
    if (!(val.pos)) {
      return;
    }
    const minDistance = Number.MAX_SAFE_INTEGER;
    const f_id = 0;
    const patientPoint = new cornerstoneMath.Vector3(val.pos.x, val.pos.y, val.pos.z);
    fiducialsCollection.find({'studyInstanceUid': studyInstanceUid}).fetch().forEach((value) => {
        const distance = patientPoint.distanceTo(value.patientPoint).toFixed(2)
        if (distance < minDistance) {
          minDistance = distance;
          f_id = value.id;
        }
    });
    if (f_id) {
      tempStr = ''.concat(
        html ? '<p>' : '',
        html ? '<span class="text-color">' : '',
        'fid '+ f_id ,
        html ? '</span>' : '',
        ' is the closest to ',
        html ? '<span class="text-color">' : '',
        (val.ClinSig) ? 'CSPC-' + val.fid : 'CIPC-' + val.fid,
        html ? '</span>' : '',
        ' with ',
        html ? '<span class="text-color">' : '',
        minDistance + ' mm',
        html ? '</span>' : '',
        html ? '</p>' : '',
      );
      str = str.concat(tempStr);
      const f_idStr = f_id.toString();
      if (dict[f_idStr]) {
        dict[f_idStr].push(tempStr);
      } else {
        dict[f_idStr] = [tempStr];
      }
    }
  });

  if (html) {
    return str;
  } else {
    return dict;
  }

}

function makeModelInfoTable() {
    let html = '<table class="table table-responsive"><tbody>';
    const instance = Template.instance();
    const selectedModel = instance.selectedModel.get();
    const aiModelsInfo = instance.aiModelsInfo.get()[selectedModel];
    for (key in aiModelsInfo) {
      html += '<tr>';
      html += '<td class="text-bold">' + key + '</td>';
      html += '<td>' + aiModelsInfo[key] + '</td>';
      html += '</tr>';
      if (key === 'additional info required') {
          if (aiModelsInfo[key] !== '') {
              Session.set('modelWithZone', true);
              instance.note.set(aiModelsInfo[key] + ' is additionally needed by this model.');
          } else {
              Session.set('modelWithZone', false);
              instance.note.set('');
          }
      }
    }
    html += '</tbody></table>'
    $('#ai-model-info').html(html);
}

function saveUserData(instance) {
    const patientName = instance.data.studies[0].patientName;
    const fiducials = Fiducials.find({ ProxID: patientName }).fetch();
    const studyInstanceUid = OHIF.viewerbase.layoutManager.viewportData[Session.get('activeViewport')]['studyInstanceUid'];

    fiducialsCollection.find({'studyInstanceUid': studyInstanceUid}).fetch().forEach((value) => {
        let rowId = value.id;
        let aiScores = AiPredictions.find({'studyInstanceUid': studyInstanceUid, 'fid': rowId}).fetch();

        let userData = {
            toolType: value.toolType,
            aiScores: aiScores,
            fid: rowId,
            userId: Meteor.userId(),
            patientId: OHIF.viewer.metadataProvider.getMetadata(value.imageIds[0]).patient.id,
            studyInstanceUid: value.studyInstanceUid,
            locationSide: $('#location-side-'+rowId).first().text(),
            locationPosition: $('#location-pos-'+rowId).first().text(),
            t2: $('#t2-'+rowId).first().val(),
            dwi: $('#dwi-'+rowId).first().val(),
            dce: $('#dce-'+rowId).first().val(),
            pirads: $('#pirads-'+rowId).first().val(),
            report: findingsAnalysis(fiducials, studyInstanceUid)[rowId.toString()],
            lps: {
              x: value.patientPoint.x,
              y: value.patientPoint.y,
              z: value.patientPoint.z
            }
        }

        UserData.insert(userData);
    });
}

function checkLocations() {
    let flag = true;
    $('.location-data').get().forEach((element) => {
        if (element.innerHTML === '-') {
            flag = false;
            return;
        }
    });
    return flag;
}

Template.measurementTableView.onCreated(() => {
  const instance = Template.instance();
  instance.note = new ReactiveVar('');
  instance.selectedModel = new ReactiveVar('');
  instance.aiModelsInfo = new ReactiveVar({});
  instance.aiModelsName = new ReactiveVar([]);
  instance.aiModelsActive = new ReactiveVar(true);
  instance.feedbackActive = new ReactiveVar(true);
  instance.disableReport = new ReactiveVar(false);
  instance.locationNotSelected = new ReactiveVar(true);
  instance.showSnackbar = new ReactiveVar(true);
  Meteor.subscribe('fiducials.public');
  Meteor.subscribe('user_data.public');
});


Template.measurementTableView.onRendered(() => {
  const instance = Template.instance();
  $('.roundedButtonWrapper[data-value="aiModel"]').on('click', (eve) => {
      instance.aiModelsActive.set(true);
      instance.feedbackActive.set(false);
      $("#aiModelName option:first").click();
  });
  $('.roundedButtonWrapper[data-value="findings"]').on('click', (eve) => {
      instance.feedbackActive.set(true);
      instance.aiModelsActive.set(false);
  });

  $.ajax({url: "https://api.github.com/repos/ProstateWebViewer/p-cad/contents/models", success: function(result) {
      let nameArr = [];
      let modelsInfoDict = {};
      let url = '';
      result.forEach((val) => {
          if (val.type === 'dir') {
            nameArr.push(val.name);
            url = "https://raw.githubusercontent.com/ProstateWebViewer/p-cad/master/models/" + val.name + "/info.json"
            $.ajax({url: url, success: function(res) {
                modelsInfoDict[val.name] = JSON.parse(res);
                instance.aiModelsInfo.set(modelsInfoDict);
            }});
          }
      });
      instance.aiModelsName.set(nameArr);
      instance.selectedModel.set(nameArr[0]);
      Session.set('selectedModel', nameArr[0]);
  }});

});


Template.measurementTableView.helpers({
  fiducials() {
    const studyInstanceUid = window.location.pathname.split('/')[2];
    return fiducialsCollection.find({'studyInstanceUid': studyInstanceUid}).fetch();
  },

  prostateLabels() {
    return prostateLabels;
  },

  getNote() {
    return Template.instance().note.get();
  },

  aiModelsName() {
    return Template.instance().aiModelsName.get();
  },

  isFeedbackActive() {
    return Template.instance().feedbackActive.get();
  },

  isReportDisabled() {
    return Template.instance().disableReport.get();
  },

  isAiModelActive() {
    return Template.instance().aiModelsActive.get();
  },

  isLocationSelected() {
    return Template.instance().locationNotSelected.get();
  }

});

Template.measurementTableView.events({
  'click .js-getFeedback'(event, instance) {

      if (!(checkLocations())) {
          instance.locationNotSelected.set(false);
          return;
      }

      instance.locationNotSelected.set(true);

      instance.disableReport.set(true);
      $('.roundedButtonWrapper[data-value="result"]').removeClass('disabled');
      Session.set('resultGenerated', true);
      $('.roundedButtonWrapper[data-value="result"]').click();
      instance.feedbackActive.set(false);

      $('.roundedButtonWrapper[data-value="result"]').on('click', (eve) => {
          instance.aiModelsActive.set(false);
          instance.feedbackActive.set(false);
      });

      displayFiducials(instance);
      saveUserData(instance);
  },

  'click .js-aiModelName'(event, instance) {
    let selectedModel = event.currentTarget.value;
    instance.selectedModel.set(selectedModel);

    if (instance.showSnackbar.get()) {
        $('#aiModelName').change();
    }

    makeModelInfoTable();
  },

  'change .js-option'(event, instance) {
    instance.showSnackbar.set(false);
    Session.set('selectedModel', event.currentTarget.value);
    let snackbar = $('#snackbar').addClass('show');
    setTimeout(() => { snackbar.removeClass('show'); }, 3000);
  },


});
