#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
import os
pp=os.path.dirname(os.path.abspath(__file__))
import sys
sys.path.insert(0, pp)
import numpy as np
np.set_printoptions(precision=4, linewidth=100)
from utils import vgg_ft_bn, get_data, get_batches, get_classes, split_at, save_array, load_array
from vgg16bn import Vgg16BN
from keras.layers import Flatten, Dense, BatchNormalization, Convolution2D, MaxPooling2D, Dropout, GlobalAveragePooling2D, Activation
from keras.models import Sequential
from keras.utils import to_categorical
import shutil
from sklearn.metrics import  precision_recall_curve,  average_precision_score, classification_report
import glob
from keras.preprocessing import image
import pandas as pd
import matplotlib.pylab as plt
import json
import traceback


def get_pre_rec(Y_test, y_score):
    # For each class
    precision = dict()
    recall = dict()
    n_classes=len(Y_test[0])
    average_precision = dict()
    for i in range(n_classes):
        precision[i], recall[i], _ = precision_recall_curve(Y_test[:, i],y_score[:, i])
        average_precision[i] = average_precision_score(Y_test[:, i], y_score[:, i])
    # A "micro-average": quantifying score on all classes jointly
    precision["micro"], recall["micro"], _ = precision_recall_curve(Y_test.ravel(),y_score.ravel())
    average_precision["micro"] = average_precision_score(Y_test, y_score,average="micro")
    print('Average precision score, micro-averaged over all classes: {0:0.2f}'.format(average_precision["micro"]))
    return precision, recall, average_precision


def plot_pre_rec(precision,recall,average_precision):
    plt.figure()
    plt.step(recall['micro'], precision['micro'], color='b', alpha=0.2,
             where='post')
    plt.fill_between(recall["micro"], precision["micro"], step='post', alpha=0.2,color='b')
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.ylim([0.0, 1.05])
    plt.xlim([0.0, 1.0])
    plt.title('Average precision score, micro-averaged over all classes: AP={0:0.2f}'.format(average_precision["micro"]))



def get_bn_layer  (conv_layer, nclasses ,p=0.5  ) :
    return [
        MaxPooling2D(input_shape= conv_layer[-1].output_shape[1:]),
        BatchNormalization(axis=1),
        Dropout(p/4),
        Flatten(),
        Dense(512, activation='relu'),
        BatchNormalization(),
        Dropout(p),
        Dense(512, activation='relu'),
        BatchNormalization(),
        Dropout(p/2),
        Dense( nclasses   , activation='softmax')]



def get_lrg_layer(conv_layer, num_classes , n_filter=128, p=0.1  ):
    return [
        BatchNormalization(axis=1, input_shape=conv_layer[-1].output_shape[1:]),
        Convolution2D(n_filter, (3,3), activation='relu', padding='same'),
        BatchNormalization(axis=1),
        MaxPooling2D(),
        Convolution2D(n_filter, (3,3), activation='relu', padding='same'),
        BatchNormalization(axis=1),
        MaxPooling2D(),
        Convolution2D(n_filter, (3,3), activation='relu', padding='same'),
        BatchNormalization(axis=1),
        MaxPooling2D((1,2)),
        Convolution2D(num_classes, (3,3), padding='same'),
        Dropout(p),
        GlobalAveragePooling2D(),
        Activation('softmax')
    ]

def Save_cnn_model(model,filename, pp):
    model_json = model.to_json()
   
    with open(os.path.join(pp,filename+"_Image_model.json"), "w") as json_file:
        json_file.write(model_json)
    
    # serialize weights to HDF5
    model.save_weights(os.path.join(pp,filename + "_Image_model.h5"))
    
    print("Saved model to disk")
    return os.path.join(pp, filename + "_Image_model")


def Load_cnn_image_model(pp, filename):
    from keras.models import model_from_json
    
    json_file = open(os.path.join(pp, filename + "_Image_model.json"), 'r')
    loaded_model_json = json_file.read()
    json_file.close()
    
    conv_model = model_from_json(loaded_model_json)
    conv_model.load_weights(os.path.join(pp, filename + "_Image_model.h5"))
    
    print("Loaded model from disk")
    return conv_model


def get_models(image_size, n_classes):
    model = Vgg16BN(image_size).model
    model.pop()
    
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    #model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    
    conv_layer, fc_layer = split_at(model, Convolution2D)
    
    rsd_model = Sequential(get_bn_layer(conv_layer, n_classes))
    
    return  Sequential(conv_layer),  rsd_model


def get_cnn_predictions4traub(pp, path, image_size, n_classes):
    trn = get_data(path + '/train', target_size=image_size)
    val = get_data(path + '/valid', target_size=image_size)

    model1, model2 = get_models(image_size, n_classes)
    
    trn1 = model1.predict(trn, batch_size=64, verbose=1)
    val1 = model1.predict(val, batch_size=64, verbose=1)
    
    save_array(os.path.join(path, 'training_input4FClayer'), trn1)
    save_array(os.path.join(path, 'validation_input4FClayer'), val1)
    return trn1, val1


