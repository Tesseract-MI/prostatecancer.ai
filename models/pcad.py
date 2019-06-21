import importlib
import json
import os
import shutil
from keras import backend as K
from flask import Flask, request
from requests.auth import HTTPBasicAuth
from orthanc_rest_client import Orthanc
import sys
import requests
from flask_cors import CORS
import tensorflow as tf

sys.path.append("./")
sys.path.append("../")

import models.settings as S

app = Flask(__name__)
# app.debug = True
CORS(app)
auth = HTTPBasicAuth('orthanc', 'orthanc')
orthanc = Orthanc('http://192.241.141.88:8042/', auth=auth)


def safe_mkdir(path):
    try:
        os.mkdir(path)
    except OSError:
        pass


def cach_dicoms(info):
    url = "http://162.243.174.237:8042/"
    if info["case"] not in os.listdir(S.dicom_folder):
        patient_folder = os.path.join(S.dicom_folder, info["case"])
        safe_mkdir(patient_folder)
        post_query = {"Level": "Instance", "Query": {"PatientName": info["case"]}}
        response = requests.post(url + "tools/find", data=json.dumps(post_query),
                                 auth=("**", "**"))
        for enum, instance_id in enumerate(response.json()):
            dicom = requests.get(url + "/instances/" + str(instance_id) + "/file",
                                 stream=True,
                                 auth=("**", "**"))
            with open(os.path.join(patient_folder, str(enum)), 'wb') as out_file:
                shutil.copyfileobj(dicom.raw, out_file)
            del dicom
        print("*" * 100)
        print(response.json()[0])


model_uid_1 = "Densenet_T2_ABK_auc_08"
model_uid_2 = "Densenet_T2_ABK_auc_079_nozone"
deployer1 = importlib.import_module(model_uid_1 + ".deploy").Deploy()
model1 = deployer1.build()
model1._make_predict_function()
# graph=tf.get_default_graph()
deployer2 = importlib.import_module(model_uid_2 + ".deploy").Deploy()
model2 = deployer2.build()
model2._make_predict_function()


@app.route('/predict', methods=['GET'])
def predict():
	prepare_dicom()
    global model1, model2
    global deployer1, deployer2
    info = request.args.to_dict()
    info["lps"] = list(map(float, [info["lps_x"], info["lps_y"], info["lps_z"]]))
    # cach_dicoms(info)
    result = "NA"
    if info["model_name"] == model_uid_1:
        result = deployer1.run(model1, info)
    elif info["model_name"] == model_uid_2:
        result = deployer2.run(model2, info)
    return result

def prepare_dicom():
    create_dir(os.path.abspath("cases"))

    if (not os.path.exists(os.path.abspath("cases/"+ case))):
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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
