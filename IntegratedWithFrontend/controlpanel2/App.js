import React,{useRef, useState} from 'react';
import Slider, { createSliderWithTooltip } from "rc-slider";
import "rc-slider/assets/index.css";
import axios from 'axios';
import {  Select,Button ,Layout,Divider} from 'antd';
import * as d3 from 'd3';

import "./App.css"
//https://stackoverflow.com/questions/63905902/how-to-get-value-of-dropdown-component-in-ant-design-antd-react-js
var qs = require('qs');

var rowno=0;
var val = [];
var out_indices = [];
var outlier = [];
var in_indices = [];
var inlier=[];


class SliderOk extends React.Component {
  constructor(props) {
    super(props);

    
    this.state = {
      value1: 3,
      value2: 0.3,
      value3:3000 ,
      selectValue:'HR_diagram.csv'
      
    };
    this.handleClick = this.handleClick.bind(this);
  }
  
  
  onSliderChange1 = value1 => {
    this.setState(
      {
        value1
      },
      () => {
        var SliderValue=this.state.value1     
        console.log("Slider value: ",SliderValue);
      }     
    );
    
  };

  onSliderChange2 = value2 => {
    this.setState(
      {
        value2
      },
      () => {
        var SliderValue=this.state.value2   
        console.log("Slider value: ",SliderValue);
      }     
    );
    
  };
  onSliderChange3 = value3 => {
    this.setState(
      {
        value3
      },
      () => {
        var SliderValue=this.state.value3   
        console.log("Slider value: ",SliderValue);
      }     
    );
    
  };
  dropdownChange=e=>{
    this.setState({selectValue:e.target.value});
  };

  

  handleClick()  {
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
    console.log("MISCAL");
    console.log(miscal);
    const newdata={XYData:qs.stringify(miscal),color_list:'[1,0]',Nbatch:this.state.value1.toString(),Threshold:this.state.value2.toString(),BatchSize:this.state.value3.toString(),FileName:this.state.selectValue.toString()};
    let data = qs.stringify(newdata)
    console.log("data!!:",qs.parse(data))
    axios.post(`http://localhost:5000/BackendData`,data,
    {
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })  
  };

  render() {
   
    return (
      <div style={{marginLeft: 30,marginRight: 30}} >
        <p style={{fontSize: "10px",color:"grey"}}>Uploading Dataset :</p>
        <Select value={this.state.selectValue} onChange={this.dropdownChange} >
          <option value="arxiv_articles_UMAP.csv">arxiv_articles_UMAP.csv</option>
          <option value="HR_diagram.csv">HR_diagram.csv</option> 
        </Select>
        <br></br>
        <br></br>
        <p style={{fontSize: "10px",color:"grey"}}>Number of Frames: {this.state.value1}</p>
        <Slider 
          min={0}
          max={10}
          value={this.state.value1}
          onChange={this.onSliderChange1}
          railStyle={{ height: 4, }}
          handleStyle={{
            height: 20,
            width: 20,
            marginLeft: -8,
            marginTop: -8,
            backgroundColor: "MediumPurple",
            border: 0
          }}
          trackStyle={{ background: "none" }}
        />
        
        <p style={{fontSize: "10px",color:"grey"}}>Threshold : {this.state.value2}</p>
        <Slider 
          min={0.0}
          max={1.0}
          step={0.01}
          value={this.state.value2}
          onChange={this.onSliderChange2}
          railStyle={{ height: 4, }}
          handleStyle={{
            height: 20,
            width: 20,
            
            marginLeft: -8,
            marginTop: -8,
            backgroundColor: "MediumPurple",
            border: 0
          }}
          trackStyle={{ background: "none" }}
        />
        <p style={{fontSize: "10px",color:"grey"}}>Batch size : {this.state.value3}</p>
        <Slider 
          min={1000}
          max={10000}
          step={10} // you can change this step size
          value={this.state.value3}
          onChange={this.onSliderChange3}
          railStyle={{ height: 4, }}
          handleStyle={{
            height: 20,
            width: 20,
            
            marginLeft: -8,
            marginTop: -8,
            backgroundColor: "MediumPurple",
            border: 0
          }}
          trackStyle={{ background: "none" }}
        />
        <br></br>     
        <Button size="small" onClick={this.handleClick} shape="round" style={{width:"180px",fontSize: "10px", color: "MediumPurple",background: "white", borderColor: "MediumPurple"}}>
        Updating data on Backend
        </Button>
      </div>
    );
  } 
}




