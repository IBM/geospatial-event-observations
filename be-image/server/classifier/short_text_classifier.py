#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
from concurrent.futures import ProcessPoolExecutor
import os
pp=os.path.dirname(os.path.abspath(__file__))
import sys
sys.path.insert(0, pp)
import pandas as pd
import numpy as np
from keras.layers import   MaxPooling1D, Flatten, Dense,  Conv1D, Dropout, Input,  concatenate
from keras.models import  Model
from sklearn.metrics import  precision_recall_curve,  average_precision_score, classification_report
import matplotlib.pylab as plt
import nltk
from nltk import word_tokenize
from nltk.tokenize import RegexpTokenizer
import re
import json
import operator
import time
import traceback

sys.path.append('..')

from config import get_diagnostics

# CPU core count
available_cpus = 1
try:
    available_cpus = os.cpu_count() - 1
except:
    import psutil
    available_cpus = psutil.cpu_count(logical=False) - 1

def training_text_classifier(spath, Training_text, val_text):
    global pp
    with open(os.path.join(pp, 'settings.json')) as f:
        Conf = json.load(f)
    wd_path = Conf['data_path']
    filename = Conf["word_vectors"]

    wvmodel = get_word_vectors(os.path.join(pp, filename))
    vecsize = len(wvmodel[list(wvmodel.keys())[0]])
    
    filters = Conf["filters"]
    
    df_train = pd.read_csv(os.path.join(spath, Training_text))
    df_train = df_train[["TEXT","TOPIC"]]
    
    print(df_train.head(4))
    print(df_train.info())
    df = pd.read_csv(os.path.join(spath, val_text))
    df = df[["TEXT","TOPIC"]]
    df_train['clean_text'] = df_train.TEXT.apply(lambda s: preprocess(s))
    
    print(df_train.head(4))
    df['clean_text'] = df.TEXT.apply(lambda s: preprocess(s))
    df = df.dropna()
    df_train = df_train.dropna()
    df = df[df.clean_text.str.split().str.len()>2]
    df_train = df_train[df_train.clean_text.str.split().str.len()>2]
    df_train = df_train.sample(frac=1)
    classdict = df_train.groupby('TOPIC').apply(lambda s: s['clean_text'].tolist()).to_dict()
    print(classdict)
    
    length = int(np.mean(df.clean_text.str.split().str.len()))
    print("max len seq:" + str(length))
    maxlen = length
    
    amodel = CNNEmbeddedVecClassifier(wvmodel, classdict, maxlen, vecsize, filters, spath)
    amodel.train()
    amodel.Save_cnn_model(spath)
    
    Y_true = [amodel.convert_class_label(i) for i in df.TOPIC.tolist()]
    Y_prob = [amodel.score_prob(str(i)) for i in df.clean_text.tolist()]
    Y_true2 = df.TOPIC.tolist()
    Y_prob2 = [amodel.score(str(i)) for i in df.clean_text.tolist()]
    Y_prob2 = [max(d.items(), key=operator.itemgetter(1))[0] for d in  Y_prob2]
    precision, recall, average_precision = get_pre_rec(np.asarray(Y_true), np.asarray(Y_prob))
    plot_pre_rec(precision, recall, average_precision)
    plt.savefig(os.path.join(spath, "wvc_CNN_model.png"))
    report = classification_report(np.asarray(Y_true2), np.asarray(Y_prob2))
    Conf['maxlen'] = maxlen
    
    with open(os.path.join(spath, "settings.json"), "w") as json_set_file:
        json.dump(Conf, json_set_file)
    print(report)
    
    return report


