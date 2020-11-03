// Hold description of how wordiness was calculated
const wordinessInfo = ["This data category compares descriptors (adjectives or adverbs) to verbs for each story. This value is displayed", "as a ratio (number of descriptors/number of verbs). The higher the ratio, the more likely it is an author opted to", "pile on descriptors rather than use one strong action word. The lower the ratio, the better the readability!"];

// Hold description of how average word complexity was calculated
const complexityInfo = ["This data category calculates the average difficulty of the words in each story. Words are scored on a scale of -1 (easy)", "to 1 (hard) based on data obtained from https://www.kaggle.com/kkhandekar/word-difficulty. All words with scores > 0", "are defined as complex. First, a complex word proportion is computed (complex words/total words), and then that", "ratio is multiplied by the average score of each complex word. This yields the story's overall complexity score."];

// Creates placeholder where explanations of how data were obtained will be
let tipArea = d3.select("#book-legend").select("svg").append("text")
    .attr("class", "text legend-text info-tip-text")
    .attr("x", 0)
    .attr("y", 10)
    .text("");

/**
 * Hides the tooltip displaying data wrangling explanation
 */  
const hideInfo = function() {
    tipArea.text("");
}

// Adds tooltip functionality to info buttons
d3.select("#wordiness-tip")
    .on("mouseover", function() {
        tipArea.append("tspan").text(wordinessInfo[0]);
        tipArea.append("tspan").text(wordinessInfo[1])
            .attr("x", 0)
            .attr("y", 31);
        tipArea.append("tspan").text(wordinessInfo[2])
            .attr("x", 0)
            .attr("y", 52);
    })
    .on("mouseout", hideInfo);

d3.select("#complexity-tip")
    .on("mouseover", function() {
        tipArea.append("tspan").text(complexityInfo[0]);
        tipArea.append("tspan").text(complexityInfo[1])
            .attr("x", 0)
            .attr("y", 31);
        tipArea.append("tspan").text(complexityInfo[2])
            .attr("x", 0)
            .attr("y", 52);
        tipArea.append("tspan").text(complexityInfo[3])
            .attr("x", 0)
            .attr("y", 73);
    })
    .on("mouseout", hideInfo);