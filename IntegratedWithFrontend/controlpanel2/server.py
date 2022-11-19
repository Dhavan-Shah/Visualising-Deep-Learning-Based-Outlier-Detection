import pandas as pd
import numpy as np

#url = 'https://raw.githubusercontent.com/ChenXin360104/ProgressivePyramidBasedSampling/release/data/HR_diagram.csv'
#data = pd.read_csv(url,header=None).to_numpy()
data=pd.read_csv("C:/Users/minjo/Downloads/HR_diagram.csv").to_numpy()


from flask import Flask, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
#data_short=data[0:1000]
XYData = np.delete(data, -1, axis=1)
color_list=data[:,-1]
l=[]
NumberofData=len(data)

@app.route("/BackendData", methods=['GET','POST'])
def BackendData():
    n=0
    if request.method=='POST':
        print("POST FINALLY CONNECTED")
        #XYData=request.form.get('XYData')
        #color_list =request.form.get('color_list')
        print("from frontend : ",int(request.form.get('n')))
        n=n+int(request.form.get('n'))
        l.append(n)
        num=sum(l)
        data_put=data[0:num]
        XYData_put = np.delete(data_put, -1, axis=1)
        color_list_put=data_put[:,-1]
        print("n is ",n)
        print("Total is ",num)

        BackendData={"XYData":XYData_put.tolist(),"color_list":color_list_put.tolist(),"n":[n],"Total":[num],"NumberofData":[NumberofData]}
        return BackendData
        
        
    elif request.method=='GET':
        print("GET Executed")
        data_get=data[0:sum(l)]
        XYData_get = np.delete(data_get, -1, axis=1)
        color_list_get=data_get[:,-1]
        num=sum(l)
        print("n is ",n)
        print("Total is ",num)

        BackendData={"XYData":XYData_get.tolist(),"color_list":color_list_get.tolist(),"n":[n],"Total":[num],"NumberofData":[NumberofData]}
        return BackendData
        


if __name__ == "__main__":
    app.run(debug=True,port=5000)
 
