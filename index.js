const line = require('@line/bot-sdk');
const express = require('express');
const request = require('request');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

const lineConfig = {
  channelAccessToken: process.env.HEROKU_LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.HEROKU_LINE_CHANNEL_SECRET
};
const client = new line.Client(lineConfig);
const app = express();

var myClientSecret={"installed":{"client_id":"129892641691-a6mhvuh0lbabhimaffjie822sld2eboo.apps.googleusercontent.com","project_id":"cedar-hawk-214915","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://www.googleapis.com/oauth2/v3/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"YdqOC0e_VNksq-cExF6M8mYi","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}}
var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(myClientSecret.installed.client_id,myClientSecret.installed.client_secret, myClientSecret.installed.redirect_uris[0]);
//底下輸入sheetsapi.json檔案的內容
oauth2Client.credentials ={"access_token":"ya29.GlsJBmmClrvARWQVeVEVuD8ei1EV0krVU__5mswBVYQPYkFcbPzA4Ui4vYlcDpNBqmB2UomkpTTxIGIAZOKWtt4uxv1YUmhrduk_QJz7tlsAJIvGqcJH-drtcBQl","refresh_token":"1/Z3QPhH0H2YAkhgHPcF9SUKa06k05frdTtx5BOWKvCyw","scope":"https://www.googleapis.com/auth/spreadsheets","token_type":"Bearer","expiry_date":1535648685667}

//試算表的ID，引號不能刪掉
var mySheetId='1fxtBrKtUrtdMvLJB6XyFLub2AYFIAcKOkVw-fZ-Li8s';

var myQuestions=[];
var users=[];
var totalSteps=0;
var myReplies=[];

//程式啟動後會去讀取試算表內的問題
//getQuestions();
getEncourage();

//取得歡迎詞內容的函式
function getEncourage() {
   var sheets = google.sheets('v4');
   sheets.spreadsheets.values.get({
      auth: oauth2Client,
      spreadsheetId: mySheetId,
      range:encodeURI('鼓勵的詞彙'),
   }, function(err, response) {
      if (err) {
         console.log('讀取問題檔的API產生問題：' + err);
         return;
      }
      var choice = Math.floor(Math.random() * response.values.length);
      console.log("choice : " + choice + " length : " + response.values.length);

      console.log("鼓勵的詞彙 : " + response.values[choice][0]);
      return response.values[choice][0];
   });
} 
getBest('C48e39d01abde6266ae70194513b4c2f5');
//這是讀取問題的函式
function getBest(group_id) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
     auth: oauth2Client,
     spreadsheetId: mySheetId,
     range:encodeURI('人員清單'),
  }, function(err, response) {
     if (err) {
        console.log('讀取問題檔的API產生問題：' + err);
        return;
     }
     var rows = response.values;
     if (rows.length == 0) {
        console.log('No data found.');
     } else {
     	var best;
     	rows.forEach(function(element, index, arr){
     		if (index > 0) {
     			if (element[0].equals(group_id)) {
     				console.log("小組員: " + element[1]);
     				console.log("Best: " + element[2]);
     			}
     		}
     	});
        myQuestions=rows;
        totalSteps=myQuestions[0].length;
        console.log('人員清單讀取完畢！');
     }
  });
}




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

var parylist = '〓 幸福的BEST 禱告名單\n\
(1 heart)安義：林世傑 Eran 莊岡陵\n\
(1 heart)雅珊：邱子庭 李盈華 毛毛\n\
\n\
(pencil)\n\
每週一 三 五中午或者當天找一時段為Best禱告\n\
每週三 聚會前/後期望可以一起為Best禱告\n\
\n\
(star)\n\
ＰＳ 假如沒有時間可以一起禱告也請在遙遠的那端看著同一片天空一起禱告';

function test() {
	client.pushMessage('C48e39d01abde6266ae70194513b4c2f5', {
		type: "text",
		text: parylist
	});

}