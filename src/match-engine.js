'use strict';

const setjs = require('setjs');

function MatchEngine() {
  this.addedTerms = [];
  this.knownTokens = setjs();
  this.synonyms = {
    "glux": ["luxury", "lux"],
    "4x4": ["4wd"],
    "diesel": ["disel", "deasel", "vnt", "d4d"],
    "bensin": ["petrol"],
    "trd": ["sportivo"]
  };
}

MatchEngine.prototype.addTerm = function(term) {
  // Ignore if the term has been added previously.
  if (this.addedTerms.hasOwnProperty(term)) {
    return;
  }

  // Formatting.
  let plain = term.toLowerCase();       // Convert to lower case.
  plain = plain.trim();                 // Remove leading and trailing spaces.
  plain = plain.split('  ').join(' ');  // Remove double whitespaces.
  plain = plain.split('-').join('');    // Remove dashes.

  // Split the term by space to produce tokens.
  const tokenArray = plain.split(' ');

  // Convert the array of tokens to a unique set.
  let tokenSet = setjs();
  tokenArray.forEach(function (token) {
    tokenSet = setjs(tokenSet, token);
    // Also add the token's synonyms into the set.
    getSynonyms.call(this, token).forEach(function (synonymToken) {
      tokenSet = setjs(tokenSet, synonymToken);
    });
  }.bind(this));

  // Add the tokens to the list of known tokens.
  this.knownTokens = setjs(this.knownTokens, tokenSet);

  // Add the term to the list of added terms.
  this.addedTerms.push({
    name: term,
    tokens: tokenSet
  });
};

MatchEngine.prototype.match = function(string) {
  // Formatting.
  let plain = string.toLowerCase();     // Convert to lower case.
  plain = plain.trim();                 // Remove leading and trailing spaces.
  plain = plain.split('  ').join(' ');  // Remove double whitespaces.
  plain = plain.split('-').join('');    // Remove dashes.

  // Split the string by space to produce array of words.
  const words = plain.split(' ');

  // Match each word of the string to every added term, iterating one by one.
  let scoreCard = this.addedTerms.map(function (term) {
    /*  `stat` here is a temporary object with two keys: `stat.hits` is an
        array of token hits, and `stat.misses` is an array of token misses.  */
    const stat = words.reduce(function (stat, word) {
      if (setjs.contains(term.tokens, word)) {
        // HIT. The word matches a token (or its synonym) of the current term.
        return {
          hits: stat.hits.concat([word]),
          misses: stat.misses
        };
      } else if (setjs.contains(this.knownTokens, word)) {
        // MISS. The word matches a token (or its synonym) of another term.
        return {
          hits: stat.hits,
          misses: stat.misses.concat([word])
        };
      } else {
        return stat; // Neither hit nor miss.
      }
    }.bind(this), { hits: [], misses: [] });
    return {
      term: term.name,
      numToken: setjs.count(term.tokens),
      hits: stat.hits,
      misses: stat.misses
    };
  }.bind(this));

  return scoreCard;
}

function getSynonyms(word) {
  if (this.synonyms.hasOwnProperty(word)) {
    return this.synonyms[word];
  } else {
    return [];  // The given word has no synonyms.
  }
}

module.exports = MatchEngine;
