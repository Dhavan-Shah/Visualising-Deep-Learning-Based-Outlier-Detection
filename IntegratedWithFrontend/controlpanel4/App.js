import React,{useRef, createRef,useState,useEffect} from 'react';
import Slider, { createSliderWithTooltip } from "rc-slider";
import "rc-slider/assets/index.css";
import axios from 'axios';
import { Select,Button ,Layout,Divider,Checkbox,Drawer,Spin} from 'antd';
import * as d3 from 'd3';
import d3ConcentricCircles from 'd3-concentric-circles';

import "./App.css"
//https://stackoverflow.com/questions/63905902/how-to-get-value-of-dropdown-component-in-ant-design-antd-react-js
var qs = require('qs');

var rowno=0;
var rowno2 = 0;
var val = [];
var val2=[];

let BrushData=[];
let IsAreaBrush=false;

let out_indicesList = [];
let outlier = [];
let in_indicesList = [];
let inlier=[];

let out_indicesList2 = [];
let outlier2 = [];
let in_indicesList2 = [];
let inlier2=[];

let history=[];

let n_Post=-1
let sliderindexList=[]
var last_index = [];
let clicks = 0

class SliderOk extends React.Component {
  constructor(props) {
    super(props);

    
    this.state = {
      value1: 3,
      value2: 0.5,
      value3:100 ,
      selectValue:'HR_diagram.csv',
      CategoryType:'Binary Feature'
      
    };
    this.handleClick = this.handleClick.bind(this);
    this.dropdownChange=this.dropdownChange.bind(this);
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
  }
  

