import React,{useRef, createRef,useState,useEffect} from 'react';
import Slider, { createSliderWithTooltip } from "rc-slider";
import "rc-slider/assets/index.css";
import axios from 'axios';
import { Select,Button ,Layout,Divider,Checkbox, Drawer,Spin} from 'antd';

import * as d3 from 'd3';
import "./App.css"

var qs = require('qs');
const { Option } = Select;

var val = [];

let IsDot=false;
let LassoData=[];
let IsAreaLasso=false;

let out_indicesList = [];
let outlier = [];
let in_indicesList = [];
let inlier=[];
let InlierCat=[];
let OutlierCat=[];

let out_indicesList2 = [];
let outlier2 = [];
let in_indicesList2 = [];
let inlier2=[];

let AddingPointsList=[];
let AddingPointsList2=[];
let DeletingPointsList=[];
let IsDeleting=false;
let IsAdding=false;
let IsAdding2=false;


let history=[];

let n_Post=-1 
let sliderindexList=[]
let last_index = [];
let clicks = 0

let InitdataType='Binary Feature'
let NewdataType='Binary Feature'; 

let IsCAT=false;

let GlobalNumFrame=3;
let HeatMapData=[];
let GlobalNbatch=100;

class SliderOk extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value1: 3,
      value2: 0.5,
      value3:100 , 
      selectValue:'HR_diagram.csv',
      CategoryType:'Binary Feature',
      timerBool:false  
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
        GlobalNumFrame=this.state.value1     
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
        GlobalNbatch=this.state.value3  
      }     
    );

  };
  
  dropdownChange=e=>{
    if (e!=InitdataType){NewdataType=e;console.log(NewdataType,InitdataType)}
    let dataType='Binary Feature'
    if (e==='arxiv_articles_UMAP.csv'){
      dataType='Category Feature'
    }
    if (e==='PyOD.csv'){
      dataType='Binary Feature'
    }
    
    else{dataType='Binary Feature'}
    this.setState({selectValue:e,CategoryType:dataType});   
  }

