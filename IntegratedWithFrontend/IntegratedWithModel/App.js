import  React,{useState, useRef,useEffect} from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import './App.css';
var qs = require('qs');

var rowno=0;
var val = [];
var out_indices = [];
var outlier = [];
var in_indices = [];
var inlier=[];
var last_index = [];
var clicks = 0;



function myFunction(val) { 
  var table = document.getElementById("demo");
    table.innerHTML = "";
    if(val.length>0)
    {
      for(var i=0;i<val.length;i++)
      {
        var row = table.insertRow(i);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = val[i][0];
        cell2.innerHTML = val[i][1];
      }
    }
    rowno += 1;
    console.log(rowno);

}


function myFunction2(val, index) {
  var table = document.getElementById("outlier");
  table.innerHTML = "";
  var j=0;
  for(j;j<index.length;j++)
  {
    var row = table.insertRow(j);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell1.innerHTML = index[j];
    cell2.innerHTML = val[j][0];
    cell3.innerHTML = val[j][1];
  }
}


const App = () => {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState('');
  const svgRef = useRef();


  const SethandleClick= async () => {
    try {
    const data = await axios.get('http://localhost:5000/BackendData')
    .then(res => {
      console.log(res.data.n)
        //divide data into variables
        const DATA = res.data.XYData;
        //console.log(DATA);
        const color_list=res.data.color_list;
        const Nbatch=res.data.Nbatch;
        console.log("Nbatch : ",Nbatch)
        const Threshold=res.data.Threshold;
        console.log("Threshold : ",Threshold)
        const BatchSize=res.data.BatchSize;
        console.log("BatchSize :",BatchSize);
        const last_index = res.data.last_index;
        console.log("Last index :", last_index);


        out_indices = color_list.map((c,i)=>c===1?i:'').filter(String);
        outlier = DATA.filter((_, ind) => out_indices.includes(ind));
        in_indices = color_list.map((c,i)=>c===0?i:'').filter(String);
        inlier=DATA.filter((_, ind) => in_indices.includes(ind));

        console.log("Understanding DATA");
        console.log(out_indices);
        console.log(outlier);
        console.log(outlier[0])
        console.log(inlier);
        console.log(DATA);

				// Set up chart
        const w=600;
        const h=400;
				const svg = d3.select(svgRef.current)
								.attr('width', w)
								.attr('height', h)
								.style('overflow','visible')
                .style('margin-top','50px');
				// x axis scale 
				const xScale = d3.scaleLinear()
          .domain([0, 5])
          .range([0,w]);

        // y axis scale 
				const yScale = d3.scaleLinear()
        .domain([0,20])
        .range([h,0])

        //x ScaleBack
        const xSB = d3.scaleLinear()
          .domain([0,w])
          .range([0,5])


        //y ScaleBack
        const ySB = d3.scaleLinear()
          .domain([h, 0])
          .range([0,20])

        //storing values in array
        console.log(val);

        
        // setting up axis
        const xAxis = d3.axisBottom(xScale).ticks(5);
        const yAxis = d3.axisLeft(yScale).ticks(10);
        svg.append('g')
          .call(xAxis)
          .attr('transform', `translate(0, ${h})`);
        svg.append('g')
          .call(yAxis)

        svg.selectAll()
          //.data(data['X_train']).enter()
          .data(outlier).enter()
          .append('circle')
            .attr('cx',d=>xScale(d[0]))
            .attr('cy',d=>yScale(d[1]))
            .attr('fill','red')
            .attr('opacity',"0.3")
            .attr('r',2);
        

        svg.selectAll()
          //.data(data['X_train']).enter()
          .data(inlier).enter()
          .append('circle')
            .attr('cx',d=>xScale(d[0]))
            .attr('cy',d=>yScale(d[1]))
            .attr('fill','green')
            .attr('opacity',"0.3")
            .attr('r',2);



        const Dataval = svg
          .selectAll('circle')
          .data(DATA)
          .join('circle')
              .attr('opacity', 0.75);
        
        


        Dataval
        .on('mouseover', function(){
          const data = DATA
          d3.select(this).attr('stroke', '#333').attr('stroke-width', 2).attr(data);

        })
        .on('click', function(){
          d3.select(this).attr('stroke', '#000').attr('stroke-width', 4);
          console.log("Enter::");
          console.log(this);
          const xval = this.cx["baseVal"]["value"];
          const xvalue = xSB(xval);
          const yval = this.cy["baseVal"]["value"];
          const yvalue = ySB(yval);
          var temp = Array(2);
          temp = [xvalue,yvalue];
          console.log(temp);
          val.push(temp);
          console.log(val);
          console.log(val);
          console.log(xvalue);
          console.log(yvalue);
          console.log(" xval, yval");
          if (d3.select(this).attr('fill')=='blue')
          {
            console.log("HEREEEEEEEEE");
            for(var j=0;j<outlier.length;j++)
            {
              console.log(xvalue, outlier[j][0],Math.abs(xvalue-outlier[j][0]),"---", yvalue, outlier[j][1],Math.abs(yvalue-outlier[j][1]));
              if(Math.abs(xvalue-outlier[j][0]) < 0.0001 && Math.abs(yvalue-outlier[j][1]) < 0.0001)
              {
                console.log("----------------HEREEEEEEEEE--------------");
                d3.select(this).attr('fill','red');
                break;
              }
              else
              {
                d3.select(this).attr('fill','green');
              }
            }
            console.log(val[val.length -1]);
            for(var i=0;i<val.length - 1;i++)
            {

              if(val[val.length - 1][0] == val[i][0] && val[val.length - 1][1] == val[i][1])
              {
                console.log("Match Found");
                console.log(val[i]);
                console.log(val, i);
                console.log("del val[i]")
                val.splice(i,1);
                i = val.length -1;
                val.splice(i,1);
                console.log(val);
                console.log(val.length);

              }
            }
          }
          else
          {
            d3.select(this).attr('fill','blue');
          }
        console.log(val);
        myFunction(val);
        console.log("Exit Onclick");

        })
        .on('mouseout', function(){
          d3.select(this).attr('stroke', null);
        })

        
        
        
      })
    } catch (e) {
      console.error('DATA ERROR:', e);
    }
  };
  const PosthandleClick = async () => {
    var z = val.length;
    var miscal = [[-1, -1, -1, -1],[-1, -1, -1, -1]];
    console.log("X --------- X ---------- Y -------------- Y")
    for(var i=0;i<z;i++)
    {
      for(var j=0;j<outlier.length;j++)
      {
        //console.log(val[i][0], outlier[j][0],Math.abs(val[i][0]-outlier[j][0]),"---", val[i][1], outlier[j][1],Math.abs(val[i][1]-outlier[j][1]));
        if(Math.abs(val[i][0]-outlier[j][0]) < 0.0001 && Math.abs(val[i][1]-outlier[j][1]) < 0.0001)
        {
          console.log("Yessss");
          var x = outlier[j][0];
          var y = outlier[j][1];
          miscal.push([x,y,0,out_indices[j]]);
        }
      }
      for(var j=0;j<inlier.length;j++)
      {
        if(Math.abs(val[i][0]-inlier[j][0]) < 0.0001 && Math.abs(val[i][1]-inlier[j][1]) < 0.0001)
        {
          var x = inlier[j][0];
          var y = inlier[j][1];
          miscal.push([x,y,1,in_indices[j]]);
        }
      }
    }
    var Nbatch = 5;
    var Threshold = 0.5;
    var BatchSize = 1000;
    console.log(BatchSize, Threshold, Nbatch);
    var x = document.getElementById("inp");
    BatchSize = x.elements[0].value;
    Threshold = x.elements[1].value;
    Nbatch = x.elements[2].value;




    console.log("TESTING INPUTS");
    console.log(BatchSize, Threshold, Nbatch);
    clicks += 1;
    console.log(clicks)
    if(last_index.length == 0)
    {
      last_index.push(Number(BatchSize));
    }
    else
    {
      var temp = last_index.length;
      console.log(temp, last_index[temp - 1]);
      last_index.push( Number(last_index[temp-1]) + Number(BatchSize));
    }
    console.log(last_index);
    console.log("MISCAL");
    console.log(miscal);
    const newdata={XYData:qs.stringify(miscal),color_list:'[1,0]',Nbatch:Nbatch.toString(),Threshold:Threshold.toString(),BatchSize:BatchSize.toString(),last_index:last_index.toString(), clicks:clicks.toString()};
    let data = qs.stringify(newdata)
    console.log("data!!:",qs.parse(data))
    var table = document.getElementById("demo");
    table.innerHTML = "";

    axios.post(`http://localhost:5000/BackendData`,data,
    {
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    
  };
  const outl = async() => {
    myFunction2(outlier,out_indices);
  }
  return (
    
    <div className='App' style={{ 
        display:'block', 
        width:'100%',
        }}>



      <div style={{
        width:'20%', 
        float: 'left',
        display: 'inline-block',
        height:'690px',
        border:'1px solid black',
      }}>

      {err && <h2>{err}</h2>}
      <br></br>
      <form id = "inp">
        <a>Batch Size : (1000 - 10000) </a>
        <input id="BatchSize" type="number" defaultValue= {1000} ></input>
        <br></br>
        <br></br>
        <a>Threshold : (0.3 - 0.5) </a>
        <input id="Threshold" type="number" defaultValue={0.5}></input>
        <br></br>
        <br></br>
        <a>No. of Frames : (1 - 10) </a>
        <input id="NFrames" type="number" defaultValue={4}></input>
        <br></br>
        <br></br>

        <div style={{
          height:'30px',
          display: 'inline-block',
        }}>
        <button onClick={outl}>Outliers</button>
        </div>
        <br></br>
        <br></br>

          <a>Testing</a>
      </form>
      </div>


      <div style={{
        width:'60%',
        float: 'left',
        display: 'inline-block',
        height:'690px',
        border:'1px solid black',
      }}>
        <svg ref={svgRef}></svg>
      </div>




      <div style={{
        width:'19%',
        float: 'left',
        display: 'inline-block',
        height: '690px',
        border:'1px solid black',
      }}>

      <div style={{
          height:'30px',
        display: 'inline-block',
      }}>

      <button onClick={SethandleClick}>Get Frame</button>
      </div>
        <br></br>
      <div style={{
          height:'30px',
        display: 'inline-block',
      }}>
      <button onClick={PosthandleClick}>Send Data Back</button>
      </div>
        <p>Outliers</p>
            <table id="outlier">

            </table>
        <p>-----------------------------------------</p>
        <p>Incorrect Classification</p>
        <table id="demo"></table>
      </div>
      



    </div>
  );
};

export default App;