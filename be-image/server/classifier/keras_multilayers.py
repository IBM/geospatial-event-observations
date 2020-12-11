#
# Licensed Materials - Property of IBM
# 6949-04J
# © Copyright IBM Corp. 2020 All Rights Reserved
#

from keras.layers import  concatenate,Input, Conv1D, MaxPooling1D, Dense, Dropout, Flatten
from keras.utils import np_utils # utilities for one-hot encoding of ground truth values
import numpy as np
from keras.models import Model

print( 'start')
#batch_size = 32 # in each iteration, we consider 32 training examples at once
#num_epochs = 200 # we iterate 200 times over the entire training set
#kernel_size = 3 # we will use 3x3 kernels throughout
#pool_size = 2 # we will use 2x2 pooling throughout
#conv_depth_1 = 32 # we will initially have 32 kernels per conv. layer...
#conv_depth_2 = 64 # ...switching to 64 after the first pooling layer
drop_prob_1 = 0.25 # dropout after pooling with probability 0.25
#drop_prob_2 = 0.5 # dropout in the FC layer with probability 0.5
#hidden_size = 512 # the FC layer will have 512 neurons


y_train = np.random.randint(0,2,1000)
y_test =  np.random.randint(0,2,1000)
X_train=np.array([np.array([np.random.normal(8*i,1,50)  for j in range(0,30)]) for i in y_train ])
X_test=np.array([np.array([np.random.normal(8*i,1,50)  for j in range(0,30)]) for i in y_test ])



y_train = y_train[0:100]# np.random.randint(0,2,1000)
y_test =y_test [0:100]# #np.random.randint(0,2,1000)
X_train = X_train [0:100]# #[np.random.normal(8*i,1,[9,9]) for i in y_train]
X_test = X_test[0:100]# #[np.random.normal(8*i,1,[9,9]) for i in y_test]

#y_train = np.random.randint(0,2,1000)
#y_test =  np.random.randint(0,2,1000)
#X_train = [np.random.normal(8*i,1,[9,9]) for i in y_train]
#X_test = [np.random.normal(8*i,1,[9,9]) for i in y_test]



num_train,  w,d = X_train.shape # there are 50000 training examples in CIFAR-10
num_test = X_test.shape[0] # there are 10000 test examples in CIFAR-10
num_classes = np.unique(y_train).shape[0] # there are 10 image classes

X_train = X_train.astype('float32')
X_test = X_test.astype('float32')
#X_train /= np.max(X_train) # Normalise data to [0, 1] range
#X_test /= np.max(X_test) # Normalise data to [0, 1] range

Y_train = np_utils.to_categorical(y_train, num_classes) # One-hot encode the labels
Y_test = np_utils.to_categorical(y_test, num_classes) # One-hot encode the labels
print(X_train.shape)
#inp = Input(shape=(w,d,e)) # depth goes last in TensorFlow back-end (first in Theano)
##Conv [32] -> Conv [32] -> Pool (with dropout on the pooling layer)
#submodels = []


def conv_layers_pool(f,ng,I_shape):
    model_in = Input(shape= I_shape[1:] )
    conv=Conv1D(nb_filter=f,filter_length=ng,border_mode='valid',activation='relu')(model_in)
    pool=MaxPooling1D(I_shape[1]-ng+1)(conv)
    return model_in,pool


def create_network(f,list_g,i_shape):

    mins1,mouts1=conv_layers_pool(f,list_g[0], i_shape)
    mins2,mouts2=conv_layers_pool(f,list_g[1], i_shape)
    mins3,mouts3=conv_layers_pool(f,list_g[2], i_shape)
    mins4,mouts4=conv_layers_pool(f,list_g[3], i_shape)
    mins5,mouts5=conv_layers_pool(f,list_g[4], i_shape)
    concatenated = concatenate([mouts1,mouts2,mouts3,mouts4,mouts5 ])
    flat=Flatten()(concatenated)
    drop=Dropout(0.25)(flat)
    out = Dense(num_classes, activation='softmax', name='output_layer')(drop)
    big_model = Model( input=  [mins1,mins2,mins3,mins4,mins5] , output=out)
    return big_model


big_model=create_network(1,[2,3,4,5,6],X_train.shape)
big_model.compile(loss='categorical_crossentropy', # using the cross-entropy loss function
                  optimizer='adam', # using the Adam optimiser
                  metrics=['accuracy']) # reporting the accuracy
#batch_size=1
big_model.fit([X_train]*len([2,3,4,5,6])  , Y_train, batch_size=1, epochs=1,verbose=1, validation_split=0.1) # ...holding out 10% of the data for validation