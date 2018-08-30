const line = require('@line/bot-sdk');
const express = require('express');
const lineConfig = {
  channelAccessToken: 'Srnv8nMZG0QnSKkjc8VwgcsKle9hWXGGYfSQ/oX76z7wU18V98bWJhZCClWnahe1UH6DlRbesy+4qpG7xCZ+cr5pjSa87SZ3uY/nocttPeqj8rgPCnfq2lc2X60sv98xsouC28WckEKHE8KRC35+vgdB04t89/1O/w1cDnyilFU=',
  channelSecret: 'b45811e9c4fd332a208a99a8a7e68d63'
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