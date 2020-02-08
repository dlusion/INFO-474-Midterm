// Set the margins for our graph as well as define the svg dimensions
var margin = { top: 10, right: 0, bottom: 40, left: 200 },
    width = 1500 - margin.left - margin.right,
    height = 750 - margin.top - margin.bottom;

// Create the svg within the DOM
let svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "svg")

// Create a div that will be used by the tooltips
let tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .attr('style', 'position: absolute; opacity: 0;');

// Function for making a graph - defines the axis, adds the circles that make up our scatterplot - all 
// according to the data that is passed in as a parameter.
makeGraph = function (data) {
    d3.selectAll("svg > *").remove(); // Clears the SVG element of a previous graph, if applicable 
    let types = ["Bug", "Dragon", "Electric", "Fairy", "Fighting", "Fire", "Ghost", "Grass", "Ground",
        "Ice", "Normal", "Poison", "Psychic", "Rock", "Water"]

    // Sets the colors that will be linked to each of the pokemon types 
    let color = d3.scaleOrdinal()
        .domain(types)
        .range(["#A8B820", "#7038F8", "#F8D030", "#EE99AC", "#C03028", "#F08030", "#705898", "#78C850",
            "#E0C068", "#98D8D8", "#A8A878", "#A040A0", "#F85888", "#B8A038", "#6890F0", "#705848",
            "#B8B8D0", "#A890F0"])

    // Finds the largest and smallest Sp. Def values within the dataset that is passed in and uses them
    // to scale the x-axis and x-values.
    let max = d3.max(data, function (d) { return d["Sp. Def"] });
    let min = d3.min(data, function (d) { return d["Sp. Def"] });
    let xScale = d3.scaleLinear()
        .domain([min - 10, (max + 10)])
        .range([margin.left, (width - 50)])


    // Appends our x-axis to the graph
    let xAxis = d3.axisBottom(xScale)
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis)
        .call(g => g.append("text") // Adds the x-axis label to the x-axis
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("x", (width + margin.left + margin.right) / 2)
            .attr("y", (40))
            .attr("fill", "black")
            .text("Sp. Def"));

    // Scales the y-axis
    max = d3.max(data, function (d) { return d["Total"]; })
    min = d3.min(data, function (d) { return d["Total"]; })
    let yScale = d3.scaleLinear()
        .domain([max + 30, min - 30])
        .range([(margin.top + margin.bottom), height])

    // Appends y-axis to the graph
    let yAxis = d3.axisLeft(yScale)
    svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(yAxis)
        .call(g => g.append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("x", -(height + margin.bottom + margin.top) / 2)
            .attr("y", -30)
            .attr("fill", "black")
            .attr("transform", "rotate(-90)")
            .text("Total"));

    // group that will contain all of the plots
    var groups = svg.append("g")

    // Creates the circles that represent our data in the scatterplot and appends them to the graph
    // also contains a mouseover event that will display the pokemons name and types when a user
    // hovers over a datapoint
    let circles = groups.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circles")
        .attr("cx", function (d) { return xScale(+d["Sp. Def"]); })
        .attr("cy", function (d) { return yScale(+d["Total"]); })
        .attr("r", 10)
        .attr("id", function (d) { return d.Name; })
        .style("fill", function (d) { return color(d["Type 1"]); })
        .style("stroke", "black")
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<p id='Name'>" + d.Name + "</p>" + "<p class='type'>" + d["Type 1"] + "</p>" + (d["Type 2"] ? ("<p class='type'>" + d["Type 2"] + "</p>") : ""))
                .style("left", (d3.event.pageX + 20) + "px")
                .style("top", (d3.event.pageY + 10) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    // Creates a legend that explains the graphs coloring and appends it to the graph
    let legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(125," + i * 25 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color)
        .style("stroke-width", 2)
        .style("stroke", "black");


    // draw legend text
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) { return d; })
}

// Loads the pokemon csv file and converts Sp. Def and Total to numeric values 
d3.csv("./pokemon.csv", (data) => {
    data.forEach(function (d) {
        d["Sp. Def"] = +d["Sp. Def"];
        d["Total"] = +d["Total"];
    });
    makeGraph(data) // makes our initial graph

    // Creates filters that allow users to refine the data used. 
    var generations = ["All", 1, 2, 3, 4, 5, 6]

    var legendary = ["All", "True", "False"]

    let legendFilter = d3.select("#filterLegendary")
        .append('select')

    legendFilter.selectAll('option')
        .data(legendary)
        .enter()
        .append('option')
        .attr('value', function (d) { return d })
        .html(function (d) { return d })

    legendFilter.on("change", function () {
        let tempData = data;
        if (genFilter._groups[0][0].value != "All") {
            tempData = tempData.filter(data => data["Generation"] == genFilter._groups[0][0].value);
        }
        if (this.value == "All") {
            makeGraph(tempData);
        } else {
            tempData = tempData.filter(data => data["Legendary"] == this.value);
            makeGraph(tempData);
        }
    })

    let genFilter = d3.select("#filterGen")
        .append('select');

    genFilter.selectAll('option')
        .data(generations)
        .enter()
        .append('option')
        .html(function (d) { return d })
        .attr('value', function (d) { return d })

    genFilter.on("change", function () {
        let tempData = data;
        if (legendFilter._groups[0][0].value != "All") {
            tempData = tempData.filter(data => data["Legendary"] == legendFilter._groups[0][0].value);
        }
        if (this.value == "All") {
            makeGraph(tempData);
        } else {
            tempData = tempData.filter(data => data["Generation"] == this.value);
            makeGraph(tempData);
        }
    })
});