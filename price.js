/*
 * This script scrapes used Toyota cars in J@@lo.com within DKI Jakarta region.
 * Only scrapes Fortuner models at the moment, but can be easily configured by
 * modifying the `sets` constant.
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

// List of sets that we will scrape. Each set will produce an output file.
const sets = [
  { model: 'Fortuner', transmission: 'Manual' },
  { model: 'Fortuner', transmission: 'Automatic' }
];

// Scrape each set.
const n = sets.length;
for (var i = 0; i < n; i++ ) {
  scrapeOneSet(sets[i].model, sets[i].transmission);
}

function scrapeOneSet(model, transmission) {
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

  function xRayDone(err, rawSet) {
    if (err) {
      console.error(err);
      return;
    }

  	// Output processing.
    const finalSet = rawSet.map(function (elem) {
      return {
        // Remove whitespace characters and convert to lower case.
        title: elem.title.trim().toLowerCase(),
        // Remove non-numeric characters.
        price: elem.price.replace(/\D/g, '')
      }
    });

    // Save results to a CSV file.
    var buffer = '';
    const n = finalSet.length;
    for (var i = 0; i < n; i++) {
      buffer += `"${finalSet[i].price}","${finalSet[i].title}"\n`;
    }
    const fileName = `set-${model}-${transmission}.csv`;
    fs.writeFile(fileName, buffer, function (err) {
      if (err) {
        console.error(err);
	    }
    });

  } // end of `function xRayDone(err, setRaw)`

} // end of `function scrapeOneSet(model, transmission)`
