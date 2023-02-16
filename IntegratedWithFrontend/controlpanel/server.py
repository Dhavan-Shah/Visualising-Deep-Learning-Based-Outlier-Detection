import pandas as pd
import numpy as np
from difmain.algorithms.dif import DIF

data = pd.read_csv("E:/Python/Projects/IForest/deep-iforest-main/data/HR_diagram.csv").to_numpy()
#data=pd.read_csv("C:/Users/minjo/Downloads/HR_diagram.csv").to_numpy()


print("Done")
model_configs = {'n_ensemble':50, 'n_estimators':6}
dif = DIF(**model_configs)

ctmod = []
for i in range(12):
    ctmod.append(DIF(**model_configs))
    #ctmod[i] = DIF
    print("Model ", i, " created")
print(ctmod)

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
        if (FileName=="HR_diagram.csv"):
            #Binary : inlier(0)=green, outlier(1)=red, adding point(-1)=purple
            data=pd.read_csv("E:/Python/Projects/IForest/deep-iforest-main/data/HR_diagram.csv").to_numpy()
            data_short=data[0:10000]
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
            
            out, m, score = train_mod(dif,data_put, data_tr, Threshold)
            outa = []
            ma = 0
            scorea = []
            if AdD != -1:
                
                AdDpt = pd.DataFrame(AdD).to_numpy()
                
                print(AdDpt)
                
                
                dif.fit(AdDpt)
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

            BackendData={"FullData":data_put.tolist(),"XYData":XYData_put.tolist(),"color_list":color_list_put.tolist(),"Nbatch":[Nbatch],"Threshold":[Threshold],"BatchSize":[sum(l)],"last_index":[last_index], "button_clicks": [clicks],"FileName":[FileName]}
        
        
        
        
        
        else:
            
            
            data=pd.read_csv("E:/Python/Projects/IForest/deep-iforest-main/data/arxiv_articles_UMAP.csv").to_numpy()
            print("category!!") #['astro-ph' 'cond-mat' 'cs' 'gr-qc' 'hep-ex' 'hep-lat' 'hep-ph' 'hep-th' 'math' 'other' 'physics' 'quant-ph']
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
            print("포스트 data_short",data_short)
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
            #data_put[0][2] = 100
            print(data_put[0][2])
            print(data_tr[0][2])
            
            train_indx = []
            test_indx = []
            for i in range (12):
                train_indx.append([])
                test_indx.append([])
                
            for i in range(len(data_tr)):
                for j in range(2,14):
                    if data_tr[i][2] == j:
                        #print("BEFORE : ", data_tr[i][2])
                        data_tr[i][2] = 0
                        test_indx[j-2].append(data_tr[i])
                        
                        if i <= min(last_index[-1]+BatchSize, len(data_short)) - min(last_index[-1], len(data_short)) and i >= max(last_index[-1]-BatchSize, 0) - max(min(last_index[-1] - (Nbatch-1)*BatchSize, len(data_short)), 0):
                        #print("AFTER : ", data_tr[i][2])
                            train_indx[j-2].append(data_tr[i])
            
            """
            for i in range(len(data_put)):
                for j in range(2,14):
                    if data_put[i][2] == j:
                        #print("BEFORE : ", data_put[i][2])
                        data_put[i][2] = 0
                        #print("AFTER : ", data_put[i][2])
                        train_indx[j-2].append(data_put[i])
                        #print(data_put[i], "----", len(train_indx), "indx-len", j-2, "")
            #print(train_indx)
            

            
            for i in range(len(data_tr)):
                for j in range(2,14):
                    if data_tr[i][2] == j:
                        #print("BEFORE : ", data_tr[i][2])
                        data_tr[i][2] = 0
                        #print("AFTER : ", data_tr[i][2])
                        test_indx[j-2].append(data_tr[i])
                        #print(data_tr[i], "----", len(test_indx), "indx-len", j-2, "")
            #print(test_indx)
            """
            print(test_indx)
            print("TEST")
            print(train_indx)
            print("TRAIN")
            
            
        
            
            for i in range(12):
                print(train_indx[i])
                print(test_indx[i])
                data_train = pd.DataFrame(train_indx[i]).to_numpy()
                data_test = pd.DataFrame(test_indx[i]).to_numpy()                  
                print(ctmod[i])
                #print("Train", data_train)
                #print("Test", data_test)
                m = 1
                score = [0  for _ in range(len(data_test))]
                if len(data_train) != 0 and len(data_test) != 0:
                    out, m, score = train_mod(ctmod[i],data_train, data_test, 0)
                    print(m, i)
                    print(out)               
                
                
                for j in range(len(data_test)): 

                    if m - score[j]<0.06:
                        data_test[j][2] = 1 
                        test_indx[i][j][2] = 1
                    else:
                        data_test[j][2] = i+2
                        test_indx[i][j][2] = i+2
                print(data_test)
                print(test_indx)
            
                print("Start Index Test : " , max(min(last_index[-1] - (Nbatch-1)*BatchSize, len(data_short)), 0))
                print("End Index Test :", min(last_index[-1]+BatchSize, len(data_short)))
                st = max(min(last_index[-1] - (Nbatch-1)*BatchSize, len(data_short)), 0)
                ed = min(last_index[-1]+BatchSize, len(data_short))
                co = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                print(co)
                it = 0
                print( ed - st)
                while st < ed :
                    
                    if data_short[st][2] != 1:
                        print("Data Short :" ,data_short[st])
                        cv = data_short[st][2] - 2
                        print(test_indx[cv][0])
                        if len(test_indx[cv]) > co[cv] and data_short[st][0] == test_indx[cv][co[cv]][0] and data_short[st][1] == test_indx[cv][co[cv]][1]:
                            print("MAAAAATCHHHHHHH FOUNDDDDDDDDDDDDD")
                            data_short[st][2] = cv+2
                            it += 1
                            co[cv] += 1
                        #if data_short[st][0] == test_indx[i][0][0] and data_short[st][1] == test_indx[i][0][1]:
                    else: 
                        
                        for k in range(12):
                            if len(test_indx[k]) > co[k] and data_short[st][0] == test_indx[k][co[k]][0] and data_short[st][1] == test_indx[k][co[k]][1]:
                                data_short[st][2] = 1
                                co[k] += 1
                                print("MATCH Found") 
                                it += 1
                                break
                    st += 1
                print("it", it)
                print(data_short)

                    

                    
                          
                #print("TEST DATA CAT: ", data_tr[i][2])

                
                
                
                
                
                
                
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