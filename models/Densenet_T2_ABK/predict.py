import os
import sys

sys.path.append("../")
from glob import glob
from models.Densenet_T2_ABK.utils.helpers import *
import json
from keras import backend as K
import SimpleITK as sitk
import models.settings as S


class Predict:
    def __init__(self, model, info):
        self.info = info
        self.case = info["case"]
        self.model = model
        self.datagen_dict = read_json(os.path.dirname(__file__) + "/config/datagen.json")['datagen']
        self.datagen_dict_specs = self.datagen_dict['specs']
        self.datagen_dict_prep = self.datagen_dict['preprocessing']

    def read_images(self, image_type):
        image_paths = glob(
            os.path.join(S.nrrd_folder, "train-original_preprocessed_2018_06_27_17_30_32_abk_2_2_3_t2_05053",
                         self.case + '*' + image_type + '*.nrrd'))
        assert len(image_paths) == 1, print(self.case, "more than one image")
        image = sitk.ReadImage(image_paths[0])
        image_prep = preprocess(image=image,
                                window_intensity_dict=self.datagen_dict_prep["window_intensity"],
                                zero_scale_dict=self.datagen_dict_prep["rescale_zero_one"])
        return image_prep

    def extract_patches(self):
        zone_encoding = np.zeros((1, 3), dtype=np.float32)
        if self.info["zone"].lower().startswith('p'):
            zone_encoding[0, ...] = np.array([1, 0, 0])
        elif self.info["zone"].lower().startswith('t'):
            zone_encoding[0, ...] = np.array([0, 1, 0])
        elif self.info["zone"].lower().startswith('a'):
            zone_encoding[0, ...] = np.array([0, 0, 1])
        size_x, size_y, size_z = self.datagen_dict_specs["output_patch_shape"]["size"]

        t2_test = np.zeros((1, size_x, size_y, size_z, 1), dtype=np.float32)
        abk_test = np.zeros((1, size_x // 2, size_y // 2, size_z, 3), dtype=np.float32)

        for enum, image_type in enumerate(['t2_tse_tra', 'ADC', 'BVAL', 'Ktrans']):
            image = self.read_images(image_type=image_type)
            ijk = self.info[image_type]
            if image_type == 't2_tse_tra':
                image_cropped = crop_roi(image, ijk, [size_x, size_y, size_z])
                image_cropped_arr = sitk.GetArrayFromImage(image_cropped)
                image_cropped_arr = np.swapaxes(image_cropped_arr, 0, 2)
                t2_test[0, ..., 0] = image_cropped_arr
            else:
                image_cropped = crop_roi(image, ijk, [size_x // 2, size_y // 2, size_z])
                image_cropped_arr = sitk.GetArrayFromImage(image_cropped)
                image_cropped_arr = np.swapaxes(image_cropped_arr, 0, 2)
                abk_test[0, ..., enum - 1] = image_cropped_arr
        return t2_test, abk_test, zone_encoding

    def mean_std_standarzation(self, t2_arr, abk_arr):
        mean_std_dir = os.path.join(os.path.dirname(__file__), "weights/mean_stds/")
        t2_mean = np.load(mean_std_dir + "/training_t2_mean.npy")
        t2_std = np.load(mean_std_dir + "/training_t2_std.npy")
        #
        abk_mean = np.load(mean_std_dir + "/training_abk_mean.npy")
        abk_std = np.load(mean_std_dir + "/training_abk_std.npy")
        #
        t2_arr -= t2_mean
        t2_arr /= t2_std
        #
        abk_arr -= abk_mean
        abk_arr /= abk_std
        return t2_arr, abk_arr

    def run(self):
        t2_test, abk_test, zone_encoding = self.extract_patches()
        t2_test, abk_test = self.mean_std_standarzation(t2_test, abk_test)
        x = [t2_test, abk_test, zone_encoding]
        predicted_prob = self.model.predict(x, verbose=1)
        print("successss" * 100)
        scores = np.concatenate(predicted_prob).ravel()
        print("predictions: {} ".format(scores))
        # del self.model
        # K.clear_session()
        response_dict = {"case": self.info["case"],
                         "score": str(scores[0])}
        return json.dumps(response_dict)
