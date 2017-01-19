'use strict';

/*
 * This script scrapes prices of used cars in A@@@C@@P@@@@@.com. Only scrapes
 * Daihatsu, Honda, Hyundai, Mazda, and Toyota at the moment, but this can be
 * easily configured by modifying the `groups` constant.
 *
 * Usage:
 *
 *     $ node price-agent-acp.js
 *
 * Output will be written to the current directory.
 */



const fs = require('fs');
const console = require('console');
const jsonfile = require('jsonfile');
const FuzzySet = require('fuzzyset.js');
const Xray = require('x-ray');
const x = Xray();

const groups = require('./price-agent-acp-groups.json');

// Scrape each group.
const n = groups.length;
for (var i = 0; i < n; i++ ) {
  scrapeOneGroup(groups[i].name, groups[i].url, groups[i].taxonomy);
}



function scrapeOneGroup(groupName, targetUrl, taxonomy) {

  // Attempt to load cached results from previous execution.
  const cacheFileName = `acp-group-${groupName}-v1.json`;
  var cacheGroupV1 = null;
  try {
    cacheGroupV1 = jsonfile.readFileSync(cacheFileName);
  } catch (e) {
  } finally {
  }
  if (cacheGroupV1) {
    console.log(`Using cached results from ${cacheFileName}`);

    // Processing stage 2: matching with model taxonomy.
    var groupV2;
    if (taxonomy) {
      var modelSet = FuzzySet();
      Object.keys(taxonomy).forEach(function (model) {
        modelSet.add(model);
      });
      groupV2 = cacheGroupV1.map(function (elem) {
        const modelMatch = modelSet.get(elem.title);
        return {
          title: elem.title,
          model: (modelMatch ? modelMatch[0][1] : ''),
          year: elem.year,
          price: elem.price
        }
      });
    } else {
      groupV2 = cacheGroupV1;
    }

    // Processing stage 3: matching with variant taxonomy.
    var groupV3;
    if (taxonomy) {
      groupV3 = groupV2.map(function (elem) {
        var variantGuess = '';
        if (Array.isArray(taxonomy[elem.model])) {
          var variantSet = FuzzySet();
          taxonomy[elem.model].forEach(function (variant) {
            variantSet.add(elem.model + ' ' + variant);
          });
          const variantMatch = variantSet.get(elem.title);
          if (variantMatch) {
            variantGuess = variantMatch[0][1];
          }
        }
        return {
          title: elem.title,
          model: elem.model,
          variant: variantGuess,
          year: elem.year,
          price: elem.price
        }
      });
    } else {
      groupV3 = groupV2;
    }

    // Save results to a CSV file.
    const fileName = `acp-group-${groupName}.csv`;
    outputStage(groupV3, fileName);

    return;
  }

  // Start of flow without cache.

  // First check if the title of the table indicates "used cars".
  x(targetUrl, '#img > h3[align="left"]')(function (err, title) {
    title = title.trim().toLowerCase();
    if (title.indexOf('bekas') < 0) {
      console.log('Could not find the right table to scrape');
      return;
    }
    
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

    // Processing stage 1: formatting.
    const groupV1 = groupRaw.map(stageOne);
    // Dump results to JSON, which may be used as cache by subsequent scrape.
    const stage1FileName = `acp-group-${groupName}-v1.json`;
    fs.writeFile(stage1FileName, JSON.stringify(groupV1, null, 2), null);

    // Processing stage 2: matching with model taxonomy.
    var groupV2;
    if (taxonomy) {
      var modelSet = FuzzySet();
      Object.keys(taxonomy).forEach(function (model) {
        modelSet.add(model);
      });
      groupV2 = groupV1.map(function (elem) {
        const modelMatch = modelSet.get(elem.title);
        return {
          title: elem.title,
          model: (modelMatch ? modelMatch[0][1] : ''),
          year: elem.year,
          price: elem.price
        }
      });
    } else {
      groupV2 = groupV1;
    }

    // Processing stage 3: matching with variant taxonomy.
    var groupV3;
    if (taxonomy) {
      groupV3 = groupV2.map(function (elem) {
        var variantSet = FuzzySet();
        taxonomy[elem.model].forEach(function (variant) {
          variantSet.add(variant);
        });
        const variantMatch = variantSet.get(elem.title);
        return {
          title: elem.title,
          model: elem.model,
          variant: (variantMatch ? variantMatch[0][1] : ''),
          year: elem.year,
          price: elem.price
        }
      });
    } else {
      groupV3 = groupV2;
    }

    // Save results to a CSV file.
    const fileName = `acp-group-${groupName}.csv`;
    outputStage(groupV3, fileName);
  }
}



// Processing stage 1: formatting.
function stageOne(elem) {
  return {
    // Remove whitespace characters and convert to lower case.
    title: elem.title.trim().toLowerCase(),
    year: elem.year,
    // Convert from millions of rupiah to rupiah.
    price: Number(elem.price) * 1000000
  }
}



// Write output.
function outputStage(group, fileName) {
  var buffer = '';
  const n = group.length;
  for (var i = 0; i < n; i++) {
    buffer += `"${group[i].price}",`;
    buffer += `"${group[i].model}",`;
    buffer += `"${group[i].variant}",`;
    buffer += `"${group[i].year}",`;
    buffer += `"${group[i].title}"\n`;
  }
  fs.writeFile(fileName, buffer, function (err) {
    if (err) {
      console.error(err);
    }
  });
}
