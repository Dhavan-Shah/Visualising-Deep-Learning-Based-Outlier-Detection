import  React,{useState, useRef,useEffect} from 'react';
import * as d3 from 'd3';
import './App.css';


function App(){
  const svgRef = useRef();
  const [data, setData]=useState([{}]);
  useEffect(()=>{
    fetch("/members").then(
      res=>res.json()
    ).then(
      data=>{
        setData(data)
        //divide data into variables
        const color_list = data.y_train;
        const out_indices = color_list.map((c,i)=>c===1?i:'').filter(String);
        const outlier = data.X_train.filter((_, ind) => out_indices.includes(ind));
        const in_indices = color_list.map((c,i)=>c===0?i:'').filter(String);
        const inlier=data.X_train.filter((_, ind) => in_indices.includes(ind));
        
        //console.log('outlier',outlier);
        //console.log('inlier',inlier);

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
          //.data(data['X_train']).enter()
          .data(outlier).enter()
          .append('circle')
            .attr('cx',d=>xScale(d[0]))
            .attr('cy',d=>yScale(d[1]))
            .attr('fill','red')
            .attr('r',2);
        

        svg.selectAll()
          //.data(data['X_train']).enter()
          .data(inlier).enter()
          .append('circle')
            .attr('cx',d=>xScale(d[0]))
            .attr('cy',d=>yScale(d[1]))
            .attr('fill','green')
            .attr('r',2);
      }
    )
  },[])
  return (
    <div className='App'>
      <svg ref={svgRef}></svg>

    </div>
  )
}

export default App;
