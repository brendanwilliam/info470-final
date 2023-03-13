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
var padding = {t: 20, r: 10, b: 30, l: 30};

// Compute the dimensions of the trellis plots, assuming a 2x2 layout matrix.
trellisWidth = svgWidth / 5 - padding.l - padding.r;
trellisHeight = trellisWidth;

// As an example for how to layout elements with our variables
// Lets create .background rects for the trellis plots
svg.selectAll('.background')
    .data(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']) // dummy data
    .enter()
    .append('rect') // Append 4 rectangles
    .attr('class', 'background')
    .attr('width', trellisWidth) // Use our trellis dimensions
    .attr('height', trellisHeight)
    .attr('transform', function(d, i) {
        // Position based on the matrix array indices.
        // i = 1 for column 1, row 0)
        var tx = (i % 5) * (trellisWidth + padding.l + padding.r) + padding.l;
        var ty = Math.floor(i / 5) * (trellisHeight + padding.t + padding.b) + padding.t;
        return 'translate('+[tx, ty]+')';
    });

var parseDate = d3.timeParse('%b %Y');
var minDiffDomain = [-35, 35];
var maxDiffDomain = [-35, 35];
var ticks = [-30, -20, -10, 10, 20, 30];

// **** How to properly load data ****

d3.csv('ALL_CITIES.csv').then(function(dataset) {

    // 1.2 Parse the dates
    dataset.forEach(function(d){
        d.date = parseDate(d.date);
    });

    // 1.3 Nest the loaded dataset
    var nested = d3.nest()
        .key(function(c){
            return c.city
        })
        .entries(dataset);

    console.log(nested);

    // 2.2 Create scales for our line charts
    var xScale = d3.scaleLinear().domain(minDiffDomain).range([0, trellisWidth]);
    var yScale = d3.scaleLinear().domain(maxDiffDomain).range([trellisHeight, 0]);

    // 2.4 Create axes for each subplot
    var xAxis = d3.axisBottom(xScale)
        .tickValues(ticks);
    var yAxis = d3.axisLeft(yScale)
        .tickValues(ticks);

    // 2.1 Append trellis groupings
    var trellisG = svg.selectAll('trellis')
        .data(nested)
        .enter()
        .append('g')
        .attr('class', 'trellis')
        .attr('transform', function(d, i) {
            var tx = (i % 5) * (trellisWidth + padding.l + padding.r) + padding.l;
            var ty = Math.floor(i / 5) * (trellisHeight + padding.t + padding.b) + padding.t;
            return 'translate('+[tx, ty]+')';
        });

    // 3.3 Add grids
    var xGrid = d3.axisTop(xScale)
        .tickSize(-trellisHeight, 0, 0)
        .tickFormat('');

    var yGrid = d3.axisLeft(yScale)
        .tickSize(-trellisWidth, 0, 0)
        .tickFormat('');

    trellisG.append('g')
        .attr('class', 'x grid')
        .call(xGrid);
    trellisG.append('g')
        .attr('class', 'y grid')
        .call(yGrid);

    // 2.1.2 Append axes to each subplot
    trellisG.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + trellisHeight/2 + ')')
        .call(xAxis);

    trellisG.append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(' + trellisWidth/2 + ', 0)')
        .call(yAxis);

    // 3.1 Append company labels
    trellisG.append('text')
        .attr('class', 'city-label')
        .text(function(d){
            return d.key;
        })
        .attr('transform', 'translate(' + (trellisWidth / 2) + ', ' + (trellisHeight + 20) + ')');

    trellisG.selectAll('circle')
        .data(function(d) {return d.values; })
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', function(d) { return xScale(d.difference_min_temp); })
        .attr('cy', function(d) { return yScale(d.difference_max_temp); })
        .attr('r', 2);
});

// Remember code outside of the data callback function will run before the data loads