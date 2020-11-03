/*
 * Root file that handles instances of all the charts and loads the visualization
 */
(function(){
    let instance = null;

    /**
     * Creates instances for every chart (classes created to handle each chart;
     * the classes are defined in the respective javascript files.
     */
    function init() {
        //Creates instances for book diagram
        let bookDiagram = new BookDiagram();

        const storyTitles = ["TOM TIT TOT", "THE THREE SILLIES", "THE ROSE-TREE", "THE OLD WOMAN AND HER PIG", "HOW JACK WENT TO SEEK HIS FORTUNE",
                            "MR. VINEGAR", "NIX NOUGHT NOTHING", "JACK HANNAFORD", "BINNORIE", "MOUSE AND MOUSER", "CAP O' RUSHES", "TEENY-TINY",
                            "JACK AND THE BEANSTALK", "THE STORY OF THE THREE LITTLE PIGS", "THE MASTER AND HIS PUPIL", "TITTY MOUSE AND TATTY MOUSE",
                            "JACK AND HIS GOLDEN SNUFF-BOX", "THE STORY OF THE THREE BEARS", "JACK THE GIANT-KILLER", "HENNY-PENNY", "CHILDE ROWLAND",
                            "MOLLY WHUPPIE", "THE RED ETTIN", "THE GOLDEN ARM", "THE HISTORY OF TOM THUMB", "MR. FOX", "LAZY JACK", "JOHNNY-CAKE",
                            "EARL MAR'S DAUGHTER", "MR. MIACCA", "WHITTINGTON AND HIS CAT", "THE STRANGE VISITOR", "THE LAIDLY WORM OF SPINDLESTON HEUGH",
                            "THE CAT AND THE MOUSE", "THE FISH AND THE RING", "THE MAGPIE'S NEST", "KATE CRACKERNUTS", "THE CAULD LAD OF HILTON",
                            "THE ASS, THE TABLE, AND THE STICK", "FAIRY OINTMENT", "THE WELL OF THE WORLD'S END", "MASTER OF ALL MASTERS",
                            "THE THREE HEADS OF THE WELL"];

        // Used d3-fetch library to get this function: https://github.com/d3/d3-fetch/tree/v2.0.0
        d3.text("../data/englishfairytales.txt")    
            .then(fairytaleData => {
                // Data found on https://www.kaggle.com/kkhandekar/word-difficulty
                d3.csv("../data_wrangling/WordDifficulty.csv")
                    .then(wordData => {
                        // Adapted from https://stackoverflow.com/questions/41763174/quickly-creating-a-map-of-objects-from-an-array-of-objects-using-a-specified-obj
                        var wordMap = new Map(wordData.map(d => [d.Word, d]));
                        let rawData = fairytaleData.split('\n\n\n\n\n\n\n\n');
                        let stories = rawData.slice(3, 46);
                        let storyMap = new Map();
                        let complexityMap = new Map();
                        let wordinessMap = new Map();
                        // Code below adapted from https://code.google.com/archive/p/jspos/
                        // Tags the parts of speech of all stories
                        for (let story in stories) {
                            const title = storyTitles[story];
                            const words = new Lexer().lex(stories[story]);
                            let taggedWords = new POSTagger().tag(words);
                            let storyWords = [];
                            let descriptors = [];
                            let verbs = [];
                            let sum = 0;
                            for (i in taggedWords) {
                                var taggedWord = taggedWords[i];
                                var word = taggedWord[0];
                                var tag = taggedWord[1];
                                if (wordMap.get(word)) {
                                    storyWords.push(word);
                                    // Get running sum of word complexities
                                    if(+wordMap.get(word).I_Zscore >=0) {
                                        sum += +wordMap.get(word).I_Zscore;                                         
                                    }
                                    // parse adjectives and adverbs
                                    if (tag == 'JJ' || tag == 'RB') {
                                        descriptors.push(word);
                                    }
                                    // parse all verb tenses
                                    if (tag == 'VB' || tag == 'VBD' || tag == 'VBG' || tag == 'VBN' || tag == 'VBP' || tag == 'VBZ') {
                                        verbs.push(word);
                                    }
                                }
                            }
                            // Stores complexity and wordiness calculations in map
                            const complexity = sum/taggedWords.length;
                            const ratio = descriptors.length/verbs.length;
                            complexityMap.set(title, complexity);
                            wordinessMap.set(title, ratio);
                            // Creates overall map of all story data
                            storyMap.set(title, {"storyText": storyWords, "complexity": complexity, "descriptors": descriptors, "verbs": verbs, "title": title}); 
                        }
                        let bookSpectrum = new BookSpectrum(storyMap, complexityMap, wordinessMap, bookDiagram);
                        let bookList = new BookList(storyMap, complexityMap, wordinessMap, bookDiagram, bookSpectrum);
                        bookList.update();
                    })
            });
    }

    /**
     *
     * @constructor
     */
    function Main(){
        if(instance  !== null){
            throw new Error("Cannot instantiate more than one Class");
        }
    }

    /**
     *
     * @returns {Main singleton class |*}
     */
    Main.getInstance = function(){
        let self = this
        if(self.instance == null){
            self.instance = new Main();

            //called only once when the class is initialized
            init();
        }
        return instance;
    }

    Main.getInstance();
})();