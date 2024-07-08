import { useD3 } from './hooks/useD3';
import React from 'react';
import * as d3 from 'd3';

function LineBarChart({ data }) {
    const ref = useD3(
        (svg) => {
            const height = 490;
            const width = 1100;
            const margin = { top: 20, right: 30, bottom: 30, left: 40 };

            const line = d3
                .line()
                .x(d => x(d.year) + x.bandwidth() / 2)
                .y(d => y2(d.efficiency))

            const x = d3
                .scaleBand()
                .domain(data.map((d) => d.year))
                .rangeRound([margin.left, width - margin.right])
                .padding(0.1);

            const y1 = d3
                .scaleLinear()
                .domain([0, d3.max(data, (d) => d.sales)])
                .rangeRound([height - margin.bottom, margin.top]);

            const y2 = d3
                .scaleLinear()
                .domain([0, 100])
                .rangeRound([height - margin.bottom, margin.top])

            const xAxis = (g) =>
                g.attr("transform", `translate(0,${height - margin.bottom})`).call(
                    d3
                        .axisBottom(x)
                        .tickSizeOuter(0)
                );

            const y1Axis = (g) =>
                g
                    .attr("transform", `translate(${margin.left},0)`)
                    .style("color", "steelblue")
                    .call(d3.axisLeft(y1).ticks(null, "s"))
                    .call((g) =>
                        g
                            .append("text")
                            .attr("x", -margin.left)
                            .attr("y", 10)
                            .attr("fill", "currentColor")
                            .attr("text-anchor", "start")
                            .text(data.y1)
                    );

            const y2Axis = g => g
                .attr("transform", `translate(${width - margin.right},0)`)
                .call(d3.axisRight(y2))
                .call(g => g.append("text")
                    .attr("x", margin.right)
                    .attr("y", 10)
                    .attr("fill", "currentColor")
                    .attr("text-anchor", "end")
                    .text(data.y2))

            svg.append("g")
                .attr("fill", "red")
                .attr("fill-opacity", 0.6)
                .selectAll("rect")
                .data(data)
                .join("rect")
                .attr("x", d => x(d.year))
                .attr("width", x.bandwidth())
                .attr("y", d => y1(d.sales))
                .attr("height", d => y1(0) - y1(d.sales));

            svg.append("g")
                .attr("fill", "steelblue")
                .attr("fill-opacity", 1)
                .selectAll("rect")
                .data(data)
                .join("rect")
                .attr("x", d => x(d.year))
                .attr("width", x.bandwidth())
                .attr("y", d => y1(d.sales2))
                .attr("height", d => y1(0) - y1(d.sales2));

            svg.append("path")
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-miterlimit", 1)
                .attr("stroke-width", 3)
                .attr("d", line(data));

            svg.selectAll("svg")
                .data(data)
                .enter()
                .append("svg:text")
                .attr("x", d => x(d.year) + x.bandwidth() / 2)
                .attr("y", d => y2(d.efficiency))
                .attr("text-anchor", "middle")
                .attr("style", "font-size: 16; font-family: Helvetica, sans-serif; font-weight: bold")
                .text(function (d) { return d.efficiency.toFixed(2)+"%" })
                .attr("transform", "translate(0, 18)")
                .attr("class", "yAxis");
            
            svg.selectAll("svg")
                .data(data)
                .enter()
                .append("svg:text")
                .attr("x", d => x(d.year) + x.bandwidth() / 2)
                .attr("y", d => y1(d.sales) - 20)
                .attr("text-anchor", "middle")
                .attr("style", "font-size: 12; font-family: Helvetica, sans-serif; font-weight: bold")
                .text(function (d) { return (((d.sales)*100)/d.ptotal).toFixed(2) +"% , " + d.sales })
                .attr("transform", "translate(0, 18)")
                .attr("class", "yAxis");

            svg.append("g")
                .attr("fill", "none")
                .attr("pointer-events", "all")
                .selectAll("rect")
                .data(data)
                .join("rect")
                .attr("x", d => x(d.year))
                .attr("width", x.bandwidth())
                .attr("y", 0)
                .attr("height", height)
                .append("title")
                .text(d => `${d.year}`);

            svg.append("g")
                .call(xAxis);

            svg.append("g")
                .call(y1Axis);

            svg.append("g")
                .call(y2Axis);
        },
        [data.length]
    );

    return (
        <svg
            ref={ref}
            style={{
                height: "100%",
                width: "100%",
                marginRight: "0px",
                marginLeft: "0px",
            }}
        >
            <g className="plot-area" />
            <g className="x-axis" />
            <g className="y-axis" />
        </svg>
    );
}

export default LineBarChart;