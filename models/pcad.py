from flask import Flask, jsonify, request
from flask_cors import CORS
import importlib
import os
import shutil
from requests.auth import HTTPBasicAuth
from orthanc_rest_client import Orthanc
import requests
import SimpleITK as sitk

app = Flask(__name__)
CORS(app)
auth = HTTPBasicAuth('orthanc', 'orthanc')
orthanc = Orthanc('http://localhost:8042/', auth=auth)

@app.route('/getProbability', methods=['GET', 'POST'])
def getProbability():
    data = request.get_json()
    global case
    case = data.get('case')
    prepare_dicom()
    model_uid_2 = "Densenet_T2_ABK_auc_079_nozone"
    deployer2 = importlib.import_module(model_uid_2 + ".deploy").Deploy()
    model2 = deployer2.build()
    model2._make_predict_function()
    result = deployer2.run(model2, data)
    return jsonify(result)

def prepare_dicom():
    create_dir(os.path.abspath("cases"))
    create_dir(os.path.abspath("cases/"+ case))

    create_sub_dir('t2')
    create_sub_dir('adc')
    create_sub_dir('bval')
    create_sub_dir('ktrans')

def create_sub_dir(seriesType):
    create_dir(os.path.abspath("cases/"+ case + "/" + seriesType))
    create_dir(os.path.abspath("cases/"+ case + "/" + seriesType + "/dcm"))

    seriesDescription = "*" + seriesType + "*"
    query = {'Level': 'Instance',
                'Query': {'PatientName': case, 'SeriesDescription': seriesDescription},
            }
    for instance_id in orthanc.find(query):
        create_dcm_file(instance_id, seriesType)

    create_dir(os.path.abspath("cases/"+ case + "/" + seriesType + "/nrrd"))    
    convert_dcm_to_nrrd(seriesType)

def create_dcm_file(instance_id, seriesType):
    if (seriesType == 'ktrans'):
    	fileName = os.path.abspath("cases/"+ case + "/" + seriesType + "/ktrans.dcm")
    else:
    	fileName = os.path.abspath("cases/"+ case + "/" + seriesType + "/dcm/" + instance_id + ".dcm")

    with open(fileName, 'wb') as dcm:
     for chunk in orthanc.get_instance_file(instance_id):
         dcm.write(chunk)

def convert_dcm_to_nrrd(seriesType):
    if (seriesType == 'ktrans'):
        os.system("docker run -v " + os.path.abspath("cases/"+ case + "/ktrans") + ":/tmp/dcmqi qiicr/dcmqi paramap2itkimage --outputDirectory /tmp/dcmqi/ --inputDICOM /tmp/dcmqi/ktrans.dcm")
    else:
        reader = sitk.ImageSeriesReader()
        directory_to_add_nrrd_file = os.path.abspath("cases/"+ case + "/" + seriesType + "/dcm")
        dicom_reader = reader.GetGDCMSeriesFileNames(directory_to_add_nrrd_file)
        reader.SetFileNames(dicom_reader)
        dicoms = reader.Execute()
        sitk.WriteImage(dicoms, os.path.abspath("cases/"+ case + "/" + seriesType + "/nrrd/" + seriesType + ".nrrd"))

def create_dir(path):
    if (not os.path.exists(path)):
        os.mkdir(path)
