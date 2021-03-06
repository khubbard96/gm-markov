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
  var request = JSON.parse(this.req.chunks[0]), botRegex = /what would @(.*) say/gmi;
  var attachments = request.attachments.find(el => el.type == "mentions");
  console.log(attachments);
  var mentions;
  if(attachments) {
    mentions = attachments.user_ids[0];
  } else {
    console.log("dont care");
    return;
  }
  if(request.text && botRegex.test(request.text)) {
    this.res.writeHead(200);
    postMessage(mentions);
    this.res.end();
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function postMessage(userId) {
  var botResponse, options, body, botReq;

  botResponse = getChain(userId);

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

function getChain(userId) {
    if(!loading) {
        let sentence = "(...hmmm not sure...)";
        try {
            sentence = memberMarkovs[userId].makeChain();
        } catch {
            
        }
        
        return sentence;
    } else {
        return "Not done loading yet!";
    }
}



exports.respond = respond;
