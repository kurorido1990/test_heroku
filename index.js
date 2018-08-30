const line = require('@line/bot-sdk');
const express = require('express');
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
	
}

var timer2;
function test() {

	client.pushMessage('Ca235f9483eb71d8f7a381b2777011c17', {
		type : 'text',
		text : ('我就是個測試')
	});
	setInterval(test, 10000);
}