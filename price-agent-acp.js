'use strict';

const fs = require('fs');
const console = require('console');
const Xray = require('x-ray');
const x = Xray();

const groups = [
  {
    name: 'daihatsu',
    url: 'http://www.autocarprices.com/daihatsu_car_price.php'
  },
  {
    name: 'honda',
    url: 'http://www.autocarprices.com/honda_car_price.php'
  },
  {
    name: 'hyundai',
    url: 'http://www.autocarprices.com/hyundai_car_price.php'
  },
  {
    name: 'mazda',
    url: 'http://www.autocarprices.com/mazda_car_price.php'
  },
  {
    name: 'toyota',
    url: 'http://www.autocarprices.com/toyota_car_price.php'
  },
];

// Scrape each group.
const n = groups.length;
for (var i = 0; i < n; i++ ) {
  scrapeOneGroup(groups[i].name, groups[i].url);
}



function scrapeOneGroup(groupName, targetUrl) {
  // First check if the title of the table indicates "used cars".
  x(targetUrl, '#img > h3[align="left"]')(function (err, title) {
    title = title.trim().toLowerCase();
    if (title.indexOf('bekas') < 0) {
      console.log('Could not find the right table to scrape');
      return;
    }
    
    console.log(title);

    // We've found the right table. Now we may start scraping.
    const scope = '#img > h3[align="left"] + p[align="left"] tr';
    const selector = [{
      title: 'td:nth-child(1)',
      year: 'td:nth-child(2)',
      price: 'td:nth-child(3)'
    }];
    x(targetUrl, scope, selector)(xRayDone);

  });

  function xRayDone(err, groupRaw) {
    if (err) {
      console.error(err);
      return;
    }

    // Save results to a CSV file.
    const fileName = `acp-group-${groupName}.csv`;
    outputStage(groupRaw, fileName);
  }
}



// Write output.
function outputStage(group, fileName) {
  var buffer = '';
  const n = group.length;
  for (var i = 0; i < n; i++) {
    buffer += `"${group[i].price}",`;
    buffer += `"${group[i].year}",`;
    buffer += `"${group[i].title}"\n`;
  }
  fs.writeFile(fileName, buffer, function (err) {
    if (err) {
      console.error(err);
    }
  });
}
