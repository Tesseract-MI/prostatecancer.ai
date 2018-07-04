import os
from keras.layers import *
from keras import optimizers
from keras.losses import *
from keras.models import Model
from keras.regularizers import l2
import json


class ModelBuilder:
    def __init__(self):
        experiment_json = self.read_json(os.path.dirname(__file__) + "/config/experiment.json")["experiment"]
        self.train_params = experiment_json["train_parameters"]
        self.cnn_params = experiment_json["cnn"]
        self.densenet_params = experiment_json["cnn"]["dense_net_params"]

    def read_json(self, path):
        with open(path) as json_file:
            json_data = json.load(json_file)
        return json_data

    def build(self):
        model = self.densenet_build(img_dim={"t2": (32, 32, 5, 1),
                                             "abk": (16, 16, 5, 3)},
                                    depth=self.densenet_params["depth"],
                                    initial_lr=self.train_params["lr"]["initial_lrate"],
                                    nb_dense_block=self.densenet_params["nb_dense_block"],
                                    growth_rate=self.densenet_params["growth_rate"],
                                    nb_filter=self.cnn_params["filter_size"],
                                    flc_type=self.cnn_params["flc_type"],
                                    dropout_rate=self.cnn_params["dropout"],
                                    weight_decay=self.cnn_params["l2_regularizer"])
        model.load_weights(os.path.dirname(__file__) + "/weights/model_checkpoint.hdf5")
        model._make_predict_function()
        return model

    def densenet_build(self, img_dim, depth, initial_lr, nb_dense_block, growth_rate,
                       nb_filter, dropout_rate=None, weight_decay=1E-4, summary=1, flc_type=0):
        t2_input = Input(shape=img_dim["t2"])
        abk_input = Input(shape=img_dim["abk"])
        zones_input = Input((3,))
        # t2
        print("depth", depth["t2"])
        print("nb_filter", nb_filter["t2"])
        print("dense block", nb_dense_block["t2"])
        # abk
        print("depth", depth["abk"])
        print("nb_filter", nb_filter["abk"])
        print("dense block", nb_dense_block["abk"])

        x1 = self.densenet_main(model_input=t2_input,
                                depth=depth["t2"],
                                nb_filter=nb_filter["t2"],
                                weight_decay=weight_decay,
                                nb_dense_block=nb_dense_block["t2"],
                                growth_rate=growth_rate["t2"],
                                dropout_rate=dropout_rate)

        x2 = self.densenet_main(model_input=abk_input,
                                depth=depth["abk"],
                                nb_filter=nb_filter["abk"],
                                weight_decay=weight_decay,
                                nb_dense_block=nb_dense_block["abk"],
                                growth_rate=growth_rate["abk"],
                                dropout_rate=dropout_rate)

        concated_x = concatenate([x1, x2])
        x = Dense(flc_type,
                  activation='relu',
                  kernel_regularizer=l2(weight_decay),
                  bias_regularizer=l2(weight_decay))(concated_x)

        x = concatenate([x, zones_input])
        x = Dense(1,
                  activation='sigmoid',
                  kernel_regularizer=l2(weight_decay),
                  bias_regularizer=l2(weight_decay))(x)

        model = Model(inputs=[t2_input, abk_input, zones_input], outputs=[x], name="DenseNet")

        opt = optimizers.adam(lr=initial_lr, beta_1=0.9, beta_2=0.999, epsilon=1e-08)

        model.compile(loss=binary_crossentropy, optimizer=opt, metrics=['accuracy'])
        #
        if summary:
            print(model.summary())

        return model

    def densenet_main(self, model_input, depth, nb_filter, weight_decay,
                      nb_dense_block, growth_rate, dropout_rate=None):
        concat_axis = -1

        assert (depth - 4) % 3 == 0, "Depth must be 3 N + 4"

        # layers in each dense block
        nb_layers = int((depth - 4) / 3)

        # Initial convolution
        x = Conv3D(nb_filter, (3, 3, 3),
                   kernel_initializer="he_uniform",
                   padding="same",
                   use_bias=False,
                   kernel_regularizer=l2(weight_decay))(model_input)

        # Add dense blocks
        for block_idx in range(nb_dense_block - 1):
            x, nb_filter = self.denseblock(x, concat_axis, nb_layers,
                                           nb_filter, growth_rate,
                                           dropout_rate=dropout_rate,
                                           weight_decay=weight_decay)
            # add transition
            x = self.transition(x, concat_axis, nb_filter, dropout_rate=dropout_rate,
                                weight_decay=weight_decay)

        # The last denseblock does not have a transition
        x, nb_filter = self.denseblock(x, concat_axis, nb_layers,
                                       nb_filter, growth_rate,
                                       dropout_rate=dropout_rate,
                                       weight_decay=weight_decay)

        x = BatchNormalization(axis=concat_axis,
                               gamma_regularizer=l2(weight_decay),
                               beta_regularizer=l2(weight_decay))(x)
        x = Activation('relu')(x)
        x = GlobalAveragePooling3D(data_format=K.image_data_format())(x)
        return x

    def transition(self, x, concat_axis, nb_filter,
                   dropout_rate=None, weight_decay=1E-4):
        x = BatchNormalization(axis=concat_axis,
                               gamma_regularizer=l2(weight_decay),
                               beta_regularizer=l2(weight_decay))(x)
        x = Activation('relu')(x)
        x = Conv3D(nb_filter, (1, 1, 1),
                   kernel_initializer="he_uniform",
                   padding="same",
                   use_bias=False,
                   kernel_regularizer=l2(weight_decay))(x)
        if dropout_rate:
            x = Dropout(dropout_rate)(x)
        x = AveragePooling3D((2, 2, 2), strides=(2, 2, 1))(x)

        return x

    def conv_factory(self, x, concat_axis, nb_filter,
                     dropout_rate=None, weight_decay=1E-4):
        x = BatchNormalization(axis=concat_axis,
                               gamma_regularizer=l2(weight_decay),
                               beta_regularizer=l2(weight_decay))(x)
        x = Activation('relu')(x)
        x = Conv3D(nb_filter, (3, 3, 3),
                   kernel_initializer="he_uniform",
                   padding="same",
                   use_bias=False,
                   kernel_regularizer=l2(weight_decay))(x)
        if dropout_rate:
            x = Dropout(dropout_rate)(x)
        return x

    def denseblock(self, x, concat_axis, nb_layers, nb_filter, growth_rate,
                   dropout_rate=None, weight_decay=1E-4):
        list_feat = [x]

        for i in range(nb_layers):
            x = self.conv_factory(x, concat_axis, growth_rate,
                                  dropout_rate, weight_decay)
            list_feat.append(x)
            x = Concatenate(axis=concat_axis)(list_feat)
            nb_filter += growth_rate

        return x, nb_filter