// POST BUTTON
  handleClick()  {
  
  //Timer  Start
    this.setState({timerBool:true}) 
    let timerNumber=0;

    let timer = d3.interval(()=>{
      timerNumber++;
      
      if ( timerNumber > 3){
        this.setState({timerBool:false})
        timer.stop()}     
    }, 1000);
  //Timer End

    n_Post+=1
    let miscal; //val, dot incorection
    let miscal2; // both of dot and area
    let miscal3; // area
    let miscal4; //deleting
    let miscal5; //adding
    let Totalmiscal;
    //Deleting points to (0,0)
    console.log( "IsDeleting :",IsDeleting ,"IsAdding:",IsAdding,"IsAdding2:",IsAdding2,"IsAreaLasso:",IsAreaLasso,"IsDot:",IsDot)
    //TODO: for category, oulier and inlier lists are needed
    if (IsDeleting){
      
      console.log("IsDeleting ON")
      miscal4 = [[-1, -1, -1, -1],[-1, -1, -1, -1]]; 
      console.log("POST delete:",DeletingPointsList)
      for(var i=0;i<DeletingPointsList.length;i++)  
      {
        //outlier
        for(var j=0;j<outlier.length;j++)
        {
            if(Math.abs(DeletingPointsList[i][0]-outlier[j][0]) < 0.0001 && Math.abs(DeletingPointsList[i][1]-outlier[j][1]) < 0.0001)
          {
            miscal4.push([0,0,1,out_indicesList[j]]);
          }
        }
        //inlier
        for(var j=0;j<inlier.length;j++)
        {

          if(Math.abs(DeletingPointsList[i][0]-inlier[j][0]) < 0.0001 && Math.abs(DeletingPointsList[i][1]-inlier[j][1]) < 0.0001)
          { 
            miscal4.push([0,0,InlierCat[j],in_indicesList[j]]);
          }
        }
        console.log("Deleting miscal4 :",miscal4) 
      } 
  }
  miscal5 = []; 
  if (IsAdding2===true){
    console.log("Outlier IsADDING2 ON")
    for (var i=0;i<AddingPointsList2.length;i++) {
      miscal5.push(AddingPointsList2[i])}
  }
  if (IsAdding===true){
    console.log("Inlier:IsADDING ON")   
    for (var i=0;i<AddingPointsList.length;i++) {
      miscal5.push(AddingPointsList[i])}   
  }
  console.log("Total Adding: miscal5 :",miscal5) 
  


  //Lasso start

  if ((IsAreaLasso===true) && (IsDot===true)){
    //combining both
    for (var n=0; n<val.length ; n++){LassoData.push(val[n])}
    
    console.log("IsAreaLasso ON & IsDot ON")
    console.log("Both of lasso, dot",LassoData)
    miscal2 = [[-1, -1, -1, -1],[-1, -1, -1, -1]]; 
    for(var i=0;i<LassoData.length;i++) 
      {
        //outlier->inlier
        for(var j=0;j<outlier.length;j++)
        {
        
          if(Math.abs(LassoData[i][0]-outlier[j][0]) < 0.0001 && Math.abs(LassoData[i][1]-outlier[j][1]) < 0.0001)
          {
          // console.log("outlier->inlier");
            var x = outlier[j][0];
            var y = outlier[j][1];
            if (IsCAT){miscal2.push([x,y,0,out_indicesList[j],OutlierCat[j]])}
            else{miscal2.push([x,y,0,out_indicesList[j]]);}
          }
        }
        //inlier->outlier
        for(var j=0;j<inlier.length;j++)
        {
    
          if(Math.abs(LassoData[i][0]-inlier[j][0]) < 0.0001 && Math.abs(LassoData[i][1]-inlier[j][1]) < 0.0001)
          {
          // console.log("inlier->outlier");
            var x = inlier[j][0];
            var y = inlier[j][1];
            if (IsCAT){miscal2.push([x,y,1,in_indicesList[j],InlierCat[j]]);}
            else{miscal2.push([x,y,1,in_indicesList[j]]);}     
          }
        } 
      console.log("Both incorrection : miscal2 :",miscal2) 
      }
    IsAreaLasso=false
    IsDot=false
    Totalmiscal=miscal2
  }
  if ((IsAreaLasso===true) && (IsDot===false)){
    console.log("only lasso ON")
    if (IsCAT)
    {miscal3 = [[-1, -1, -1, -1, -1],[-1, -1, -1, -1, -1]];} 
    else
    {
      miscal3 = [[-1, -1, -1, -1],[-1, -1, -1, -1]]
    }
    for(var i=0;i<LassoData.length;i++) 
      {
        //outlier->inlier
        for(var j=0;j<outlier.length;j++)
        {
        
          if(Math.abs(LassoData[i][0]-outlier[j][0]) < 0.0001 && Math.abs(LassoData[i][1]-outlier[j][1]) < 0.0001)
          {
          // console.log("outlier->inlier");
            var x = outlier[j][0];
            var y = outlier[j][1];
            
            if (IsCAT){miscal3.push([x,y,0,out_indicesList[j],OutlierCat[j]])}
            else{miscal3.push([x,y,0,out_indicesList[j]]);}
          }
        }
        //inlier->outlier
        for(var j=0;j<inlier.length;j++)
        {
    
          if(Math.abs(LassoData[i][0]-inlier[j][0]) < 0.0001 && Math.abs(LassoData[i][1]-inlier[j][1]) < 0.0001)
          {
          // console.log("inlier->outlier");
            var x = inlier[j][0];
            var y = inlier[j][1];
            if (IsCAT){miscal3.push([x,y,1,in_indicesList[j],InlierCat[j]]);}
            else{miscal3.push([x,y,1,in_indicesList[j]]);}
          }
        } 
      console.log("Area incorrection :miscal3 :",miscal3) 
      }
    IsAreaLasso=false
    Totalmiscal=miscal3
  }
  //Lasso end

  if ((IsAreaLasso===false) && (IsDot===true)){
      //point selection
      console.log("only dot ON")
      var z = val.length;
      if (IsCAT){miscal = [[-1, -1, -1, -1, -1],[-1, -1, -1 , -1, -1]]}
      else {miscal = [[-1, -1, -1, -1],[-1, -1, -1, -1]];}
      for(var i=0;i<z;i++)
      {
        for(var j=0;j<outlier.length;j++)
        {
          if(Math.abs(val[i][0]-outlier[j][0]) < 0.0001 && Math.abs(val[i][1]-outlier[j][1]) < 0.0001)
          {
            var x = outlier[j][0];
            var y = outlier[j][1];
            if (IsCAT){miscal.push([x,y,0,out_indicesList[j],OutlierCat[j]])}
            else{miscal.push([x,y,0,out_indicesList[j]]);} 
          }
        }
        //inlier->outlier
        for(var j=0;j<inlier.length;j++)
        {

          if(Math.abs(val[i][0]-inlier[j][0]) < 0.0001 && Math.abs(val[i][1]-inlier[j][1]) < 0.0001)
          {
            var x = inlier[j][0];
            var y = inlier[j][1];
            if (IsCAT){miscal.push([x,y,1,in_indicesList[j],InlierCat[j]]);}
            else{miscal.push([x,y,1,in_indicesList[j]]);}
            
          }
        }
      }
      Totalmiscal=miscal
      console.log("Dot incorrection: miscal:",miscal)
    }
    //Slider inputs
      clicks += 1;
      if(last_index.length == 0)
      { 

        last_index.push(Number(this.state.value3));
      }
      else
      {
        var temp = last_index.length;
      // console.log(temp, last_index[temp - 1]);
        last_index.push( Number(last_index[temp-1]) + Number(this.state.value3));
      }
      console.log("NewdataType:",NewdataType)
      console.log("InitdataType:",InitdataType) 

      let PostBatchSize;  

      if (NewdataType!=InitdataType){
        if (NewdataType!='HR_diagram.csv'){IsCAT=true;}
        else{IsCAT=false}
        //reset all
        last_index=[]
        last_index.push(Number(this.state.value3));
        InitdataType=NewdataType;
        history=[];
        clicks=0;
        PostBatchSize=100;
      }
       
      PostBatchSize=this.state.value3
      var Threshold = this.state.value2;
    // console.log(Threshold);  
 
      if(Threshold == "Comparitive Value")
      {
        Threshold = 0;
      }
      else
      {
        Threshold = this.state.value2; 
      }
      
      const newdata={FullData:'[[]]',DeletingData:qs.stringify(miscal4),AddingData:qs.stringify(miscal5),XYData:qs.stringify(Totalmiscal),color_list:'[1,0]',Nbatch:this.state.value1.toString(),Threshold:this.state.value2.toString(),BatchSize:PostBatchSize.toString(),FileName:this.state.selectValue.toString(),last_index:last_index.toString(), clicks:clicks.toString()};

      let data = qs.stringify(newdata)
      //console.log("data!!:",qs.parse(data))
      axios.post(`http://localhost:5000/BackendData`,data,
      {
          headers:{
              'Content-Type': 'application/x-www-form-urlencoded'
          }
      })  
     //RESET LIST
      AddingPointsList=[] 
      AddingPointsList2=[]
      DeletingPointsList=[]
    };

  render() {

    return (
      <div style={{marginLeft: 30,marginRight: 30}} >
        <Spin size="small" spinning={this.state.timerBool} > 
              <div className="content" />
        </Spin>
        <br></br>
        <p style={{fontSize: "12px",color:"DimGrey"}}>Uploading Dataset : {this.state.CategoryType}</p>
        <Select value={this.state.selectValue} onChange={this.dropdownChange} >
          <Option value="arxiv_articles_UMAP.csv">arxiv_articles_UMAP.csv</Option>
          <Option value="HR_diagram.csv">HR_diagram.csv</Option> 
          <Option value="PyOD.csv">PyOD.csv</Option> 
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


const { Sider, Content} = Layout;

const CheckboxGroup = Checkbox.Group;
const plainOptions = ["Inlier","Outlier"];
const defaultCheckedList = ["Inlier","Outlier"];

let lassoNum=0;


const App = () => {

  const [checkedList, setCheckedList] = useState(defaultCheckedList);
  const [indeterminate, setIndeterminate] = useState(true);
  const [checkAll, setCheckAll] = useState(false);
  const [data, setData] = useState({outlierCat:"",inlierCat:"",colorData:"",FileName:"",FullData:"",DATA:"",Outlier:"",out_indices:"",Inlier:"",in_indices:"",last_index:""})
  const [historydata, sethistoryData] = useState({FullData:""})
  const [heatdata, setheatData] = useState({data:""})


  const [incorrectNum, setincorrectNum] = useState(0);
  const [incorrectColor, setincorrectColor] = useState("black");
  const [deleteNum, setdeleteNum] = useState(0);
  const [deleteColor, setdeleteColor] = useState("black");
  const [addNum, setaddNum] = useState(0);
  const [addColor, setaddColor] = useState("black");
  const [addNum2, setaddNum2] = useState(0);
  const [addColor2, setaddColor2] = useState("black");
  const [CatAddName,setCatAddName]=useState("astro-ph");

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
  const svgRefL = useRef(); 
  const svgRefH = useRef(); 
  const [sliderdata, slidersetData] = useState({sliderFullData:""})

 
  const onSingleChange = (list) => {
    
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < plainOptions.length);
    setCheckAll(list.length === plainOptions.length);
    if( list.includes("Outlier")&&list.includes("Inlier")) {

      axios.get('http://localhost:5000/BackendData')
      .then(res => {
        
      const DATA = res.data.XYData;
      const color_list=res.data.color_list;
      let out_indices = color_list.map((c,i)=>c===1?i:'').filter(String);
      let Outlier = DATA.filter((_, ind) => out_indices.includes(ind));
      let outlierCat=color_list.filter((_, ind) => out_indices.includes(ind));
      let in_indices = color_list.map((c,i)=>c!=1?i:'').filter(String);
      let Inlier=DATA.filter((_, ind) => in_indices.includes(ind));
      let inlierCat=color_list.filter((_, ind) => in_indices.includes(ind));
      
      console.log("inlierCat:",inlierCat)
      console.log("outlierCat:",outlierCat)

      setData(prevState => ({
        ...prevState,
        FullData:  res.data.FullData,
        DATA:DATA,
        Outlier :Outlier,
        out_indices:out_indices,
        Inlier :Inlier,
        in_indices:in_indices,
        inlierCat:inlierCat,
        outlierCat:outlierCat
      }))
    })
    }	
    else if( list.includes("Outlier")) {
      axios.get('http://localhost:5000/BackendData')
      .then(res => {

      let out_indices1 = res.data.FullData.map((c,i)=>c[2]===1?i:'').filter(String);
      console.log( out_indices1)
      let outlier1 =res.data.FullData.filter((_, ind) => out_indices1.includes(ind));
      console.log(outlier1)

      setData(prevState => ({
        ...prevState,
        FullData: outlier1,
      }))
     })
    }	
    else if( list.includes("Inlier")) {
      axios.get('http://localhost:5000/BackendData')
      .then(res => {
      let in_indices1 = res.data.FullData.map((c,i)=>c[2]!=1?i:'').filter(String);
      console.log( in_indices1)

      let inlier1 =res.data.FullData.filter((_, ind) => in_indices1.includes(ind));
      console.log(inlier1)
      setData(prevState => ({
        ...prevState,
        FullData: inlier1,
      }))
     })
    }	
    else{ 

    setData(prevState => ({
      ...prevState,
      FullData: "",
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
        let outlierCat=color_list.filter((_, ind) => out_indices.includes(ind));
        let in_indices = color_list.map((c,i)=>c!=1?i:'').filter(String);
        let Inlier=DATA.filter((_, ind) => in_indices.includes(ind));
        let inlierCat=color_list.filter((_, ind) => in_indices.includes(ind));
        console.log("inlierCat:",inlierCat)

      setData(prevState => ({
        ...prevState,
        FullData:  res.data.FullData,
        DATA:DATA,
        Outlier :Outlier, 
        out_indices:out_indices,
        Inlier :Inlier,
        in_indices:in_indices,
        inlierCat:inlierCat,
        outlierCat:outlierCat
      }))
    })

    }
  };

  let MinX;
  let MaxX;
  let MinY;
  let MaxY;
  let w;
  let h; 
  
  if (data.FileName[0]==='PyOD.csv'){
    
    MinX=-7;
    MaxX=10;
    MinY=-7;
    MaxY=10;
    w=800 ;
    h=400;
  }
  else if (data.FileName[0]==='arxiv_articles_UMAP.csv'){
    MinX=-13;
    MaxX=10;
    MinY=-13;
    MaxY=14;
    w=700 ;
    h=400;
  }
  else{
    MinX=-1;
    MaxX=5;
    MinY=-3;
    MaxY=17;
    w=800;
    h=400;
  }
 

  const xScale = d3.scaleLinear()
        .domain([MinX, MaxX])
        .range([0,w]);

      // y axis scale 
  const yScale = d3.scaleLinear()
      .domain([MinY,MaxY]) 
      .range([h,0])   


  //MAIN PLOT START
  let svg = d3.select(svgRef.current).attr("width", w).attr("height", h)

  //concnetric circlcle Start
  let svg4 = d3.select(svgRef4.current).attr("width", 800).attr("height",150);

  var myGroups = ["frame1", "frame2", "frame3", "frame4","frame5","frame6","frame7","frame8","frame9","frame10", ]
  var myVars = ["p1", "p2", "p3","p4","p5","p6","p8","p9","p10"]
  
  var HeatText =  svg.selectAll('.HeatText')
      .data(heatdata.data)
      .enter()
 			.append("g")
      
    HeatText.append("text").text(function(d){
            	return d[2];
            })
            .attr("x", function (d) {
                return xScale(d[0]);
            })
            .attr("y", function (d) {
                return yScale(d[1]+0.3);
            })
            .style("font-size", "0.8em");
    svg.selectAll('text').data(heatdata.data).exit().remove()
    

  
  
    function HeatMap(arr,NumPoint, NumFrame){
      console.log("NumPoint:",NumPoint," NumFrame:", NumFrame)
      const ARR=[...arr]
     
      var margin = {top: 30, right: 30, bottom: 0, left: 30},
      width = 720 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;
      svg4.attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    
      var xH = d3.scaleBand()
        .range([ 200, width])
        .domain(myGroups.slice(0, NumFrame))
        .padding(0.01); 
      
      svg4.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xH))
      var yH = d3.scaleBand()
        .range([ height, 0 ])
        .domain(myVars.slice(0,NumPoint))
        .padding(0.01);
      svg4.append("g")
        .attr("transform", "translate(200,0)")
        .call(d3.axisLeft(yH));
        
  
      var CH=d3.scaleOrdinal()
      .domain([0, 1,"white"])
      .range([ "#75B79E","#F67280","white"])
  
      svg4.selectAll("rect") 
      .data(ARR)
      .enter()
      .append("rect")
      .attr("x", function(d) { return xH(d[0]) })
      .attr("y", function(d) { return yH(d[1]) })
      .attr("width", xH.bandwidth() )
      .attr("height", yH.bandwidth() )
      .style("fill", function(d) { return CH(d[2])} )
  
    }

  function funcline(arr)
  {
    console.log("Entered funcline");
    console.log(arr);
    var glin = svg4.append('g');
    var lindat = [];
    //var dataLevel = [];
    //y = 10, 110
    //x = 120, 220
    var x = 130;
    var x_1 = [];
    //var x_2 = [];
    for(var i=0; i<11; i++) 
    {
      if(i<arr.length)
      {
        x_1.push(x - (i*20));
        if(arr[i][2] == 0)
        {
          //dataLevel.push([(i+1)*10, "green", (i*100)/(arr.length) + x, 10]);
          lindat.push([x - i*20, 10, "green"]);
          console.log("Green Execution");
        }
        else
        {
          //dataLevel.push([(i+1)*10, "red", (i*100)/(arr.length) + x, 140]);
          lindat.push([x - i*20, 110, "red"]);
          console.log("Red Execution");
        }
      }
      else
      {
        break;
      }
    }
    var li = [];
    for(var k=0; k<lindat.length-1;k++)
    {
      li.push([lindat[k][0], lindat[k][1], lindat[k+1][0], lindat[k+1][1], lindat[k][2]]);
      console.log("x1 : ", lindat[k][0], " y1 : ", lindat[k][1], " x2 : ",lindat[k+1][0], " y2 : ", lindat[k+1][1], " color :", lindat[k+1][2]);
    }


    glin.selectAll('circle')
      .data(x_1)
      .enter()
      .append("line")
      .attr("x1",function(d){return d})
      .attr("x2",function(d){return d})
      .attr("y1", 10)
      .attr("y2", 110)
      .style("stroke", "black")
      .style("stroke-width", 5);

    glin.selectAll('circle')
      .data(li)
      .enter()
      .append("line")
      .attr("x1",function(d){return d[0];})
      .attr("x2",function(d){return d[2];})
      .attr("y1",function(d){return d[1];})
      .attr("y2",function(d){return d[3];})
      .style("stroke",function(d){return d[4];})
      .style("stroke-width", 3);

  }



  //Binary : inlier(0)=green, outlier(1)=red, adding inlier point(-1), adding outlier(-2)
  
  //category option2: inlier(2~13)=each color, outlier(1)=red, adding inlier point(-1), adding outlier(-2)####
  var C=d3.scaleOrdinal()
  .domain(["0", "1", "-1","-2","-3","2","3","4","5","6","7","8","9","10","11","12","13"])
  //.range([ "green","red","#16FF00","#FF9551","#DFD3C3","#ECC5FB,'#F2D388","#C1EFFF","#E4D192","#D3CEDF","#92A9BD","yellow","#42032C","#93C6E7"])
  .range([ "green","red","#16FF00","#FF9551","yellow","blue","navy,'purple","brown","#CCD6A6","pink","violet","#FAF7F0","#CDF0EA","#93C6E7","#4C8492","#ECF9FF","#E5BA73"])
  
  //LABEL
  let colorLabelName=d3.scaleOrdinal()
  .domain(["0", "1", "-1","-2","-3","2","3","4","5","6","7","8","9","10","11","12","13"])
  .range([ "inlier","outlier","added inlier","added outlier","seleted point",'astro-ph' ,'cond-mat', 'cs' ,'gr-qc', 'hep-ex', 'hep-lat', 'hep-ph', 'hep-th', 'math', 'other' ,'physics' ,'quant-ph'])
  
  //label enter
  let svgL = d3.select(svgRefL.current).attr("width", w).attr("height", h)
  var legend = svgL.selectAll(".legend")
    .data(data.colorData)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
    .attr("x",  13)
    .attr("width", 8)
    .attr("height", 8)
    .style("fill",d=> C(d.toString()));

  legend.append("text")
    .attr("x",  30)
    .attr("y", 4)
    .attr("dy", ".35em") 
    .style("text-anchor", "start")
    .text(function(d) { return colorLabelName(d.toString()); });

//label exit
svgL.selectAll('rect')
.data(data.colorData).exit().remove();
svgL.selectAll('text')
.data(data.colorData).exit().remove();

//label update
svgL.selectAll("rect")
.data(data.colorData)
  .transition()
    .attr("x",  13)
    .attr("width", 8)
    .attr("height", 8)
    .style("fill",d=> C(d.toString()));
svgL.selectAll("text")
.data(data.colorData)
  .transition()
    .attr("x",  30)
    .attr("y", 4)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(function(d) { return colorLabelName(d.toString()); }); 

//MAIN PLOT
  //enter
  //console.log("data.FullData:",data.FullData)
  svg.selectAll('circle')
  .data(data.FullData)
  .enter() 
    .append('circle')
    .attr('cx',d=>xScale(d[0]))
    .attr('cy',d=>yScale(d[1]))
    .attr('r',2)
    .attr('fill',d=>C(d[2].toString())) 
    .attr('opacity',"0.65");
    
  
  //exit
  svg.selectAll('circle')
  .data(data.FullData).exit().remove();

  //update
  svg.selectAll('circle')
  .data(data.FullData)
  .transition()
  .attr("fill",d=>C(d[2].toString()))
  .attr('cx',d=>xScale(d[0]))
  .attr('cy',d=>yScale(d[1]))
  .attr('r',2)
  .attr('opacity',"0.65");


  //x ScaleBack
  const xSB = d3.scaleLinear()
  .domain([0,w])
  .range([MinX,MaxX])

  //y ScaleBack
  const ySB = d3.scaleLinear()
    .domain([h, 0])
    .range([MinY,MaxY])

  //storing values in array 
  //console.log("val :",val);

  const Dataval = svg
        .selectAll('circle')
        .data(data.DATA)
        .join('circle')
            .attr('opacity', 0.75);
  
  
  //DotClick
  const DotClick=() => {
    IsDot=true;
    if ((incorrectNum+1)%2===1){
      setincorrectColor("red")}
    else{setincorrectColor("black")}
    
  
  //  console.log("data.DATA:",data.DATA)
    if ((incorrectNum+1)%2===1){
      setincorrectNum(incorrectNum+1)
      Dataval
      .on('mouseover', function(){
       
       d3.select(this).attr('stroke', '#333').attr('stroke-width', 2).attr(data.DATA);
       console.log("DATA:", data.DATA);

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
        if((history[j].length>= ind)&&(hisarr.length<GlobalNumFrame))
         {
          console.log(history[j].length, ind, hisarr.length, history[j][ind]);
          if(history[j][ind].length >= 3)
           {hisarr.push([history[j][ind][0],history[j][ind][1],history[j][ind][2],ind]);}
         }
         else
         { 
          console.log(history[j].length, ind, hisarr.length, history[j][ind]);
           break;
         }
       }
       funcline(hisarr);
     //  console.log(hisarr);
     })
     .on('click', function(){
       d3.select(this).attr('stroke', '#000').attr('stroke-width', 4);
       console.log("Enter::");
      // console.log(this);
       const xval = this.cx["baseVal"]["value"];
       const xvalue = xSB(xval);
       const yval = this.cy["baseVal"]["value"];
       const yvalue = ySB(yval);
       var temp = Array(2);
       temp = [xvalue,yvalue];
     //  console.log(temp);
       val.push(temp);
     //  console.log("val :",val);
    
     //  console.log("xvalue:",xvalue);
     //  console.log("yvalue : ",yvalue);
     //  console.log(" xval, yval");
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
         d3.select(this).attr('fill','yellow');
         d3.select(this).attr('opacity', 1.0);
       }
     console.log(val);
     //myFunction(val);
     console.log("Exit Onclick");

     })
     .on('mouseout', function(){
       d3.select(this).attr('stroke', null);
       //var gsvg = svg4.append('g');
       svg4.selectAll("*").remove();
       
     }) 
   }
 }


