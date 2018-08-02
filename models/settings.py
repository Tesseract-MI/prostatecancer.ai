import os
import socket
import getpass

folders = []

if socket.gethostname() == 'pmous008':
    intermediate_folder = os.environ['HOME'] + "/projects/pcad"
    slicer_dir = os.environ['HOME'] + "/sources/Slicer-4.8.1-linux-amd64"

elif socket.gethostname() == 'pirads-trainer':
    intermediate_folder = os.environ['HOME'] + "/projects/pcad"
    slicer_dir = os.environ['HOME'] + "/sources/Slicer-4.8.1-linux-amd64"
else:
    intermediate_folder = "/data"

dicom_folder = intermediate_folder + "/dicom"
nrrd_folder = intermediate_folder + "/nrrd"
