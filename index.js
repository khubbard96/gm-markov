const http = require('https');
const MESSAGES_LIMIT = 100;
var lastMessage = undefined

const writeJsonFile = require('write-json-file');
var memberData = {};
var messagesFound = 0;

console.log("beginning")

function getMessages() {
    let beforeMessage = lastMessage ? "&before_id=" + lastMessage : "";
    http.get('https://api.groupme.com/v3/groups/43847120/messages?token=' + TOKEN + "&limit=" + MESSAGES_LIMIT + beforeMessage, (res) => {
    
    
        var rawData = "";
        res.on('data', (chunk) => {
            rawData += chunk;
        });
    
        res.on('end', () => {
            try {
                let messages = JSON.parse(rawData).response.messages;

                messages.forEach((mes) => {
                    let poster = mes.sender_id;
                    let content = mes.text;
                    if(!Object.keys(memberData).includes(poster)) {
                        memberData[poster] = [];
                    }
                    if(content != null) {
                        memberData[poster].push(content);
                    }
                    

                    messagesFound += 1;
                    process.stdout.write("\r\x1b[K")
                    process.stdout.write("Messages found: " + messagesFound);

                });

                lastMessage = messages[messages.length - 1].id;
                if(messages.length == MESSAGES_LIMIT) {
                    getMessages();
                } else {
                    finish();
                }
            } catch {

            }
        });
    });
}

function finish() {
    (async () => {
        await writeJsonFile('data.json', memberData);
    })();
}

getMessages();
