import pandas as pd
import numpy as np
from difmain.algorithms.dif import DIF


print("Done")
model_configs = {'n_ensemble':50, 'n_estimators':6}
dif = DIF(**model_configs)


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


data = pd.read_csv("E:/Python/Projects/IForest/deep-iforest-main/data/HR_diagram.csv").to_numpy()
#data=pd.read_csv("C:/Users/minjo/Downloads/HR_diagram.csv").to_numpy()

from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
data_short=data[0:10000]
#print(data_short)

XYData = np.delete(data_short, -1, axis=1)
color_list=data_short[:,-1]
l = []
print(color_list)
NumberofData=len(data)
Threshold=0
Nbatch=0
BatchSize = 100
last_index = []

#print(color_list) 

@app.route("/BackendData", methods=['GET','POST'])
def BackendData():
    global Threshold
    global Nbatch
    global BatchSize
    global last_index
    n = 100
    if request.method=='POST':
        print("POST CONNECTED")
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
        #if clicks != 1:
        if len(XYDatalst)>8:
            print(XYDatalst)             
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
            for j in range(int(a[-1])+1):
                XY.append([0,0,0,0])
                for k in range(4):
                    #print(j,k)
                    XY[j][k] = dl[j*4+k]
            XY.pop(0)
            XY.pop(0)
            print(XY)  
            
            for i in range(len(XY)):
                print(XY[i], data_short[int(XY[i][3])][2], XY[i][2])
                data_short[int(XY[i][3])] = int(XY[i][2])


        else:
            print("No points selected")
                
                
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
            
            
        out, m, score = train_mod(dif,data_put, data_tr, 0.4)
        #print(out)
        print(len(out))
        print(m)
        print(len(score), len(data_tr))
        data_put = data_tr
        if Threshold == 0:
            print("This works")
        for i in range(len(data_tr)):
            if Threshold == 0:
                if m - score[i]<0.06:
                    data_put[i][2] = 1
            else: 
                if score[i]>Threshold:
                    data_put[i][2] = 1
        
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

        BackendData={"FullData":data_put.tolist(),"XYData":XYData_put.tolist(),"color_list":color_list_put.tolist(),"Nbatch":[Nbatch],"Threshold":[Threshold],"BatchSize":[sum(l)],"last_index":[last_index], "button_clicks": [clicks]}
        return BackendData 

    elif request.method=='GET': 
        print("GET Executed")
        #print(last_index)
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

        BackendData={"FullData":data_get.tolist(),"XYData":XYData_get.tolist(),"color_list":color_list_get.tolist(),"Nbatch":[Nbatch],"Threshold":[Threshold],"BatchSize":[sum(l)], "last_index":[last_index]}
        return BackendData

if __name__ == "__main__":
    app.run(debug=True) 