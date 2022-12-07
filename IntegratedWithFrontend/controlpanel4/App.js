import React,{useRef, createRef,useState,useEffect} from 'react';
import Slider, { createSliderWithTooltip } from "rc-slider";
import "rc-slider/assets/index.css";
import axios from 'axios';
import { Select,Button ,Layout,Divider,Checkbox} from 'antd';
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

let n_Post=-1
let sliderindexList=[]


class SliderOk extends React.Component {
  constructor(props) {
    super(props);

    
    this.state = {
      value1: 3,
      value2: 0.3,
      value3:3000 ,
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
          min={1000}
          max={10000}
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
const split=[]




const App = () => {
  
  const [checkedList, setCheckedList] = useState(defaultCheckedList);
  const [indeterminate, setIndeterminate] = useState(true);
  const [checkAll, setCheckAll] = useState(false);
  const [data, setData] = useState({FullData:"",DATA:""})
  
  const svgRef = useRef();
  const [width, setWidth] = useState(0);
  const [sliderInd, setsliderInd] = useState(5);
  const svgRef2 = useRef();
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
      
      setData(prevState => ({
        ...prevState,
        FullData:  res.data.FullData,
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
          //divide data into variables
      
      setData(prevState => ({
        ...prevState,
        FullData:  res.data.FullData,
      }))
    })

    }
  };
  
  const w=800;
  const h=450;
      
  const xScale = d3.scaleLinear()
        .domain([-0.5, 5])
        .range([0,w]);

      // y axis scale 
  const yScale = d3.scaleLinear()
      .domain([0,16])
      .range([h,0])

  
  //MAIN PLOT START
  let svg = d3.select(svgRef.current).attr("width", w).attr("height", h)
  
  
  var C = d3.scaleOrdinal()
  .domain([0,1])
  .range(["green","red"])
  //enter
  svg.selectAll('circle')
  .data(data.FullData)
  .enter()
    .append('circle')
    .attr('cx',d=>xScale(d[0]))
    .attr('cy',d=>yScale(d[1]))
    .attr('r',2)
    .attr('fill',d=>C(d[2])) 
    .attr('opacity',"0.3");
  
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
  .attr('opacity',"0.3");
  
 
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

  const Dataval = svg
        .selectAll('circle')
        .data(data.DATA)
        .join('circle')
            .attr('opacity', 0.75);

      Dataval
      .on('mouseover', function(){
        const data = data.DATA
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
    //MAIN PLOT END
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
    .attr('opacity',"0.3");
  
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
  .attr('opacity',"0.3");
  


  const SethandleClick=() => {
   
    axios.get('http://localhost:5000/BackendData')
    .then(res => {
        //divide data into variables
        const FullDATA = res.data.FullData;
        const DATA = res.data.XYData;
      
      setData(prevState => ({
        ...prevState,
        FullData: FullDATA,
        DATA : DATA
     }))
  })
   }

  const changeWidth = (event) => {
    setWidth(event.target.value);
  
    axios.get('http://localhost:5000/BackendData')
    .then(res => {
        //divide data into variables
        const sliderFullDATA = res.data.FullData;
        const Nbatch=Number(res.data.Nbatch);
       
        
        if (n_Post===0){split.push(Number(res.data.BatchSize)/Number(res.data.Nbatch))}
       
        if (sliderindexList.length<sliderFullDATA.length/split[0]){
          //console.log("Slider list updating")      
          for (let i = 1; i <= Nbatch; i++) {
            sliderindexList.push(split[0]*i+(split[0]*Nbatch)*(n_Post));
          } 
        }
       
      //console.log("sliderindexList :",sliderindexList)
      setsliderInd(Number(res.data.Nbatch)*(n_Post+1))
      
      slidersetData(prevState => ({
        ...prevState,
        sliderFullData: sliderFullDATA.slice(0,sliderindexList[event.target.value-1]),
      
     }))
    })

  };
  
  

  return (
    <div style={{ margin: 10 ,width:"80%",height:"70%"}}>
  
      <Layout style={{ height:  "70%", backgroundColor:'white',borderColor: "black" }}>
        <Sider width={ "35%"} style={{backgroundColor:'OldLace'}}>  
          <p style={{fontWeight:'bold',fontSize: "16px",color: "DimGrey",marginLeft: 30,marginRight: 30}}>Outlier Detection and Monitoring<br></br> for Streaming data</p>
              <Content style={{ height:  "100%"}}>
              <Divider />
                
                <SliderOk/>
                
                <Button size="small" shape="round" style={{ width:"200px",fontSize: "13px",color: "white", marginLeft: 30,  marginTop: 5 ,background: "black", borderColor: "black" }} onClick={SethandleClick}>Updating on Plot</Button>
              
                <Divider /> 
                <p style={{fontSize: "14px",color: "DimGrey",marginLeft: 30}}>Outliers</p>
                  <table id="outlier"></table>
                <Divider/>
                <p style={{fontSize: "14px",color: "DimGrey",marginLeft: 30}}>Incorrect Classification</p>
                    <table style ={{fontSize: "8px",marginLeft: 30}}id="demo"></table>        
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
        <Divider />
        <h4>Process : {width} out of {sliderInd} batches</h4>
      <div className="slidecontainer">
      <input type='range'  className="slider" id="myRange" onChange={changeWidth}
        min={0} max={sliderInd} step={1} value={width} ></input>
        <svg ref={svgRef2} />
      </div>
        </Layout>  
      </Layout>
                
    </div>
  );
};

export default App;
