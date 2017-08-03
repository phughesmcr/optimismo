# optimismo

Analyse the optimism of a string.

## Usage
```Javascript
const optimismo = require('optimismo');
const text = "A big long string of text...";
const opts = {
  'bigrams': true,
  'trigrams': true
}
const opt = optimismo(text, opts);
console.log(opt, opts)
```
Scale runs from 1 (Completely pessimistic) to 9 (completely optimistic)
if there are no matches optimismo will return 0

The lexicon contains both bigrams and trigrams. We recommend you set these to true in the opts object, unless you're analysing very long text.


## Output
```Markdown
1 = very pessimistic, 5 = neutral, 9 = very optimistic
```

## Acknowledgements

Using the affect/intensity and prospection lexica data from [WWBP](http://www.wwbp.org/lexica.html)

Used under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported licence

# Licence
(C) 2017 P. Hughes

[Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/)
