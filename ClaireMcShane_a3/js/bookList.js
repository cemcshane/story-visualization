/**
 * Constructor for the BookList
 * @param storyInfo -- JS object: object containing title and story complexity as well as arrays of parsed words, descriptors, verbs of one specific story
 * @param complexityMap -- JS Map: map with keys of story titles and values of each of their average word complexities
 * @param wordinessMap -- JS Map: map with keys of story titles and values of each of their wordiness scores
 * @param bookDiagram -- BookDiagram object
 * @param bookSpectrum -- BookSpectrum object
 */
function BookList(storyMap, complexityMap, wordinessMap, bookDiagram, bookSpectrum){
    let self = this;
    self.storyMap  = storyMap;
    self.complexityMap = complexityMap;
    self.wordinessMap = wordinessMap;
    self.bookDiagram = bookDiagram;
    self.bookSpectrum = bookSpectrum;
    
    self.init();
};

/**
 * Initializes the svg elements required for book list
 */
BookList.prototype.init = function(){
    let self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 20};

    //Gets access to the div element created for this list from HTML
    self.bookListArea = d3.select("#book-list")
        .append("p")
        .attr("text-align", "center");

};

/**
 * Lists all of the story titles and updates chart visualizations on click
 */
BookList.prototype.update = function(){
    let self = this;

    let titles = self.bookListArea.selectAll("span").data(self.storyMap);

    titles.enter()
        .append("span")
        .attr("class", "text list-text")
        .text(function(d) {
            return d[0];
        })
        .on("click", function(event, d) {
            self.bookDiagram.update(d[1], self.complexityMap, self.wordinessMap);
            self.bookSpectrum.update(d[1]);
        })
};
