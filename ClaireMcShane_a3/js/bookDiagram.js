/**
 * Constructor for the BookDiagram
 *
 */
function BookDiagram(){
    let self = this;

    self.init();
};

/**
 * Initializes the svg elements required for book diagram
 */
BookDiagram.prototype.init = function(){
    let self = this;
    self.margin = {top: 0, right: 20, bottom: 30, left: 20};

    //Gets access to the div element created for this chart from HTML
    let divBookDiagram = d3.select("#book-diagram");
    self.svgBounds = divBookDiagram.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 350 - self.margin.bottom - self.margin.top;

    //Creates svg element within the div
    self.svg = divBookDiagram.append("svg")
        .attr("width",self.svgWidth + self.margin.left + self.margin.right)
        .attr("height",self.svgHeight + self.margin.bottom + self.margin.top)
        .append("g")
        .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

    //Creates container
    self.svg.append("rect")
        .attr("class", "container-rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", self.svgWidth)
        .attr("height", self.svgHeight);

    //Creates book image
    self.svg.append("circle")
        .attr("class", "outer-legend")
        .attr("cx", 150)
        .attr("cy", 250)
        .attr("r", 25);
    
    self.svg.append("rect")
        .attr("class", "outer-legend")
        .attr("x", 40)
        .attr("y", 110)
        .attr("height", 150)
        .attr("width", 220);
        
    self.svg.append("circle")
        .attr("class", "middle-legend")
        .attr("cx", 150)
        .attr("cy", 245)
        .attr("r", 18);

    self.svg.append("rect")
        .attr("class", "middle-legend")
        .attr("x", 50)
        .attr("y", 100)
        .attr("height", 150)
        .attr("width", 200);

    self.svg.append("rect")
        .attr("class", "inner-legend")
        .attr("x", 60)
        .attr("y", 90)
        .attr("height", 150)
        .attr("width", 88);

    self.svg.append("rect")
        .attr("class", "inner-legend")
        .attr("x", 150)
        .attr("y", 90)
        .attr("height", 150)
        .attr("width", 88);

    self.svg.append("polygon")
        .attr("class", "inner-legend")
        .attr("points", "135,240 148,240 148,248");

    self.svg.append("polygon")
        .attr("class", "inner-legend")
        .attr("points", "150,240 150,248 163,240");

    for(let i=0; i < 7; ++i) {
        self.svg.append("line")
            .attr("class", "legend-lines")
            .attr("x1", 70)
            .attr("y1", function() {
                return 105 + ((i%9)*15);
            })
            .attr("x2", 140)
            .attr("y2", function(d) {
                return 105 + ((i%9)*15);
            });        
    }

    self.svg.append("line")
        .attr("class", "legend-lines")
        .attr("x1", 70)
        .attr("y1", function() {
            return 105 + ((7%9)*15);
        })
        .attr("x2", 100)
        .attr("y2", function(d) {
            return 105 + ((7%9)*15);
        }); 

    //Creates title and subtitle for diagram
    self.svg.append("text")
        .attr("class", "text")
        .attr("id", "story-title")
        .attr("x", self.svgWidth/2)
        .attr("y", 40)
        .text("SELECT A STORY");

    self.svg.append("text")
        .attr("class", "text")
        .attr("id", "diagram-subtitle")
        .attr("x", self.svgWidth/2)
        .attr("y", 70)
        .text("Hover over diagram for more info")
        .attr("display", "none");

    //Creates placeholder text elements to display tooltip text (precise data values)
    self.svg.append("text")
        .style("fill", "#DAA520")
        .attr("class", "text story-data")
        .attr("x", 3*self.svgWidth/4)
        .attr("y", self.svgHeight/2)
        .text("");

    self.svg.append("text")
        .style("fill", "#DAA520")
        .attr("class", "text story-data")
        .attr("x", 3*self.svgWidth/4)
        .attr("y", self.svgHeight/2+30)
        .text("");
};

/**
 * Creates a dynamically changed book visual that represents the two data points
 * @param storyInfo -- JS object: object containing title and story complexity as well as arrays of parsed words, descriptors, verbs of one specific story
 * @param complexityMap -- JS Map: map with keys of story titles and values of each of their average word complexities
 * @param wordinessMap -- JS Map: map with keys of story titles and values of each of their wordiness scores
 */
