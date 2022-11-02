from algorithms.dif import DIF
import pandas as pd

print("Done")
model_configs = {'n_ensemble':50, 'n_estimators':6}
model = DIF(**model_configs)

X = pd.read_csv('E:/Python/Projects/IForest/deep-iforest-main/data/tabular/HR_diagram.csv')
X_test = X[-1000:]
print(X_test)
X_train = X[0:-1000]
print(X_train)


model.fit(X_train)
score = model.predict(X_test)
print("okay")


att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,label