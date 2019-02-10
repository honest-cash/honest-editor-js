# honest-editor-js
[![Build Status](https://travis-ci.org/honest-cash/honest-editor-js.svg?branch=master)](https://travis-ci.org/honest-cash/honest-editor-js)

> Full-featured, open-source Markdown editor used at Honest.Cash.
> Based on StackEdit, the PageDown-Markdown library used by Stack Overflow and the other Stack Exchange sites.


**DEMO: https://editor.honest.cash** 

### Installation
``` bash
# install from npm
npm install honest-editor-js
```

### How to use?
Create a container in your HTML.
```html
<div id="honest-editor"></div>
```

```js
import HonestEditor from "honest-editor-js";
import "honest-editor-js/app.css";

const honestEditor = new HonestEditor("honest-editor");

honestEditor.setContent(`
  # Honest Editor
  ## brought to you by Honest.Cash

  - beautiful
  - ultrafast
  - real-time markdown -> html
  - offline saves
  - programmable interface
`);

honestEditor.subscribe(newMarkdown => {
  console.log(newMarkdown)
});
```

### Features:
 - Real-time HTML preview with Scroll Sync feature to bind editor and preview scrollbars
 - Markdown Extra/GitHub Flavored Markdown support and Prism.js syntax highlighting
 - LaTeX mathematical expressions using KaTeX
 - Diagrams and flowcharts using Mermaid
 - WYSIWYG control buttons
 - Smart layout
 - Offline editing


### License
Apache License Version 2.0

**NOTE:** This package is a fork of [StackEdit](https://stackedit.io/ "StackEdit").

**Changes:**
- wrapped stackedit into an importable module
- added subscribe and setContent methods
- removed elements for cloud saves


