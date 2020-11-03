/**
 * Constructor for the BookSpectrum
 */
function BookSpectrum(storyMap, complexityMap, wordinessMap, bookDiagram){
    let self = this;
    self.storyMap  = storyMap;
    self.complexityMap = complexityMap;
    self.wordinessMap = wordinessMap;
    self.bookDiagram = bookDiagram;

    self.init();
};

/**
 * Initializes the svg elements required for book spectrum
 */
BookSpectrum.prototype.init = function(){
    let self = this;
    self.margin = {top: 20, right: 20, bottom: 30, left: 20};

    //Gets access to the div element created for this chart from HTML
    let divBookSpectrum = d3.select("#book-spectrum");
    self.svgBounds = divBookSpectrum.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 280 - self.margin.bottom - self.margin.top;

    //Creates svg element within the div
    self.svg = divBookSpectrum.append("svg")
        .attr("width",self.svgWidth + self.margin.left + self.margin.right)
        .attr("height",self.svgHeight + self.margin.bottom + self.margin.top)
        .append("g")
        .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

    // Wrangles the necessary data
    let dataset = [];
    self.complexityMap.forEach(function(value, key) {
        dataset.push({title: key, complexity: value, wordiness: self.wordinessMap.get(key)});
    });

    // Sets up bounds for spectrum visualization
    const graphSideMargin = 50;
    const graphLength = self.svgWidth-(2*graphSideMargin);

    // Sets up scales for wordiness and complexity
    const wordinessScale = d3.scaleLinear()
        .domain([0, d3.max(self.wordinessMap.values())])
        .range([0, graphLength]);    
    const complexityScale = d3.scaleLinear()
        .domain([0, d3.max(self.complexityMap.values())])
        .range([0, graphLength]);

    // Creates axes
    const cAxis = d3.axisBottom().scale(complexityScale);
    const wAxis = d3.axisBottom().scale(wordinessScale);

    // Draws wordiness axis with label
    self.svg.append("g")
        .attr("class", "axis")
        .attr("id", "w-axis")
        .attr("transform", "translate(" + graphSideMargin + ", 75)")
        .call(wAxis);
    self.svg.append("text")
        .attr("class", "text axis-label")
        .attr("x", graphSideMargin+graphLength)
        .attr("y", 110)
        .text("Wordiness");

    // Draws word complexity axis with label
    self.svg.append("g")
        .attr("class", "axis")
        .attr("id", "c-axis")
        .attr("transform", "translate(" + graphSideMargin + ", 200)")
        .call(cAxis);
    self.svg.append("text")
        .attr("class", "text axis-label")
        .attr("x", graphSideMargin+graphLength)
        .attr("y", 235)
        .text("Complexity");

    // Creates groups for all points and their connecting lines
    self.svg.append("g")
        .attr("transform", "translate(" + graphSideMargin + ", 75)")
        .attr("id", "w-points");
    self.svg.append("g")
        .attr("transform", "translate(" + graphSideMargin + ", 200)")
        .attr("id", "c-points");
    self.svg.append("g")
        .attr("transform", "translate(" + graphSideMargin + ", 75)")
        .attr("id", "spectrum-lines");

    // Creates scales for getting complexity color and class name
    const getColor = d3.scaleQuantile()
        .domain([d3.min(self.complexityMap.values()), d3.max(self.complexityMap.values())])
        .range(["#6eb560", "#faf887", "#eb4034"]);
    const getRank = d3.scaleQuantile()
        .domain([d3.min(self.complexityMap.values()), d3.max(self.complexityMap.values())])
        .range(["easy", "medium", "hard"]);

    // Creates placeholders for title display tooltips
    self.svg.append("text")
        .attr("class", "text tip")
        .attr("x", 0)
        .attr("y", 57)
        .text("");
    let tempTip = self.svg.append("text")
        .attr("class", "text tip")
        .attr("x", 0)
        .attr("y", 40)
        .text("");

    // Draws all wordiness data points, changes diagram display on click, and displays title tooltip on hover
    let wPoints = self.svg.select("#w-points").selectAll("circle").data(dataset);
    wPoints.enter()
        .append("circle")
        .attr("class", function(d) {
            return d.title.replace(/\W/g, '') + " " + getRank(d.complexity);
        })
        .attr("cx", function(d) {
            return wordinessScale(d.wordiness);
        })
        .attr("cy", 0)
        .attr("r", 5)
        .style("fill", function(d) {
            return getColor(d.complexity);
        })
        .on("mouseover", function(event, d) {
            if(!this.classList.contains("clicked")) {
                const titleClass = "." + d.title.replace(/\W/g, '');
                self.svg.selectAll(titleClass)
                    .style("fill", "#DAA520")
                    .attr("r", 10)
                    .style("stroke", "#DAA520")
                    .attr("stroke-width", 3);
                tempTip
                    .attr("x", wordinessScale(d.wordiness)+graphSideMargin)
                    .text(d.title);
            }
        })
        .on("mouseout", function(event, d) {
            if(!this.classList.contains("clicked")) {
                const titleClass = "." + d.title.replace(/\W/g, '');
                self.svg.selectAll(titleClass)
                    .style("fill", getColor(d.complexity))
                    .attr("r", 5)
                    .style("stroke", getColor(d.complexity))
                    .attr("stroke-width", 1);
                tempTip.text("");
            }
        })
        .on("click", function(event, d) {
            tempTip.text("");     
            d3.select(this).classed("clicked", true);
            self.bookDiagram.update(self.storyMap.get(d.title), self.complexityMap, self.wordinessMap, self.wordMap);
            self.update(self.storyMap.get(d.title));
        });

    // Draws all complexity data points, changes diagram display on click, and displays title tooltip on hover
    let cPoints = self.svg.select("#c-points").selectAll("circle").data(dataset);
    cPoints.enter()
        .append("circle")
        .attr("class", function(d) {
            return d.title.replace(/\W/g, '') + " " + getRank(d.complexity);
        })
        .attr("cx", function(d) {
            return complexityScale(d.complexity);
        })
        .attr("cy", 0)
        .attr("r", 5)
        .style("fill", function(d) {
            return getColor(d.complexity);
        })
        .on("mouseover", function(event, d) {
            if(!this.classList.contains("clicked")) {
                const titleClass = "." + d.title.replace(/\W/g, '');
                self.svg.selectAll(titleClass)
                    .style("fill", "#DAA520")
                    .attr("r", 10)
                    .style("stroke", "#DAA520")
                    .attr("stroke-width", 3);
                tempTip
                    .attr("x", wordinessScale(d.wordiness)+graphSideMargin)
                    .text(d.title);
            }
        })
        .on("mouseout", function(event, d) {
            if(!this.classList.contains("clicked")) {
                const titleClass = "." + d.title.replace(/\W/g, '');
                self.svg.selectAll(titleClass)
                    .style("fill", getColor(d.complexity))
                    .attr("r", 5)
                    .style("stroke", getColor(d.complexity))
                    .attr("stroke-width", 1);  
                tempTip.text("");
            }
        })
        .on("click", function(event, d) {
            tempTip.text("");     
            d3.select(this).classed("clicked", true);
            self.bookDiagram.update(self.storyMap.get(d.title), self.complexityMap, self.wordinessMap, self.wordMap);
            self.update(self.storyMap.get(d.title));
        });

    // Draws all lines connecting data points, changes diagram display on click, and displays title tooltip on hover
    let lines = self.svg.select("#spectrum-lines").selectAll("line").data(dataset);
    lines.enter()
        .append("line")
        .attr("class", function(d) {
            return d.title.replace(/\W/g, '') + " " + getRank(d.complexity);
        })
        .attr("x1", function(d) {
            return wordinessScale(d.wordiness);
        })
        .attr("y1", 0)
        .attr("x2", function(d) {
            return complexityScale(d.complexity);
        })
        .attr("y2", 125)
        .style("stroke", function(d) {
            return getColor(d.complexity);
        })
        .on("mouseover", function(event, d) {
            if(!this.classList.contains("clicked")) {
                const titleClass = "." + d.title.replace(/\W/g, '');
                self.svg.selectAll(titleClass)
                    .style("fill", "#DAA520")
                    .attr("r", 10)
                    .style("stroke", "#DAA520")
                    .attr("stroke-width", 3);
                tempTip
                    .attr("x", wordinessScale(d.wordiness)+graphSideMargin)
                    .text(d.title);
            }
        })
        .on("mouseout", function(event, d) {
            if(!this.classList.contains("clicked")) {
                const titleClass = "." + d.title.replace(/\W/g, '');
                self.svg.selectAll(titleClass)
                    .style("fill", getColor(d.complexity))
                    .attr("r", 5)
                    .style("stroke", getColor(d.complexity))
                    .attr("stroke-width", 1);      
                tempTip.text("");      
            }
        })
        .on("click", function(event, d) {
            tempTip.text("");
            d3.select(this).classed("clicked", true);
            self.bookDiagram.update(self.storyMap.get(d.title), self.complexityMap, self.wordinessMap, self.wordMap);
            self.update(self.storyMap.get(d.title));
        });

    // Creates checkbox and label to toggle connecting line display on and off
    self.svg.append("circle")
        .attr("id", "checkbox")
        .attr("cx", graphSideMargin+5)
        .attr("cy", 10)
        .attr("r", 7)
        .on("click", function() {
            let clicked = d3.select(this).style("fill") == "goldenrod";
            if(clicked) {
                d3.select(this).style("fill", "azure")
                self.svg.select("#spectrum-lines")
                    .attr("display", "visible");
            }
            else {
                d3.select(this).style("fill", "goldenrod")
                self.svg.select("#spectrum-lines")
                    .attr("display", "none");
            }
        });
    self.svg.append("text")
        .attr("class", "text")
        .attr("id", "checkbox-text")
        .attr("x", graphSideMargin+20)
        .attr("y", 16)
        .text("Hide lines");

    // Adds instructions to spectrum diagram
    self.svg.append("text")
        .attr("class", "text")
        .attr("id", "spectrum-instructions")
        .attr("x", self.svgWidth/2)
        .attr("y", 5)
        .text("Click data points to see book diagram");
}