def train_model(pp, path, image_size, n_classes, Full_train=False):
    model1, model2 = get_models(image_size, n_classes)
    
    (val_classes, trn_classes, val_onehot, trn_onehot, test_onehot, val_filenames, trn_filenames, test_filenames) = get_classes(path + "/")

    cls = os.listdir(path + '/train')
    cls = [i for i in cls if i .find('.') < 0]
    cls = np.sort(cls)
    dcls = [(i, cls[i]) for i in range(len(cls))]
    dcls = dict(dcls)

    with open(os.path.join(path, 'image_classes.json'), 'w') as fp:
        json.dump(dcls, fp)

    if Full_train:
        try:
            shutil.rmtree(os.path.join(path, 'training_input4FClayer'))
            shutil.rmtree(os.path.join(path, 'validation_input4FClayer'))
        except:
            pass
    
    try:
        trn1 = load_array(os.path.join(path, 'training_input4FClayer'))
        val1 = load_array(os.path.join(path, 'validation_input4FClayer'))
    except:
        traceback.print_exc()
        trn1, val1 = get_cnn_predictions4traub(pp, path, image_size, n_classes)
    
    #model2.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    model2.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    model2.fit(trn1, trn_onehot, epochs=10, validation_data=(val1, val_onehot), batch_size=128 , verbose=1)
    
    loss, acc = model2.evaluate(val1, val_onehot, verbose=0)
    
    saved_path = Save_cnn_model(model2, 'finetuned', path)
    
    return [saved_path, loss, acc]


def evaluate(pp, path, image_size, n_classes):
    model1, model2 = get_models(image_size, n_classes)
    
    model2 = Load_cnn_image_model(path, 'finetuned')
    
    tst = get_data(path + '/test', target_size=image_size)
    
    (val_classes, trn_classes, val_onehot, trn_onehot, test_onehot, val_filenames, trn_filenames, test_filenames) = get_classes(path + "/")
    
    Y_prob = model2.predict(model1.predict(tst, verbose=1), verbose=1)
    
    precision, recall, average_precision = get_pre_rec(test_onehot, Y_prob)
    plot_pre_rec(precision, recall, average_precision)
    plt.savefig(os.path.join(path, "image_CNN_model.png"))
    report = classification_report(np.argmax(test_onehot, axis=1), np.argmax(Y_prob , axis=1))
    
    print(report)
    return report


def get_batches_from_df(df, dirname, gen=image.ImageDataGenerator(), shuffle=False, batch_size=1, class_mode=None, target_size=(224,224)):
    return gen.flow_from_dataframe(df, dirname, x_col='IMAGE',
                                    y_col="IMAGE_CLASS", has_ext=True, target_size=target_size,
                                    class_mode= class_mode, batch_size= batch_size,
                                    shuffle= shuffle)

def get_data2score(df, path, target_size=(224,224)):
    batches = get_batches_from_df(df, path, shuffle=False, batch_size=1, class_mode=None, target_size=target_size)
    try:
        return np.concatenate([batches.next() for i in range(batches.nb_sample)])
    except:
        return np.concatenate([batches.next() for i in range(batches.samples)])


def score(dfi, pp, path, image_size, n_classes):
    model1, model2 = get_models(image_size, n_classes)
    #model2 = Load_cnn_image_model(pp, 'finetuned')
    model2 = Load_cnn_image_model(os.path.join(pp, 'Images'), 'finetuned')
    
    #dfi["IMAGE_CLASS"] = [np.random.uniform(0,5) for i in range(len(dfi))]
    dfi["IMAGE_CLASS"] = [0 for i in range(len(dfi))]
    #df = dfi.iloc[:,[2, 6]]
    df = dfi.loc[:,["IMAGE", "IMAGE_CLASS"]]
    print('Size of DF (IMAGE,CLASS): ' + str(len(df.index)))
    df = df.dropna(axis=0, how='all')
    df = df.drop_duplicates()

    print('Size of DF after NA/Dupes: ' + str(len(df.index)))
    # need to filter out any non-existant images
    labelArray = []
    for i in range(len(df)):
        if not os.path.exists(os.path.join(path, str(df.iloc[i,0]))):
            labelArray.append(df.index.values[i])
    
    if len(labelArray):
        df = df.drop(labels=labelArray, axis=0)
    
    print('Size of DF after non-exist: ' + str(len(df.index)))
    df.reset_index(drop=True, inplace=True)

    tst = get_data2score(df, path, target_size=image_size)
    
    with open(os.path.join(pp, 'Images', 'image_classes.json')) as cl:
        cls = json.load(cl)
    
    Y_prob = model2.predict(model1.predict(tst,verbose=1), verbose=1)
    idxs = np.argmax(Y_prob, axis=1 )
    p_class =  [cls[str(i)] for i in idxs]
    print('PREDICTED_IMAGE_CLASS: ' + str(p_class))
    prob= np.max(Y_prob, axis=1 )
    del df["IMAGE_CLASS"]
    print('Size of DF after remove class: ' + str(len(df.index)))
    df['PREDICTED_IMAGE_CLASS'] = p_class
    df['PROBABILITY_IMAGE'] = prob
    dfr = dfi.merge(df, on='IMAGE', how='left')
    
    return dfr


def main():
    global pp
    path = 'Images'
    image_size=(56,56)
    n_classes=len( glob.glob(os.path.join(path,'train','*')))
    print(n_classes)
    a,b,c=train_model(pp,path, image_size, n_classes, Full_train=False)
    s=evaluate(pp, path, image_size, n_classes)


if __name__ == '__main__':
    main()