BookDiagram.prototype.update = function(storyInfo, complexityMap, wordinessMap){
    let self = this;

    d3.select("#diagram-subtitle").attr("display", "visible");

    // Data that will be used/manipulated later in code
    let complexities = ["easy", "medium", "hard"];
    let lineArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

    // Functions for word complexity visualization
    const complexityScale = d3.scaleQuantile()
        .domain([d3.min(complexityMap.values()), d3.max(complexityMap.values())])
        .range(complexities);

    /**
     * Converts word complexity ranking to a color
     * @param rank -- string: the complexity ranking of a story (easy, medium, or hard)
     */    
    const getColor = function(rank) {
        if(rank=="easy") {
            return "#6eb560";
        }
        else if(rank=="medium"){
            return "#faf887";
        }
        else{
            return "#eb4034";
        }
    }

    // Found on https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array
    const index = complexities.indexOf(complexityScale(storyInfo.complexity));
    if (index > -1) {
        complexities.splice(index, 1);
    }

    // Updates color of word complexity portion of visualization
    self.svg.selectAll(".middle-legend")
        .classed(complexities[0], false)
        .classed(complexities[1], false)
        .classed(complexityScale(storyInfo.complexity), true)
        .style("fill", getColor(complexityScale(storyInfo.complexity)));

    // Sets scales for wordiness visualiation
    const wordinessScale = d3.scaleLinear()
        .domain([0, d3.max(wordinessMap.values())])
        .range([0, 1260]);    

    // Finds the number of lines that need to be added to wordiness visualization
    const linesNeeded = Math.floor(wordinessScale(wordinessMap.get(storyInfo.title))/70);
    lineArray.splice(linesNeeded, lineArray.length-linesNeeded);
    const finalLineLength = wordinessScale(wordinessMap.get(storyInfo.title))%70;

    // Updates the number of lines on the wordiness portion of the visualization
    let lines = self.svg.selectAll("line").data(lineArray);

    lines
        .attr("class", "legend-lines")
        .attr("x1", function(d) {
            if(d>9){
                return 158;
            }
            return 70;
        })
        .attr("y1", function(d) {
            return 105 + (((d-1)%9)*15);
        })
        .attr("x2", function(d) {
            if(d>9){
                return 230;
            }
            return 140;
        })
        .attr("y2", function(d) {
            return 105 + (((d-1)%9)*15);
        });

    lines.enter()
        .append("line")
        .attr("class", "legend-lines")
        .attr("x1", function(d) {
            if(d>9){
                return 158;
            }
            return 70;
        })
        .attr("y1", function(d) {
            return 105 + (((d-1)%9)*15);
        })
        .attr("x2", function(d) {
            if(d>9){
                return 230;
            }
            return 140;
        })
        .attr("y2", function(d) {
            return 105 + (((d-1)%9)*15);
        });

    lines.exit().remove();

    self.svg.append("line")
        .attr("class", "legend-lines")
        .attr("x1", function() {
            if(linesNeeded+1 > 9){
                return 158;
            }
            return 70;
        })
        .attr("y1", function() {
            return 105 + (((linesNeeded)%9)*15);
        })
        .attr("x2", function() {
            if(linesNeeded+1 > 9){
                return 158 + finalLineLength;
            }
            return 70 + finalLineLength;
        })
        .attr("y2", function() {
            return 105 + (((linesNeeded)%9)*15);
        });

    // Adds story title to the visualization
    self.svg.select("#story-title")
        .text(storyInfo.title);

    /**
     * Hides the tooltip that displays more precise story data
     */    
    const hideInfo = function() {
        self.svg.selectAll(".story-data").text("");
    }

    // Adds hover effects to word complexity visualization that displays tooltip and changes color
    self.svg.selectAll(".middle-legend")
        .on("mouseover", function() {
            let count = 0;
            self.svg.selectAll(".story-data")
                .text(function() {
                    if(count==0){
                        ++count;
                        return "Complexity:";
                    }
                    else{
                        return (storyInfo.complexity).toFixed(6);
                    }
                })
            self.svg.selectAll(".middle-legend")
                .style("fill", "#DAA520");
        })
        .on("mouseout", function() {
            hideInfo();
            self.svg.selectAll(".middle-legend")
                .style("fill", getColor(complexityScale(storyInfo.complexity)));
        });

    // Adds hover effects to wordiness visualization that displays tooltip and changes color
    self.svg.selectAll(".inner-legend")
        .on("mouseover", function() {
            let count = 0;
            self.svg.selectAll(".story-data")
                .text(function() {
                    if(count==0){
                        ++count;
                        return "Wordiness:";
                    }
                    else{
                        return (storyInfo.descriptors.length/storyInfo.verbs.length).toFixed(3);
                    }
                })
            self.svg.selectAll(".legend-lines")
                .style("stroke", "#DAA520");
        })
        .on("mouseout", function() {
            hideInfo();
            self.svg.selectAll(".legend-lines")
                .style("stroke", "black");
        });
}
