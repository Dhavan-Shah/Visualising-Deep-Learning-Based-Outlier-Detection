import {useRef, useState} from 'react';
import axios from 'axios';
import * as d3 from 'd3';
var qs = require('qs');


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
      const DATA = res.data.XYData;
      //console.log(DATA);
      const color_list=res.data.color_list;
      //console.log(color_list);

      const out_indices = color_list.map((c,i)=>c===1?i:'').filter(String);
      const outlier = DATA.filter((_, ind) => out_indices.includes(ind));
      const in_indices = color_list.map((c,i)=>c===0?i:'').filter(String);
      const inlier=DATA.filter((_, ind) => in_indices.includes(ind));
      
      // Set up chart
      const w=400;
      const h=300;
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
      {err && <h2>{err}</h2>}
      <button onClick={SethandleClick}>Set</button>
      <button onClick={PosthandleClick}>Post</button>

{/*       {isLoading && <h2>Loading...</h2>}

      {data && (
        <div>
          <h2>XYData: {data.XYData}</h2>
          <h2>color_list: {data.color_list}</h2>
        </div>
      )} */}
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default App;
