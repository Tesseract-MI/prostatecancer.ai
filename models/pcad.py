import importlib
from flask import Flask, request
import sys
sys.path.append("./")
app = Flask(__name__)

default_model = "Densenet_T2_ABK"
model = importlib.import_module(default_model+".cnn")
model_compiled = model.ModelBuilder().build()
predictor = importlib.import_module(default_model + ".predict")

@app.route('/', methods=['POST'])
def predict():
    global default_model
    global model_compiled
    global predictor
    info = request.get_json()
    if info["model_name"] != default_model:
        model = importlib.import_module(info["model_name"]+".cnn")
        model_compiled = model.ModelBuilder().build()
        predictor = importlib.import_module(info["model_name"] + ".predict")
        default_model = info["model_name"]
    pd = predictor.Predict(model=model_compiled, info=info)
    result = pd.run()
    return result