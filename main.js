var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 70, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

// var parseDate = d3.timeParse("%Y %b %d");

var x = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory20);

var stack = d3.stack();


var area = d3.area()
    .x(function(d) { return x(d.data.id); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); });



var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).ticks(10, "%"))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -70)
    .attr("y", -40)
    .attr("dy", "0.3408em")
    .attr("fill", "#000")
    .text("Percentage of Parking Spots")
    .style("font-weight", "bold");

svg.append("text")
    .attr("x", 0)
    .attr("y", -40)
    .attr("dy", "0.71em")
    .attr("fill", "#000")
    .text("Parking spots, filled and empty in london")
    .style("font", "23px avenir")
    .style("fill", "#000000");
var a = ["Spots Filled", "Spots Empty"];
var color = ["#2077b4", "#aec7e8"];

var legend = svg.append("g")
    .attr("transform", "translate(" + (width-10) + "," + (0) + ")");
a.forEach(function(st,i){
    let legendRow = legend.append("g")
        .attr("transform", "translate(0," + (i*20) +")");
    legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", color[i] );

    legendRow.append("text")
        .attr("x", -10)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .style("text-transform", "capitalize")
        .text(st);

})

d3.json("https://api.tfl.gov.uk/Occupancy/CarPark?app_key=41fc7267f724ef213398d52ef5caaf61&app_id=04612f9d", function(error, data) {
    if (error) throw error;
    var keys = ["occupied", "free"];

    let filteredData = [];
    let id = 0;
    let maxTotal = 0;
    data.forEach(function(d){
        let occupied = 0;
        let free = 0;
        let total = 0;
        d.bays.forEach(function(bay){
            occupied += bay.occupied;
            free += bay.free;
            total += bay.bayCount;
            if (total > maxTotal) maxTotal = total;
        });
        filteredData.push({
            occupied,
            free,
            total,
            id : id++,
            name: d.name
        });
    });
    data = filteredData;
    x.domain(d3.extent(data, function(d) { return d.id; }));
    y.domain([0,maxTotal]);
    z.domain(keys);
    stack.keys(keys);
    var layer = g.selectAll(".layer")
        .data(stack(data))
        .enter().append("g")
        .attr("class", "layer");


    layer.append("path")
        .attr("class", "area")
        .style("fill", function(d) { return z(d.key); })
        .attr("d", area);



    // Only label the layers left at the end (if one browser disappears)
    layer.filter(function(d) { return d[d.length - 1][1] - d[d.length - 1][0] > 0.01; })
        .append("text")
        .attr("x", width - 6)
        .attr("y", function(d) { return y((d[d.length - 1][0] + d[d.length - 1][1]) / 2); })
        .attr("dy", ".35em")
        .style("font", "10px sans-serif")
        .style("text-anchor", "end")
        .text(function(d) { return d.key; });

    // var legend = svg.selectAll(".legend")
    //     .data(z.domain()).enter()
    //     .append("g")
    //     .attr("class","legend")
    //     .attr("transform", "translate(" + (width +20) + "," + 0+ ")");

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .append("text")
        .attr("x", 350)
        .attr("y", 36)
        .attr("fill", "#000")
        .text("Bay")
        .style("font-weight", "bold");




});
