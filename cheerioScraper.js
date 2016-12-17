var request = require('request');
var cheerio = require('cheerio');
const formatCurrency = require('format-currency');
var numeral = require('numeral');

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
        
        /*
        $('div[class="masonry-grid with-button is-preloading"]').each(function(){
            test = $(this).find('div').attr('data-title');
        
            console.log(test);
        })
        */
        
        var rawList = [];
        $('div[class="masonry-grid with-button is-preloading"]').find('div').each(function(index,element){
            var carName = $(element).find('p[class="title"]').text();
            var carPrice = $(element).find('div[id="olxid-ad-price"]').text();
            
            
            if (carName === 'undefined' || carName === null || carPrice === null || carPrice === '') {
                console.log('empty');
            }else{
                rawList.push(carName,carPrice.trim().replace('Rp. ','').replace('.',','));
            }
        })
        
        console.log('weeee');
        
        var uniqueList = rawList.filter(function(elem, pos){
            return rawList.indexOf(elem) == pos;
        })
        console.dir(uniqueList);
        
        
        //class category
        
        //trus di click icon down abs
        //get value_
        
        //get h3. with name ""
    
    
    //var jobTitle = $('#job-title-scrape');
    //var jobTitleText = jobTitle.text();
    
    // $('#job-title-scrape').filter(function(){
    //     var jobTitle = $(this);
    //     jobTitleText = jobTitle.text();
    // })
    
    
    
    
    
    // console.log('cheerio : '+jobTitleText);
    
    // return 'xx';
    
    })
}