//Area Lasso Start
const AreaLasso=() => {
   
  lassoNum++;
  
  if ((lassoNum%2)===1){
    IsAreaLasso=true;
    let lassoData=[...data.FullData]
    HeatMapData=[]
    let n=0
    for (let i of lassoData) { 
      i.push(n++)
    }
    
    const lassocircles = svg
        .selectAll("circle")
        .data(lassoData)
        .join("circle")
          .attr("id", (d) => {
            return "dot-" + d[3]; })
          .attr('opacity', 0.75);
    // lasso selection based on the drag events
    let coords = [];
    const lineGenerator = d3.line();

    const pointInPolygon = function (point, vs) { 

        var x = point[0],
            y = point[1];

        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0],
                yi = vs[i][1];
            var xj = vs[j][0],
                yj = vs[j][1];

            var intersect =
                yi > y != yj > y &&
                x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
            if (intersect) inside = !inside;
        }

        return inside;
    };

    function drawPath() {
        d3.select("#lasso")      
            .style("fill", "#00000054")
            .attr("d", lineGenerator(coords));
    }
 
    function dragStart() {
        svg4.selectAll("*").remove();
        coords = [];
        //lassocircles.attr("fill", "steelblue");
        d3.select("#lasso").remove();
        d3.select("#chart")
            .append("path")
            .attr("id", "lasso");
    }

    function dragMove(event) {
        let mouseX = event.sourceEvent.offsetX;
        let mouseY = event.sourceEvent.offsetY;
        coords.push([mouseX, mouseY]);
        drawPath();
    }

    function dragEnd() {
        let xlist=[];
        let ylist=[];
        let selectedDots = [];
        lassocircles.each((d, i) => {
            let point = [ xScale(d[0]),yScale(d[1])];
            if (pointInPolygon(point, coords)) {
                d3.select("#dot-" + d[3]).attr("fill", "yellow");
                
                selectedDots.push(d[3]);
                xlist.push(d[0]);
                ylist.push(d[1]);
                LassoData.push([d[0],d[1]])
                HeatMapData.push([d[0],d[1],d[2],d[3]])
                console.log(`lasso selected point: ${[d[0],d[1]]}`);

            }
        });

        

        console.log(`lasso select index: ${selectedDots}`);
       
        let cc;
        let HeatFinal=[];
        let HeatPoint=[];

        for(let ii=0;xlist.length>ii;ii++){
          for(let i=0;history.length>i;i++){
            for(let j=0; history[i].length>j;j++){
              
              if((history[i][j][0]==xlist[ii])&&(history[i][j][1]==ylist[ii])){
                if(history[i][j][2]!=1){
                  cc=0
                }
                else(cc=history[i][j][2])
                HeatFinal.push([myGroups[i], myVars[ii] ,cc])}
            }
          }
          
          HeatPoint.push([xlist[ii],ylist[ii],myVars[ii]])

        }
        console.log("HeatFinal:",HeatFinal)
        HeatMap(HeatFinal,selectedDots.length,history.length)
        setheatData(prevState => ({
          ...prevState,
          data:  HeatPoint,
          
        }))
        
    }
    
    const drag = d3
        .drag()
        .on("start", dragStart)
        .on("drag", dragMove)
        .on("end", dragEnd);

    d3.select("#chart").call(drag); 
    svg.on('click', function(){
      
      svg4.selectAll("*").remove();
      
    }) 
  }
  
  //
} 

