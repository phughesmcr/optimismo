/**
 * optimismo
 * v4.0.1
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
 * (C) 2017-18 P. Hughes
 * Licence : Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 * Usage example:
 * const optimismo = require('optimismo');
 * // These are the default options
 * const opts = {
 *  'encoding': 'binary',
 *  'locale': 'US',
 *  'logs': 3,
 *  'max': Number.POSITIVE_INFINITY,
 *  'min': Number.NEGATIVE_INFINITY,
 *  'nGrams': [2, 3],
 *  'noInt': false,
 *  'output': 'lex',
 *  'places': undefined,
 *  'sortBy': 'freq',
 *  'wcGrams': false,
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
 * @param {Object} [opts] options object
 * @return {Object} optimism value, array of matches, or both
 */

(function() {
  'use strict';

  // Lexicon data
  const affectLex = require('./data/affect.json');
  const futureLex = require('./data/future.json');

  // External modules
  const async = require('async');
  const trans = require('british_american_translate');
  const simplengrams = require('simplengrams');
  const tokenizer = require('happynodetokenizer');
  const lexHelpers = require('lex-helpers');
  const arr2string = lexHelpers.arr2string;
  const doLex = lexHelpers.doLex;
  const doMatches = lexHelpers.doMatches;
  const getMatches = lexHelpers.getMatches;
  const itemCount = lexHelpers.itemCount;

  /**
  * @function getFuture
  * @param  {Array} arr token array
  * @return {Array} array of matched items
  */
  const getFuture = (arr) => {
    const matches = [];
    const words = [...new Set(arr)];
    for (let word of words) {
      if (futureLex.includes(word)) matches.push(word);
    }
    return matches;
  };

  /**
  * Analyse the optimism of a string.
  * @function optimismo
  * @param {string} str     input string
  * @param {Object} [opts]  options object
  * @return {Object} optimism value, array of matches, or both
  */
  const optimismo = (str, opts = {}) => {
    // default options
    opts.encoding = (typeof opts.encoding === 'undefined') ? 'binary' : opts.encoding;
    opts.locale = (typeof opts.locale === 'undefined') ? 'US' : opts.locale;
    opts.logs = (typeof opts.logs === 'undefined') ? 3 : opts.logs;
    if (opts.suppressLog) opts.logs = 0; // suppressLog was depreciated in v3.0.0
    opts.max = (typeof opts.max === 'undefined') ? Number.POSITIVE_INFINITY : opts.max;
    opts.min = (typeof opts.min === 'undefined') ? Number.NEGATIVE_INFINITY : opts.min;
    if (typeof opts.max !== 'number' || typeof opts.min !== 'number') {
      // try to convert to a number
      opts.min = Number(opts.min);
      opts.max = Number(opts.max);
      // check it worked, or else default to infinity
      opts.max = (typeof opts.max === 'number') ? opts.max : Number.POSITIVE_INFINITY;
      opts.min = (typeof opts.min === 'number') ? opts.min : Number.NEGATIVE_INFINITY;
    }
    opts.nGrams = (typeof opts.nGrams !== 'undefined') ? opts.nGrams : [2, 3];
    if (!Array.isArray(opts.nGrams)) {
      if (opts.nGrams == 0) {
        opts.nGrams = [0];
      } else {
        if (opts.logs > 1) {
          console.warn('optimismo: nGrams option must be an array! Defaulting to [2, 3].');
        }
        opts.nGrams = [2, 3];
      }
    }
    opts.noInt = (typeof opts.noInt === 'undefined') ? false : opts.noInt;
    opts.output = (typeof opts.output === 'undefined') ? 'lex' : opts.output;
    opts.sortBy = (typeof opts.sortBy === 'undefined') ? 'freq' : opts.sortBy;
    opts.wcGrams = (typeof opts.wcGrams === 'undefined') ? false : opts.wcGrams;
    // cache frequently used options
    const encoding = opts.encoding;
    const logs = opts.logs;
    const nGrams = opts.nGrams;
    const output = opts.output;
    const places = opts.places;
    const sortBy = opts.sortBy;
    // no string return null
    if (!str) {
      if (logs > 1) console.warn('optimismo: no string found. Returning null.');
      return null;
    }
    // if str isn't a string, make it into one
    if (typeof str !== 'string') str = str.toString();
    // trim whitespace and convert to lowercase
    str = str.trim().toLowerCase();
    // translalte US English to UK English if selected
    if (opts.locale.match(/gb/gi)) str = trans.uk2us(str);
    // convert our string to tokens
    let tokens = tokenizer(str, {logs: opts.logs});
    // if there are no tokens return null
    if (!tokens) {
      if (logs > 1) console.warn('optimismo: no tokens found. Returned null.');
      return null;
    }
    // get wordcount before we add ngrams
    let wordcount = tokens.length;
    // get n-grams
    if (nGrams && !nGrams.includes(0)) {
      async.each(nGrams, function(n, callback) {
        if (wordcount < n) {
          callback(`wordcount (${wordcount}) less than n-gram value (${n}). Ignoring.`);
        } else {
          tokens = [
            ...arr2string(simplengrams(str, n, {logs: logs})),
            ...tokens,
          ];
          callback();
        }
      }, function(err) {
        if (err && logs > 1) console.warn('optimismo: ', err);
      });
    }
    // recalculate wordcount if wcGrams is true
    if (opts.wcGrams === true) wordcount = tokens.length;
    // reduce 'future' match tokens to count item
    const future = itemCount(getFuture(tokens));
    // match future tokens against affect lexicon
    const matches = getMatches(future, affectLex, opts.min, opts.max);
    let ints = {OPTIMISM: 5.037104721};
    if (opts.noInt === true) ints.OPTIMISM = 0;
    // output!
    if (output.match(/matches/gi)) {
      // return requested output
      return doMatches(matches, encoding, wordcount, sortBy, places);
    } else if (output.match(/full/gi)) {
      // return matches and values in one object
      let results;
      async.parallel({
        matches: function(callback) {
          callback(null, doMatches(matches, encoding, wordcount, sortBy, places));
        },
        values: function(callback) {
          callback(null, doLex(matches, ints, encoding, wordcount, places));
        },
      }, function(err, res) {
        if (err && logs > 0) console.error(err);
        results = res;
      });
      return results;
    } else {
      if (!output.match(/lex/gi) && logs > 1) {
        console.warn(`optimismo: output option ("${output}") is invalid, defaulting to "lex".`);
      }
      // return just the values
      return doLex(matches, ints, encoding, wordcount, places);
    }
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = optimismo;
    }
    exports.optimismo = optimismo;
  } else {
    global.optimismo = optimismo;
  }
})();
