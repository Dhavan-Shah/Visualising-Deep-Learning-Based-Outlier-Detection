import {useRef, useState} from 'react';
import axios from 'axios';
import * as d3 from 'd3';

import * as React from "react";
import "./styles.css";
import { Formik, Field, Form } from "formik";
import styled from "styled-components";

import ControlPanel, {Button,Select,Text,Color,Range} from "react-control-panel";


const InputGroup = styled.div`
  text-align: left;
  display: inline-block;
  margin: 0 16px;
  label {
    display: block;
    text-align: left;
  }
`;

const Input = styled(Field)`
  display: block;
`;


var qs = require('qs');

const App = () => {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState('');
  const svgRef = useRef();
//
const initial = [
  {
    collectionId: 0,
    collectionFields: {
      column: "",
      row: "",
      index: ""
    }
  }
];
const [fields, setFields] = useState(initial);
const getForm = () => {
  const allFields = fields.map(({ collectionId, collectionFields }) =>
    Object.keys(collectionFields).map(input => (
      <InputGroup>
        <label htmlFor={input}>{input}</label>
        <Input
          id={`${collectionId}-${input}`}
          name={input}
          data-id={`${collectionId}`}
        />
      </InputGroup>
    ))
  );
  return Array.from(allFields);
};
const handleUpdate = e => {
  // const id = e.target["data-collection-id"];
  console.log(e.target.value);
  console.log(e.target.id);
  console.log(e.target.dataId);
};



const initialState = {
  "range slider": 100,
  selection: "option 1",
};

const DemoPanel = () => (
  <ControlPanel
    theme="dark"
    title="Outlier Detection and Monitoring for Streaming Data"
    position="top-right"
    initialState={initialState}
    onChange={console.log}
    width={300}
    style={{ marginRight: 10}}
  >
    <Range label="Smpling Size" min={0} max={1000} stepped={10} />
    <Range label="Opacity" min={0} max={1} stepped={0.05} />
    <Select label="Selection" options={{ "Deep iForest": 1, "pyod": 2 }} />
    <Button label="Setting Plot" action={SethandleClick}/>
    <Button label="Updating Data" action={PosthandleClick} />
    
    {/* <Custom
      Comp={({ value, onChange, theme }) => (
        <MyCustomComponent value={value} onChange={onChange} theme={theme} />
      )}
    /> */}
  </ControlPanel>
);
//
const SethandleClick= async () => {
  try {
  const data = await axios.get('http://localhost:5000/BackendData')
  .then(res => {
    
    const DATA = res.data.XYData;
    //console.log(DATA);
    const color_list=res.data.color_list;
    //console.log(color_list);

    const out_indices = color_list.map((c,i)=>c===1?i:'').filter(String);
    const outlier = DATA.filter((_, ind) => out_indices.includes(ind));
    const in_indices = color_list.map((c,i)=>c===0?i:'').filter(String);
    const inlier=DATA.filter((_, ind) => in_indices.includes(ind));
    
    // Set up chart
    const w=700;
    const h=400;
    const svg = d3.select(svgRef.current)
            .attr('width', w)
            .attr('height', h)
            .style('overflow','visible')
            .style('margin-top','100px');
    // x axis scale
    const xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0,w]);

    // y axis scale
    const yScale = d3.scaleLinear()
    .domain([0,10])
    .range([h,0])

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

    })
  } catch (e) {
    console.error('DATA ERROR:', e);
  }
};
  const PosthandleClick = async () => {
    const newdata={XYData:'[[4,4],[10,5]]',color_list:'[1,0]',n:'100'};
    let data = qs.stringify(newdata)
    console.log("data!!:",qs.parse(data))
    axios.post(`http://localhost:5000/BackendData`,data,
    {
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    
  };

  return (
    
    <div>
      <DemoPanel />
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default App;