//Area Lasso End


//MAIN PLOT END

//Slider PLOT START
  const svg2 = d3.select(svgRef2.current).attr("width", w).attr("height", h);
  svg2.selectAll('circle')
  .data(sliderdata.sliderFullData)
  .enter()
    .append('circle')
    .attr('cx',d=>xScale(d[0]))
    .attr('cy',d=>yScale(d[1]))
    .attr('r',2)
    .attr('fill',d=>C(d[2].toString())) 
    .attr('opacity',"0.65");

  //exit
  svg2.selectAll('circle')
  .data(sliderdata.sliderFullData).exit().remove();

  //update
  svg2.selectAll('circle')
  .data(sliderdata.sliderFullData)
  .transition()
  .attr("fill",d=>C(d[2].toString()))
  .attr('cx',d=>xScale(d[0]))
  .attr('cy',d=>yScale(d[1]))
  .attr('r',2)
  .attr('opacity',"0.65");



  const SethandleClick=() => {
    //initializing deleting and adding points button
    lassoNum=0;
    IsDeleting=false;
    IsAdding=false;
    IsAdding2=false;
    IsDot=false;
    IsAreaLasso=false
    setincorrectNum(0)
    setdeleteNum(0)
    setaddNum(0)
    setaddNum2(0)
   
   
    setincorrectColor('black')
    setdeleteColor('black')
    setaddColor('black')
    setaddColor2('black')
  
    val = [];

    LassoData=[];
    HeatMapData=[];
    //

    axios.get('http://localhost:5000/BackendData')
    .then(res => {
        //divide data into variables 
        const FileName=res.data.FileName;
        let ColorData;
        if (FileName[0]==='arxiv_articles_UMAP.csv'){
          ColorData=[[-1],[-2],[-3],[2],[3],[4],[5],[6],[7],[8],[9],[10],[11],[12],[13],[1]]
        }
        else{
          ColorData=[[0],[1],[-1],[-2],[-3]]
        }
      console.log("ColorData:",ColorData.length,ColorData)
      
        const FullDATA = res.data.FullData;
        console.log("FullDATA:",FullDATA.length,FullDATA)


        history.push(FullDATA)
        const DATA = res.data.XYData;
        const last_index = res.data.last_index;
        //console.log("Last index :", last_index);

        const color_list=res.data.color_list;
        let out_indices = color_list.map((c,i)=>c===1?i:'').filter(String);
        let Outlier = DATA.filter((_, ind) => out_indices.includes(ind));
        let outlierCat=color_list.filter((_, ind) => out_indices.includes(ind));
        let in_indices = color_list.map((c,i)=>c!=1?i:'').filter(String);
        let Inlier=DATA.filter((_, ind) => in_indices.includes(ind));
        outlier=Outlier; 
        inlier=Inlier;
        out_indicesList=out_indices;
        in_indicesList=in_indices;
        let inlierCat=color_list.filter((_, ind) => in_indices.includes(ind));
        InlierCat=inlierCat
        console.log("inlierCat:",inlierCat)
        OutlierCat=outlierCat
        console.log("outlierCat:",outlierCat)

      setData(prevState => ({
        ...prevState,
        colorData:ColorData,
        FileName:FileName,
        FullData: FullDATA,
        DATA : DATA,
        last_index:last_index,
        Outlier :Outlier,
        out_indices:out_indices,
        Inlier :Inlier,
        in_indices:in_indices,
        inlierCat:inlierCat,
        outlierCat:outlierCat
     }))
  })
   }

   const changeWidth = (event) => {
    setWidth(event.target.value);
    
    
    const sliderFullDATA = history.slice(-1)[0]; 
    let startTest=0;
    let endTest=0;
    const sliderindexList=[...last_index]
    sliderindexList.push(data.FullData.length)
    
    if (sliderindexList.length<GlobalNumFrame){
      setsliderText(`${clicks+1} testing frame < ${GlobalNumFrame} Frames (${GlobalNumFrame-clicks-1} needed more)`)  
      setsliderText2(`${clicks+1} Frames: ${(event.target.value)* 1 + 1} out of ${clicks+1} `)
      
      setsliderInd(clicks+1)
      startTest=0
      endTest=sliderindexList[(event.target.value)* 1]
      
    }
    if (sliderindexList.length>=GlobalNumFrame){
      setsliderText(``)
      setsliderText2(`${GlobalNumFrame} Frames: ${(event.target.value)* 1 + 1} out of ${GlobalNumFrame} `)
      
      setsliderInd(GlobalNumFrame)
    
      startTest=sliderindexList[sliderindexList.length-GlobalNumFrame-1]
      endTest=sliderindexList[sliderindexList.length-GlobalNumFrame+(event.target.value)* 1]
    }
    console.log("startTest:",startTest)
    console.log("endTest:",endTest)
    slidersetData(prevState => ({
    ...prevState,
    sliderFullData: sliderFullDATA.slice(startTest,endTest),

  }))

  };

  const changeWidth1 = (event) => {
    setWidth1(event.target.value);
   
    console.log("click :",clicks)
    console.log("history :",history)
    console.log("(event.target.value)* 1-1:",(event.target.value)* 1-1) 
    console.log("history[event.target.value-1]",history[(event.target.value)* 1-1]);
    let FullData=[[]];
    if ((event.target.value)* 1!=0){
      FullData= history[(event.target.value)* 1-1]
      setsliderText1(event.target.value);
    }
    if ((event.target.value)* 1==0){
      console.log("Default")  
      FullData= ''
      setsliderText1("Default");
    }
      
    setsliderInd1(history.length);
    sethistoryData(prevState => ({
      ...prevState,
      FullData: FullData,

   }))
  };

  //History Slider PLOT START
  const svg3 = d3.select(svgRef3.current).attr("width", w).attr("height", h);
  
  svg3.selectAll('circle')
  .data(historydata.FullData)
  .enter()
    .append('circle')
    .attr('cx',d=>xScale(d[0]))
    .attr('cy',d=>yScale(d[1]))
    .attr('r',2)
    .attr('fill',d=>C(d[2].toString())) 
    .attr('opacity',"0.65");

  //exit
  svg3.selectAll('circle')
  .data(historydata.FullData).exit().remove();

  //update
  svg3.selectAll('circle')
  .data(historydata.FullData)
  .transition()
  .attr("fill",d=>C(d[2].toString()))
  .attr('cx',d=>xScale(d[0]))
  .attr('cy',d=>yScale(d[1]))
  .attr('r',2)
  .attr('opacity',"0.65");

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
 

