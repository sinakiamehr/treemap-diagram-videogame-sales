import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [data, setData] = useState([])
  //useRef hook to store the svg element
  const svgRef = useRef()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json')
        const jsonData = await response.json()
        setData(jsonData)
      } catch (error) {
        console.error('Error fetching video game sale data:', error)
      }
    }

    fetchData()
  }, [])

  


  //useEffect hook to draw the svg
  useEffect(() => {
     if (data.length === 0) {
      return
    }

    //clear the previous svg
    d3.select(svgRef.current).selectAll('*').remove()

   //set the dimensions of the svg
    const width = 1000
    const height = 600
    const padding = 60

    //create the svg element
    const svg = d3.select(svgRef.current)
    .attr('width', width)
    .attr('height', height)

    //set the title of the svg
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', padding / 2)
      .attr('text-anchor', 'middle')
      .attr("id", "title")
      .attr('fill', 'white')
     .text('Title')

    //set the description of the svg
    svg.append('text')
     .attr('x', width / 2)
     .attr('y', padding / 2 + 20)
     .attr('text-anchor','middle')
     .attr("id", "description")
     .attr('fill', 'white')
     .text('Description')

     //create hierarchy of data
     const root = d3.hierarchy(data)
     .sum(d => d.value)
     .sort((a, b) => b.value - a.value)

     //create treemap layout
     const treemap = d3.treemap()
     .size([width - padding, height - padding])
    .padding(1)

     //generate treemap layout
     treemap(root);

     // Create color scale based on categories
     const categories = Array.from(new Set(root.leaves().map(d => d.data.category)))
     const colorScale = d3.scaleOrdinal()
       .domain(categories)
       .range(d3.schemeSet3)

     // Create tiles
     const cell = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`)

     // Add tooltip
     const tooltip = d3.select('body')
      .append('div')
      .attr('id', 'tooltip')
     .attr('class', 'tooltip')
     

     cell.append("rect")
      .attr("class", "tile")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => colorScale(d.data.category))
      .attr("data-name", d => d.data.name)
      .attr("data-category", d => d.data.category)
      .attr("data-value", d => d.data.value)
      .on("mouseover", (event, d) => {
      tooltip.transition()
       .duration(200)
       .style("opacity", 0.9)
      tooltip.html(`Name: ${d.data.name}<br/>Category: ${d.data.category}<br/>Value: ${d.data.value}`)
       .style("left", (event.pageX) + "px")
      .style("top", (event.pageY - 28) + "px")
      .attr("data-value", d.data.value)
     })
     .on("mouseout", () => {
      tooltip.transition()
      .duration(500)
      .style("opacity", 0)

     })

     cell.append("text")
      .attr("x", 5)
      .attr("y", 15)
      .text(d => d.data.name)
      .attr("fill", "black")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")

     // Create legend
     const legend = svg.append("g")
       .attr("id", "legend")
       .attr("transform", `translate(${width - 150}, ${padding})`)
       .selectAll(".legend")
       .data(categories)
       .enter()
       .append("g")
       .attr("class", "legend")
       .attr("transform", (d, i) => `translate(0, ${i * 20})`)

     legend.append("rect")
       .attr("class", "legend-item")
       .attr("width", 18)
       .attr("height", 18)
       .attr("fill", d => colorScale(d))

     legend.append("text")
       .attr("x", 24)
       .attr("y", 9)
       .attr("dy", "0.35em")
       .style("text-anchor", "start")
       .text(d => d)

    
    
  }, [data])
  return (
    <>
      <div className='main'>
        <header>
          <h1 id="title">Video Game Sales</h1>
          <h2 id="description">Top 100 Video Game sales</h2>
        </header>
        <div className='container'>
          <svg ref={svgRef}></svg>
        </div>
             
      </div>
    </>
  )
}

export default App
