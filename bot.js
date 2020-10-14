var HTTPS = require('https');
const loadJsonFile = require('load-json-file');
const MarkovGen = require('markov-generator');
let memberMarkovs = {};
var loading = true;

var botID;

var loading = true;


//load markov chains subroutine
(async () => {
    const config = await loadJsonFile("config.json")

    botID = config.bot_id;

    const data = await loadJsonFile('data.json');

    Object.keys(data).forEach((key) => {
        let markov = new MarkovGen({
            input: data[key],
            minLength: 10
        });
        memberMarkovs[key] = markov;
    });

    loading = false;
})();

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botRegex = /@Mr. Markov/g;

  if(request.text && botRegex.test(request.text)) {
    this.res.writeHead(200);
    postMessage();
    this.res.end();
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function postMessage() {
  var botResponse, options, body, botReq;

  botResponse = getChain();

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

function getChain() {
    if(!loading) {
        let user = Object.keys(memberMarkovs)[Math.floor((Math.random() * Object.keys(memberMarkovs).length) + 1)];
        let sentence = "I broke"
        try {
            sentence = memberMarkovs[user].makeChain();
        } catch {
            
        }
        
        return sentence;
    } else {
        return "Not done loading yet!";
    }
}



exports.respond = respond;