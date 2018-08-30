const line = require('@line/bot-sdk');
const express = require('express');
const request = require('request');

const lineConfig = {
  channelAccessToken: process.env.HEROKU_LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.HEROKU_LINE_CHANNEL_SECRET
};
const client = new line.Client(lineConfig);
const app = express();
test();
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
	console.log(event);
  	switch (event.message.type) {
	  case 'text':
	    var source = event.source;
	    switch (source.type) {
	      case 'user':
	        return client.replyMessage(event.replyToken, {
	          type: 'text',
	          text: '你是user'
	        }).then(function() {
	          return client.pushMessage(source.userId, {
	            type: 'text',
	            text: '使用userId推送訊息'
	          });
	        });
	      case 'room':
	        return client.replyMessage(event.replyToken, {
	          type: 'text',
	          text: '你是room'
	        }).then(function() {
	          return client.pushMessage(source.roomId, {
	            type: 'text',
	            text: '使用roomId推送訊息'
	          });
	        });
	      case 'group':
	        return client.replyMessage(event.replyToken, {
	          type: 'text',
	          text: '你是group'
	        }).then(function() {
	          return client.pushMessage(source.groupId, {
	            type: 'text',
	            text: '使用groupId推送訊息'
	          });
	        });
	    }
	}
}

var timer2;
function test() {
	client.pushMessage('C48e39d01abde6266ae70194513b4c2f5', {
		type: "text",
		text: "測試測試測試"
	});
	setInterval(test, 50000);
}