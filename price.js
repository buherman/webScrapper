'use strict';

/*
 * This script scrapes used Toyota cars in J@@lo.com within DKI Jakarta region.
 * Only scrapes Fortuner models at the moment, but can be easily configured by
 * modifying the `groups` constant.
 *
 * Usage:
 *
 *     $ node price.js
 *
 * Output will be written to the current directory.
 */

const fs = require('fs');
const console = require('console');
const jsonfile = require('jsonfile');
const Xray = require('x-ray');
const x = Xray();



// List of groups that we will scrape. Each group will produce an output file.
const groups = [
  { model: 'Fortuner', transmission: 'Manual' },
  { model: 'Fortuner', transmission: 'Automatic' }
];

// Scrape each group.
const n = groups.length;
for (var i = 0; i < n; i++ ) {
  scrapeOneGroup(groups[i].model, groups[i].transmission);
}



function scrapeOneGroup(model, transmission) {
  console.log(model, transmission);

  // Attempt to load cached results from previous execution.
  const cacheFileName = `group-${model}-${transmission}-v1.json`;
  var cacheGroupV1 = null;
  try {
    cacheGroupV1 = jsonfile.readFileSync(cacheFileName);
  } catch (e) {
  } finally {
  }
  if (cacheGroupV1) {
    console.log(`Using cached results from ${cacheFileName}`);

    // Processing stage 2: guessing year.
    const groupFinal = cacheGroupV1.map(stageTwo);

    // Save results to a CSV file.
    const fileName = `group-${model}-${transmission}.csv`;
    outputStage(groupFinal, fileName);

    return;
  }

  // Start of flow without cache.

  var targetUrl = 'https://www.jualo.com/mobil-toyota-bekas/dki-jakarta';
  targetUrl += `?filter[13]=${transmission}`;
  targetUrl += `&filter[48]=${model}`;
  const scope = '.detail-product';
  const selector = [{
    title: '.title-product',
    price: '.product__price'
  }];
  const nextPageSelector = '.next_page@href';
  x(targetUrl, scope, selector)(xRayDone).paginate(nextPageSelector);

  function xRayDone(err, groupRaw) {
    if (err) {
      console.error(err);
      return;
    }

    // Processing stage 1: formatting.
    const groupV1 = groupRaw.map(stageOne);
    // Dump results to JSON, which may be used as cache by subsequent scrape.
    const stage1FileName = `group-${model}-${transmission}-v1.json`;
    fs.writeFile(stage1FileName, JSON.stringify(groupV1, null, 2), null);

    // Processing stage 2: guessing year.
    const groupFinal = groupV1.map(stageTwo);

    // Save results to a CSV file.
    const fileName = `group-${model}-${transmission}.csv`;
    outputStage(groupFinal, fileName);

  } // end of `function xRayDone(err, groupRaw)`

} // end of `function scrapeOneGroup(model, transmission)`



// Processing stage 1: formatting.
function stageOne(elem) {
  return {
    // Remove whitespace characters and convert to lower case.
    title: elem.title.trim().toLowerCase(),
    // Remove non-numeric characters.
    price: elem.price.replace(/\D/g, '')
  }
}



// Processing stage 2: guessing year.
function stageTwo(elem) {
  const yearKw = [ // Keywords for year.
    '2000', '2001', '2002', '2003', '2004',
    '2005', '2006', '2007', '2008', '2009',
    '2010', '2011', '2012', '2013', '2014',
    '2015', '2016'
  ];
  const nYearKw = yearKw.length;
  var yearGuess = '';
  for (var i = 0; i < nYearKw; i++) {
    if (elem.title.indexOf(yearKw[i]) >= 0) {
      yearGuess = yearKw[i];
      break;
    }
  }
  return {
      title: elem.title,
      price: elem.price,
      yearGuess: yearGuess
  }
}



// Write output.
function outputStage(group, fileName) {
  var buffer = '';
  const n = group.length;
  for (var i = 0; i < n; i++) {
    buffer += `"${group[i].price}",`;
    buffer += `"${group[i].yearGuess}",`;
    buffer += `"${group[i].title}"\n`;
  }
  fs.writeFile(fileName, buffer, function (err) {
    if (err) {
      console.error(err);
    }
  });
}
