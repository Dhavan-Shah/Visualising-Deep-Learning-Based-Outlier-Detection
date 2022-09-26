
Plotly.d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/normal-clusters.csv', function(err, rows){
function unpack(rows, key) {
  return rows.map(function(row) { return parseFloat(row[key]); });
}
  
var button_layer_height = 1.2
//we can change x1,x2,y1,y2 values
var x1 = unpack(rows,'x1')
var x2 = unpack(rows,'x2')

var y1 = unpack(rows,'y1')
var y2 = unpack(rows,'y2')

var data = [
  {
    x: x1, 
    y: y1,
    mode: 'markers',
    marker: {color: 'green'}
  },
  {
    x: x2, 
    y: y2,
    mode: 'markers',
    marker: {color: 'red'}
  }
  
]


var cluster = {type: 'circle',
                 xref: 'x', yref: 'y',
                 x0: Math.min(...x1), y0: Math.min(...y1), 
                 x1: Math.max(...x1), y1: Math.max(...y1), 
                 opacity: 0.25,
                 line: {color: 'green'},
                 fillcolor: 'green'}

var outlier = {type: 'circle',
                 xref: 'x', yref: 'y',
                 x0: Math.min(...x2), y0: Math.min(...y2), 
                 x1: Math.max(...x2), y1: Math.max(...y2), 
                 opacity: 0.25,
                 line: {color: 'red'},
                 fillcolor: 'red'}

var updatemenus=[
    {
        buttons: [   
            {
                args: ['shapes', []],
                label: 'None',
                method: 'relayout'
            },
            {
                args: ['shapes', [cluster]],
                label: 'Inliers',
                method: 'relayout'
            },
            {
                args: ['shapes', [outlier]],
                label: 'Outliers',
                method: 'relayout'
            },
            {
                args: ['shapes', [cluster, outlier]],
                label: 'All',
                method: 'relayout'
            },
        ],
        direction: 'left',
        pad: {'r': 10, 't': 10},
        showactive: true,
        type: 'buttons',
        x: 0.1,
        xanchor: 'left',
        y: button_layer_height,
        yanchor: 'top' 
    },
    
]

var layout = {
    updatemenus: updatemenus,
    showlegend: false
}


Plotly.plot("myDiv", data, layout, {showSendToCloud: true});

});
