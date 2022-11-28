from difmain.algorithms.dif import DIF
import pandas as pd
import numpy as np
import math


def train_mod(model, X, X_test, threshold = 0):
    model.fit(X)
    score = model.decision_function(X_test)
    print(score)
    m = max(score)
    out = []
    for i in range(len(score)):
        if threshold == 0:
            if m - score[i]<0.06:
                out.append(score[i])
        else:
            if score[i]>threshold:
                out.append(score[i])
    print(out)
    print(len(out))
    print(m)
    print("okay")
    return out, m
    


print("Done")
model_configs = {'n_ensemble':50, 'n_estimators':6}
dif = DIF(**model_configs)

X = pd.read_csv('E:/Python/Projects/IForest/deep-iforest-main/data/tabular/shuttle_16.csv').to_numpy()
data_size = len(X)
i = 100
val = []
mval = []
while True:
    if i<data_size:
        print(i, data_size)
        if i+100>data_size:
           print(i, data_size, "here")
           out, m = train_mod(dif, X[i-500: data_size], X)
           print("Last Iteration")
           print(out)
           print(m)
        else:
            print(i, data_size)
            out, m = train_mod(dif, X[max(0, i-500):i], X[i: min(i+100, data_size)])
            print("New iteration")
            print(out)
            print(m)
        val.append(len(out))
        mval.append(m)
             
    else:
        print("Breaking the loop")
        break
    i += 100

print(val)
print(mval)


"""X_test = X[-1000:]
X_test = X_test.to_numpy()
print(X_test)
X_train = X[0:-1000]
X_train = X_train.to_numpy()
print(X_train)
#X_train = np.r_[X_train]
print(X_train)


dif.fit(X_train)
score = dif.decision_function(X_test)
print(score)
m = max(score)
out = []
for i in range(1000):
    if score[i]>0.4:
        out.append(score[i])
print(out)
print(len(out))
print(m)
print("okay")"""


