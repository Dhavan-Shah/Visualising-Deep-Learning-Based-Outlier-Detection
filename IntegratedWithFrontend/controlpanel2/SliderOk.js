import React from "react";
import Slider, { createSliderWithTooltip } from "rc-slider";
import "rc-slider/assets/index.css";
import axios from 'axios';
import {  Button } from 'antd';

var qs = require('qs');

var val = [];
var out_indices = [];
var outlier = [];
var in_indices = [];
var inlier=[];

class SliderOk extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 500
    };
    this.handleClick = this.handleClick.bind(this);
  }


  onSliderChange = value => {
    this.setState(
      {
        value
      },
      () => {
        var SliderValue=this.state.value     
        console.log("Slider value: ",SliderValue);
      }     
    );
    
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
    const newdata={XYData:qs.stringify(miscal),color_list:'[1,0]',n:this.state.value.toString(),Total:'100',NumberofData:'100'};
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
        <p style={{fontSize: "12px",color:"grey"}}>Frame Size : {this.state.value}</p>
        <Slider 
          min={0}
          max={1000}
          value={this.state.value}
          onChange={this.onSliderChange}
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

export default SliderOk;
