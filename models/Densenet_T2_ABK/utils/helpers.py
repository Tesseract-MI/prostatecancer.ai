import SimpleITK as sitk
import json
import numpy as np


def read_json(path):
    with open(path) as json_file:
        json_data = json.load(json_file)
    return json_data


def preprocess(image, window_intensity_dict, zero_scale_dict):
    if window_intensity_dict["status"]:
        pl = window_intensity_dict['pl']
        ph = window_intensity_dict['ph']
        bounding_box = window_intensity_dict['bounding box']
        image = window_intensity(image, bounding_box=bounding_box,
                                      pl=pl, ph=ph)
    if zero_scale_dict["status"]:
        image = rescale_zero_one(image)
    return image


def window_intensity(image, bounding_box=[0, 1, 0.1, 0.9, 0.1, 0.9], pl=1.0, ph=99.0):
    rescaler = sitk.IntensityWindowingImageFilter()
    nda = sitk.GetArrayFromImage(image)
    a = int(nda.shape[0] * bounding_box[0])
    b = int(nda.shape[0] * bounding_box[1])
    c = int(nda.shape[1] * bounding_box[2])
    d = int(nda.shape[1] * bounding_box[3])
    e = int(nda.shape[2] * bounding_box[4])
    f = int(nda.shape[2] * bounding_box[5])
    val_pl = np.percentile(nda[a:b, c:d, e:f], pl)
    val_ph = np.percentile(nda[a:b, c:d, e:f], ph)
    rescaler.SetWindowMaximum(val_ph)
    rescaler.SetWindowMinimum(val_pl)
    rescaler.SetOutputMaximum(val_ph)
    rescaler.SetOutputMinimum(val_pl)
    return rescaler.Execute(image)


def rescale_zero_one(image):
    image = sitk.RescaleIntensity(sitk.Cast(image, sitk.sitkFloat32), 0, 1)
    return image


def zero_pad(image, index, pad):
    pad = int(pad)
    filter = sitk.ConstantPadImageFilter()
    # filter.SetConstant(float(np.amin(sitk.GetArrayFromImage(image))))
    filter.SetConstant(0)
    filter.SetPadLowerBound([pad, pad, pad])
    filter.SetPadUpperBound([pad, pad, pad])
    image = filter.Execute(image)
    index = [item + pad for item in index]  # totally needed
    return image, index


def crop_roi(image, ijk, patch_size):
    image_size = np.asanyarray(image.GetSize(), dtype=int)
    size = np.asanyarray([patch_size[0] / 2, patch_size[1] / 2, int(patch_size[2] / 2)], dtype=int)
    index = np.asanyarray(ijk - size, dtype=int)
    endpoint = np.asanyarray(ijk + size, dtype=int)
    diff = endpoint - (image_size - np.ones(len(image_size)))  # to change size to index
    if max(diff) > 0 or min(index) < 0:
        pad = max(max(diff), -min(index))
        image, index = zero_pad(image, index, pad)
    roi_filter = sitk.RegionOfInterestImageFilter()
    roi_filter.SetSize(list(map(int, patch_size)))
    roi_filter.SetIndex(list(map(int, index)))
    croped_image = roi_filter.Execute(image)
    return croped_image
