const line = require('@line/bot-sdk');
const express = require('express');
const lineConfig = {
  channelAccessToken: process.env.HEROKU_LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.HEROKU_LINE_CHANNEL_SECRET
};
const client = new line.Client(lineConfig);
const app = express();

app.post('/', line.middleware(lineConfig), function(req, res) {
  Promise
    .all(req.body.events.map(handleEvent))
    .then(function(result) {
      res.json(result);
    });
});

var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});

function handleEvent(event) {
  switch (event.type) {
    case 'join':
    case 'follow':
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '你好請問我們認識嗎?'
      });   
    case 'message':
      switch (event.message.type) {
        case 'text':
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: (event.message.text+'~*')
          });
      }
  }
}