/*
 * Date: March 12, 2023
 * Author: Brendan Keane
 * Purpose: Final Project, INFO 474
 */

// **** Example of how to create padding and spacing for trellis plot****
var svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object
// This will space out the trellis subplots
var padding = {t: 20, r: 20, b: 40, l: 20};
var axesPadding = {t: 40, l:40}

// Compute the dimensions of the trellis plots, assuming a 2x2 layout matrix.
trellisWidth = svgWidth / 3 - padding.l - padding.r - axesPadding.l/2;
trellisHeight = trellisWidth;

// Labels for each axis
svg.append('text')
    .attr('class', 'title')
    .attr('transform','translate(' + (trellisWidth/2 + padding.l * 2 + axesPadding.l) + ',' + (axesPadding.t) + ')')
    .text('Difference from Average Min (°F)');

svg.append('text')
    .attr('class', 'title')
    .attr('transform','translate(' + axesPadding.l + ', ' + (trellisWidth/2 + padding.t + axesPadding.t) + ') rotate(-90)')
    .text('Difference from Average Max (°F)');

var minDiffDomain = [-30, 30];
var maxDiffDomain = [-30, 30];
var ticksMain = [-30, -20, -10, 10, 20, 30];
var ticksPlot = [-30, -20, -10, 0, 10, 20, 30];
var ticksAxes = []

// X&Y Scales
var xScale = d3.scaleLinear().domain(minDiffDomain).range([0, trellisWidth]);
var yScale = d3.scaleLinear().domain(maxDiffDomain).range([trellisHeight, 0]);

// On-plot axes
var xAxis = d3.axisBottom(xScale)
    .tickSize(0)
    .tickValues(ticksAxes);
var yAxis = d3.axisLeft(yScale)
    .tickSize(0)
    .tickValues(ticksAxes);

var xVals = d3.axisBottom(xScale)
    .tickValues(ticksPlot);

var yVals = d3.axisLeft(yScale)
    .tickValues(ticksPlot);

// **** How to properly load data ****

// Date format
var dateFormat = "%Y-%-m-%-d";
var dateText = "%b %d, %Y";


// Date parser
var parseDate = d3.timeParse(dateFormat);

var tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 1);

d3.csv('ALL_CITIES.csv').then(function(dataset) {
    // Parsing date
    dataset.forEach(function(d){
        d.date = parseDate(d.date);
    });

    // Nesting city name in data
    var nested = d3.nest()
        .key(function(c){
            return c.city
        })
        .entries(dataset);

    // Trellis groupings by city
    var trellisG = svg.selectAll('trellis')
        .data(nested)
        .enter()
        .append('g')
        .attr('class', 'trellis')
        .attr('transform', function(d, i) {
            var tx = (i % 3) * (trellisWidth + padding.l + padding.r) + padding.l + axesPadding.l * 1.5;
            var ty = Math.floor(i / 3) * (trellisHeight + padding.t + padding.b) + padding.t + axesPadding.t;
            return 'translate('+[tx, ty]+')';
        });

    trellisG.append('g')
        .attr('class', 'x-vals')
        .attr('transform', 'translate(0,' + trellisHeight + ')')
        .call(xVals)

    trellisG.append('g')
        .attr('class', 'y-vals')
        .call(yVals);

    // Background grid
    var xGrid = d3.axisTop(xScale)
        .tickSize(-trellisHeight, 0, 0)
        .tickValues(ticksPlot)
        .tickFormat('');

    var yGrid = d3.axisLeft(yScale)
        .tickSize(-trellisWidth, 0, 0)
        .tickValues(ticksPlot)
        .tickFormat('');

    trellisG.append('g')
        .attr('class', 'x grid')
        .call(xGrid);
    trellisG.append('g')
        .attr('class', 'y grid')
        .call(yGrid);

    // Axes for each plot
    trellisG.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + trellisHeight/2 + ')')
        .call(xAxis);

    trellisG.append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(' + trellisWidth/2 + ', 0)')
        .call(yAxis);

    trellisG.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'translate(' + (trellisWidth - 15) + ',' + (trellisHeight/2 + 15) + ')')
        .text('Δ MIN');

    trellisG.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'translate(' + (trellisWidth/2 - 20) + ', ' +  (15) + ')')
        .text('Δ MAX');

    // City labels
    trellisG.append('text')
        .attr('class', 'city-label')
        .text(function(d){
            return d.key;
        })
        .attr('transform', 'translate(' + (8) + ', ' + (24) + ')');

    trellisG.selectAll('circle')
        .data(function(d) {return d.values; })
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', function(d) { return xScale(d.difference_min_temp); })
        .attr('cy', function(d) { return yScale(d.difference_max_temp); })
        .attr('r', 3)
        .on("mouseover", function(d) {
            // Get the mouse position
            var mouseX = d3.event.pageX;
            var mouseY = d3.event.pageY;
            // Create the tooltip text
            var formattedDate = d3.timeFormat(dateText)(d.date);
            // Create the tooltip text
            var tooltipText = "Date: " + formattedDate + "<br>" + "High: " +
                d.actual_max_temp + " °F" + "<br>" + "Low: " + d.actual_min_temp +
                " °F" + "<br>";
            // Show the tooltip and adjust its position
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);

        tooltip.html(tooltipText)
            .style("left", (mouseX + 10) + "px")
            .style("top", (mouseY - 28) + "px");
          })
          // Add a mouseout event to remove the tooltip
          .on("mouseout", function(d) {
            // Remove the tooltip from the SVG
            svg.select("#tooltip").remove();
          });
});