def val_text_classifier(spath, val_text):
    global pp
    with open(os.path.join(pp, 'settings.json')) as f:
        Conf = json.load(f)
    wd_path = Conf['data_path']
    filename = Conf["word_vectors"]
    
    wvmodel = get_word_vectors(os.path.join(pp, filename))
    vecsize = len(wvmodel[list(wvmodel.keys())[0]])
    
    filters = Conf["filters"]
    maxlen = Conf["maxlen"]
    with open(os.path.join(pp,'classes.json')) as cl:
        classdict = json.load(cl)
    df = pd.read_csv(os.path.join(pp, val_text))
    df = df[['TEXT','TOPIC']]
    df['clean_text'] = df.TEXT.apply(lambda s: preprocess(s))
    
    amodel = CNNEmbeddedVecClassifier(wvmodel, classdict, maxlen, vecsize, filters, spath)
    amodel.Load_cnn_model(pp)
    
    Y_true = [amodel.convert_class_label(i) for i in df.TOPIC.tolist()]
    Y_prob = [amodel.score_prob(str(i)) for i in df.clean_text.tolist()]
    Y_true2 = df.TOPIC.tolist()
    Y_prob2 = [amodel.score(str(i)) for i in df.clean_text.tolist()]
    Y_prob2 = [max(d.items(), key=operator.itemgetter(1))[0] for d in  Y_prob2]
    precision, recall, average_precision = get_pre_rec(np.asarray(Y_true), np.asarray(Y_prob))
    plot_pre_rec(precision, recall, average_precision)
    plt.savefig(os.path.join(spath,"wvc_CNN_model.png"))
    report = classification_report(np.asarray(Y_true2), np.asarray(Y_prob2))
    
    Conf['maxlen'] = maxlen
    with open(os.path.join(spath, "settings.json"), "w") as json_set_file:
        json.dump(Conf, json_set_file)
    print(report)
    
    return report


def score_text_classifier(modelPath, spath, val_text):
    global pp
    with open(os.path.join(modelPath, 'settings.json')) as f:
        Conf = json.load(f)
    
    wd_path = Conf['data_path']
    filename = Conf["word_vectors"]
    wvmodel = get_word_vectors(os.path.join(pp, filename))
    
    vecsize = len(wvmodel[list(wvmodel.keys())[0]])
    filters = Conf["filters"]
    maxlen = Conf["maxlen"]
    
    with open(os.path.join(modelPath, 'classes.json')) as cl:
        classdict = json.load(cl)
    df = pd.read_csv(os.path.join(spath, val_text))
    df['clean_text'] = df.TEXT.apply(lambda s: preprocess(s))
    amodel = CNNEmbeddedVecClassifier(wvmodel, classdict, maxlen, vecsize, filters, modelPath)
    amodel.Load_cnn_model(modelPath)
    print(df)
    df = df.join(
        df.apply(
            lambda s: 
                amodel.score_text(
                    str(s.loc['clean_text'])
                ),
            axis=1
        ), 
        how='inner'
    )
    
    return df

vector_files = None

def multi_process_read(aFunc, params, procs):
    with ProcessPoolExecutor(procs) as ppe:
        result = ppe.map(aFunc, params)
    return list(result)

def get_word_vector(n):
    global vector_files
    embeddings_index = {}
    f = open(vector_files[n], encoding="latin-1")
    for line in f:
        try:
            values = line.split()
            word = values[0]
            coefs =  np.asarray([float(i)for i in values[1:]])
            embeddings_index[word] = coefs
        except:
            pass
    f.close()
    
    return embeddings_index 

#def get_word_vectors(pathname):
#    if get_diagnostics(): start = time.time()
#    global available_cpus
#    global vector_files
#    vector_files = []
#    embeddings_index = {}
#    
#    for filename in os.listdir(pathname):
#        vector_files.append(os.path.join(pathname, filename))

    # call the multiprocess read
#    result = multi_process_read(get_word_vector, range(len(vector_files)), available_cpus)

#    vector_files = None

#    for obj in result:
#        embeddings_index.update(obj)

#    if get_diagnostics():
#        end = time.time()
#        print('%s Loaded Word Vectors in %f s' %(time.ctime(end), end-start), flush=True)
    
#    return embeddings_index

def get_word_vectors(pathname):
    if get_diagnostics(): start = time.time()

    embeddings_index = {}
    for filename in os.listdir(pathname):
        f = open(os.path.join(pathname, filename ), encoding="latin-1")
        try:
           for line in f:
                values = line.split()
                word = values[0]
                coefs =  np.asarray([float(i)for i in values[1:]])
                embeddings_index[word] = coefs
        except:
            pass
        f.close()

    if get_diagnostics():
        end = time.time()
        print('%s Loaded Word Vectors in %f s' %(time.ctime(end), end-start), flush=True)

    return embeddings_index

