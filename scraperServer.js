//import StaticVariable
var sV = require('./staticVariable');

//Global Variable

var express = require('express');
var path = require('path');

var fs = require('fs');

var app = express();
var FILE_NAME = __filename.split(/[\\/]/).pop(); 
var port = sV.PORT;

//import other module
var cheerio = require('./cheerioScraper');


//code starts here-----------------------------------------------------

//scrap OLX with Cheerio
console.log(FILE_NAME+' : Start Scrap : '+sV.MAIN_URL_OLX_AUDI+' with Cheerio.');

var jobtitleText = cheerio.cheerioFunction(sV.MAIN_URL_OLX_AUDI);

console.log(FILE_NAME+' : scrapper : '+jobtitleText);

app.listen(port);
console.log(FILE_NAME+' : server listening on ' + port);