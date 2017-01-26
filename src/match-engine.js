'use strict';

const setjs = require('setjs');

function MatchEngine() {
  this.terms = [];
  this.tokens = setjs();
}

MatchEngine.prototype.addTerm = function(term) {
  // Ignore if the term has been added previously.
  if (this.terms.hasOwnProperty(term)) {
    return;
  }

  // Formatting.
  var plain = term.toLowerCase();       // Convert to lower case.
  plain = plain.trim();                 // Remove leading and trailing spaces.
  plain = plain.split('  ').join(' ');  // Remove double whitespaces.
  plain = plain.split('-').join('');    // Remove dashes.

  // Split the term by space to produce tokens.
  const tokens = plain.split(' ');

  // Add each of the found tokens to the list of known tokens.
  tokens.forEach(function (token) {
    this.tokens = setjs(this.tokens, token);
  }.bind(this));

  // Add to the list of known terms.
  this.terms.push({
    name: term,
    tokens: tokens
  });
};

MatchEngine.prototype.match = function(string) {
  // Formatting.
  var plain = string.toLowerCase();     // Convert to lower case.
  plain = plain.trim();                 // Remove leading and trailing spaces.
  plain = plain.split('  ').join(' ');  // Remove double whitespaces.
  plain = plain.split('-').join('');    // Remove dashes.

  // Split the string by space to produce words.
  const words = plain.split(' ');

  var scoreCard = this.terms.map(function (term) {
    /*  `stat` is a 2-element array. The first element is the list of token
        hits. The second element is the list of token penalties.  */
    const stat = words.reduce(function (stat, word) {
      if (term.tokens.indexOf(word) >= 0) {
        return [stat[0].concat([word]), stat[1]];  // Hit.
      } else if (setjs.contains(this.tokens, word)) {
        return [stat[0], stat[1].concat([word])];  // Penalty.
      } else {
        return stat; // Neither hit nor penalty.
      }
    }.bind(this), [[], []]);
    return {
      term: term.name,
      numToken: term.tokens.length,
      hits: stat[0],
      penalties: stat[1]
    };
  }.bind(this));

  return scoreCard;
}

module.exports = MatchEngine;