//let cat_list=['astro-ph' ,'cond-mat', 'cs' ,'gr-qc', 'hep-ex', 'hep-lat', 'hep-ph', 'hep-th', 'math', 'other' ,'physics' ,'quant-ph']
//adding inlier points start
const AddingPoints=() => {
  if (data.FileName[0]==='arxiv_articles_UMAP.csv'){
    
    IsAdding=true;    
  
    if ((addNum+1)%2===1){  
      setaddColor("red")}
    else{setaddColor("black")}
    
    svg
      .on("click", function(event, d) {  
        if (((addNum+1)%2===1)&&(deleteNum%2===0)){  
            if (CatAddName=='astro-ph'){
              AddingPointsList.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),2,0])  
            }
            if (CatAddName=='cond-mat'){
              AddingPointsList.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),3,0])  
            }
            if (CatAddName=='cs'){
              AddingPointsList.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),4,0])  
            }
            if (CatAddName=='gr-qc'){
              AddingPointsList.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),5,0])  
            }
            if (CatAddName=='hep-ex'){
              AddingPointsList.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),6,0])  
            }
            if (CatAddName=='hep-lat'){
              AddingPointsList.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),7,0])  
            }
            if (CatAddName=='hep-ph'){
              AddingPointsList.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),8,0])  
            }
            if (CatAddName=='hep-th'){
              AddingPointsList.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),9,0])  
            }
            if (CatAddName=='math'){
              AddingPointsList.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),10,0])  
            }
            if (CatAddName=='other'){
              AddingPointsList.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),11,0])  
            }
            if (CatAddName=='physics'){
              AddingPointsList.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),12,0])  
            }
            if (CatAddName=='quant-ph'){
              AddingPointsList.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),13,0])  
            }
            
            let origin=data.FullData     
            origin.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),-1])
            
            setData(prevState => ({
              ...prevState,
              DATA: origin,
            }))
          }
          else{console.log("Adding inlier Turned Off")
          }    
      })
    console.log("INLIER Adding BUTTON_AddingPointsList :",AddingPointsList)
    setaddNum(addNum+1)

  }
  else{
    IsAdding=true;    
   
    if ((addNum+1)%2===1){  
      setaddColor("red")}
    else{setaddColor("black")}

    svg
      .on("click", function(event, d) {  
        if (((addNum+1)%2===1)&&(deleteNum%2===0)){  
            
            AddingPointsList.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),0])
            
            let origin=data.FullData     
            origin.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),-1])
            
            setData(prevState => ({
              ...prevState,
              DATA: origin,
            }))
          }
          else{console.log("Adding inlier Turned Off")
          }    
      })
    console.log("INLIER Adding BUTTON_AddingPointsList :",AddingPointsList)
    setaddNum(addNum+1)
  }
}
//adding points end


