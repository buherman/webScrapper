'use strict';

/*
 * This script scrapes prices of used cars in A@@@C@@P@@@@@.com.
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
  console.log(groupName);

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
    const groupV2 = stageTwo(cacheGroupV1, taxonomy);

    // Processing stage 3: matching with variant taxonomy.
    const groupV3 = stageThree(groupV2, taxonomy);

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

    // Processing stage 0: excluding cars older than 10 years.
    const groupV0 = groupRaw.filter(function (elem) {
      return (elem.year > 2006);
    });

    // Processing stage 1: formatting.
    const groupV1 = groupV0.map(stageOne);
    // Dump results to JSON, which may be used as cache by subsequent scrape.
    const stage1FileName = `acp-group-${groupName}-v1.json`;
    fs.writeFile(stage1FileName, JSON.stringify(groupV1, null, 2), null);

    // Processing stage 2: matching with model taxonomy.
    const groupV2 = stageTwo(groupV1, taxonomy);

    // Processing stage 3: matching with variant taxonomy.
    const groupV3 = stageThree(groupV2, taxonomy);

    // Save results to a CSV file.
    const fileName = `acp-group-${groupName}.csv`;
    outputStage(groupV3, fileName);
  }
}



// Processing stage 1: formatting.
function stageOne(elem) {
  return {
    // Remove leading, trailing, and double whitespace characters.
    title: elem.title.trim().split('  ').join(' '),
    year: elem.year,
    // Convert from millions of rupiah to rupiah.
    price: Number(elem.price) * 1000000
  }
}



// Processing stage 2: matching with model taxonomy.
function stageTwo(group, taxonomy) {
  var modelSet = FuzzySet();
  Object.keys(taxonomy).forEach(function (model) {
    modelSet.add(model);
  });
  return group.map(function (elem) {
    // Determine the model.
    const modelMatch = modelSet.get(elem.title);
    const modelGuess = (modelMatch ? modelMatch[0][1] : '');
    // Determine the variant as the text without the model name.
    var variant = elem.title;
    if (modelGuess) {
      /* In case the model consists of more than one words, we process each of
         them individually. */
      modelGuess.split(' ').forEach(function (elem) {
        variant = variant.split(elem + ' ').join('');
      });
    }
    return {
      title: elem.title,
      model: modelGuess,
      variant: variant,
      year: elem.year,
      price: elem.price
    }
  });
}



// Processing stage 3: matching with variant taxonomy.
function stageThree(group, taxonomy) {
  return group.map(function (elem) {
    var variantGuess = '';
    if (Array.isArray(taxonomy[elem.model])) {
      var variantSet = FuzzySet();
      taxonomy[elem.model].forEach(function (variant) {
        // The search term is "[model] [variant]".
        variantSet.add(elem.model + ' ' + variant);
      });
      const variantMatch = variantSet.get(elem.title);
      if (variantMatch) {
        // The `substring` converts "[model] [variant]" to "[variant]".
        variantGuess = variantMatch[0][1].substring(elem.model.length + 1);
      }
    }
    return {
      title: elem.title,
      model: elem.model,
      variant: elem.variant,
      variantGuess: variantGuess,
      year: elem.year,
      price: elem.price
    }
  });
}



// Write output.
function outputStage(group, fileName) {
  var buffer = '';
  const n = group.length;
  for (var i = 0; i < n; i++) {
    buffer += `"${group[i].price}",`;
    buffer += `"${group[i].model}",`;
    buffer += `"${group[i].variant}",`;
    buffer += `"${group[i].variantGuess}",`;
    buffer += `"${group[i].year}",`;
    buffer += `"${group[i].title}"\n`;
  }
  fs.writeFile(fileName, buffer, function (err) {
    if (err) {
      console.error(err);
    }
  });
}
