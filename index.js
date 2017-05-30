var Alexa = require('alexa-sdk');
var http = require('http');

var APP_ID = "amzn1.ask.skill.453fcf32-a68b-4ee6-986d-49c2d4dadc05";
var SKILL_NAME = "Bolero Stock Quotes";

// TODO put placeholders in string
// TODO indicate increase or decrease

var GET_STOCK_QUOTE_MESSAGE = "Thank you Bolero. Here is the current stock value in US dollars for ";
var HELP_MESSAGE = "You can say what\'s the stock price for, and then choose any company, or you can say exit... What can I help you with?";
var HELP_REPROMPT = "Y?";
var STOP_MESSAGE = "Online trading, mighty easy with Bolero.";

var company_name = '';

// TODO: find company to ticker mapper api
var tickers = [
		{ "name" : "microsoft", "value" : "NASDAQ:MSFT" },
		{ "name" : "apple", "value" : "NASDAQ:AAPL" },
		{ "name" : "tesla", "value" : "NASDAQ:TSLA"},
		{ "name" : "google", "value" : "NASDAQ:GOOG"},
		{ "name" : "alphabet", "value" : "NASDAQ:GOOG"},
		{ "name" : "facebook", "value" : "NASDAQ:FB"}
	];

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    company_name = event.request.intent.slots.company_name.value;
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetStockQuote');
    },
    'IntentRequest': function() {
        this.emit('GetStockQuote');
    },
    'InspirationIntent': function () {
        this.emit('GetStockQuote');
    },
    'GetStockQuote': function () {
        var speechOutput = '';
        var text = '';
        var sel = getTickerByCompany(company_name);
        var ticker = sel[0].value;
        var url = 'http://www.google.com/finance/info?q=' + ticker;
        var self = this;
        
        getStockInfo(url, function (stockinfo) {
            if(stockinfo === '') {
            	speechOutput = "Please try again later";
            }
            else {
            	var l = stockinfo[0].l;
            	var c = stockinfo[0].c;
            	var d = 'better than yesterday';
            	if stock_performance.charAt(0) === '-' {
            		d = 'less than yesterday';
            	}
            	
            	stock_performance = stock_performance.substring(1);
            	
            	speechOutput = GET_STOCK_QUOTE_MESSAGE + company_name + '... ' + l + ' dollars... That is ' + c + ' percent ' + d;
            }
	        self.emit(':tellWithCard', speechOutput, SKILL_NAME, text);
        }
    )},
    'AMAZON.HelpIntent': function () {
        res(this.emit(':ask', HELP_MESSAGE, HELP_REPROMPT));
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'Unhandled': function() {
        this.emit('AMAZON.HelpIntent');
    }
};

function getStockInfo(url, callback){
    http.get(url, function(res) {
        console.error("Got response: " + res.statusCode);
        res.on("data", function(chunk) {
        console.error("BODY: " + chunk);
        text = '' + chunk;
        console.log(JSON.parse(text.substring(3)));
        return callback(JSON.parse(text.substring(3)));
    });
    }).on('error', function(e) {
        text = 'error' + e.message;
        console.error("Got error: " + e.message);
	});
}

function getTickerByCompany(n) {
  return tickers.filter(
      function(tickers){ return tickers.name == n }
  );
}
