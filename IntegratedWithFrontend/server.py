import pandas as pd
import numpy as np

#url = 'https://raw.githubusercontent.com/ChenXin360104/ProgressivePyramidBasedSampling/release/data/HR_diagram.csv'
#data = pd.read_csv(url,header=None).to_numpy()
data = pd.read_csv("E:/Python/Projects/IForest/deep-iforest-main/data/HR_diagram.csv").to_numpy()
#data=pd.read_csv("C:/Users/minjo/Downloads/HR_diagram.csv").to_numpy()

from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
data_short=data[0:10000]
print(data_short)

XYData = np.delete(data_short, -1, axis=1)
color_list=data_short[:,-1]
l = []
print(color_list)

@app.route("/BackendData", methods=['GET','POST'])
def BackendData():
    n = 100
    if request.method=='POST':
        print("POST FINALLY CONNECTED")
        XYData=request.form.get('XYData')
        print(XYData)
        color_list =request.form.get('color_list')
        XYDatalst = list(XYData.split('&'))
        print(len(XYDatalst))
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
                print(s)
                a,d = s.split('=')
                a,b,c = a.split('%')
                al.append(int(a))
                bl.append(int(b[2]))
                cl.append(int(c[0]))
                dl.append(float(d))
                t += 1
            for j in range(int(a[-1])+1):
                XY.append([0,0,0,0])
                for k in range(4):
                    print(j,k)
                    XY[j][k] = dl[j*4+k]
            XY.pop(0)
            XY.pop(0)
            print(XY)  
        else:
            print("No points selected")
            
            
        n=n+int(request.form.get('n'))
        l.append(n)
        num=sum(l) 
        data_put=data_short[0:num]
        XYData_put = np.delete(data_put, -1, axis=1)
        color_list_put=data_put[:,-1]
        print("n is ",num)
       
        print(l)
        BackendData={"XYData":XYData_put.tolist(),"color_list":color_list_put.tolist(),"n":[n]}
        #print(BackendData)
        return BackendData

    elif request.method=='GET':
        print("GET Executed")
        data_get=data_short[0:sum(l)]
        XYData_get = np.delete(data_get, -1, axis=1)
        color_list_get=data_get[:,-1]
        print("l is ",sum(l))
        

        BackendData={"XYData":XYData_get.tolist(),"color_list":color_list_get.tolist(),"n":[n]}
        return BackendData

if __name__ == "__main__":
    app.run(debug=True)