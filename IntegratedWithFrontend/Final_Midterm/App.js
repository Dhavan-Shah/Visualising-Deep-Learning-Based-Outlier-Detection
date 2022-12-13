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
let out_indicesList = [];
let outlier = [];
let in_indicesList = [];
let inlier=[];
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
      value2: 0.3,
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

    console.log("MISCAL:",miscal);
    const newdata={FullData:'[[]]',XYData:qs.stringify(miscal),color_list:'[1,0]',Nbatch:this.state.value1.toString(),Threshold:this.state.value2.toString(),BatchSize:this.state.value3.toString(),FileName:this.state.selectValue.toString(),last_index:last_index.toString(), clicks:clicks.toString()};
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
  const [sliderInd, setsliderInd] = useState(5);
  const [sliderInd1, setsliderInd1] = useState(5);
  const svgRef2 = useRef();
  const svgRef3 = useRef();
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
        if (d3.select(this).attr('fill')=='yellow')
        {
          console.log("HEREEEEEEEEE");
          for(var j=0;j<data.Outlier.length;j++)
          {
            console.log(xvalue, data.Outlier[j][0],Math.abs(xvalue-data.Outlier[j][0]),"---", yvalue, data.Outlier[j][1],Math.abs(yvalue-data.Outlier[j][1]));
            if(Math.abs(xvalue-data.Outlier[j][0]) < 0.0001 && Math.abs(yvalue-data.Outlier[j][1]) < 0.0001)
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
    val = [];
    myFunction(val)
    //If your outlier table does not work well, you can uncomment below and assign index you want
    //myFunction2(val, index)
    axios.get('http://localhost:5000/BackendData')
    .then(res => {
        //divide data into variables
        const FullDATA = res.data.FullData;
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


        console.log("Understanding DATA");
        console.log(out_indices);
        console.log(outlier); 
        console.log(outlier[0])
        console.log(inlier); 
        console.log(DATA.length);
        console.log(FullDATA);

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
        console.log("sliderFullDATA SIZE :",sliderFullDATA.length)  
        console.log("clicks:",clicks)
       
        sliderindexList=last_index[0].slice(1)
      console.log("sliderindexList :",sliderindexList)
      console.log("event.target.value :",event.target.value)
      console.log("sliderindexList[event.target.value-1] :",sliderindexList[event.target.value-1])
      setsliderInd(clicks)
      
      slidersetData(prevState => ({
        ...prevState,
        sliderFullData: sliderFullDATA.slice(0,sliderindexList[event.target.value-1]),
      
     }))
    })

  };

  const changeWidth1 = (event) => {
    setWidth1(event.target.value);
    console.log("히스토리 : ",event.target.value)
    console.log("click :",clicks)
    console.log("history :",history)
    console.log("history[event.target.value-1]",history[event.target.value-1]);
    //sethistoryData(history[event.target.value-1])
    setsliderInd1(clicks+1);
    sethistoryData(prevState => ({
      ...prevState,
      FullData: history[event.target.value-1],
      
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
    .attr('opacity',"0.3");
  
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
  .attr('opacity',"0.3");
  
  
  const outl = () => {
    console.log("new button :data.out_indices",data.out_indices)
    console.log("outlier :",outlier)
    myFunction2(outlier,data.out_indices);
  }
  
  return (
    <div style={{ margin: 10 ,width:"80%",height:"70%"}}>
  
      <Layout style={{ height:  "70%", backgroundColor:'white',borderColor: "black" }}>
        <Sider width={ "35%"} style={{backgroundColor:'OldLace'}}>  
          <p style={{fontWeight:'bold',fontSize: "16px",color: "DimGrey",marginLeft: 30,marginRight: 30}}>Outlier Detection and Monitoring<br></br> for Streaming data</p>
              <Content style={{ height:  "100%"}}>
              <Divider />
                
                <SliderOk/> 
                
                <Button size="small" shape="round" style={{ width:"200px",fontSize: "13px",color: "white", marginLeft: 30,  marginTop: 5 ,background: "black", borderColor: "black" }} onClick={SethandleClick}>Updating on Plot</Button>
              
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

      <h4>History : {width1-1} plot</h4>
      <div className="slidecontainer">
      <input type='range'  className="slider" id="myRange1" onChange={changeWidth1}
        min={0} max={sliderInd1} step={1} value={width1} ></input>
        <svg ref={svgRef3} />
      </div>
        </Layout>  
      </Layout>
       
    </div>
  );
};

export default App; 