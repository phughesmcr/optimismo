/**
 * optimismo
 * v0.1.3
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
 * let opt = optimismo(text);
 * console.log(opt)
 *
 * @param {string} str  input string
 * @return {number} optimism value
 */

'use strict'
;(function () {
  const root = this
  const previous = root.optimismo

  const hasRequire = typeof require !== 'undefined'

  let tokenizer = root.tokenizer
  let lexicon = root.lexicon

  if (typeof _ === 'undefined') {
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
  const getMatches = (arr) => {
    const matches = {}
    // loop through the lexicon categories
    const match = []
    // loop through words in category
    let key
    const data = lexicon.AFFECT
    for (key in data) {
      if (!data.hasOwnProperty(key)) continue
      // if word from input matches word from lexicon ...
      if (arr.indexOf(key) > -1) {
        let item = [key, data[key]]
        match.push(item)
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
  const getFuture = (arr) => {
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
      let weight = Number(obj[key][1])
      lex += weight
    }
    // add int
    lex += Number(int)
    // return final lexical value + intercept
    return Number(lex)
  }

  /**
  * @function optimismo
  * @param  {string} str input string
  * @return {number}  optimism value
  */
  const optimismo = (str) => {
    // make sure there is input before proceeding
    if (str == null) return 0
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
    // match future tokens against affect lexicon
    const affect = getMatches(future)
    // calculate lexical useage
    const lex = calcLex(affect.AFFECT, 5.037104721).toFixed(2)
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
