import pandas as pd
import numpy as np
 
 
        
  
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


#data = pd.read_csv("E:/Python/Projects/IForest/deep-iforest-main/data/HR_diagram.csv").to_numpy()

#     

from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

####I think we have to initialize this part when changing Binary->Category
l = []
data=pd.read_csv("C:/Users/minjo/Downloads/HR_diagram.csv").to_numpy()
data_short=data[0:10000]
Threshold=0
Nbatch=0          
BatchSize = 100
last_index = []

FileName="HR_diagram.csv"
#######

from pyod.utils.data import generate_data
contamination = 0.1  # percentage of outliers (the number of outliers in train(correct answer)=20)
n_train = 2000  # number of training points
n_test = 1000  # number of testing points
# Generate sample data
X_train, X_test, y_train, y_test = \
    generate_data(n_train=n_train,
                    n_test=n_test,
                    n_features=2,
                    contamination=contamination,
                    random_state=42)
y_train=y_train.reshape(-1,1)
y_test=y_test.reshape(-1,1)
data1=np.concatenate((X_train, y_train),axis=1)   
data2=np.concatenate((X_test, y_test),axis=1)
X=np.concatenate((data1, data2),axis=0) 
StreamingData=np.take(X,np.random.permutation(X.shape[0]),axis=0,out=X)
print("random data",StreamingData)


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
        
        print("post, Filename : ",FileName)
        if (FileName!=request.form.get('FileName')):
            print("!!FILE is CHANGED!!")
            
            FileName=request.form.get('FileName')
            Threshold=0
            Nbatch=0 
            BatchSize = 100
            last_index = []

        if (FileName=="PyOD.csv"):
            #Binary : inlier(0)=green, outlier(1)=red, adding point(-1)=purple
           
            data_short=StreamingData
            XYData = np.delete(data_short, -1, axis=1)
            color_list=data_short[:,-1]
     
            DeletingData=request.form.get('DeletingData')
            #print("DeletingData:",DeletingData)
            AddingData =request.form.get('AddingData')
            #print("AddingData:",AddingData)
            XYData=request.form.get('XYData')
             
            color_list =request.form.get('color_list')
            XYDatalst = list(XYData.split('&'))
            
            BatchSize = int(request.form.get('BatchSize'))
            #BatchSize=BatchSize+int(request.form.get('BatchSize'))
            print("BatchSize:",BatchSize)
            Threshold=float(request.form.get('Threshold'))
            Nbatch=int(request.form.get('Nbatch'))
            #last_index = request.form.get('last_index') 
            clicks = int(request.form.get('clicks'))
            #print(last_index) 
            #if clicks != 1: 
            if len(XYDatalst)>8:
                #print("XYDatalst :",XYDatalst)             
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
               # print("al :",al)    
                for j in range(int(a[-1])+1):
                    XY.append([0,0,0,0])
                    for k in range(4):
                        #print(j,k)
                        XY[j][k] = dl[j*4+k]
                XY.pop(0)
                XY.pop(0)
               # print("XY :",XY)  

                for i in range(len(XY)):
                   # print("XY[i] : ",XY[i], "data_short[int(XY[i][3])][2]:",data_short[int(XY[i][3])][2], "XY[i][2]:",XY[i][2])
                    data_short[int(XY[i][3])][2] = int(XY[i][2])
            else:
                print("No points selected")
                     
                           
            lastindex = request.form.get('last_index')
           # print(lastindex)
            last = list(map(int,lastindex.split(',')))
          #  print(last)
            n = int(last[-1])    
            last_index.append(last[-1]) 
            print(last_index)  
            if last_index == 0:      
                last_index = BatchSize 
            l.append(n)  
            num=sum(l)        
            # data_put -> Train Data
          #  print("Start Index Train : " , max(last_index[-1]-BatchSize, 0))
          #  print("End Index Train :", min(last_index[-1], len(data_short)))
           # print("Start Index Test : " , max(min(last_index[-1] - (Nbatch-1)*BatchSize, len(data_short)), 0))
            #print("End Index Test :", min(last_index[-1]+BatchSize, len(data_short)))
            data_put=data_short[max(last_index[-1]-BatchSize, 0):min(last_index[-1], len(data_short))]
            data_tr = data_short[max(min(last_index[-1] - (Nbatch-1)*BatchSize, len(data_short)), 0):min(last_index[-1]+BatchSize, len(data_short))]
            XYData_put = np.delete(data_put, -1, axis=1)
            color_list_put=data_put[:,-1]  
            #print("n is ",num) 
                        
            l.append(BatchSize)
            #data_put=data[0:sum(l)]
            XYData_put = np.delete(data_put, -1, axis=1)
            color_list_put=data_put[:,-1]
 
    
            BackendData={"FullData":data_put.tolist(),"XYData":XYData_put.tolist(),"color_list":color_list_put.tolist(),"Nbatch":[Nbatch],"Threshold":[Threshold],"BatchSize":[sum(l)],"last_index":[last_index], "button_clicks": [clicks],"FileName":[FileName]}
       

        if (FileName=="HR_diagram.csv"):
            #Binary : inlier(0)=green, outlier(1)=red, adding point(-1)=purple
            data=pd.read_csv("C:/Users/minjo/Downloads/HR_diagram.csv").to_numpy()
            data_short=data[0:10000]
            XYData = np.delete(data_short, -1, axis=1)
            color_list=data_short[:,-1]
            NumberofData=len(data)
            DeletingData=request.form.get('DeletingData')
            #print("DeletingData:",DeletingData)
            AddingData =request.form.get('AddingData')
            #print("AddingData:",AddingData)
            XYData=request.form.get('XYData')
             
            color_list =request.form.get('color_list')
            XYDatalst = list(XYData.split('&'))
            
            BatchSize = int(request.form.get('BatchSize'))
            #BatchSize=BatchSize+int(request.form.get('BatchSize'))
            print("BatchSize:",BatchSize)
            Threshold=float(request.form.get('Threshold'))
            Nbatch=int(request.form.get('Nbatch'))
            #last_index = request.form.get('last_index') 
            clicks = int(request.form.get('clicks'))
            #print(last_index) 
            #if clicks != 1: 
            if len(XYDatalst)>8:
                #print("XYDatalst :",XYDatalst)             
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
               # print("al :",al)    
                for j in range(int(a[-1])+1):
                    XY.append([0,0,0,0])
                    for k in range(4):
                        #print(j,k)
                        XY[j][k] = dl[j*4+k]
                XY.pop(0)
                XY.pop(0)
               # print("XY :",XY)  

                for i in range(len(XY)):
                   # print("XY[i] : ",XY[i], "data_short[int(XY[i][3])][2]:",data_short[int(XY[i][3])][2], "XY[i][2]:",XY[i][2])
                    data_short[int(XY[i][3])][2] = int(XY[i][2])
            else:
                print("No points selected")
                     
                           
            lastindex = request.form.get('last_index')
           # print(lastindex)
            last = list(map(int,lastindex.split(',')))
          #  print(last)
            n = int(last[-1])    
            last_index.append(last[-1]) 
            print(last_index)  
            if last_index == 0:      
                last_index = BatchSize 
            l.append(n)  
            num=sum(l)        
            # data_put -> Train Data
          #  print("Start Index Train : " , max(last_index[-1]-BatchSize, 0))
          #  print("End Index Train :", min(last_index[-1], len(data_short)))
           # print("Start Index Test : " , max(min(last_index[-1] - (Nbatch-1)*BatchSize, len(data_short)), 0))
            #print("End Index Test :", min(last_index[-1]+BatchSize, len(data_short)))
            data_put=data_short[max(last_index[-1]-BatchSize, 0):min(last_index[-1], len(data_short))]
            data_tr = data_short[max(min(last_index[-1] - (Nbatch-1)*BatchSize, len(data_short)), 0):min(last_index[-1]+BatchSize, len(data_short))]
            XYData_put = np.delete(data_put, -1, axis=1)
            color_list_put=data_put[:,-1]  
            #print("n is ",num) 
                        
            l.append(BatchSize)
            #data_put=data[0:sum(l)]
            XYData_put = np.delete(data_put, -1, axis=1)
            color_list_put=data_put[:,-1]
           # print("BatchSize is ",BatchSize)
           # print("Threshold is ",Threshold)
           # print("Nbatch is ",Nbatch)   
           # print("Index is", last_index) 
           # print("Button Clicks is ", clicks)  
           # print(len(XYData_put))  
           # print(len(data_put))
    
            BackendData={"FullData":data_put.tolist(),"XYData":XYData_put.tolist(),"color_list":color_list_put.tolist(),"Nbatch":[Nbatch],"Threshold":[Threshold],"BatchSize":[sum(l)],"last_index":[last_index], "button_clicks": [clicks],"FileName":[FileName]}
        if (FileName=="arxiv_articles_UMAP.csv"):
            #please return category features 
             
            data=pd.read_csv("C:/Users/minjo/Downloads/arxiv_articles_UMAP.csv").to_numpy()
            print("POST category!!") #['astro-ph' 'cond-mat' 'cs' 'gr-qc' 'hep-ex' 'hep-lat' 'hep-ph' 'hep-th' 'math' 'other' 'physics' 'quant-ph']
            #### 
                      
            #category option2: category option2: inlier(2~13)=each color, outlier(1)=red, adding inlier point(-1), adding outlier(-2)####
            data_short=data[0:10000]
            cat1=data_short[data_short[:,2]=='astro-ph'] #2 => DIF => append outlier  [1,2,2] [100,200,1]
            cat2=data_short[data_short[:,2]=='cond-mat'] #3 [1,2,3] [100,200,1] 
            cat3=data_short[data_short[:,2]=='cs']
            cat4=data_short[data_short[:,2]=='gr-qc']
            cat5=data_short[data_short[:,2]=='hep-ex']
            cat6=data_short[data_short[:,2]=='hep-lat']
            cat7=data_short[data_short[:,2]=='hep-ph']   
            cat8=data_short[data_short[:,2]=='hep-th']
            cat9=data_short[data_short[:,2]=='math'] 
            cat10=data_short[data_short[:,2]=='other']    
            cat11=data_short[data_short[:,2]=='physics']   
            cat12=data_short[data_short[:,2]=='quant-ph'] 
                   
            data_short[data_short=='astro-ph']=2
            data_short[data_short=='cond-mat']=3
            data_short[data_short=='cs']=4
            data_short[data_short=='gr-qc']=5
            data_short[data_short=='hep-ex']=6
            data_short[data_short=='hep-lat']=7
            data_short[data_short=='hep-ph']=8
            data_short[data_short=='hep-th']=9
            data_short[data_short=='math']=10
            data_short[data_short=='other']=11
            data_short[data_short=='physics']=12
            data_short[data_short=='quant-ph']=13
            print("POST data_short",data_short)
            ######  
            
            XYData = np.delete(data_short, -1, axis=1)
            color_list=data_short[:,-1]
            NumberofData=len(data)

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
             
                                 
                          
            lastindex = request.form.get('last_index')
            #print(lastindex)
            last = list(map(int,lastindex.split(',')))
            #print(last)
            n = int(last[-1])
            last_index.append(last[-1]) 
            print(last_index)
            if last_index == 0:   
                last_index = BatchSize           
            l.append(n)  
            num=sum(l)   
            # data_put -> Train Data
            #print("Start Index Train : " , max(last_index[-1]-BatchSize, 0))
            #print("End Index Train :", min(last_index[-1], len(data_short)))
            #print("Start Index Test : " , max(min(last_index[-1] - (Nbatch-1)*BatchSize, len(data_short)), 0))
            #print("End Index Test :", min(last_index[-1]+BatchSize, len(data_short)))
            data_put=data_short[max(last_index[-1]-BatchSize, 0):min(last_index[-1], len(data_short))]
            data_tr = data_short[max(min(last_index[-1] - (Nbatch-1)*BatchSize, len(data_short)), 0):min(last_index[-1]+BatchSize, len(data_short))]
            XYData_put = np.delete(data_put, -1, axis=1)
            color_list_put=data_put[:,-1] 
            #print("n is ",num)         
                         
            l.append(BatchSize)  
            #data_put=data[0:sum(l)]
            XYData_put = np.delete(data_put, -1, axis=1)
            color_list_put=data_put[:,-1]
            
            
                  
            BackendData={"FullData":data_put.tolist(),"XYData":XYData_put.tolist(),"color_list":color_list_put.tolist(),"Nbatch":[Nbatch],"Threshold":[Threshold],"BatchSize":[sum(l)],"last_index":[last_index], "button_clicks": [clicks],"FileName":[FileName]}
       
                          
        
        return BackendData   
      
    if request.method=='GET':  
        print("======================================")
        print("GET Executed") 
        print("get, Filename : ",FileName)
        if (FileName=="PyOD.csv"):
            print("File : PyOD.csv")   
            print("last_index",last_index)
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
        

        if (FileName=="HR_diagram.csv"):
            print("Same File : HR_diagram.csv")  
            print("last_index",last_index)
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
        if (FileName=="arxiv_articles_UMAP.csv"):
           
            print("last_index",last_index)
                 
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
            