//adding outlier points start
const AddingPoints2=() => {
  if (data.FileName[0]==='arxiv_articles_UMAP.csv'){
    IsAdding2=true;   
    AddingPointsList2.push([-1,-1,-1,-1],[-1,-1,-1,-1]); 
    
    if ((addNum2+1)%2===1){  
      setaddColor2("red")}
    else{setaddColor2("black")}

    svg
      .on("click", function(event, d) {  
        if (((addNum2+1)%2===1)&&(deleteNum%2===0)){  
            
          if (CatAddName=='astro-ph'){
            AddingPointsList2.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),2,1])  
          }
          if (CatAddName=='cond-mat'){
            AddingPointsList2.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),3,1])  
          }
          if (CatAddName=='cs'){
            AddingPointsList2.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),4,1])  
          }
          if (CatAddName=='gr-qc'){
            AddingPointsList2.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),5,1])  
          }
          if (CatAddName=='hep-ex'){
            AddingPointsList2.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),6,1])  
          }
          if (CatAddName=='hep-lat'){
            AddingPointsList2.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),7,1])  
          }
          if (CatAddName=='hep-ph'){
            AddingPointsList.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),8,1])  
          }
          if (CatAddName=='hep-th'){
            AddingPointsList2.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),9,1])  
          }
          if (CatAddName=='math'){
            AddingPointsList.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),10,1])  
          }
          if (CatAddName=='other'){
            AddingPointsList2.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),11,1])  
          }
          if (CatAddName=='physics'){
            AddingPointsList2.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),12,1])  
          }
          if (CatAddName=='quant-ph'){
            AddingPointsList2.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),13,1])  
          }  
            
            let origin2=data.FullData     
            origin2.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),-2])
            
            setData(prevState => ({
              ...prevState,
              DATA: origin2,
            }))
          }

          else{
            
            console.log("Adding outlier Turned Off")
            
            }
      })
    console.log("OUTLIER Adding BUTTON_AddingPointsList2 :",AddingPointsList2)
    setaddNum2(addNum2+1)
  }
  else{
      IsAdding2=true;
      AddingPointsList2.push([-1,-1,-1],[-1,-1,-1]);    
    
    if ((addNum2+1)%2===1){  
      setaddColor2("red")}
    else{setaddColor2("black")}

    svg
      .on("click", function(event, d) {  
        if (((addNum2+1)%2===1)&&(deleteNum%2===0)){  
            
            AddingPointsList2.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),1])  
            
            let origin2=data.FullData     
            origin2.push([xSB(d3.pointer(event)[0]),ySB(d3.pointer(event)[1]),-2])
            
            setData(prevState => ({
              ...prevState,
              DATA: origin2,
            }))
          }

          else{
            
            console.log("Adding outlier Turned Off")
            
            }
      })
    console.log("OUTLIER Adding BUTTON_AddingPointsList2 :",AddingPointsList2)
    setaddNum2(addNum2+1)
  }
}
//adding points end


 //deleting points start
 const DeletingPoints=() => {
  IsDeleting=true
  if ((deleteNum+1)%2===1){  
    setdeleteColor("red")}
  else{setdeleteColor("black")}   
  

  if ((deleteNum+1)%2===1){
    
    Dataval
    .on('click', function(){
      d3.select(this)
      
      DeletingPointsList.push([xSB(this.cx["baseVal"]["value"]),ySB(this.cy["baseVal"]["value"])])  
      //console.log("Deleting BUTTON_DeletingPointsList :",DeletingPointsList)
      
      d3.select(this).attr('opacity', 0);
    })
   
  }
  setdeleteNum(deleteNum+1)
  console.log("deleting!!!!!",DeletingPointsList) 
}
//deleting points end


