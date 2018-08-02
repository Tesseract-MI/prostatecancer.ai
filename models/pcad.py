import importlib
import json
import os
import shutil
from keras import backend as K
from flask import Flask, request
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


default_model = "Densenet_T2_ABK_auc_08"
deployer = importlib.import_module(default_model + ".deploy").Deploy()
model = deployer.build()
model._make_predict_function()
graph=tf.get_default_graph()


@app.route('/predict', methods=['GET'])
def predict():
    global default_model
    global model, deployer
    global graph
    info = request.args.to_dict()
    info["lps"] = list(map(float, [info["lps_x"], info["lps_y"], info["lps_z"]]))
    # cach_dicoms(info)
    if info["model_name"] != default_model:
        del deployer
        deployer = importlib.import_module(info["model_name"] + ".deploy").Deploy()
        model = deployer.build()
        model._make_predict_function()
        graph=tf.get_default_graph()
        default_model = info["model_name"]
    with graph.as_default():
        result = deployer.run(model, info)
    return result

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
