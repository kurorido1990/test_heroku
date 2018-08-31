const line = require('@line/bot-sdk');
const express = require('express');
const request = require('request');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
let moment = require("moment");
let momentimezone = require("moment-timezone");

const heart = "\uDBC0\uDC37";
const pen = "\uDBC0\uDC41";
const star = "\uDBC0\uDCB2";


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
var base_time = Math.floor(new Date() / 1000);

//取得鼓勵的詞彙內容的函式
function getEncourage(callback) {
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

      console.log("鼓勵的詞彙 : " + response.values[choice][0]);
      callback(response.values[choice][0]);
   });
}

//這是讀取BestList的函式
function getBest(group_id, callback) {
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
     	var best_list = "〓 幸福的BEST 禱告名單 〓\n";
     	rows.forEach(function(element, index, arr){
     		if (index > 0) {
     			console.log("element : " + element + "index : " + index + "arr: " + arr );
     			if (element[0] == group_id) {
     				best_list += heart + " " + element[1] + "：" + element[2] + "\n";
     				console.log("小組員: " + element[1] + "Best: " + element[2]);
     			}
     		}
     	});
     	console.log(best_list);
     	callback(best_list);
     }
  });
}

//這是讀取禱告時間的函式
function getPrayTime(group_id, callback) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
     auth: oauth2Client,
     spreadsheetId: mySheetId,
     range:encodeURI('禱告時間'),
  }, function(err, response) {
     if (err) {
        console.log('讀取問題檔的API產生問題：' + err);
        return;
     }
     var rows = response.values;
     if (rows.length == 0) {
        console.log('No data found.');
     } else {
     	var prayTime;
     	rows.forEach(function(element, index, arr){
     		if (index > 0) {
     			if (element[0] == group_id) {
     				prayTime = pen + "\n" + element[1];
     			}     			
     		}
     	});
     	callback(prayTime);
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

getTime();
function getTime() {
	let now = moment().toDate();
	let day = now.getDay();
	let hour = now.getHours();

	if (hour + 8 < 24) {
		hour += 8;
	} else {
		hour = (hour + 8) - 24;
		day += 1;
	}

	return {day : day, hour : hour};
}

let g_now = moment().toDate();
let g_hour = (g_now.getHours() + 8 < 24) ? g_now.getHours() + 8 : (g_now.getHours() + 8) - 24;
checkbrocast();
function checkbrocast() {
	var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
     auth: oauth2Client,
     spreadsheetId: mySheetId,
     range:encodeURI('提醒時間'),
  }, function(err, response) {
     if (err) {
        console.log('讀取問題檔的API產生問題：' + err);
        return;
     }
     var rows = response.values;
     if (rows.length == 0) {
        console.log('No data found.');
     } else {
			 var prayTime;
			 var time = getTime();
     	rows.forEach(function(element, index, arr){
     		if (index > 0) {
					 console.log("element : " + element + " g_hour: " + g_hour + " time h: " + time.hour + " time d:" + time.day);
						 var hour = element[2].split(":");
						 console.log("day : " + element[1] + " hour: " + hour[0] + " g_hour: " + g_hour);

						 if (element[1] == time.day && hour[0] == time.hour && g_hour == hour[0]){
							 test(element[0]);
						 }
     		}
			 });
			 g_hour = time.hour;
     }
	});
	
	setInterval(checkbrocast, 60000 * 60);
}

fighting('C48e39d01abde6266ae70194513b4c2f5');
function fighting(groupId) {
	var out;

	getEncourage(function(Encourage_word){
		out = Encourage_word + "\n\n"
		getBest(groupId, function(best_list){
			out += best_list;
			client.pushMessage(groupId, {
				type: "text",
				text : out
			}).then(function(){
				client.pushMessage(groupId,{
					type:'sticker',
					packageId:'1',
					stickerId:'12'
			});
			});
		});
	});
}

function test(groupId) {
	var out;

	getBest(groupId, function(best_list){
		out = best_list + "\n";
		getPrayTime(groupId, function(prayTime){
			out += prayTime + "\n\n" + star + "\nＰＳ 假如沒有時間可以一起禱告也請在遙遠的那端看著同一片天空一起禱告";
			client.pushMessage(groupId, {
				type: "text",
				text: out
			});
		});
	});
}