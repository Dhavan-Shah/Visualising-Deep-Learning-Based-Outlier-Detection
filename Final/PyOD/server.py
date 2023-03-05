import pandas as pd
import numpy as np
from difmain.algorithms.dif import DIF

data = pd.read_csv("E:/Python/Projects/IForest/deep-iforest-main/data/HR_diagram.csv").to_numpy()
#data1 = pd.read_csv("E:/Python/Projects/IForest/deep-iforest-main/data/HR_diagram.csv").to_numpy()
#data2 = pd.read_csv("E:/Python/Projects/IForest/deep-iforest-main/data/arxiv_articles_UMAP.csv").to_numpy()
#data=pd.read_csv("C:/Users/minjo/Downloads/HR_diagram.csv").to_numpy()



#FOR ACCURACY

import os
import sys

# temporary solution for relative imports in case pyod is not installed
# if pyod is installed, no need to use the following line
sys.path.append(
    os.path.abspath(os.path.join(os.path.dirname("__file__"), '..')))

from pyod.models.lof import LOF
from pyod.utils.data import generate_data
from pyod.utils.data import evaluate_print
from pyod.utils.example import visualize

from joblib import dump, load

from sklearn.model_selection import train_test_split


contamination = 0.1  # percentage of outliers (the number of outliers in train(correct answer)=20)
n_train = 1001  # number of training points
n_test = 501  # number of testing points

# Generate sample data
X_train, X_test, y_train, y_test = \
        generate_data(n_train=n_train,
                      n_test=n_test,
                      n_features=2, 
                      contamination=contamination,
                      random_state=42)
    
    
print("X_train :",X_train) 
print("X_test :",X_test)
print("y_train :",y_train)
print("y_test :",y_test)

X_train, X_test1, y_train, y_test2 = train_test_split(X_train, y_train, test_size=1) 

X_test, X_test1, y_test, y_test2 = train_test_split(X_train, y_train, test_size=1) 

print("Done")
model_configs = {'n_ensemble':50, 'n_estimators':6}
#dif = DIF(**model_configs)

dif2 = DIF(**model_configs)

dif3 = DIF(**model_configs)



acc_train = []
acc_dif_train = []
acc_test = []
acc_dif_test = []


def train_mod(model, X, X_test, threshold = 0):
    print(X)
    model.fit(X)
    score = model.decision_function(X_test)
    #print(score)
    m = max(score)
    out = []
    for i in range(len(score)): 
        if threshold == 0:
            if m - score[i]<0.06:
                out.append(score[i])
        else:
            if score[i]>threshold:
                out.append(score[i]) 
    #print(out)
    print(len(out))
    #print(m)
    print("okay")
    return out, m, score


    

"""
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
"""



from flask import Flask, request
from flask_cors import CORS


data = np.c_[X_train, y_train]
test = np.c_[X_test, y_test]
 
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
data_short=data[0:min(10000, len(data))]
#print(data_short)
#data_short = np.c_[X_train, y_train]
  
XYData = np.delete(data_short, -1, axis=1)
color_list=data_short[:,-1] 
l = []
print(color_list)
NumberofData=len(data)
Threshold=0
Nbatch=0 
BatchSize = 100
last_index = []

FileName="HR_diagram.csv"

#print(color_list) 

