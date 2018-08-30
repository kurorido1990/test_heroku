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
	var source = event.source;
  	switch (event.message.type) {
	  case 'text':
	    switch (source.type) {
	      case 'user':
	      return client.getProfile(source.userId).then(function(profile) {
	        return client.replyMessage(event.replyToken, {
	          type: 'text',
	          text: ('你的名字是: '+profile.displayName+'，你的狀態是: '+profile.statusMessage)
	        });
	      });
	      case 'group':
	        return client.getGroupMemberProfile(source.groupId,    source.userId).then(function(profile) {
	          return client.replyMessage(event.replyToken, {
	            type: 'text',
	            text: ('你的名字是: '+profile.displayName+'，你的狀態是: '+profile.statusMessage)
	          });
	        });
	      case 'room':
	        return client.getRoomMemberProfile(source.roomId, source.userId).then(function(profile) {
	          return client.replyMessage(event.replyToken, {
	            type: 'text',
	            text: ('你的名字是: '+profile.displayName+'，你的狀態是: '+profile.statusMessage)
	          });
	        });
	    }
	}
}