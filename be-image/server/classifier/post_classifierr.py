#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#
import os
import pandas as pd
import numpy as np
from keras.layers import  Convolution2D, MaxPooling1D, Flatten, Dense,  Conv1D, Dropout, Input,  concatenate
from keras.models import  Model, Sequential
from sklearn.metrics import  precision_recall_curve,  average_precision_score, classification_report
import matplotlib.pylab as plt
import nltk 
from nltk.tokenize import RegexpTokenizer
import re
import json
import pickle
from nltk import pos_tag, word_tokenize
from NER import *
import io
from keras.preprocessing import image
from PIL import Image
from vgg16bn import Vgg16BN
from importlib import reload
import utils; reload(utils)
from utils import split_at
import operator


def training_text_classifier( Training_text,val_text):
    with open('settings.json') as f:
        Conf = json.load(f)
    wd_path = Conf['data_path']
    filename = Conf["word_vectors"]
    wvmodel = get_word_vectors(filename)
    vecsize = len(wvmodel[list(wvmodel.keys())[0]])
    filters = Conf["filters"]
    df_train = pd.read_csv(os.path.join(wd_path, Training_text))
    df_train = df_train[["TEXT","TOPIC"]]
    print(df_train.head(4))
    print(df_train.info())
    df = pd.read_csv(os.path.join(wd_path, val_text))
    df = df[["TEXT","TOPIC"]]
    df_train['clean_text']=df_train.TEXT.apply(lambda s: preprocess(s))
    print(df_train.head(4))
    df['clean_text']=df.TEXT.apply(lambda s: preprocess(s))
    df=df.dropna()
    df_train=df_train.dropna()
    df = df[df.clean_text.str.split().str.len()>2]
    df_train = df_train[df_train.clean_text.str.split().str.len()>2]
    df_train=df_train.sample(frac=1)
    classdict=df_train.groupby('TOPIC').apply(lambda s: s['clean_text'].tolist()).to_dict()
    print(classdict)
    length= int(np.mean(df.clean_text.str.split().str.len()))
    print("max len seq:"+str(length))
    maxlen=length
    amodel=CNNEmbeddedVecClassifier(wvmodel,classdict,maxlen,vecsize,filters)
    amodel.train()
    amodel.Save_cnn_model()
    Y_true = [amodel.convert_class_label(i) for i in df.TOPIC.tolist()]
    Y_prob = [amodel.score_prob(str(i)) for i in df.clean_text.tolist()]
    Y_true2 = df.TOPIC.tolist()
    Y_prob2 = [  amodel.score(str(i)) for i in df.clean_text.tolist()]
    Y_prob2 = [max(d.items(), key=operator.itemgetter(1))[0] for d in  Y_prob2]
    precision, recall, average_precision=get_pre_rec(  np.asarray(Y_true), np.asarray(Y_prob  ))
    plot_pre_rec(precision,recall,average_precision)
    plt.savefig("wvc_CNN_model.png")
    print(classification_report(  np.asarray(Y_true2), np.asarray(Y_prob2  )  ))
    Conf['maxlen']=maxlen
    with open("settings.json", "w") as json_set_file:
        json.dump(Conf,  json_set_file )
    return 'model trained'


def val_text_classifier( val_text):
    with open('settings.json') as f:
        Conf = json.load(f)
    wd_path = Conf['data_path']
    filename = Conf["word_vectors"]
    wvmodel = get_word_vectors(filename)
    vecsize = len(wvmodel[list(wvmodel.keys())[0]])
    filters = Conf["filters"]
    maxlen = Conf["maxlen"]
    with open('classes.json') as cl:
        classdict = json.load(cl)
    df = pd.read_csv(os.path.join(wd_path, val_text))
    df=df[['TEXT','TOPIC']]
    df['clean_text']=df.TEXT.apply(lambda s: preprocess(s))
    amodel=CNNEmbeddedVecClassifier(wvmodel,classdict,maxlen,vecsize,filters)
    amodel.Load_cnn_model()
    Y_true = [amodel.convert_class_label(i) for i in df.TOPIC.tolist()]
    Y_prob = [amodel.score_prob(str(i)) for i in df.clean_text.tolist()]
    Y_true2 = df.TOPIC.tolist()
    Y_prob2 = [  amodel.score(str(i)) for i in df.clean_text.tolist()]
    Y_prob2 = [max(d.items(), key=operator.itemgetter(1))[0] for d in  Y_prob2]
    precision, recall, average_precision=get_pre_rec(  np.asarray(Y_true), np.asarray(Y_prob  ))
    plot_pre_rec(precision,recall,average_precision)
    plt.savefig("wvc_CNN_model.png")
    print(classification_report(  np.asarray(Y_true2), np.asarray(Y_prob2  )  ))
    Conf['maxlen']=maxlen
    with open("settings.json", "w") as json_set_file:
        json.dump(Conf,  json_set_file )
    return 'validation complete'