@app.route("/BackendData", methods=['GET','POST'])
def BackendData():
    global data
    global data_short
    global FileName
    global Threshold
    global Nbatch
    global BatchSize
    global last_index
    n = 100 
    if request.method=='POST':
        print("POST CONNECTED")
        FileName=request.form.get('FileName')
        print("post, Filename : ",FileName)

        #data  = data1
        #print("Data1: ", data)
        print("_________________________________________")
        print("Data2 : ", data)
        #data = data1
        data_short=data
        XYData = np.delete(data_short, -1, axis=1)
        color_list=data_short[:,-1]
        NumberofData=len(data)
        DeletingData=request.form.get('DeletingData')
        DeletingData = list(DeletingData.split('&'))
        print("DeletingData:",DeletingData)
        AddingData =request.form.get('AddingData')
        AddingData = list(AddingData.split('&'))
        print("AddingData:",AddingData)
        XYData=request.form.get('XYData')
            
        color_list =request.form.get('color_list')
        XYDatalst = list(XYData.split('&')) 
            
        BatchSize = int(request.form.get('BatchSize'))
        #BatchSize=BatchSize+int(request.form.get('BatchSize'))
        
        Threshold=float(request.form.get('Threshold'))
        Nbatch=int(request.form.get('Nbatch'))
        #last_index = request.form.get('last_index') 
        clicks = int(request.form.get('clicks'))
        #print(last_index) 
        print(XYDatalst)
        #if clicks != 1:
            
        #Changing Outlier/Inlier 
        if len(XYDatalst)>8:
            print("XYDatalst :",XYDatalst)             
            XY = []
            t = 0  
            al = []
            bl = []
            cl = []
            dl = []
            for i in range(len(XYDatalst)):
                s = XYDatalst[i] 
                #print(s)
                a,d = s.split('=')
                a,b,c = a.split('%')
                al.append(int(a))
                bl.append(int(b[2]))
                cl.append(int(c[0]))
                dl.append(float(d))
                t += 1
            print("al :",al)
            print("PTSel-------a:" , a)
            for j in range(int(a)+1):
                XY.append([0,0,0,0]) 
                for k in range(4):
                    #print(j,k)
                    XY[j][k] = dl[j*4+k] 
            XY.pop(0)
            XY.pop(0)
            print("XY :",XY)   

            for i in range(len(XY)):
                #print("bef:" , data_short[int(XY[i][3])])                                        
                print("XY[i] : ",XY[i], "data_short[int(XY[i][3])][2]:",data_short[int(XY[i][3])][2], "XY[i][2]:",XY[i][2])
                data_short[int(XY[i][3])][2] = int(XY[i][2])
                inp = int(input())
                print(inp)
                print(data_short[int(XY[i][3])], "  ", int(XY[i][2]))
                dif2.fit(pd.DataFrame([data_short[int(XY[i][3])][0], data_short[int(XY[i][3])][1], int(XY[i][2])]).to_numpy())
                print("Done")
                #print("aft: " , data_short[int(XY[i][3])])
                    
        else:
            print("No points selected")
                 
                
        #Deletig Data  
        if len(DeletingData) > 8:
            print("DeletingData :",DeletingData)             
            Del = []
            t = 0  
            ad = []
            bd = []
            cd = []
            dd = []
            for i in range(len(DeletingData)):
                s = DeletingData[i]
                print(s) 
                a,d = s.split('=')
                a,b,c = a.split('%')
                ad.append(int(a))
                bd.append(int(b[2]))
                cd.append(int(c[0]))
                dd.append(float(d))
                t += 1
            print("ad :",ad)
            print("Del-------a:" , a)
            for j in range(int(a)+1):
                Del.append([0,0,0,0])
                for k in range(4):
                    #print(j,k)
                    Del[j][k] = dd[j*4+k]
            Del.pop(0)
            Del.pop(0)
            print("Del :",Del)  

            for i in range(len(Del)):
                print("bef:" , data_short[int(Del[i][3])])                                        
                print("Del[i] : ",Del[i], "data_short[int(Del[i][3])][2]:",data_short[int(Del[i][3])][2], "Del[i][2]:",Del[i][2])
                data_short[int(Del[i][3])] = -1 #int(XY[i][2])
                data_short[int(Del[i][3])][2] = 1
                print("aft: " , data_short[int(Del[i][3])])
                    
        else:
            print("No points selected")
                
             
        #Adding Data Points
        if len(AddingData) > 6:
            print("AddingData :",AddingData)
            AdD = [["att1","att2","label"]] 
            #AdD = []            
            t = 0  
            aa = []
            ba = []
            ca = []
            da = []
            for i in range(len(AddingData)):
                s = AddingData[i]
                #print(s)
                a,d = s.split('=')
                a,b,c = a.split('%')
                aa.append(int(a))
                ba.append(int(b[2]))
                ca.append(int(c[0]))
                da.append(float(d))
                t += 1
            print("aa :",aa)
            print("AdD-------a:" , a)
            for j in range(int(a)):
                AdD.append([0,0,0])
                for k in range(3):
                    #print(j,k)
                    AdD[j][k] = da[j*3+k]
            print(AdD)
            AdD.pop(0)
            AdD.pop(0)
            #AdD.pop(-1)
            print("AdD :",AdD)  

            #for i in range(len(AdD)):                                      
            #    print("AdD[i] : ",AdD[i], "data_short[int(AdD[i][3])][2]:",data_short[int(AdD[i][3])][2], "AdD[i][2]:",AdD[i][2])
                  
        else:
            print("No points selected")
            AdD = -1
            
                
        lastindex = request.form.get('last_index') 
        print(lastindex)
        last = list(map(int,lastindex.split(',')))
        print(last)
        n = int(last[-1])
        last_index.append(last[-1]) 
        print(last_index)
        if last_index == 0:
            last_index = BatchSize
        l.append(n)
        num=sum(l)   
        # data_put -> Train Data
        print("Start Index Train : " , max(last_index[-1]-BatchSize, 0))
        print("End Index Train :", min(last_index[-1], len(data_short)))
        print("Start Index Test : " , max(min(last_index[-1] - (Nbatch-1)*BatchSize, len(data_short)), 0))
        print("End Index Test :", min(last_index[-1]+BatchSize, len(data_short)))
        data_put=data_short[max(last_index[-1]-BatchSize, 0):min(last_index[-1], len(data_short))]
        data_tr = data_short[max(min(last_index[-1] - (Nbatch-1)*BatchSize, len(data_short)), 0):min(last_index[-1]+BatchSize, len(data_short))]
        XYData_put = np.delete(data_put, -1, axis=1)
        color_list_put=data_put[:,-1]
        print("n is ",num)
        out_dif, m_dif, score_dif = train_mod(dif3, data_put, test, Threshold)
        out, m, score = train_mod(dif2,data_put, data_tr, Threshold)
        outa = []
        ma = 0
        scorea = []
        if AdD != -1:
                
            AdDpt = pd.DataFrame(AdD).to_numpy()
             
            print(AdDpt)
                
                
            dif2.fit(AdDpt)
        #print(outa, ma, scorea)
        #print(out)
        print(len(out)) 
        print(m)
        print(len(score), len(data_tr))  
        data_put = data_tr 
        if Threshold == 0:
            print("This works")  
        for i in range(len(data_tr)):   
            if Threshold == 0: 
                if m - score[i]<0.2:
                    data_tr[i][2] = 0 
            else:   
                if score[i]>Threshold:
                    data_tr[i][2] = 1
                        
            
                   
        y_train_pred3=dif2.decision_function(data[max(last_index[-1]-BatchSize, 0):min(last_index[-1], len(data_short))])
        if Threshold != 0:
            y_train_pred3[y_train_pred3>Threshold] = 1
            y_train_pred3[y_train_pred3<=Threshold] = 0
        else:
            y_train_pred3[y_train_pred3>m-0.2] = 1
            y_train_pred3[y_train_pred3<=m-0.2] = 0
        #y_train_pred3=np.array(y_train_pred3.as_data_frame(use_pandas=True, header=True)).reshape((200,))

        #testing_frame3 = dif.decision_function(X_test)
        y_test_pred3=dif2.decision_function(test)
        if Threshold != 0:
            y_test_pred3[y_test_pred3>Threshold] = 1
            y_test_pred3[y_test_pred3<=Threshold] = 0
        else:
            y_test_pred3[y_test_pred3>m-0.2] = 1
            y_test_pred3[y_test_pred3<=m-0.2] = 0
        #y_test_pred3=np.array(y_test_pred3.as_data_frame(use_pandas=True, header=True)).reshape((100,))

        # evaluate and print the results
        clf_name='DIF'
        y_test_scores = dif2.decision_function(test)
        print("\nOn Training Data:")
        #evaluate_print(clf_name, y_train, y_train_pred2)
        print(y_train[max(last_index[-1]-BatchSize, 0):min(last_index[-1], len(data_short))])
        print("--------------------------------")
        print(y_train_pred3)
        print("# train error",np.sum(y_train[max(last_index[-1]-BatchSize, 0):min(last_index[-1], len(data_short))]!= y_train_pred3))
        DIF_train_accuracy=np.sum(y_train[max(last_index[-1]-BatchSize, 0):min(last_index[-1], len(data_short))]== y_train_pred3)/len(y_train[max(last_index[-1]-BatchSize, 0):min(last_index[-1], len(data_short))])
        print(DIF_train_accuracy)

        print("\nOn Test Data:")
        #evaluate_print(clf_name, y_test, y_test_pred2)

        DIF_test_accuracy=np.sum(y_test== y_test_pred3)/len(y_test) 
        print(DIF_test_accuracy)
            
            
            
        y_train_pred3=dif3.decision_function(data[max(last_index[-1]-BatchSize, 0):min(last_index[-1], len(data_short))])
        if Threshold != 0:
            y_train_pred3[y_train_pred3>Threshold] = 1
            y_train_pred3[y_train_pred3<=Threshold] = 0
        else: 
            y_train_pred3[y_train_pred3>m-0.2] = 1
            y_train_pred3[y_train_pred3<=m-0.2] = 0

        #y_train_pred3=np.array(y_train_pred3.as_data_frame(use_pandas=True, header=True)).reshape((200,))

        #testing_frame3 = dif.decision_function(X_test)
        y_test_pred3=dif3.decision_function(test)
        if Threshold != 0:
            y_test_pred3[y_test_pred3>Threshold] = 1 
            y_test_pred3[y_test_pred3<=Threshold] = 0
        else:
            y_test_pred3[y_test_pred3>m-0.2] = 1
            y_test_pred3[y_test_pred3<=m-0.2] = 0

        #y_test_pred3=np.array(y_test_pred3.as_data_frame(use_pandas=True, header=True)).reshape((100,))

        # evaluate and print the results
        clf_name='DIF'
        y_test_scores = dif3.decision_function(test)
        print("\nOn Training Data:")
        #evaluate_print(clf_name, y_train, y_train_pred2)
        print("# train error",np.sum(y_train[max(last_index[-1]-BatchSize, 0):min(last_index[-1], len(data_short))]!= y_train_pred3))
        DIF_train_accuracy_dif=np.sum(y_train[max(last_index[-1]-BatchSize, 0):min(last_index[-1], len(data_short))]== y_train_pred3)/len(y_train[max(last_index[-1]-BatchSize, 0):min(last_index[-1], len(data_short))])
        print(DIF_train_accuracy_dif)

        print("\nOn Test Data:")
        #evaluate_print(clf_name, y_test, y_test_pred2)

        DIF_test_accuracy_dif=np.sum(y_test== y_test_pred3)/len(y_test)
        print(DIF_test_accuracy_dif)
            
        acc_train.append(DIF_train_accuracy)
        acc_test.append(DIF_test_accuracy)
        acc_dif_train.append(DIF_train_accuracy_dif)
        acc_dif_test.append(DIF_test_accuracy_dif)
            
                
            
        l.append(BatchSize)
        #data_put=data[0:sum(l)]
        XYData_put = np.delete(data_put, -1, axis=1)
        color_list_put=data_put[:,-1]
        print("BatchSize is ",BatchSize) 
        print("Threshold is ",Threshold) 
        print("Nbatch is ",Nbatch)   
        print("Index is", last_index)
        print("Button Clicks is ", clicks)
        print(len(XYData_put))
        print(len(data_put))
            
        print("Accuracy ||  Semisuperwised DIF  ||          DIF          ")
        for i in range(len(acc_train)):
            print("---------||----------------------||-----------------------")
            print("  Train  ||          ",   acc_train[i], "       ||         ", acc_dif_train[i], "         ||", i)
            print("  Test   ||          ",   acc_test[i],  "       ||         ", acc_dif_test[i] , "         ||", i)
                
        print("TRAIN: ") 
        print("Semi_DIF: ", acc_train)
        print("DIF: ", acc_dif_train)
        print("TEST: ")
        print("Semi-DIF: ", acc_test)
        print("DIF: ", acc_dif_test)
        
        BackendData={"FullData":data_put.tolist(),"XYData":XYData_put.tolist(),"color_list":color_list_put.tolist(),"Nbatch":[Nbatch],"Threshold":[Threshold],"BatchSize":[sum(l)],"last_index":[last_index], "button_clicks": [clicks],"FileName":[FileName]}
        
            
        
        return BackendData 
 
 
 
 
 
    elif request.method=='GET':
        
        print("GET Executed") 
        print("get, Filename : ",FileName)
        if (FileName=="HR_diagram.csv"):
            print("HR_diagram.csv")
            if len(last_index) == 0:
                last_index.append(BatchSize)
                data_get=data_short[0:last_index[-1]] 
                
            else: 
                data_get=data_short[0:min(last_index[-1]+BatchSize, 10000)]
                
            XYData_get = np.delete(data_get, -1, axis=1)
            color_list_get=data_get[:,-1] 
            #print("l is ",sum(l))
            
            #print("BatchSize is ",BatchSize) 
            #print("Threshold is ",Threshold)
            #print("Nbatch is ",Nbatch) 
            print("Index is ", last_index)

            BackendData={"FullData":data_get.tolist(),"XYData":XYData_get.tolist(),"color_list":color_list_get.tolist(),"Nbatch":[Nbatch],"Threshold":[Threshold],"BatchSize":[sum(l)], "last_index":[last_index],"FileName":[FileName]}
        else:
            print("카테고리 겟",data_short)
         #please return category features
            if len(last_index) == 0:
                last_index.append(BatchSize)
                data_get=data_short[0:last_index[-1]] 
                
            else: 
                data_get=data_short[0:min(last_index[-1]+BatchSize, 10000)]
                  
            XYData_get = np.delete(data_get, -1, axis=1)
            color_list_get=data_get[:,-1] 
            #print("l is ",sum(l))
            
            #print("BatchSize is ",BatchSize) 
            #print("Threshold is ",Threshold)
            #print("Nbatch is ",Nbatch) 
            print("Index is ", last_index)

            BackendData={"FullData":data_get.tolist(),"XYData":XYData_get.tolist(),"color_list":color_list_get.tolist(),"Nbatch":[Nbatch],"Threshold":[Threshold],"BatchSize":[sum(l)], "last_index":[last_index],"FileName":[FileName]}
      
        
        return BackendData 

if __name__ == "__main__":   
    app.run(debug=True)  