/**
 * Highlights the selected story
 * @param storyInfo -- JS object: object containing title and story complexity as well as arrays of parsed words, descriptors, verbs of one specific story
 */
BookSpectrum.prototype.update = function(storyInfo){
    let self = this;

    // Reestablishes bounds and scales for spectrum visualization
    const graphSideMargin = 50;
    const graphLength = self.svgWidth-(2*graphSideMargin);
    const wordinessScale = d3.scaleLinear()
        .domain([0, d3.max(self.wordinessMap.values())])
        .range([0, graphLength]);

    // Corrects formatting of all points and lines to non-hover/non-click state
    self.svg.select("#spectrum-lines").selectAll("line")
        .style("stroke", function() {
            if(this.classList.contains("easy")) {
                return "#6eb560";
            }
            else if (this.classList.contains("medium")) {
                return "#faf887";
            }
            else {
                return "#eb4034";
            }
        })
        .attr("stroke-width", 1)
        .classed("clicked", false);
    self.svg.select("#w-points").selectAll("circle")
        .style("stroke", "none")
        .style("fill", function() {
            if(this.classList.contains("easy")) {
                return "#6eb560";
            }
            else if (this.classList.contains("medium")) {
                return "#faf887";
            }
            else {
                return "#eb4034";
            }
        })
        .attr("r", 5)
        .classed("clicked", false);
    self.svg.select("#c-points").selectAll("circle")
        .style("stroke", "none")
        .style("fill", function() {
            if(this.classList.contains("easy")) {
                return "#6eb560";
            }
            else if (this.classList.contains("medium")) {
                return "#faf887";
            }
            else {
                return "#eb4034";
            }
        })
        .attr("r", 5)
        .classed("clicked", false);
    
    // Displays hover/click state of selected story
    const titleClass = "." + storyInfo.title.replace(/\W/g, '');
    self.svg.selectAll(titleClass)
        .style("fill", "#DAA520")
        .attr("r", 10)
        .style("stroke", "#DAA520")
        .attr("stroke-width", 3)
        .classed("clicked", true);

    // Displays title of the selected story
    const wordiness = storyInfo.descriptors.length/storyInfo.verbs.length;
    d3.select(".tip")
        .attr("x", wordinessScale(wordiness)+graphSideMargin)
        .text(storyInfo.title);
}