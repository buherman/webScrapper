var request = require('request');
var cheerio = require('cheerio');
const formatCurrency = require('format-currency');
var numeral = require('numeral');
var phantom = require('node-phantom');
const toCSV = require('array-to-csv');



var FILE_NAME = __filename.split(/[\\/]/).pop(); 

//import StaticVariable
var sV = require('./staticVariable');

module.exports.cheerioFunction = function (url){
  
    console.log(FILE_NAME+': url received : '+url);
    
    var carList = [];  
    
    var test ='';
  
    request(url, function(err,resp,body){
        
        if (err) {
            return console.error(FILE_NAME+' : upload failed :', err);
        }
      
        var $ = cheerio.load(body);
        
        
        //notice that there's lazy loading - Scroll to get to other page.
        var loadMore = $('div[id="loadMoreAds"]');
        var countLoadMore = 1;
        
        if (loadMore === null){
            
        }else{
            
            countLoadMore= countLoadMore+1;
            console.log('loadMore Exist : ' +countLoadMore);
            
            
            
            
            $=cheerio.load(body);
        }
        
        
        var rawList = [];
        $('div[class="masonry-grid with-button is-preloading"]').find('div').each(function(index,element){
            var carName = $(element).find('p[class="title"]').text();
            var carPrice = $(element).find('div[id="olxid-ad-price"]').text();
            
            
            if (carName === 'undefined' || carName === null || carPrice === null || carPrice === '') {
                //console.log('empty'); Remove the "Undefined".
            }else{
                rawList.push(carName,carPrice.trim().replace('Rp. ','').replace('.',','));
            }
        })
        
        
        //Clean Up the rawList.
        var uniqueList = rawList.filter(function(elem, pos){
            return rawList.indexOf(elem) == pos;
        })
        console.dir(uniqueList);
       
       //transform to CSV
       
    
    })
}