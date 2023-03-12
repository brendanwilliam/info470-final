/*
 * Date: January 31, 2023
 * Author: Brendan Keane
 * Purpose: Lab 4, INFO 474
 */

// **** Example of how to create padding and spacing for trellis plot****
var svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object
// This will space out the trellis subplots
var padding = {t: 20, r: 20, b: 60, l: 60};

// Compute the dimensions of the trellis plots, assuming a 2x2 layout matrix.
trellisWidth = svgWidth / 2 - padding.l - padding.r;
trellisHeight = svgHeight / 2 - padding.t - padding.b;

// As an example for how to layout elements with our variables
// Lets create .background rects for the trellis plots
svg.selectAll('.background')
    .data(['A', 'B', 'C', 'C']) // dummy data
    .enter()
    .append('rect') // Append 4 rectangles
    .attr('class', 'background')
    .attr('width', trellisWidth) // Use our trellis dimensions
    .attr('height', trellisHeight)
    .attr('transform', function(d, i) {
        // Position based on the matrix array indices.
        // i = 1 for column 1, row 0)
        var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
        var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
        return 'translate('+[tx, ty]+')';
    });

var parseDate = d3.timeParse('%b %Y');
// To speed things up, we have already computed the domains for your scales
var dateDomain = [new Date(2000, 0), new Date(2010, 2)];
var priceDomain = [0, 223.02];

// **** How to properly load data ****

d3.csv('stock_prices.csv').then(function(dataset) {

    // 1.2 Parse the dates
    dataset.forEach(function(d){
        d.date = parseDate(d.date);
    });

    // 1.3 Nest the loaded dataset
    var nested = d3.nest()
        .key(function(c){
            return c.company
        })
        .entries(dataset);

    console.log(nested);

    // 2.2 Create scales for our line charts
    var xScale = d3.scaleTime().domain(dateDomain).range([0, trellisWidth]);
    var yScale = d3.scaleLinear().domain(priceDomain).range([trellisHeight, 0]);

    // 2.5 Add color
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(nested.map(function(d){
        return d.key;
    }));

    // 2.4 Create axes for each subplot
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // 2.3 Create the line chart
    var lineInterpolate = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.price); });

    // 2.1 Append trellis groupings
    var trellisG = svg.selectAll('trellis')
        .data(nested)
        .enter()
        .append('g')
        .attr('class', 'trellis')
        .attr('transform', function(d, i) {
            var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
            var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
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

    // 2.1.1 Append path to trellis groupings and add line chart
    trellisG.append('path')
        .attr('class', 'line-plot')
        .attr('d', function(d){
            return lineInterpolate(d.values);
        })
        .style('stroke', function(d){
            return colorScale(d.key);
        });

    // 2.1.2 Append axes to each subplot
    trellisG.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + trellisHeight + ')')
        .call(xAxis);

    trellisG.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);

    // 3.1 Append company labels
    trellisG.append('text')
        .attr('class', 'company-label')
        .text(function(d){
            return d.key;
        })
        .style('fill', function(d){
            return colorScale(d.key);
        })
        .attr('transform', 'translate(' + (trellisWidth / 2) + ', ' + (trellisHeight / 2) + ')');

    // 3.2 Append axes labels
    trellisG.append('text')
        .attr('class', 'axis-label')
        .text('Date (by Month)')
        .attr('transform', 'translate(' + (trellisWidth / 2) + ', ' + (trellisHeight + 34) + ')');

    trellisG.append('text')
        .attr('class', 'axis-label')
        .text('Stock Price (USD)')
        .attr('transform', 'translate(' + (-30) + ', ' + (trellisHeight / 2) + ') rotate(-90)');

});

// Remember code outside of the data callback function will run before the data loads