const outl = () => {
  console.log("new button :data.out_indices",data.out_indices)
  console.log("outlier :",outlier)
  //myFunction2(outlier,data.out_indices);
}
const CatAdd = (value) => {
  console.log(value);
  setCatAddName(value) 
};

return (
  <div style={{ margin: 10 ,width:"700",height:"600"}}>

    <Layout style={{ height:620 , backgroundColor:'white',borderColor: "black" }}>
      <Sider width={ "350"}  style={{backgroundColor:'OldLace',marginLeft: 10,marginRight: 20}}>  
        <p style={{fontWeight:'bold',fontSize: "16px",color: "DimGrey",marginLeft: 30,marginRight: 30}}>Outlier Detection and Monitoring<br></br> for Streaming data</p>
            <Content style={{ height:  "100%"}}>
            <Divider />

              <SliderOk/> 

              <Button size="small" shape="round" style={{ width:"200px",fontSize: "13px",color: "white", marginLeft: 30,  marginTop: 5 ,background: "black", borderColor: "black" }} onClick={SethandleClick}>Updating on Plot</Button>   
              
              </Content>
      </Sider>
      <Layout style={{ marginTop:5,marginLeft:20,backgroundColor:'White'}}>
          <Content style={{ width: 500}}  >
            <div className="container">
            <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll} >
                  Check All</Checkbox>
            <CheckboxGroup options={plainOptions} value={checkedList} onChange={onSingleChange}/>        
            </div>
          
          </Content>
          <Layout style={{backgroundColor:'White',width: 500,height: 500}}>
            <svg id="chart" ref={svgRef} />
          </Layout>
          
          <Layout style={{backgroundColor: "white"}}>
            <svg ref = {svgRef4} />
          </Layout>
  
      </Layout>
    <Sider width={"145"} style={{backgroundColor:'white',marginLeft: 10,marginRight: 30}}>  
     <p style={{fontWeight:'bold',fontSize: "14px",color: "DimGrey",marginLeft: 10,marginRight: 10}}>[  Tool Tips  ]</p>        
     <Button size="small" shape="round" style={{ width:"120px",fontSize: "13px",color: "white", marginLeft: 10,  marginRight: 10,marginTop: 5 ,background: "black", borderColor: "black" }} onClick={showDrawer}>
        Process 
      </Button>
      <Drawer title="Process of Test Data" size="large" placement="right" onClose={onClose} open={draweropen}>
        <h4>{sliderText2}</h4>
          <h4>{sliderText} </h4>
        <div className="slidecontainer">
        <input type='range'  className="slider" id="myRange" onChange={changeWidth}
          min={0} max={sliderInd-1} step={1} value={width} ></input>
          <svg ref={svgRef2} />
        </div>

      </Drawer>

      <Button size="small" shape="round" style={{ width:"120px",fontSize: "13px",color: "white", marginLeft: 10, marginRight: 10,  marginTop: 5 ,background: "black", borderColor: "black" }} onClick={showDrawer2}>
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
      
      <Button size="small" shape="round" style={{ width:"120px",fontSize: "13px",color: addColor, marginLeft: 10, marginRight: 10, marginTop: 5 ,background: "white", borderColor: "black" }} onClick={AddingPoints}>
      Adding Inlier
      </Button> 
      <Button size="small" shape="round" style={{ width:"120px",fontSize: "13px",color: addColor2, marginLeft: 10, marginRight: 10, marginTop: 5 ,background: "white", borderColor: "black" }} onClick={AddingPoints2}>
      Adding Outlier
      </Button>
      <Button size="small" shape="round" style={{ width:"120px",fontSize: "13px",color: deleteColor, marginLeft: 10, marginRight: 10, marginTop: 5 ,background: "white", borderColor: "black" }} onClick={DeletingPoints}>
      Deleting Points
      </Button> 
      <Button size="small" shape="round" style={{ width:"120px",fontSize: "13px",color: incorrectColor, marginLeft: 10, marginRight: 10,  marginTop: 5 ,background: "OldLace", borderColor: "black" }} onClick={DotClick}>
        Dot Selection</Button>
      <Button size="small" shape="round" style={{ width:"120px",fontSize: "13px",color: 'black', marginLeft: 10, marginRight: 10,  marginTop: 5 ,background: "OldLace", borderColor: "black" }} onClick={AreaLasso}>Area Selection</Button>
      <br></br>
     
      <p style={{fontWeight:'bold',fontSize: "13px",color: "DimGrey",marginLeft: 10,marginRight: 10}}>[ Category Options ]</p>     
      <Select
          defaultValue="astro-ph"
          style={{
            width: 110,fontSize: "11px",marginLeft: 10,marginRight: 10
          }}
          onChange={CatAdd}
          options={[
            {
              value: 'astro-ph',
              label: 'astro-ph',
            },
            {
              value: 'cond-mat',
              label: 'cond-mat',
            },
            {
              value: 'cs',
              label: 'cs',
            },
            {
              value: 'gr-qc',
              label: 'gr-qc',
            },
            {
              value: 'hep-ex',
              label: 'hep-ex',
            },
            {
              value: 'hep-lat',
              label: 'hep-lat',
            },
            {
              value: 'hep-ph',
              label: 'hep-ph',
            },
            {
              value: 'hep-th',
              label: 'hep-th',
            },
            {
              value: 'math',
              label: 'math',
            },
            {
              value: 'other',
              label: 'other',
            },
            {
              value: 'physics',
              label: 'physics',
            },
            {
              value: 'quant-ph',
              label: 'quant-ph',
            },
            
          ]}
        />
      <br></br>
      <br></br>
      <svg ref={svgRefL} />
    </Sider>
    
    </Layout>
    
  </div>
);
};

export default App;