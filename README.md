# optimismo

Analyse the optimism of a string on a scale of 1 - 9

## Usage
```javascript
const optimismo = require('optimismo');
// These are the default and recommended options
const opts = {
  'encoding': 'binary',
  'locale': 'US',
  'logs': 3,
  'max': Number.POSITIVE_INFINITY,
  'min': Number.NEGATIVE_INFINITY,
  'nGrams': [2, 3],
  'noInt': false,
  'output': 'lex',
  'places': undefined,
  'sortBy': 'freq',
  'wcGrams': false,
};
const str = 'A string of text....';
const output = optimismo(str, opts);
console.log(output);  // {OPTIMISM: 4.89}
```
Scale runs from 1 (Completely pessimistic) to 9 (completely optimistic). 

If there are no matches optimismo will return null.

## Default Output
```javascript
 { OPTIMISM: 4.89 }
```
```Markdown
1 = very pessimistic, 5 = neutral, 9 = very optimistic
```

## The Options Object

The options object is optional and provides a number of controls to allow you to tailor the output to your needs. However, for general use it is recommended that all options are left to their defaults.

### "encoding"

**string - valid options: "binary" (default), "frequency", or "percent"**

*N.B - You probably don't want to change this, ever.*

Controls how the lexical value is calculated.

__Binary__ is simply the addition of lexical weights, i.e. word1 + word2 + word3.

__Frequency__ encoding takes the overall wordcount and word frequency into account, i.e. (word frequency / word count) * weight. Note that the encoding option accepts either 'freq' or 'frequency' to enable this option.

Another way to think of binary and frequency encoding is that 'binary' essentially sets all weights to '1', whereas frequency will generate a group norm. This is useful for predictive lexica, for example, when predicting age (see [predictAge](https://github.com/phugh/predictage)) we want to use frequency encoding because we care about the actual number generated - i.e. the lexical value *is* the predicted age. Whereas, when predicting optimism in this module 'binary' encoding is used because the final value doesn't particularly matter, only whether it is above or below 0 to indicate association.

__Percent__ returns the percentage of total (non-unique) tokens matched against the lexicon in each category as a decimal, i.e. 0.48 = 48%.

### 'locale'

**String - valid options: 'US' (default), 'GB'**

The lexicon data is in American English (US), if the string(s) you want to analyse are in International / British English set the locale option to 'GB'.

### 'logs'
**Number - valid options: 0, 1, 2, 3 (default)**
Used to control console.log, console.warn, and console.error outputs.
* 0 = suppress all logs
* 1 = print errors only
* 2 = print errors and warnings
* 3 = print all console logs

### 'max' and 'min'

**Number - accepts floats**

Each item in the lexicon data has an associated weight (number). Use these options to exclude words that have weights beyond a given maximum or minimum threshold.

By default these are set to infinity, ensuring that no words from the lexicon are excluded.

For English, -0.37 (default) will include everything from the lexicon, 0.85 will include nothing.

For Spanish, -0.85 (default) will include everything from the lexicon, 3.32 will include nothing.

### 'nGrams'

**Array - valid options: [ number, number, ...]**

*N.B the lexicon contains unigrams, bigrams, and trigrams. Including a value > 3 makes no sense and will impact performance drastically.*

n-Grams are contiguous pieces of text, bi-grams being chunks of 2, tri-grams being chunks of 3, etc.

Use the nGrams option to include n-gram chunks. For example if you want to include both bi-grams and tri-grams, use like so:

```javascript
{
  nGrams: [2, 3]
}
```

If you only want to include tri-grams:

```javascript
{
  nGrams: [3]
}
```

To disable n-gram inclusion, use the following:

```javascript
{
  nGrams: [0]
}
```

If the number of words in the string is less than the ngram number provided, the option will simply be ignored.

For accuracy it is recommended that n-grams are included, however including n-grams for very long strings can affect performance.

### 'noInt'

**Boolean - valid options: true or false (default)**

The lexica contain intercept values, set noInt to true to ignore these values.

Unless you have a specific need to ignore the intercepts, it is recommended you leave this set to false.

### 'output'

**String - valid options: 'lex' (default), 'matches', 'full'**

'lex' (default) returns an object of lexical values. See 'Defauly Output Example above.

'matches' returns an object with data about matched words. See 'matches output example' below.

'full' returns both of the above in one object with two keys, 'values' and 'matches'.

### 'places'

**Number - valid options between 0 and 20 inclusive.**

Number of decimal places to limit outputted values to.

The default is "undefined" which will simply return the value unchanged.

### 'sortBy'

**String - valid options: 'freq' (default), 'weight', or 'lex'**

If 'output' = 'matches', this option can be used to control how the outputted array is sorted.

'lex' sorts by final lexical value, (N.B. when using binary encoding [see 'encoding' above] the lexical value and the weight are identical.)

'weight' sorts the array by the matched words initial weight.

'freq' (default) sorts by word frequency, i.e. the most used words appear first.

### 'wcGrams'

**boolean - valid options: true or false (default)**

When set to true, the output from the nGrams option will be added to the word count.

For accuracy it is strongly recommended that this is set to false.

## {output: 'matches'} Output Example

```javascript
{
  OPTIMISM: {
    matches: [
      [ 'magnificent', 1, -192.0206116, -1.3914537072463768 ],
      [ 'capital', 1, -133.9311307, -0.9705154398550726 ],
      [ 'note', 3, -34.83417005, -0.7572645663043478 ],
      [ 'america', 2, -49.21227355, -0.7132213557971014 ],
      [ 'republic', 1, -75.5720402, -0.5476234797101449 ],
    ],
    info: {
      total_matches: 100,
      total_unique_matches: 63,
      total_tokens: 200,
      percent_matches: 50,
    }
  }
};
```

The items in each array represent: [0] - the term, [1] - number of times the term appears in string (frequency), [2] - the terms's weight, [3] - its final lexical value.

The final lexical value is affected by which 'encoding' option you're using.

## Acknowledgements

Using the affect/intensity and prospection lexica data from [WWBP](http://www.wwbp.org/lexica.html)

Used under the [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/)

# License
(C) 2017-18 [P. Hughes](https://www.phugh.es). All rights reserved.

Shared under the [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/) license.