def get_word_vectors(pathname):
    embeddings_index = {}
    for filename in os.listdir(pathname):
        f = open(os.path.join(pathname, filename ), encoding="latin-1")
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


def remove_urls(StrX):
    return re.sub(r'https?:\/\/.*[\r\n]*', ' ', StrX)


def remove_special_chars(StrX):  
   StrX=re.sub('[^A-Za-z0-9]+', ' ', StrX) 
   return StrX.strip()

def remove_usernames(StrX):
    return re.sub(r"@[^\s]+[\s]?",' ', StrX)

def remove_numbers(StrX):
    return  re.sub(r"\s?[0-9]+\.?[0-9]*" ,' ', StrX)


def tokemize_remove_stopwords(StrX):
    tokenizer = RegexpTokenizer(r'\w+')
    SWords = set(nltk.corpus.stopwords.words('english'))
    words= tokenizer.tokenize( StrX.lower())
    Tmp = [i for i in words if i in list(set(words)-SWords)]
    res=" ".join(Tmp)
    return res 



def preprocess(StrX):
    StrX= str(StrX)
    StrX=remove_urls(StrX.lower())
    StrX=remove_usernames(StrX)
    StrX=remove_special_chars(StrX)
    StrX=remove_numbers(StrX)
    StrX=tokemize_remove_stopwords(StrX)
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

def get_sentences(t):
    from collections import Counter
    tx=preprocess(t)
    tokens=nltk.word_tokenize(tx)
    words=list(dict(Counter(tokens).most_common(50)).keys())
    return " ".join([i for i in tokens if i in words])


class CNNEmbeddedVecClassifier:
    def __init__(self,
                 wvmodel,
                 classdict,
                 maxlen,
                 vecsize ,
                 nb_filters,):
        self.wvmodel = wvmodel
        self.classdict = classdict
        self.vecsize = vecsize
        self.nb_filters = nb_filters
        self.maxlen = maxlen
        self.trained = False
 
 
    def convert_class_label(self, label):
        classlabels = self.classdict.keys()
        category_bucket = [0]*len(classlabels)
        if label in  classlabels:
            lblidx_dict = dict(zip(classlabels, range(len(classlabels))))
            category_bucket[lblidx_dict[label]] = 1
        return category_bucket
    
    
    def convert_trainingdata_matrix(self):
        classlabels = self.classdict.keys()
        lblidx_dict = dict(zip(classlabels, range(len(classlabels))))
        with open('classes.json', 'w') as fp:
            json.dump( lblidx_dict   , fp)

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

    def conv_layers_pool(self,f,ng,I_shape):
        model_in = Input(shape= I_shape[1:] )
        conv=Conv1D(filters=f,kernel_size=ng,padding='valid',activation='tanh')(model_in)
        pool=MaxPooling1D(I_shape[1]-ng+1)(conv)
        return model_in,pool

    def create_network(self,f,list_g,i_shape):
        mins1,mouts1=self.conv_layers_pool(f,list_g[0], i_shape)
        mins2,mouts2=self.conv_layers_pool(f,list_g[1], i_shape)
        mins3,mouts3=self.conv_layers_pool(f,list_g[2], i_shape)
        mins4,mouts4=self.conv_layers_pool(f,list_g[3], i_shape)
        mins5,mouts5=self.conv_layers_pool(f,list_g[4], i_shape)
        concatenated = concatenate([mouts1,mouts2,mouts3,mouts4,mouts5 ])
        flat=Flatten()(concatenated)
        drop=Dropout(0.5)(flat)
        out = Dense( len(self.classlabels)  , activation='softmax', name='output_layer')(drop)
        big_model = Model( input=  [mins1,mins2,mins3,mins4,mins5] , output=out)
        return big_model


    def train(self):
        # convert classdict to training input vectors
        self.classlabels, train_embedvec, indices = self.convert_trainingdata_matrix()


        grams=[2,3,4,5,6]
        model=self.create_network(self.nb_filters,grams,train_embedvec.shape)
        model.compile(loss='categorical_crossentropy', optimizer='adam',   metrics=['acc'])
 
        # train the model
        model.fit([train_embedvec]*5, indices , validation_split= 0.05, epochs=5, batch_size=1000, verbose=1)
 
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
 
        # wrangle output result
        scoredict = {}
        for idx, classlabel in zip(range(len(self.classlabels)), self.classlabels):
            scoredict[classlabel] = predictions[0][idx]
        return scoredict

    def score_prob(self, shorttext):
        if not self.trained:
            raise print("error")#ModelNotTrainedException()
 
        # retrieve vector
        matrix = np.array([self.shorttext_to_matrix(shorttext)])
 
        # classification using the neural network
        predictions = self.model.predict([matrix]*5, verbose=0)
        return predictions[0]

    def Save_cnn_model(self ):
        # serialize model to JSON
        model_json = self.model.to_json()
        with open("model.json", "w") as json_file:
            json_file.write(model_json)
        # serialize weights to HDF5
        self.model.save_weights("model.h5")
        print("Saved model to disk")

    def Load_cnn_model(self ):
        from keras.models import model_from_json
        # load json and create model
        json_file = open('model.json', 'r')
        loaded_model_json = json_file.read()
        json_file.close()
        self.model = model_from_json(loaded_model_json)
        # load weights into new model
        self.model.load_weights("model.h5")
        self.classlabels=self.classdict.keys()
        self.trained = True
        print("Loaded model from disk")


