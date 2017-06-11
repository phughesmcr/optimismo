/**
 * optimismo
 * v0.2.0
 *
 * Analyse the optimism of a string.
 *
 * Help me make this better:
 * https://github.com/phugh/optimismo
 *
 * Using the affect/intensity and prospection lexica data from http://www.wwbp.org/lexica.html
 * Used under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported licence
 *
 * (C) 2017 P. Hughes
 * Licence : Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 * Usage example:
 * const optimismo = require('optimismo');
 * const text = "A big long string of text...";
 * const opts = {
 *   'threshold': -0.98
 *   'bigrams': true,
 *   'trigrams': true
 * }
 * const optimism = optimismo(text, opts);
 * console.log(optimism)
 *
 * Scale runs from 1 (Completely pessimistic) to 9 (completely optimistic)
 * If there are no matches optimismo will return 0
 *
 * Lexical weights run from a maximum of 0.91 to a minimum of -0.98
 * therefore a "threshold" value of -0.98 (default) will include all words in
 * the lexicon
 *
 * The lexicon contains both bigrams and trigrams. We recommend you set these
 * to true in the opts object, unless you're analysing very long text.
 *
 * @param {string} str  input string
 * @param {Object} opts options
 * @return {number} optimism value between 1 and 9
 */

'use strict'
;(function () {
  const root = this
  const previous = root.optimismo

  let tokenizer = root.tokenizer
  let lexicon = root.lexicon
  let natural = root.natural

  if (typeof tokenizer === 'undefined') {
    const hasRequire = typeof require !== 'undefined'
    if (hasRequire) {
      tokenizer = require('happynodetokenizer')
      lexicon = require('./data/lexicon.json')
      natural = require('natural')
    } else throw new Error('optimismo required happynodetokenizer and ./data/lexicon.json')
  }

  /**
  * @function getBigrams
  * @param  {string} str input string
  * @return {Array} array of bigram strings
  */
  const getBigrams = str => {
    const NGrams = natural.NGrams
    const bigrams = NGrams.bigrams(str)
    const result = []
    const len = bigrams.length
    let i = 0
    for (i; i < len; i++) {
      result.push(bigrams[i].join(' '))
    }
    return result
  }

  /**
  * @function getTrigrams
  * @param  {string} str input string
  * @return {Array} array of trigram strings
  */
  const getTrigrams = str => {
    const NGrams = natural.NGrams
    const trigrams = NGrams.trigrams(str)
    const result = []
    const len = trigrams.length
    let i = 0
    for (i; i < len; i++) {
      result.push(trigrams[i].join(' '))
    }
    return result
  }

  /**
  * @function getMatches
  * @param  {Array} arr token array
  * @return {Object}  object of matches
  */
  const getMatches = (arr, min) => {
    const matches = {}
    // loop through the lexicon categories
    const match = []
    // loop through words in category
    let key
    const data = lexicon.AFFECT
    for (key in data) {
      if (!data.hasOwnProperty(key)) continue
      // if word from input matches word from lexicon ...
      let weight = data[key]
      if (arr.indexOf(key) > -1 && weight > min) {
        match.push(weight)
      }
      matches.AFFECT = match
    }
    // return matches object
    return matches
  }

  /**
  * @function getFuture
  * @param  {Array} arr token array
  * @return {Array} array of matched items
  */
  const getFuture = arr => {
    // loop through the lexicon categories
    const matches = []
    // loop through words in category
    const data = lexicon.FUTURE
    let key
    for (key in data) {
      if (!data.hasOwnProperty(key)) continue
      // if word from input matches word from lexicon add to matches
      if (arr.indexOf(key) > -1 && matches.indexOf(key) === -1) {
        matches.push(key)
      }
    }
    // return matches object
    return matches
  }

  /**
  * Loop through object and add up lexical weights
  * @function calcLex
  * @param  {Object} obj  matches object
  * @param  {number} int  intercept value
  * @return {number}  lexical value
  */
  const calcLex = (obj, int) => {
    let lex = 0
    // add weights
    let key
    for (key in obj) {
      if (!obj.hasOwnProperty(key)) continue
      lex += Number(obj[key]) // weight
    }
    // add intercept value
    lex += int
    // return final lexical value
    return lex
  }

  /**
  * @function optimismo
  * @param  {string} str  input string
  * @param  {Object} opts options object
  * @return {number}  optimism value
  */
  const optimismo = (str, opts) => {
    // make sure there is input before proceeding
    if (str == null) return null
    // make sure we're working with a string
    if (typeof str !== 'string') str = str.toString()
    // trim whitespace and convert to lowercase
    str = str.toLowerCase().trim()
    // option defaults
    if (opts == null) {
      opts = {
        'threshold': -999,    // minimum weight threshold
        'bigrams': true,      // match bigrams?
        'trigrams': true      // match trigrams?
      }
    }
    opts.threshold = opts.threshold || -999
    opts.bigrams = opts.bigrams || true
    opts.trigrams = opts.trigrams || true
    // convert our string to tokens
    let tokens = tokenizer(str)
    // if no tokens return null
    if (tokens == null) return 0
    // handle bigrams if wanted
    if (opts.bigrams) {
      const bigrams = getBigrams(str)
      tokens = tokens.concat(bigrams)
    }
    // handle trigrams if wanted
    if (opts.trigrams) {
      const trigrams = getTrigrams(str)
      tokens = tokens.concat(trigrams)
    }
    // get 'future' match tokens
    const future = getFuture(tokens)
    // match future tokens against affect lexicon
    const affect = getMatches(future, opts.threshold)
    // calculate lexical useage
    const lex = calcLex(affect.AFFECT, 5.037104721)
    // return lexical value
    return lex
  }

  optimismo.noConflict = function () {
    root.optimismo = previous
    return optimismo
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = optimismo
    }
    exports.optimismo = optimismo
  } else {
    root.optimismo = optimismo
  }
}).call(this)
