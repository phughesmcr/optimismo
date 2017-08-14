/**
 * optimismo
 * v0.4.0
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
 * const str = "A big long string of text...";
 * const optimism = optimismo(str);
 * console.log(optimism)
 *
 * Scale runs from 1 (Completely pessimistic) to 9 (completely optimistic)
 * If there are no matches optimismo will return 0
 *
 * @param {string} str  input string
 * @return {number} optimism value between 1 and 9
 */

'use strict'
;(function () {
  const root = this
  const previous = root.optimismo

  let lexicon = root.lexicon
  let simplengrams = root.simplengrams
  let tokenizer = root.tokenizer

  if (typeof tokenizer === 'undefined') {
    if (typeof require !== 'undefined') {
      lexicon = require('./data/lexicon.json')
      simplengrams = require('simplengrams')
      tokenizer = require('happynodetokenizer')
    } else throw new Error('optimismo required happynodetokenizer, simplengrams and ./data/lexicon.json')
  }

  /**
   * Combines multidimensional array elements into strings
   * @function arr2string
   * @param  {Array} arr input array
   * @return {Array} output array
   */
  const arr2string = arr => {
    let i = 0
    const len = arr.length
    const result = []
    for (i; i < len; i++) {
      result.push(arr[i].join(' '))
    }
    return result
  }

  /**
  * @function getAffect
  * @param  {Array} arr token array
  * @return {Object}  object of matches
  */
  const getAffect = arr => {
    const matches = {}
    // loop through the lexicon categories
    const match = []
    // loop through words in category
    let word
    const data = lexicon.AFFECT
    for (word in data) {
      if (!data.hasOwnProperty(word)) continue
      // if word from input matches word from lexicon ...
      let weight = data[word]
      if (arr.indexOf(word) > -1) {
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
    let word
    for (word in data) {
      if (!data.hasOwnProperty(word)) continue
      // if word from input matches word from lexicon add to matches
      if (arr.indexOf(word) > -1 && matches.indexOf(word) === -1) {
        matches.push(word)
      }
    }
    // return matches object
    return matches
  }

  /**
  * Loop through object and add up lexical weights
  * @function calcLex
  * @param {Object} obj matches object
  * @param {number} int intercept value
  * @return {number} lexical value
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
  * @return {number}  optimism value
  */
  const optimismo = str => {
    // make sure there is input before proceeding
    if (str == null) return null
    // make sure we're working with a string
    if (typeof str !== 'string') str = str.toString()
    // trim whitespace and convert to lowercase
    str = str.toLowerCase().trim()
    // convert our string to tokens
    let tokens = tokenizer(str)
    // if no tokens return null
    if (tokens == null) return null
    // get n-grams
    const ngrams = []
    ngrams.push(arr2string(simplengrams(str, 2)))
    ngrams.push(arr2string(simplengrams(str, 3)))
    const nLen = ngrams.length
    let i = 0
    for (i; i < nLen; i++) {
      tokens = tokens.concat(ngrams[i])
    }
    console.log(tokens)
    // get 'future' match tokens
    const future = getFuture(tokens)
    // match future tokens against affect lexicon
    const affect = getAffect(future)
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