  handleClick()  {
    n_Post+=1

    let miscal;
    let miscal2
    //Area selction post
    if (IsAreaBrush){
      var z2 =val2[0].length;
      
      miscal2 = [[-1, -1, -1, -1],[-1, -1, -1, -1]]; 
      
      for(var i=0;i<z2;i++) 
      {
        //outlier->inlier
        for(var j=0;j<outlier.length;j++)
        {
        
          if(Math.abs(val2[0][i][0]-outlier[j][0]) < 0.0001 && Math.abs(val2[0][i][1]-outlier[j][1]) < 0.0001)
          {
            console.log("outlier->inlier");
            var x = outlier[j][0];
            var y = outlier[j][1];
            miscal2.push([x,y,0,out_indicesList[j]]);
          }
        }
        //inlier->outlier
        for(var j=0;j<inlier.length;j++)
        {
    
          if(Math.abs(val2[0][i][0]-inlier[j][0]) < 0.0001 && Math.abs(val2[0][i][1]-inlier[j][1]) < 0.0001)
          {
            console.log("inlier->outlier");
            var x = inlier[j][0];
            var y = inlier[j][1];
            miscal2.push([x,y,1,in_indicesList[j]]);
          }
        }
        console.log("miscal2 :",miscal2) 
      }
    }
    //Area selction post END

    else
    {
      var z = val.length;
    
      let miscal = [[-1, -1, -1, -1],[-1, -1, -1, -1]];
      console.log("X --------- X ---------- Y -------------- Y")
      for(var i=0;i<z;i++)
      {
        for(var j=0;j<outlier.length;j++)
        {
          
          if(Math.abs(val[i][0]-outlier[j][0]) < 0.0001 && Math.abs(val[i][1]-outlier[j][1]) < 0.0001)
          {
            console.log("Yessss");
            var x = outlier[j][0];
            var y = outlier[j][1];
            miscal.push([x,y,0,out_indicesList[j]]);
          }
        }
        for(var j=0;j<inlier.length;j++)
        {
    
          if(Math.abs(val[i][0]-inlier[j][0]) < 0.0001 && Math.abs(val[i][1]-inlier[j][1]) < 0.0001)
          {
            var x = inlier[j][0];
            var y = inlier[j][1];
            miscal.push([x,y,1,in_indicesList[j]]);
          }
        }
      }
    }

    console.log("TESTING INPUTS");
    clicks += 1;
    if(last_index.length == 0)
    { 

      last_index.push(Number(this.state.value3));
    }
    else
    {
      var temp = last_index.length;
      console.log(temp, last_index[temp - 1]);
      last_index.push( Number(last_index[temp-1]) + Number(this.state.value3));
    }
    var Threshold = this.state.value2;
    console.log(Threshold);

    if(Threshold == "Comparitive Value")
    {
      Threshold = 0;
    }
    else
    {
      Threshold = this.state.value2; 
    }
    console.log(this.state.value1, Threshold, this.state.value3);
    console.log(last_index);

    let Totalmiscal = [[-1, -1, -1, -1],[-1, -1, -1, -1]];
    if (IsAreaBrush){Totalmiscal=miscal2}
    else{Totalmiscal=miscal} 


    //console.log("MISCAL:",miscal);
    //const newdata={FullData:'[[]]',XYData:qs.stringify(miscal),color_list:'[1,0]',Nbatch:this.state.value1.toString(),Threshold:this.state.value2.toString(),BatchSize:this.state.value3.toString(),FileName:this.state.selectValue.toString(),last_index:last_index.toString(), clicks:clicks.toString()};
    const newdata={FullData:'[[]]',XYData:qs.stringify(Totalmiscal),color_list:'[1,0]',Nbatch:this.state.value1.toString(),Threshold:this.state.value2.toString(),BatchSize:this.state.value3.toString(),FileName:this.state.selectValue.toString(),last_index:last_index.toString(), clicks:clicks.toString()};

    let data = qs.stringify(newdata)
    //console.log("data!!:",qs.parse(data))
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
        <p style={{fontSize: "12px",color:"DimGrey"}}>Uploading Dataset : {this.state.CategoryType}</p>
        <Select value={this.state.selectValue} onChange={this.dropdownChange} >
          <option value="arxiv_articles_UMAP.csv">arxiv_articles_UMAP.csv</option>
          <option value="HR_diagram.csv">HR_diagram.csv</option> 
        </Select>
        <br></br>
        <br></br>
        <p style={{fontSize: "12px",color:"DimGrey"}}>Number of Frames : {this.state.value1}</p>
        <Slider 
          min={0}
          max={10}
          value={this.state.value1}
          onChange={this.onSliderChange1}
          railStyle={{ height: 4,backgroundColor: "LightGrey", }}
          handleStyle={{
            height: 20,
            width: 20,
            opacity: 1,
            marginLeft: -8,
            marginTop: -8,
            backgroundColor: "black",
            border: 0
          }}
          trackStyle={{ background: "none" }}
        />

        <p style={{fontSize: "12px",color:"DimGrey"}}>Threshold : {this.state.value2}</p>
        <Slider 
          min={0.0}
          max={1.0}
          step={0.01}
          value={this.state.value2}
          onChange={this.onSliderChange2}
          railStyle={{ height: 4, backgroundColor: "LightGrey",}}
          handleStyle={{
            height: 20,
            width: 20,
            opacity: 1,
            marginLeft: -8,
            marginTop: -8,
            backgroundColor: "black",
            border: 0
          }}
          trackStyle={{ background: "none" }}
        />
        <p style={{fontSize: "12px",color:"DimGrey"}}>Batch size : {this.state.value3}</p>
        <Slider 
          min={100}
          max={1000}
          step={10} // you can change this step size
          value={this.state.value3}
          onChange={this.onSliderChange3}
          railStyle={{ height: 4, backgroundColor: "LightGrey",}}
          handleStyle={{
            height: 20,
            width: 20,
            opacity: 1,
            marginLeft: -8,
            marginTop: -8,
            backgroundColor: "black",
            border: 0
          }}
          trackStyle={{ background: "none" }}
        />
        <br></br>     
        <Divider /> 
        <Button size="small" onClick={this.handleClick} shape="round" style={{width:"200px",fontSize: "13px", color: "white",background: "black", borderColor: "black"}}>
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

function AreamyFunction(val) { 
  var table = document.getElementById("demo2");

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
    rowno2 += 1;
    console.log(rowno2);

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

const CheckboxGroup = Checkbox.Group;
const plainOptions = ["Inlier","Outlier"];
const defaultCheckedList = ["Inlier","Outlier"];

const App = () => {
  
  const [checkedList, setCheckedList] = useState(defaultCheckedList);
  const [indeterminate, setIndeterminate] = useState(true);
  const [checkAll, setCheckAll] = useState(false);
  const [data, setData] = useState({FullData:"",DATA:"",Outlier:"",out_indices:"",Inlier:"",in_indices:"",last_index:""})
  const [historydata, sethistoryData] = useState({FullData:""})
  
  const svgRef = useRef();
  const [width, setWidth] = useState(0);
  const [width1, setWidth1] = useState(0);
  const [sliderInd, setsliderInd] = useState(4);
  const [sliderText, setsliderText] = useState("");
  const [sliderText2, setsliderText2] = useState("3 Frames: 0 out of 3 ");
  const [sliderInd1, setsliderInd1] = useState(4);
  const [sliderText1, setsliderText1] = useState("Default");
  const svgRef2 = useRef();
  const svgRef3 = useRef();
  const svgRef4 = useRef();
  const [sliderdata, slidersetData] = useState({sliderFullData:""})
  //const timeoutRef = useRef(null); 

  const onSingleChange = (list) => {
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < plainOptions.length);
    setCheckAll(list.length === plainOptions.length);
    if( list.includes("Outlier")&&list.includes("Inlier")) {
      
      axios.get('http://localhost:5000/BackendData')
      .then(res => {
          //divide data into variables
      
      const DATA = res.data.XYData;
      const color_list=res.data.color_list;
      let out_indices = color_list.map((c,i)=>c===1?i:'').filter(String);
      let Outlier = DATA.filter((_, ind) => out_indices.includes(ind));
      let in_indices = color_list.map((c,i)=>c===0?i:'').filter(String);
      let Inlier=DATA.filter((_, ind) => in_indices.includes(ind));

      setData(prevState => ({
        ...prevState,
        FullData:  res.data.FullData,
        DATA:DATA,
        Outlier :Outlier,
        out_indices:out_indices,
        Inlier :Inlier,
        in_indices:in_indices
      }))
    })
    }	
    else if( list.includes("Outlier")) {
      
      let out_indices1 = data.FullData.map((c,i)=>c[2]===1?i:'').filter(String);
      console.log( out_indices1)
      let outlier1 =data.FullData.filter((_, ind) => out_indices1.includes(ind));
      console.log(outlier1)
      
      setData(prevState => ({
        ...prevState,
        FullData: outlier1,
      }))
    }	
    else if( list.includes("Inlier")) {
     
      let in_indices1 = data.FullData.map((c,i)=>c[2]===0?i:'').filter(String);
      console.log( in_indices1)
      
      let inlier1 =data.FullData.filter((_, ind) => in_indices1.includes(ind));
      console.log(inlier1)
      setData(prevState => ({
        ...prevState,
        FullData: inlier1,
      }))
    }	
    else{
     
    setData(prevState => ({
      ...prevState,
      FullData: [[]],
    }))}

  };
  const onCheckAllChange = (e) => {
    setCheckedList(e.target.checked ? plainOptions : []);
    setIndeterminate(false);
    setCheckAll(e.target.checked);

    if (e.target.checked){
      
      axios.get('http://localhost:5000/BackendData')
      .then(res => {
        const DATA = res.data.XYData;
        const color_list=res.data.color_list;
        let out_indices = color_list.map((c,i)=>c===1?i:'').filter(String);
        let Outlier = DATA.filter((_, ind) => out_indices.includes(ind));
        let in_indices = color_list.map((c,i)=>c===0?i:'').filter(String);
        let Inlier=DATA.filter((_, ind) => in_indices.includes(ind));

      
      setData(prevState => ({
        ...prevState,
        FullData:  res.data.FullData,
        DATA:DATA,
        Outlier :Outlier,
        out_indices:out_indices,
        Inlier :Inlier,
        in_indices:in_indices,
      }))
    })

    }
  };


  const w=800;
  const h=450;
      
  const xScale = d3.scaleLinear()
        .domain([0, 5])
        .range([0,w]);

      // y axis scale 
  const yScale = d3.scaleLinear()
      .domain([0,16])
      .range([h,0])

  
  //MAIN PLOT START
  let svg = d3.select(svgRef.current).attr("width", w).attr("height", h)
  let svg4 = d3.select(svgRef4.current).attr("width", 90).attr("height",90);


  function funcsvg(arr)
  {
    console.log("Entered funcsvg");
    console.log(arr);
    var gsvg = svg4.append('g');

    var dataLevel = [];
    for(var i=0; i<11; i++) 
    {
      if(i<arr.length)
      {
        if(arr[i][2] == 0)
        {
          dataLevel.push([(i+1)*8, "green"]);
          console.log("Green Execution");
        }
        else
        {
          dataLevel.push([(i+1)*8, "red"]);
          console.log("Red Execution");
        }
      }
      else
      {
        break;
      }
    }
    console.log(dataLevel);
    dataLevel.reverse();
    console.log(dataLevel);
    gsvg.selectAll('circle')
      .data(dataLevel)
      .enter()
      .append("circle")
      .attr("cx", 45)
      .attr("cy", 45)
      .attr("r", function(d){return d[0];})
      .attr("fill", function(d){return d[1];})
      .attr("stroke", "black")
      .attr("stroke-width", 1);
    
  }

  
  
  var C = d3.scaleOrdinal()
  .domain([0,1])
  .range(["green","red"])
  //enter
  console.log("data.FulData", data.FullData);
  svg.selectAll('circle')
  .data(data.FullData)
  .enter()
    .append('circle')
    .attr('cx',d=>xScale(d[0]))
    .attr('cy',d=>yScale(d[1]))
    .attr('r',2)
    .attr('fill',d=>C(d[2])) 
    .attr('opacity',"0.5");
  
  //exit
  svg.selectAll('circle')
  .data(data.FullData).exit().remove();
  
  //update
  svg.selectAll('circle')
  .data(data.FullData)
  .transition()
  .attr("fill",d=>C(d[2]))
  .attr('cx',d=>xScale(d[0]))
  .attr('cy',d=>yScale(d[1]))
  .attr('r',2)
  .attr('opacity',"0.5");
  
 
  //x ScaleBack
  const xSB = d3.scaleLinear()
  .domain([0,w])
  .range([0,5])

  //y ScaleBack
  const ySB = d3.scaleLinear()
    .domain([h, 0])
    .range([0,16])

  //storing values in array
  //console.log("val :",val);

  const Dataval = svg
        .selectAll('circle')
        .data(data.DATA)
        .join('circle')
            .attr('opacity', 0.75);

      Dataval
      .on('mouseover', function(){
        const data = data
        d3.select(this).attr('stroke', '#333').attr('stroke-width', 2).attr(data);
        //console.log("DATA:", data);



        console.log("-----------------HISTORY DATA---------------");
        console.log(history);
        console.log("---------------------------------------------");
        

        d3.select(this);
        const xval = this.cx["baseVal"]["value"];
        const yval = this.cy["baseVal"]["value"];
        const xvalue = xSB(xval);
        const yvalue = ySB(yval);
        var temp = Array(2);
        temp = [xvalue,yvalue];
        console.log(temp);
        console.log(history);
        var hisarr = [];
        var ind = -100;
        for(var i=0; i<history[history.length- 1].length; i++)
        {
          if(Math.abs(xvalue-history[history.length-1][i][0])< 0.0001 && Math.abs(yvalue - history[history.length-1][i][0]))
          {
            console.log("Match Found Hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
            ind = i;
            break;
          } 
        }
        for(var j=history.length-1; j>-1;j--)
        {
          if(history[j].length>= ind)
          {
            hisarr.push([history[j][ind][0],history[j][ind][1],history[j][ind][2],ind]);
          }
          else
          {
            break;
          }
        }
        console.log(hisarr);
        hisarr.reverse();
        console.log(hisarr);
        funcsvg(hisarr);
 
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
        console.log("val :",val);
     
        console.log("xvalue:",xvalue);
        console.log("yvalue : ",yvalue);
        console.log(" xval, yval");
        if (d3.select(this).attr('fill')=='purple')
        {
          console.log("HEREEEEEEEEE");
          for(var j=0;j<data.Outlier.length;j++)
          {
            console.log(xvalue, data.Outlier[j][0],Math.abs(xvalue-data.Outlier[j][0]),"---", yvalue, data.Outlier[j][1],Math.abs(yvalue-data.Outlier[j][1]));
            if(Math.abs(xvalue-data.Outlier[j][0]) < 0.0001 && Math.abs(yvalue-data.Outlier[j][1]) < 0.0001)
            {
              console.log("----------------HEREEEEEEEEE--------------");
              d3.select(this).attr('fill','red');
              d3.select(this).attr('opacity', 0.5);
              break;
            } 
            else
            { 
              d3.select(this).attr('fill','green');
              d3.select(this).attr('opacity', 0.5);
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
          d3.select(this).attr('fill','purple');
          d3.select(this).attr('opacity', 1.0);
        }
      console.log(val);
      myFunction(val);
      console.log("Exit Onclick");

      })
      .on('mouseout', function(){
        d3.select(this).attr('stroke', null);
      }) 

  // Add brushing

  const AreaClick=() => {
    IsAreaBrush=true;
  // create brush 
  var brush = d3.brush();

  // set brush extend (0,0) is top left corner
  brush.extent([[0, 0], [ w, h]]);

  // attach events  
  brush  
      .on("start brush", brushing)
      .on("end", brushend);

  // call brush on selection  
  svg.append("g")
      .call(brush);

  let brushExtent;
  // during brushing send coordinates to console
  function brushing(e) {
    BrushData=[]
    brushExtent =e.selection
    let x0 =xSB(brushExtent[0][0]),
        y0 = ySB(brushExtent[0][1]),
        x1 = xSB(brushExtent[1][0]),
        y1 = ySB(brushExtent[1][1])
    //console.log("("+x0+","+y0+")-("+x1+","+y1+")");
    BrushData.push([x0,y0],[x1,y1])

    //console.log("filteredData: ",filteredData)

    update()

  }


  function isInBrushExtent(d) {
    return brushExtent &&
      d[0] >= xSB(brushExtent[0][0]) &&
      d[0] <= xSB(brushExtent[1][0]) &&
      d[1] >= ySB( brushExtent[0][1]) &&
      d[1] <= ySB(brushExtent[1][1]);
  }
  let OriginalData=data.FullData

  console.log("BrushData : ",BrushData)
  //console.log(Object.entries(OriginalData))

  //
  //const color_list = data.y_train;
  //const out_indices = color_list.map((c,i)=>c===1?i:'').filter(String);
  //const outlier = data.X_train.filter((_, ind) => out_indices.includes(ind));
  //

  function update() {

    /* svg.selectAll('circle')
    .data(filteredData) 
    .transition()
      .attr('cx', function(d) { return xScale(d[0]); })
      .attr('cy', function(d) { return yScale(d[1]); })
      .attr('r', 2)
      .style('fill', 'black'); */
    }
  //.style('fill', function(d) {return isInBrushExtent(d) ? 'black' : null;})
  // on brush end, console log if no selection
  function brushend(e) {
    const filteredInd=OriginalData.map((c,i)=>(c[0]>=BrushData[0][0]&&c[0]<=BrushData[1][0]&& c[1]<=BrushData[0][1]&&c[1]>=BrushData[1][1])?i:'').filter(String);
    const filteredData = OriginalData.filter((_, ind) => filteredInd.includes(ind));
    //const NotfilteredData = OriginalData.filter((_, ind) => !filteredInd.includes(ind));
  
    console.log('end');
    console.log("씨filteredData",filteredData)
    val2.push(filteredData)
    AreamyFunction(filteredData)

    if (!e.selection) {
      console.log('There is no selection');
    }   
  }  

}
  //area selection end
  
  
  //MAIN PLOT END

  //var dataLevel = [[40,"red"],[30,"blue"],[10,"green"]]
  //Concentric Circles

  //Slider PLOT START
  const svg2 = d3.select(svgRef2.current).attr("width", w).attr("height", h);
 
  //console.log("sliderdata.sliderFullData :",sliderdata.sliderFullData)
  svg2.selectAll('circle')
  .data(sliderdata.sliderFullData)
  .enter()
    .append('circle')
    .attr('cx',d=>xScale(d[0]))
    .attr('cy',d=>yScale(d[1]))
    .attr('r',2)
    .attr('fill',d=>C(d[2])) 
    .attr('opacity',"0.5");
  
  //exit
  svg2.selectAll('circle')
  .data(sliderdata.sliderFullData).exit().remove();
  
  //update
  svg2.selectAll('circle')
  .data(sliderdata.sliderFullData)
  .transition()
  .attr("fill",d=>C(d[2]))
  .attr('cx',d=>xScale(d[0]))
  .attr('cy',d=>yScale(d[1]))
  .attr('r',2)
  .attr('opacity',"0.5");
  


  const SethandleClick=() => {
    val = [];
    myFunction(val)
    //If your outlier table does not work well, you can uncomment below and assign index you want
    //myFunction2(val, index)
    axios.get('http://localhost:5000/BackendData')
    .then(res => {
        //divide data into variables
        const FullDATA = res.data.FullData;
        console.log("큰사이즈 데이터 :",FullDATA.length)
        history.push(FullDATA)
        const DATA = res.data.XYData;
        const last_index = res.data.last_index;
        console.log("Last index :", last_index);
       
        const color_list=res.data.color_list;
        let out_indices = color_list.map((c,i)=>c===1?i:'').filter(String);
        let Outlier = DATA.filter((_, ind) => out_indices.includes(ind));
        let in_indices = color_list.map((c,i)=>c===0?i:'').filter(String);
        let Inlier=DATA.filter((_, ind) => in_indices.includes(ind));
        outlier=Outlier; 
        inlier=Inlier;
        out_indicesList=out_indices;
        in_indicesList=in_indices;



      setData(prevState => ({
        ...prevState,
        FullData: FullDATA,
        DATA : DATA,
        last_index:last_index,
        Outlier :Outlier,
        out_indices:out_indices,
        Inlier :Inlier,
        in_indices:in_indices,
     }))
  })
   }

  const changeWidth = (event) => {
    setWidth(event.target.value);
  
    axios.get('http://localhost:5000/BackendData')
    .then(res => {
        //divide data into variables
        const sliderFullDATA = res.data.FullData;
        const last_index = res.data.last_index;
        const Nbatch=Number(res.data.Nbatch);
        console.log("sliderFullDATA SIZE :",sliderFullDATA.length)  
        console.log("clicks:",clicks)
        console.log("Nbatch :",Nbatch)
       
        sliderindexList=last_index[0].slice(1)
        sliderindexList.push(sliderFullDATA.length)
      console.log("sliderindexList :",sliderindexList)
      console.log("event.target.value :",event.target.value)
     
      let startTrain=0;
      setsliderText(`${clicks} testing batch < ${Nbatch} Frames (${Nbatch-clicks} batch needed more)`)
      setsliderInd(clicks)
      setsliderText2(`${clicks} Frames: ${event.target.value} out of ${clicks} `)
      if (Number(event.target.value)===0){
        setsliderText("")
        setsliderText2(`${Nbatch} Frames: `)
        slidersetData(prevState => ({
          ...prevState,
          sliderFullData: [[]]
       }))}
      else{
        if (clicks>=Nbatch){   
          startTrain=sliderindexList[sliderindexList.length-Nbatch-1];
          console.log("startTrain:",startTrain)
          setsliderInd(Nbatch+1)
          setsliderText("")
          setsliderText2(`${Nbatch} Frames: ${event.target.value-1} out of ${Nbatch} batches`)
          console.log("event.target.value :",event.target.value)
          console.log("sliderindexList.length-Nbatch-1 :",sliderindexList.length-Nbatch-1)
          console.log("sliderindexList.length-Nbatch-1+event.target.value :",sliderindexList.length-Nbatch-1+Number(event.target.value))
          console.log("sliderindexList[sliderindexList.length - 1] :",sliderindexList[sliderindexList.length - 1])
          if (Number(event.target.value)===1){
            setsliderText("Default")
          }
          
        }
          slidersetData(prevState => ({
          ...prevState,
          sliderFullData: sliderFullDATA.slice(startTrain,sliderindexList[sliderindexList.length-Nbatch-1+Number(event.target.value)]),
        
      }))
  }})
  
  };

  const changeWidth1 = (event) => {
    setWidth1(event.target.value);
    console.log("히스토리 : ",event.target.value)
    console.log("click :",clicks)
    console.log("history :",history)
    console.log("history[event.target.value-1]",history[event.target.value-1]);
    let FullData=[[]];
    if (Number(event.target.value)!=0){
      FullData= history[event.target.value-1]
      setsliderText1(event.target.value);
    }
    if (Number(event.target.value)==0){
      console.log("디폴트")
      FullData= [[]]
      setsliderText1("Default");
    }
     console.log("현재 히스토리사이즈:",FullData)
     console.log("sliderText1 :",sliderText1)
     console.log("sliderText1 -1 :",sliderText1-1)
    //sethistoryData(history[event.target.value-1])
    setsliderInd1(clicks+1);
    sethistoryData(prevState => ({
      ...prevState,
      FullData: FullData,
      
   }))
  };

  //History Slider PLOT START
  const svg3 = d3.select(svgRef3.current).attr("width", w).attr("height", h);
 
  //console.log("sliderdata.sliderFullData :",sliderdata.sliderFullData)
  svg3.selectAll('circle')
  .data(historydata.FullData)
  .enter()
    .append('circle')
    .attr('cx',d=>xScale(d[0]))
    .attr('cy',d=>yScale(d[1]))
    .attr('r',2)
    .attr('fill',d=>C(d[2])) 
    .attr('opacity',"0.5");
   
  //exit
  svg3.selectAll('circle')
  .data(historydata.FullData).exit().remove();
  
  //update
  svg3.selectAll('circle')
  .data(historydata.FullData)
  .transition()
  .attr("fill",d=>C(d[2]))
  .attr('cx',d=>xScale(d[0]))
  .attr('cy',d=>yScale(d[1]))
  .attr('r',2)
  .attr('opacity',"0.5");
  
  //drawer start
const [draweropen, setdrawerOpen] = useState(false);

const showDrawer = () => {
  setdrawerOpen(true);
};

const onClose = () => {
  setdrawerOpen(false);
};
const [draweropen2, setdrawerOpen2] = useState(false);

const showDrawer2 = () => {
  setdrawerOpen2(true);
};

const onClose2 = () => {
  setdrawerOpen2(false);
};


//drawer end



  const outl = () => {
    console.log("new button :data.out_indices",data.out_indices)
    console.log("outlier :",outlier)
    myFunction2(outlier,data.out_indices);
  }

  /*
  <Spin tip="Loading" size="small">
              <div className="content" />
            </Spin>
            */

  return (
    <div style={{ margin: 10 ,width:"95%",height:"90%"}}>

      <Layout style={{ height:  "70%", backgroundColor:'white',borderColor: "black" }}>
        <Sider width={ "350"} style={{backgroundColor:'OldLace',marginLeft: 40,marginRight: 50}}>  
          <p style={{fontWeight:'bold',fontSize: "16px",color: "DimGrey",marginLeft: 30,marginRight: 30}}>Outlier Detection and Monitoring<br></br> for Streaming data</p>
              <Content style={{ height:  "100%"}}>
              <Divider />

                <SliderOk/> 

                <Button size="small" shape="round" style={{ width:"200px",fontSize: "13px",color: "white", marginLeft: 30,  marginTop: 5 ,background: "black", borderColor: "black" }} onClick={SethandleClick}>Updating on Plot</Button>

                <Divider/>
                <p style={{fontSize: "14px",color: "DimGrey",marginLeft: 30}}>Incorrect Classification</p>
                    <table style ={{fontSize: "8px",marginLeft: 30}}id="demo"></table>   
                <Divider/>
                <Button size="small" shape="round" style={{ width:"200px",fontSize: "13px",color: "white", marginLeft: 30,  marginTop: 5 ,background: "black", borderColor: "black" }} onClick={AreaClick}>Area Selection</Button>

                <p style={{fontSize: "14px",color: "DimGrey",marginLeft: 30}}>Area Incorrect Classification</p>
                    <table style ={{fontSize: "8px",marginLeft: 30}}id="demo2"></table>        
              </Content>
        </Sider>
        <Layout style={{ marginTop:5,marginLeft:20,backgroundColor:'White'}}>
            <Content style={{ width: "100%" ,display: "flex", verticalAlign:"middle"}}  >
              <div className="container">
              <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll} >
                    Check All</Checkbox>
              <CheckboxGroup options={plainOptions} value={checkedList} onChange={onSingleChange}/>        
            </div>



          </Content>
        <Layout style={{backgroundColor:'White'}}>
          <svg ref={svgRef} />
        </Layout>
        
        
        <Layout style={{backgroundColor: 'silver'}}>
          <svg ref = {svgRef4} />
        </Layout>

        <Divider />
        </Layout>
      <Sider width={"135"} height={"5"} style={{backgroundColor:'OldLace',marginLeft: 100,marginRight: 10}}>  
       <p style={{fontWeight:'bold',fontSize: "16px",color: "DimGrey",marginLeft: 10,marginRight: 10}}>Tool Tips</p>        
       <Button size="small" shape="round" style={{ width:"120px",fontSize: "13px",color: "white", marginLeft: 10,  marginTop: 5 ,background: "black", borderColor: "black" }} onClick={showDrawer}>
          Process 
        </Button>
        <Drawer title="Process of Test Data" size="large" placement="right" onClose={onClose} open={draweropen}>
          <h4>{sliderText2}</h4>
            <h4>{sliderText} </h4>
          <div className="slidecontainer">
          <input type='range'  className="slider" id="myRange" onChange={changeWidth}
            min={0} max={sliderInd} step={1} value={width} ></input>
            <svg ref={svgRef2} />
          </div>

        </Drawer>

        <Button size="small" shape="round" style={{ width:"120px",fontSize: "13px",color: "white", marginLeft: 10,  marginTop: 5 ,background: "black", borderColor: "black" }} onClick={showDrawer2}>
        History
        </Button>
        <Drawer title="History" size="large" placement="right" onClose={onClose2} open={draweropen2}>
            <h4> {sliderText1} plot</h4>
            <div className="slidecontainer">
            <input type='range'  className="slider" id="myRange1" onChange={changeWidth1}
              min={0} max={sliderInd1} step={1} value={width1} ></input>
              <svg ref={svgRef3} />
            </div>
        </Drawer>
      
      </Sider>
      </Layout>
      
    </div>
  );
};

export default App; 