def remove_urls(StrX):
    return re.sub(r'https?:\/\/.*[\r\n]*', ' ', StrX)


def remove_special_chars(StrX):
    StrX = re.sub('[^A-Za-z0-9]+', ' ', StrX)
    return StrX.strip()

def remove_usernames(StrX):
    return re.sub(r"@[^\s]+[\s]?",' ', StrX)

def remove_numbers(StrX):
    return  re.sub(r"\s?[0-9]+\.?[0-9]*" ,' ', StrX)

def tokemize_remove_stopwords(StrX):
    tokenizer = RegexpTokenizer(r'\w+')
    SWords = set(nltk.corpus.stopwords.words('english'))
    words = tokenizer.tokenize( StrX.lower())
    Tmp = [i for i in words if i in list(set(words)-SWords)]
    res=" ".join(Tmp)
    return res

def preprocess(StrX):
    StrX = str(StrX)
    StrX = remove_urls(StrX.lower())
    StrX = remove_usernames(StrX)
    StrX = remove_special_chars(StrX)
    StrX = remove_numbers(StrX)
    StrX = tokemize_remove_stopwords(StrX)
    return StrX

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
    precision["micro"], recall["micro"], _ = precision_recall_curve(Y_test.ravel(), y_score.ravel())
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


class CNNEmbeddedVecClassifier:
    def __init__(self,
                 wvmodel,
                 classdict,
                 maxlen,
                 vecsize,
                 nb_filters,
                 modelPath):
        self.wvmodel = wvmodel
        self.classdict = classdict
        self.vecsize = vecsize
        self.nb_filters = nb_filters
        self.maxlen = maxlen
        self.trained = False
        self.modelPath = modelPath


    def convert_class_label(self, label):
        classlabels = self.classdict.keys()
        category_bucket = [0]*len(classlabels)
        if label in classlabels:
            lblidx_dict = dict(zip(classlabels, range(len(classlabels))))
            category_bucket[lblidx_dict[label]] = 1
        return category_bucket


    def convert_trainingdata_matrix(self):
        classlabels = self.classdict.keys()
        lblidx_dict = dict(zip(classlabels, range(len(classlabels))))
        with open(os.path.join(self.modelPath, 'classes.json'), 'w') as fp:
            json.dump(lblidx_dict, fp)

        # tokenize the words, and determine the word length
        phrases = []
        indices = []
        for label in classlabels:
            for shorttext in self.classdict[label]:
                category_bucket = [0]*len(classlabels)
                category_bucket[lblidx_dict[label]] = 1
                indices.append(category_bucket)
                phrases.append(word_tokenize(shorttext))

        # store embedded vectors
        train_embedvec = np.zeros(shape=(len(phrases), self.maxlen, self.vecsize))
        for i in range(len(phrases)):
            for j in range(min(self.maxlen, len(phrases[i]))):
                train_embedvec[i, j] = self.word_to_embedvec(phrases[i][j])
        indices = np.array(indices, dtype=np.int)

        return classlabels, train_embedvec, indices

    def conv_layers_pool(self, f, ng, I_shape):
        model_in = Input(shape=I_shape[1:])
        conv = Conv1D(filters=f, kernel_size=ng, padding='valid', activation='tanh')(model_in)
        pool = MaxPooling1D(I_shape[1]-ng+1)(conv)
        return model_in, pool

    def create_network(self, f, list_g, i_shape):
        mins1, mouts1 = self.conv_layers_pool(f, list_g[0], i_shape)
        mins2, mouts2 = self.conv_layers_pool(f, list_g[1], i_shape)
        mins3, mouts3 = self.conv_layers_pool(f, list_g[2], i_shape)
        mins4, mouts4 = self.conv_layers_pool(f, list_g[3], i_shape)
        mins5, mouts5 = self.conv_layers_pool(f, list_g[4], i_shape)
        concatenated = concatenate([mouts1, mouts2, mouts3, mouts4, mouts5])
        #concatenated = concatenate([mouts1, mouts2, mouts3, mouts4])
        flat = Flatten()(concatenated)
        drop = Dropout(0.5)(flat)
        out = Dense( len(self.classlabels), activation='softmax', name='output_layer')(drop)
        big_model = Model(input=[mins1, mins2, mins3, mins4, mins5], output=out)
        #big_model = Model(input=[mins1, mins2, mins3, mins4], output=out)
        return big_model


    def train(self):
        # convert classdict to training input vectors
        self.classlabels, train_embedvec, indices = self.convert_trainingdata_matrix()

        grams = [2, 3, 4, 5, 6]
        model = self.create_network(self.nb_filters, grams, train_embedvec.shape)
        model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['acc'])
        #model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['acc'])

        # train the model
        model.fit([train_embedvec]*5, indices, validation_split=0.05, epochs=5, batch_size=1000, verbose=1)
        #model.fit([train_embedvec]*4, indices, validation_split=0.05, epochs=5, batch_size=1000, verbose=1)

        # flag switch
        self.model = model
        self.trained = True

    def word_to_embedvec(self, word):
        return self.wvmodel[word] if word in self.wvmodel else np.zeros(self.vecsize)

    def shorttext_to_matrix(self, shorttext):
        tokens = word_tokenize(shorttext)
        matrix = np.zeros((self.maxlen, self.vecsize))
        for i in range(min(self.maxlen, len(tokens))):
            matrix[i] = self.word_to_embedvec(tokens[i])
        return matrix

    def score(self, shorttext):
        if not self.trained:
            raise print("error")#ModelNotTrainedException()

        # retrieve vector
        matrix = np.array([self.shorttext_to_matrix(shorttext)])

        # classification using the neural network
        predictions = self.model.predict([matrix]*5, verbose=0)
        #predictions = self.model.predict([matrix]*4, verbose=0)

        # wrangle output result
        scoredict = {}
        for idx, classlabel in zip(range(len(self.classlabels)), self.classlabels):
            scoredict[classlabel] = predictions[0][idx]
        return scoredict


    def score_text(self, shorttext):
        if not self.trained:
            raise print("error")#ModelNotTrainedException()
        
        # retrieve vector
        matrix = np.array([self.shorttext_to_matrix(shorttext)])
        
        # classification using the neural network
        predictions = self.model.predict([matrix]*5, verbose=0)
        #predictions = self.model.predict([matrix]*4, verbose=0)

        # wrangle output result
        p=0
        for idx, classlabel in zip(range(len(self.classlabels)), self.classlabels):
            if predictions[0][idx] > p:
                p = predictions[0][idx]
                cl =  classlabel

        ser = pd.Series({'PREDICTED_TOPIC': cl, 'PROBABILITY': p})


        return ser


    def score_prob(self, shorttext):
        if not self.trained:
            raise print("error")#ModelNotTrainedException()

        # retrieve vector
        matrix = np.array([self.shorttext_to_matrix(shorttext)])

        # classification using the neural network
        predictions = self.model.predict([matrix]*5, verbose=0)
        #predictions = self.model.predict([matrix]*4, verbose=0)
        return predictions[0]

    def Save_cnn_model(self, aPath):
        # serialize model to JSON
        model_json = self.model.to_json()
        with open(os.path.join(aPath, "model.json"), "w") as json_file:
            json_file.write(model_json)
        # serialize weights to HDF5
        self.model.save_weights(os.path.join(aPath, "model.h5"))
        print("Saved model to disk")

    def Load_cnn_model(self, aPath):
        from keras.models import model_from_json
        # load json and create model
        json_file = open(os.path.join(aPath, 'model.json'), 'r')
        loaded_model_json = json_file.read()
        json_file.close()
        self.model = model_from_json(loaded_model_json)
        # load weights into new model
        self.model.load_weights(os.path.join(aPath, "model.h5"))
        self.classlabels = self.classdict.keys()
        self.trained = True
        print("Loaded model from disk")
