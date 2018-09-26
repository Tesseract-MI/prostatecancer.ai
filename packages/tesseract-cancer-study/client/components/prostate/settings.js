import { OHIF } from 'meteor/ohif:core';

OHIF.tesseract = {
  settings: {
    delay: 1500,
    selctedToolAfterResult: 'wwwc',
    clinSigString: 'CSPC',
    clinInsigString: 'CIPC',
    descriptionMap: (seriesDescription) => {
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
  }
};
