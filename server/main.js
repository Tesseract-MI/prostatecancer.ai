import { Meteor } from 'meteor/meteor';
import csv from 'fast-csv';
import fs from 'fs';

Meteor.startup(function () {
  UserData = new Mongo.Collection('user_data');
  Fiducials = new Mongo.Collection('fiducials');

  UserData.allow({
    insert: function (userId, doc) {
      return true;
    }
  });

  if (Fiducials.find().count() === 0) {
    const stream = fs.createReadStream("assets/app/findings.csv");

    csv.fromStream(stream, {
      headers: true
    }).on("data", Meteor.bindEnvironment((data) => {
      if ('pos' in data) {
        const pos = data.pos.split(" ").map(Number);
        const tra = data.t2_tse_tra.split(" ").map(Number);
        const adc = data.adc.split(" ").map(Number);
        const hbval = data.bval.split(" ").map(Number);
        const ktrans = data.ktrans.split(" ").map(Number);
        const fiducial = {
          ProxID: data.ProxID,
          fid: data.fid,
          pos: {
            x: pos[0],
            y: pos[1],
            z: pos[2]
          },
          zone: data.zone,
          ClinSig: (data.ClinSig === 'True') ? true : false,
          tra: {
            x: tra[0],
            y: tra[1],
            z: tra[2]
          },
          adc: {
            x: adc[0],
            y: adc[1],
            z: adc[2]
          },
          hbval: {
            x: hbval[0],
            y: hbval[1],
            z: hbval[2]
          },
          ktrans: {
            x: ktrans[0],
            y: ktrans[1],
            z: ktrans[2]
          }
        };
        Fiducials.insert(fiducial);
      }
      else {
        const fiducial = {
          ProxID: data.ProxID,
          ClinSig: (data.ClinSig === 'True') ? true : false,
        };
        Fiducials.insert(fiducial);
      }

    })).on("end", function() {
      console.log("Done adding all the resualts!");
    });
  }

  Meteor.publish('fiducials.public', function() {
    return Fiducials.find();
  });

  Meteor.publish('user_data.public', function() {
    return UserData.find();
  });

});
