/**
 * optimismo
 * v2.0.1
 *
 * Analyse the optimism of a string.
 *
 * Help me make this better:
 * https://github.com/phugh/optimismo
 *
 * Using the affect/intensity and prospection lexica data from
 * http://www.wwbp.org/lexica.html
 * Used under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0
 * Unported licence
 *
 * (C) 2017 P. Hughes
 * Licence : Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 * Usage example:
 * const optimismo = require('optimismo');
 * const opts = {
 *  'encoding': 'binary',
 *  'max': Number.POSITIVE_INFINITY,
 *  'min': Number.NEGATIVE_INFINITY,
 *  'nGrams': 'true',
 *  'output': 'lex',
 *  'places': 9,
 *  'sortBy': 'freq',
 *  'wcGrams': 'false',
 * };
 * const str = 'A big long string of text...';
 * const optimism = optimismo(str, opts);
 * console.log(optimism)
 *
 * Scale runs from 1 (Completely pessimistic) to 9 (completely optimistic)
 * If there are no matches optimismo will return 0
 *
 * See README.md for help.
 *
 * @param {string} str  input string
 * @param {Object} opts options object
 * @return {(number|Array|Object)} optimism value, array of matches, or both
 */

(function() {
  'use strict';

  let async;
  let lexicon;
  let simplengrams;
  let tokenizer;
  let lexHelpers;

  if (typeof require !== 'undefined') {
    async = require('async');
    lexHelpers = require('lex-helpers');
    lexicon = require('./data/lexicon.json');
    simplengrams = require('simplengrams');
    tokenizer = require('happynodetokenizer');
  } else throw new Error('optimismo: required modules not found!');

  const arr2string = lexHelpers.arr2string;
  const calcLex = lexHelpers.calcLex;
  const getMatches = lexHelpers.getMatches;
  const prepareMatches = lexHelpers.prepareMatches;
  const itemCount = lexHelpers.itemCount;

  /**
  * @function getAffect
  * @param  {Array} arr token array
  * @return {Object}  object of matches
  */
  const getAffect = (arr) => {
    const matches = {};
    // loop through the lexicon categories
    const match = [];
    // loop through words in category
    const data = lexicon.AFFECT;
    for (let word in data) {
      if (data.hasOwnProperty(word) && arr.indexOf(word) > -1) {
        match.push(data[word]);
      }
    }
    matches.AFFECT = match;
    // return matches object
    return matches;
  };

  /**
  * @function getFuture
  * @param  {Array} arr token array
  * @return {Array} array of matched items
  */
  const getFuture = (arr) => {
    const matches = [];
    const data = Object.keys(lexicon.FUTURE);
    let i = data.length;
    while (i--) {
      let word = data[i];
      if (arr.indexOf(word) > -1 && matches.indexOf(word) === -1) {
        matches.push(word);
      }
    }
    return matches;
  };

  const doMatches = (matches, sortBy, wordcount, places, encoding) => {
    return {
      OPTIMISM: prepareMatches(matches.AFFECT, sortBy, wordcount, places,
        encoding),
    };
  };

  const doLex = (matches, places, encoding, wordcount) => {
    // define intercept value
    return {
      OPTIMISM: calcLex(matches.AFFECT, 5.037104721, places, encoding,
        wordcount),
    };
  };

  /**
  * @function optimismo
  * @param {string} str  input string
  * @param {Object} opts options object
  * @return {(number|Array|Object)} optimism value, array of matches, or both
  */
  function optimismo(str, opts) {
    // no string return null
    if (!str) {
      console.error('optimismo: no string found. Returning null.');
      return null;
    }
    // if str isn't a string, make it into one
    if (typeof str !== 'string') str = str.toString();
    // trim whitespace and convert to lowercase
    str = str.trim().toLowerCase();
    // options defaults
    if (!opts || typeof opts !== 'object') {
      console.warn('optimismo: using default options');
      opts = {
        'encoding': 'binary',
        'max': Number.POSITIVE_INFINITY,
        'min': Number.NEGATIVE_INFINITY,
        'nGrams': 'true',
        'output': 'lex',
        'places': 9,
        'sortBy': 'freq',
        'wcGrams': 'false',
      };
    }
    opts.encoding = opts.encoding || 'binary';
    opts.max = opts.max || Number.POSITIVE_INFINITY;
    opts.min = opts.min || Number.NEGATIVE_INFINITY;
    opts.nGrams = opts.nGrams || 'true';
    opts.output = opts.output || 'lex';
    opts.places = opts.places || 9;
    opts.sortBy = opts.sortBy || 'freq';
    opts.wcGrams = opts.wcGrams || 'false';
    const encoding = opts.encoding;
    const output = opts.output;
    const places = opts.places;
    const sortBy = opts.sortBy;
    // convert our string to tokens
    let tokens = tokenizer(str);
    // if there are no tokens return null
    if (!tokens) {
      console.warn('optimismo: no tokens found. Returned null.');
      return null;
    }
    // get wordcount before we add ngrams
    let wordcount = tokens.length;
    // get n-grams
    if (opts.nGrams === 'true' && wordcount > 2) {
      async.each([2, 3], function(n, callback) {
        tokens = tokens.concat(
          arr2string(simplengrams(str, n))
        );
        callback();
      }, function(err) {
        if (err) console.error(err);
      });
    }
    // recalculate wordcount if wcGrams is true
    if (opts.wcGrams === 'true') wordcount = tokens.length;
    // get 'future' match tokens
    let future = getFuture(tokens);
    // reduce tokens to count item
    future = itemCount(future);
    // match future tokens against affect lexicon
    const matches = getMatches(future, lexicon, opts.min, opts.max);
    // output!
    if (output === 'matches') {
      return doMatches(matches, sortBy, wordcount, places, encoding);
    } else if (output === 'full') {
      let full = {};
      async.parallel([
        function(callback) {
          full.matches = doMatches(matches, sortBy, wordcount, places,
              encoding);
          callback();
        },
        function(callback) { 
          full.values = doLex(matches, places, encoding, wordcount);
          callback();
        },
      ], function(err) {
          if (err) console.error(err);
          return full;
      });    
    } else {
      if (output !== 'lex') {
        console.warn('optimismo: output option ("' + output +
            '") is invalid, defaulting to "lex".');
      }
      return doLex(matches, places, encoding, wordcount);
    }
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = optimismo;
    }
    exports.optimismo = optimismo;
  } else {
    root.optimismo = optimismo;
  }
})();