//var NumProgress=[];

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

/* function TotalFunction(Total,NumberofData) {
  document.getElementById("Totaldemo").innerHTML = "Progress : "+(Total/NumberofData*100).toFixed(2);
  }
 */

const { Sider, Content} = Layout;

const App = () => {
  const [data, setData] = useState();
  const svgRef = useRef();
  const Total= useRef();
  
  const SethandleClick= async () => {
    try {
    const data = await axios.get('http://localhost:5000/BackendData')
    .then(res => {
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
								.style('overflow','visible');
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

        

        svg.selectAll('p')
          .data(outlier).enter()
          .append('circle')
            .attr('cx',d=>xScale(d[0]))
            .attr('cy',d=>yScale(d[1]))
            .attr('fill','red')
            .attr('opacity',"0.3")
            .attr('r',2);
        
        svg.selectAll('p')
          .data(inlier).enter()
          .append('circle')
            .attr('cx',d=>xScale(d[0]))
            .attr('cy',d=>yScale(d[1]))
            .attr('fill','green')
            .attr('opacity',"0.3")
            .attr('r',2);

        //labelling  https://d3-graph-gallery.com/graph/custom_legend.html#cat2 
        var keys = ["Inlier","Oulier","Incorrect Selection"]
        var C = d3.scaleOrdinal()
          .domain(keys)
          .range(["red","green","yellow"]);

        
        var svg1 = d3.select("body").append("svg");

        svg.selectAll(".rect")
          .data([15,30,45])
          .enter()
          .append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("x", 310)
          .attr("y", function(d) {return d})
          .attr("fill", function(d){ return C(d)})

        svg.selectAll("mylabels")
        .data(keys).enter()
        .append("text")
          .attr("x", 330)
          .attr("y", function(d,i){ return 20+ i*15 }) // 100 is where the first dot appears. 25 is the distance between dots
          .style("fill", function(d){ return C(d)})
          .text(function(d){ return d})
          .attr("text-anchor", "left")
          .attr("font-size", "8px")
          .style("alignment-baseline", "middle");

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
          if (d3.select(this).attr('fill')=='yellow')
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
            d3.select(this).attr('fill','yellow');
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


  return (
    <div style={{ margin: 10 ,width:"80%",height:"70%"}}>
      <Layout style={{ height:  "70%", backgroundColor:'white',borderColor: "black" }}>
        <Sider width={ "40%"} style={{backgroundColor:'LavenderBlush'}}>  
          <p style={{fontWeight:'bold',fontSize: "15px",color: "grey",marginLeft: 30,marginRight: 30}}>Outlier Detection and Monitoring for Streaming data</p>
              <Content style={{ height:  "100%"}}>
              <Divider />
              
                <SliderOk/>
                <Button size="small" shape="round" style={{ width:"180px",fontSize: "10px",color: "MediumPurple", marginLeft: 30,  marginTop: 5 ,background: "white", borderColor: "MediumPurple" }} onClick={SethandleClick}>Updating on Plot</Button>
                {/* <Progress style={{width:"180px",fontSize: "8px",color: "grey",marginLeft: 30,marginRight: 30}}
                  
                  percent={20}
                  status="active"
                  strokeColor={{
                    from: "pink",
                    to: "MediumPurple",
                  }}
                />
                <table id="Totaldemo" style={{fontSize: "12px",color: "grey",marginLeft: 30}}>Progress : </table>     
                 */}
                <Divider /> 
                <p style={{fontSize: "12px",color: "grey",marginLeft: 30}}>Outliers</p>
                  <table id="outlier"></table>
                <Divider/>
                <p style={{fontSize: "12px",color: "grey",marginLeft: 30}}>Incorrect Classification</p>
                    <table style ={{fontSize: "8px",marginLeft: 30}}id="demo"></table>        
              </Content>
        </Sider>
        <Layout style={{ marginLeft:100,backgroundColor:'White'}}>
            <Content style={{ width: "100%" ,display: "flex", verticalAlign:"middle"}}  >
                <svg ref={svgRef}></svg>
          </Content>
        </Layout>     
      </Layout>              
    </div>
  );
};

export default App;


