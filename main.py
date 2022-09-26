import matplotlib.pyplot as plt
import json
# import math as m
# import numpy as np
# import matplotlib.pyplot as plt
# import networkx as nx


x = [10,9,8,7,6,5,4,3,2,1,1,0]
y = [2,4,6,6,9,12,12,14,18,20,22,24]


plt.scatter(x, y)
plt.plot(x,y)
plt.show()

print("Send to javascript")


from flask import Flask, render_template

app = Flask(__name__)
t = [x,y]

@app.route('/')
def index():
    x_j = json.dumps(x)
    y_j = json.dumps(y)
    
    return render_template('index.html', name=t)

if __name__ == "__main__":
    app.run(debug=True)