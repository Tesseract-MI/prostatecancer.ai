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
    if (not os.path.exists("C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases")):
        os.mkdir("C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases")

    if (not os.path.exists("C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases\\" + case)):
        os.mkdir("C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases\\" + case)
        create_t2()
        create_adc()
        create_bval()
        create_ktrans()

def create_t2():
    os.mkdir("C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases\\" + case + "\\t2")
    os.mkdir("C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases\\" + case + "\\t2\\dcm")
    query = {'Level': 'Instance',
                'Query': {'PatientName': case, 'SeriesDescription': '*t2*'},
            }
    for instance_id in orthanc.find(query):
        create_dcm_file(instance_id, 't2')

    os.mkdir("C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases\\" + case + "\\t2\\nrrd")    
    convert_dcm_to_nrrd('t2')

def create_adc():
    os.mkdir("C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases\\" + case + "\\adc")
    os.mkdir("C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases\\" + case + "\\adc\\dcm")
    query = {'Level': 'Instance',
                'Query': {'PatientName': case, 'SeriesDescription': '*adc*'},
            }
    for instance_id in orthanc.find(query):
        create_dcm_file(instance_id, 'adc')

    os.mkdir("C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases\\" + case + "\\adc\\nrrd")   
    convert_dcm_to_nrrd('adc')

def create_bval():
    os.mkdir("C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases\\" + case + "\\bval")
    os.mkdir("C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases\\" + case + "\\bval\\dcm")
    query = {'Level': 'Instance',
                'Query': {'PatientName': case, 'SeriesDescription': '*bval*'},
            }
    for instance_id in orthanc.find(query):
        create_dcm_file(instance_id, 'bval')

    os.mkdir("C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases\\" + case + "\\bval\\nrrd")  
    convert_dcm_to_nrrd('bval')

def create_ktrans():
    os.mkdir("C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases\\" + case + "\\ktrans")
    query = {'Level': 'Instance',
                'Query': {'PatientName': case, 'SeriesDescription': '*ktrans*'},
            }
    for instance_id in orthanc.find(query):
        create_dcm_file(instance_id, 'ktrans')
    convert_dcm_to_nrrd('ktrans')

def create_dcm_file(instance_id, folderName):
    if (folderName == 'ktrans'):
        fileName = "C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases\\" + case + "\\" + folderName + "\\ktrans.dcm"
    else:
        fileName = "C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases\\" + case + "\\"+ folderName + "\\dcm\\" + instance_id + ".dcm"

    with open(fileName, 'wb') as dcm:
     for chunk in orthanc.get_instance_file(instance_id):
         dcm.write(chunk)

def convert_dcm_to_nrrd(folderName):
    if (folderName == 'ktrans'):
        os.system("docker run -v C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases\\" + case + "\\ktrans:/tmp/dcmqi qiicr/dcmqi paramap2itkimage --outputDirectory /tmp/dcmqi/ --inputDICOM /tmp/dcmqi/ktrans.dcm")
    else:
        reader = sitk.ImageSeriesReader()
        directory_to_add_nrrd_file = "C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases\\" + case + "\\" + folderName + "\\dcm"
        dicom_reader = reader.GetGDCMSeriesFileNames(directory_to_add_nrrd_file)
        reader.SetFileNames(dicom_reader)
        dicoms = reader.Execute()
        sitk.WriteImage(dicoms, "C:\\Users\\14ot3\\Desktop\\prostateCancer\\models\\cases\\" + case + "\\" + folderName + "\\nrrd\\" + folderName + ".nrrd")