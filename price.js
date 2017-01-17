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

    // Processing stage 2: guessing year.
    const groupFinal = groupV1.map(stageTwo);

    // Save results to a CSV file.
    var buffer = '';
    const n = groupFinal.length;
    for (var i = 0; i < n; i++) {
      buffer += `"${groupFinal[i].price}",`;
      buffer += `"${groupFinal[i].yearGuess}",`;
      buffer += `"${groupFinal[i].title}"\n`;
    }
    const fileName = `group-${model}-${transmission}.csv`;
    fs.writeFile(fileName, buffer, function (err) {
      if (err) {
        console.error(err);
      }
    });

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
const yearKw = [ // Keywords for year.
  '2000', '2001', '2002', '2003', '2004',
  '2005', '2006', '2007', '2008', '2009',
  '2010', '2011', '2012', '2013', '2014',
  '2015', '2016'
];
const nYearKw = yearKw.length;
function stageTwo(elem) {
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
