/**
 * optimismo
 * v0.1.4
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
 * const min = 0.09
 * const opt = optimismo(text);
 * console.log(opt)
 *
 * Scale runs from 1 (Completely pessimistic) to 9 (completely optimistic)
 * if there are no matches optimismo will return 0
 *
 * Lexical weights run from a maximum of 0.91 to a minimum of -0.98
 * therefore a "min" value of -0.98 will include all words in the lexicon
 *
 * @param {string} str  input string
 * @param {number} min  minimum lexical weight threshold for matches (0.91 to -0.98)
 * @return {number} optimism value
 */

'use strict'
;(function () {
  const root = this
  const previous = root.optimismo

  let tokenizer = root.tokenizer
  let lexicon = root.lexicon

  if (typeof tokenizer === 'undefined') {
    const hasRequire = typeof require !== 'undefined'
    if (hasRequire) {
      tokenizer = require('happynodetokenizer')
      lexicon = require('./data/lexicon.json')
    } else throw new Error('optimismo required happynodetokenizer and ./data/lexicon.json')
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
  * @function calcLex
  * @param  {Object} obj  matches object
  * @param  {number} wc   word count
  * @param  {number} int  intercept value
  * @return {number}  lexical value
  */
  const calcLex = (obj, int) => {
    // loop through the matches and get the word frequency (counts) and weights
    let key
    let lex = 0
    for (key in obj) {
      if (!obj.hasOwnProperty(key)) continue
      lex += Number(obj[key])
    }
    // add int
    lex += int
    // return final lexical value + intercept
    return lex
  }

  /**
  * @function optimismo
  * @param  {string} str input string
  * @return {number}  optimism value
  */
  const optimismo = (str, min) => {
    // make sure there is input before proceeding
    if (str == null) return null
    // make sure we're working with a string
    if (typeof str !== 'string') str = str.toString()
    // trim whitespace and convert to lowercase
    str = str.toLowerCase().trim()
    // convert our string to tokens
    const tokens = tokenizer(str)
    // if no tokens return null
    if (tokens == null) return 0
    // get 'future' match tokens
    const future = getFuture(tokens)
    // if no minimum set to -999
    if (min == null) min = -999
    // make sure min is a number
    if (typeof min !== 'string') min = Number(min)
    // match future tokens against affect lexicon
    const affect = getMatches(future, min)
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
