### PDF Tool ###

Tool to manipulate PDF files with Ghostscript and Pdftk. The Ghostscript is native in Linux,
and Pdftk is in bin folder and is compiled only for Linux x64.

This repository is an example of manipulating PDF with few operations, feel free to fork and contribute.

* Requirements
```
- Any version of Linux x64
```

* Install
```
npm install viniciusps2/node-pdf-tool
```

* Using
```
const PdfTool = require('pdf-tool')

let stampFile = yield PdfTool
    .open(stampPdf)
    .moveFrame(5950, 8420, 0, -400)
    .rotate('1west')
    .exec()

let onePage = yield PdfTool
	.open(mainPdf2)
	.moveFrame(5950, 8420, -50, 0)
	.stamp(stampFile)
	.save(savedFile).exec()

yield onePage.clean()
yield stampFile.clean()
```

### Run Specs ###
* npm test

Maintaners
----------
* [Vinicius Sanches](https://github.com/viniciusps2)
