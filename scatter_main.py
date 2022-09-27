
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    x_value = [1,2,3,4,5,6,7,8,9,10]
    y_value = [5,3,2,1,3,2,3,9,10,2] 
    return render_template('index.html',x_value=x_value,y_value=y_value)

if __name__ == "__main__":
    app.run(debug=True)
