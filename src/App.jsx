import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import './App.css'

function App() {
  const [data, setData] = useState([])
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

  useEffect(() => {
    if (data.length === 0) return

    d3.select(svgRef.current).selectAll('*').remove()

    const width = 1200
    const height = 900
    const padding = 60

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', padding / 2)
      .attr('text-anchor', 'middle')
      .attr("id", "title")
      .attr('fill', 'white')
      .text('Video Game Sales')

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', padding / 2 + 20)
      .attr('text-anchor', 'middle')
      .attr("id", "description")
      .attr('fill', 'white')
      .text('Top 100 Video Game Sales by Platform')

    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value)

    const treemap = d3.treemap()
      .size([width - padding, height - padding])
      .padding(1)

    treemap(root)

    const categories = Array.from(new Set(root.leaves().map(d => d.data.category)))
    const colorScale = d3.scaleOrdinal()
      .domain(categories)
      .range(d3.schemeSet3)

    const tooltip = d3.select('#tooltip')

    const cell = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`)

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
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px")
          .attr("data-value", d.data.value)
      })
      .on("mouseout", () => {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0)
      })

    cell.append('text')
      .selectAll('tspan')
      .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter()
      .append('tspan')
      .attr('font-size', '11px')
      .attr('x', 4)
      .attr('y', (d, i) => 13 + 10 * i)
      .text(d => d)

    const legend = svg.append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${width - padding * 10}, ${height - padding})`)
      .selectAll(".legend")
      .data(categories)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => {
        const itemsPerColumn = Math.ceil(categories.length / 6);
        const column = Math.floor(i / itemsPerColumn);
        const row = i % itemsPerColumn;
        return `translate(${column * 80}, ${row * 20})`;
      })

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
          <div id="tooltip" className="tooltip"></div> {/* Tooltip in DOM */}
        </div>
        <footer>
          <p>Coded and Designed by <strong>Sina Kiamehr</strong></p>
        </footer>
      </div>
    </>
  )
}

export default App

