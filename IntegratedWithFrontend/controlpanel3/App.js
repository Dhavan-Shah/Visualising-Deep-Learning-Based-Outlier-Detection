import React,{useRef, useState} from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import SliderOk from './SliderOk'
import styled from 'styled-components';
import {Progress, Button,Layout,Divider, Space } from 'antd';
import "./App.css"

var qs = require('qs');

var rowno=0;
var val = [];
var out_indices = [];
var outlier = [];
var in_indices = [];
var inlier=[];
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

        /* 
        // setting up axis
        const xAxis = d3.axisBottom(xScale).ticks(5);
        const yAxis = d3.axisLeft(yScale).ticks(10);
        svg.append('g')
          .call(xAxis)
          .attr('transform', `translate(0, ${h})`);
        svg.append('g')
          .call(yAxis) */

        svg.selectAll()
          .data(outlier).enter()
          .append('circle')
            .attr('cx',d=>xScale(d[0]))
            .attr('cy',d=>yScale(d[1]))
            .attr('fill','red')
            .attr('opacity',"0.3")
            .attr('r',2);
        
        svg.selectAll()
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

        svg.selectAll()
          .data(keys).enter()
          .append("circle")
            .attr("cx", 350)
            .attr("cy", 20) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 5)
            .attr('fill',function(d){ return C(d)});
            

        svg.selectAll("mylabels")
        .data(keys).enter()
        .append("text")
          .attr("x", 350)
          .attr("y", function(d,i){ return 20+ i*15 }) // 100 is where the first dot appears. 25 is the distance between dots
          .style("fill", function(d){ return C(d)})
          .text(function(d){ return d})
          .attr("text-anchor", "left")
          .attr("font-size", "10px")
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




