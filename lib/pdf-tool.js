const path = require('path')
const child = require('child_process')
const File = require('./file')
const assert = require('assert')

const binPath = path.join(__dirname, '../bin')
let pdftkPath = 'LD_LIBRARY_PATH=' + binPath + ' ' + path.join(binPath, 'pdftk')

class PdfTool {
  constructor (inputFile) {
    this.inputFile = File.open(inputFile)
    this.lastTask = Promise.resolve(0)
    this.tasks = []
    this.results = []
    this.lastFiles = [this.inputFile]

    chainedAll.call(this, 'slicePage', 'moveFrame', 'save', 'rotate', 'stamp')
  }

  static open (inputFile) {
    return new PdfTool(inputFile)
  }

  static setPdftkPath (path) {
    pdftkPath = path
  }

  _slicePage (first, last) {
    return exec('gs', [
      '-dNOPAUSE',
      '-dBATCH',
      '-dFirstPage=' + first,
      '-dLastPage=' + (last || first),
      '-sDEVICE=pdfwrite',
      '-sOutputFile=' + this.createOutputFile(),
      '-f', this.inputFile
    ])
  }

  _moveFrame (pageWidth, pageHeight, offsetLeft, offsetTop) {
    const lastFile = this.getLastFile()
    return exec('gs', [
      '-o ' + this.createOutputFile(),
      '-sDEVICE=pdfwrite',
      `-g${pageWidth}x${pageHeight}`,
      `-c "<</PageOffset [${offsetLeft} ${offsetTop}]>> setpagedevice"`,
      '-f ' + lastFile
    ])
  }

  _save (file) {
    assert(file, 'Undefined file path to save')
    return this.getLastFile().rename(file).then(() => ({cmd: `rename to ${file}`}))
  }

  _rotate (direction) {
    return exec(pdftkPath, [
      this.getLastFile(),
      'cat',
      direction || '1west',
      'output',
      this.createOutputFile(),
      'verbose'
    ])
  }

  _stamp (stampFile) {
    return exec(pdftkPath, [
      this.getLastFile(),
      'stamp',
      stampFile.toString(),
      'output',
      this.createOutputFile(),
      'verbose'
    ])
  }

  clean () {
    let promises = this.lastFiles.map((file) => file.clean())
    return Promise.all(promises)
  }

  exec () {
    return each(this.tasks).then(() => this)
  }

  logResults (res) {
    this.results.push(res)
  }

  getResults () {
    return this.results
  }

  getLastFile () {
    return this.lastFiles.slice(-1)[0]
  }

  toString () {
    return this.getLastFile()
  }

  getResultFile () {
    return this.getLastFile().toString()
  }

  createOutputFile (path) {
    let lastFile = File.open(path)
    this.lastFiles.push(lastFile)
    return lastFile
  }
}

function chained (fn) {
  return function () {
    const task = () => fn.apply(this, [].slice.call(arguments)).then((result) => this.logResults(result))
    this.tasks.push(task)
    return this
  }.bind(this)
}

function chainedAll () {
  const methodNames = [].slice.call(arguments)
  methodNames.map((name) => (this[name] = chained.call(this, this['_' + name])))
}

function exec (program, args) {
  return new Promise((resolve, reject) => {
    const cmd = [program].concat(args).join(' ')
    child.exec(cmd, (err, res) => err ? reject(err) : resolve({cmd, res}))
  })
}

function each (fns) {
  return fns.reduce((p, f) => p.then(f), Promise.resolve())
}

module.exports = PdfTool
