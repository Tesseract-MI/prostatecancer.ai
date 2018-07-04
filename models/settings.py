import os
import socket
import getpass

folders = []
intermediate_folder = ''

if socket.gethostname() in ['theBeast', ]:
    intermediate_folder = os.environ['HOME'] + "/projects/pcad/intermediate"
    slicer_dir = os.environ['HOME'] + "/sources/Slicer-4.8.1-linux-amd64"

elif socket.gethostname() == 'pirads-trainer':
    intermediate_folder = os.environ['HOME'] + "/projects/pcad"
    slicer_dir = os.environ['HOME'] + "/sources/Slicer-4.8.1-linux-amd64"

elif socket.gethostname() == 'pmous008':
    intermediate_folder = os.environ['HOME'] + "/projects/pcad"
    slicer_dir = os.environ['HOME'] + "/sources/Slicer-4.8.1-linux-amd64"

# data folders
folders.append(intermediate_folder)
data_folder = os.path.join(intermediate_folder, 'data')
folders.append(data_folder)
raw_folder = os.path.join(data_folder, 'raw')
folders.append(raw_folder)
sheets_folder = os.path.join(data_folder, 'sheets')
folders.append(sheets_folder)
nrrd_folder = os.path.join(data_folder, 'nrrd')
folders.append(nrrd_folder)
split_folder = os.path.join(data_folder, 'split')
folders.append(split_folder)
npy_folder = os.path.join(data_folder, 'npy')
folders.append(npy_folder)