def Load_cnn_image_model(filename):
    from keras.models import model_from_json
    json_file = open(filename + '.json', 'r')
    loaded_model_json = json_file.read()
    json_file.close()
    conv_model = model_from_json(loaded_model_json)
    conv_model.load_weights(filename+".h5")
    print("Loaded model from disk")
    return   conv_model

def predict_image(imgs, model1,model2,classes):
    steps1 = model1.predict(imgs)
    all_preds = model2.predict(steps1)
    idxs = np.argmax(all_preds, axis=1)
    preds = [all_preds[i, idxs[i]] for i in range(len(idxs))]
    classes = [classes[idx] for idx in idxs]
    return np.array(preds), idxs, classes


def binary2array(b,target_size=(224,224)):
    img=Image.open(io.BytesIO(  bytearray(b))  )
    pix=image.img_to_array(img.resize(target_size))
    return pix


def entities(T):
    try:
        df=pd.DataFrame([(s.label()," ".join([i[0]for i in s.leaves()]) )for s in T.subtrees()if s.label()!="S"])
        df.columns=["Name_entity","entity"]
    except:
        df=pd.DataFrame(columns=["Name_entity","entity"])
    return df

def get_entities(chunker,df):
 #   df=df.loc[0:10]
    df2=df.groupby("uuid").apply(lambda s : entities(chunker.parse(pos_tag(word_tokenize(s.text.iloc[0])))))
    return df2




def main():
    #training_text_classifier( 'Training_short_text.csv', 'fake_real_time.csv'
    val_text_classifier(  'fake_real_time.csv')

    # elif mode=="Validation":
    #     with open('classes.json') as cl:
    #         classdict = json.load(cl)
    #     db2=client['sample_fake_data_test']
    #     df=get_text(db2)
    #     df['clean_text']=df.text.apply(lambda s: preprocess(s))
    #     amodel=CNNEmbeddedVecClassifier(wvmodel,classdict,maxlen,vecsize,filters)
    #     amodel.Load_cnn_model()
    #     Y_true=[amodel.convert_class_label(i) for i in df.Topic.tolist()]
    #     Y_prob = [amodel.score_prob(str(i)) for i in df.clean_text.tolist()]
    #     precision, recall, average_precision=get_pre_rec(  np.asarray(Y_true), np.asarray(Y_prob  ))
    #     plot_pre_rec(precision,recall,average_precision)
    #     plt.savefig("wvc_CNN_model.png")
    # else:
    #     with open('classes.json') as cl:
    #         classdict = json.load(cl)
    #     db2=client['sample_fake_data_test']
    #     image_size=(56,56)
    #     Imodel = Vgg16BN(image_size).model
    #     Imodel.pop()
    #     Imodel.compile(optimizer='adam',loss='categorical_crossentropy', metrics=['accuracy'])
    #     conv_layer,fc_layer = split_at(Imodel , Convolution2D  )
    #     model1= Sequential(  conv_layer,)
    #     model2=Load_cnn_image_model('finetunedImodel')
    #     #df=get_text(db2)
    #    # df['clean_text']=df.text.apply(lambda s: preprocess(s))
    #     amodel=CNNEmbeddedVecClassifier(wvmodel,classdict,maxlen,vecsize,filters)
    #     classes=os.listdir('Images/train')
    #     amodel.Load_cnn_model()
    #     f = open('my_classifier.pickle', 'rb')
    #     chunker = pickle.load(f)
    #     f.close()
    #     import time
    #     for doc in db2:
    #         d=amodel.score(preprocess(doc['text']))
    #         try:
    #             filename = str(doc['files']).split('/')[-1]
    #             bb=doc.get_attachment(filename)
    #             img=binary2array(bb,image_size)
    #             pred, idxs, cls= predict_image(np.asarray([img]), model1,model2,classes)
    #             doc['Image_Class']=cls
    #             doc['Image_Class_prob']=float(pred)
    #             print( [pred, idxs, cls])
    #         except BaseException as e:
    #             print('failed image scoring of doc: '+str(doc['_id']))
    #             print( e)
    #             pass
    #
    #         for k in list(d.keys()):
    #             doc[k]=float(d[k])
    #         dft=entities(chunker.parse(pos_tag(word_tokenize(doc['text']))))
    #         d=dft.groupby("Name_entity").apply(lambda s: s['entity'].tolist()).to_dict()
    #         for k in list(d.keys()):
    #             doc[k]=d[k]
    #         doc.save()
    #         time.sleep(1)
    #     print('loaded info')
    #
    # client.disconnect()
    #

if __name__ == '__main__':
    main()