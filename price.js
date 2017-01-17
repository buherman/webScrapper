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

  	// Output processing.
    const groupFinal = groupRaw.map(function (elem) {
      return {
        // Remove whitespace characters and convert to lower case.
        title: elem.title.trim().toLowerCase(),
        // Remove non-numeric characters.
        price: elem.price.replace(/\D/g, '')
      }
    });

    // Save results to a CSV file.
    var buffer = '';
    const n = groupFinal.length;
    for (var i = 0; i < n; i++) {
      buffer += `"${groupFinal[i].price}","${groupFinal[i].title}"\n`;
    }
    const fileName = `group-${model}-${transmission}.csv`;
    fs.writeFile(fileName, buffer, function (err) {
      if (err) {
        console.error(err);
	    }
    });

  } // end of `function xRayDone(err, groupRaw)`

} // end of `function scrapeOneGroup(model, transmission)`
