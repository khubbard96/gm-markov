const loadJsonFile = require('load-json-file');

const MarkovGen = require('markov-generator');

let memberMarkovs = {};


(async () => {
    const data = await loadJsonFile('data.json');

    Object.keys(data).forEach((key) => {
        let markov = new MarkovGen({
            input: data[key],
            minLength: 10
        });
        memberMarkovs[key] = markov;
    })
    
    let user = Object.keys(memberMarkovs)[Math.floor((Math.random() * Object.keys(memberMarkovs).length) + 1)];

    let sentence = memberMarkovs[user].makeChain();
    console.log(user + ": " + sentence);

})();