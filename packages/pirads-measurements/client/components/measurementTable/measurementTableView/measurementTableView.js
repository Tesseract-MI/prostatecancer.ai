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

Fiducials = new Mongo.Collection('fiducials');

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

  if (!('pos' in fiducials[0])) {
      instance.feedbackString.set(''.concat(
        'Annotations:\n',
        'Expert radiologist indicated ',
        fiducials.length.toString(),
        (fiducials.length === 1) ? ' suspicious area ' : ' suspicious areas ',
        'for this patient.',
        '\n\nProcedure:\n',
        'The patient underwent MR-guidance biopsies.\n\n',
        'Biopsy results:\n',
        ClinSigCounter,
        ' clinical significant',
        (ClinSigCounter === 1) ? ' finding ' : ' findings ',
        '(Gleason score 7 or higher) ',
        (ClinSigCounter === 1) ? 'was ' : 'were ',
        'reported by pathology.\n\n'
      ));
      $('#wwwc').trigger("click");
  }
  else {
      $('#probe').trigger("click");
      await wait(1);


      const studyInstanceUid = OHIF.viewerbase.layoutManager.viewportData[Session.get('activeViewport')]['studyInstanceUid'];
      const delay = 2000;

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

      function findingsAnalysis() {

        let str = '';

        fiducials.forEach((val) => {
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
            str = str.concat(
              'fid '+ f_id + ' is the closest to ',
              (val.ClinSig) ? 'CSPC-' + val.fid : 'CIPC-' + val.fid,
              ' with ' + minDistance + ' mm\n'
            );
          }
        });

        return str;
      }



      instance.feedbackString.set(''.concat(
        'Annotations:\n',
        'Expert radiologist indicated ',
        fiducials.length.toString(),
        (fiducials.length === 1) ? ' suspicious area ' : ' suspicious areas ',
        'for this patient.',
        '\n\nProcedure:\n',
        'The patient underwent MR-guidance biopsies.\n\n',
        'Biopsy results:\n',
        ClinSigCounter,
        ' clinical significant',
        (ClinSigCounter === 1) ? ' finding ' : ' findings ',
        '(Gleason score 7 or higher) ',
        (ClinSigCounter === 1) ? 'was ' : 'were ',
        'reported by pathology.\n\n',
        'Analysis of your findings:\n',
        findingsAnalysis(),
      ));
      $('#wwwc').trigger("click");
  }
}

Template.measurementTableView.onCreated(() => {
  const instance = Template.instance();
  instance.feedbackString = new ReactiveVar('');
  instance.feedbackActive = new ReactiveVar(true);
  instance.disableReport = new ReactiveVar(false);
  Meteor.subscribe('fiducials.public');
});

Template.measurementTableView.helpers({
  fiducials() {
    const studyInstanceUid = window.location.pathname.split('/')[2];
    return fiducialsCollection.find({'studyInstanceUid': studyInstanceUid}).fetch();
  },

  prostateLabels() {
    return prostateLabels;
  },

  getFeedback() {
    return Template.instance().feedbackString.get();
  },

  isFeedbackActive() {
    return Template.instance().feedbackActive.get();
  },

  isReportDisabled() {
    return Template.instance().disableReport.get();
  }

});

Template.measurementTableView.events({
  'click .js-getFeedback'(event, instance) {
      instance.disableReport.set(true);
      $('.roundedButtonWrapper[data-value="result"]').removeClass('disabled');
      Session.set('resultGenerated', true);
      $('.roundedButtonWrapper[data-value="result"]').click();
      instance.feedbackActive.set(false);

      $('.roundedButtonWrapper[data-value="findings"]').on('click', (eve) => {
          instance.feedbackActive.set(true);
      });
      $('.roundedButtonWrapper[data-value="result"]').on('click', (eve) => {
          instance.feedbackActive.set(false);
      });

      displayFiducials(instance);
  }

});
