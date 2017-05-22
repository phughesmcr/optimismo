# optimismo

Analyse the optimism of a string.

## Usage
```Javascript
const optimismo = require('optimismo');
const text = "A big long string of text...";
const min = 0.7
const opt = optimismo(text);
console.log(opt, min)
```
Scale runs from 1 (Completely pessimistic) to 9 (completely optimistic)
if there are no matches optimismo will return 0

Lexical weights run from a maximum of 0.91 to a minimum of -0.98
therefore a "min" value of -0.98 will include all words in the lexicon

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
