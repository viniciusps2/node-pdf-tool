const os = require('os')
const fs = require('fs')
const path = require('path')

class File {
  constructor (path) {
    path ? this.setPath(path) : this.setTempFile()
  }

  static open (path) {
    return path instanceof File ? path : new File(path)
  }

  setTempFile () {
    this.path = path.join(os.tmpdir(), '_file-tool-tmp_' + Math.random().toString(28).substring(2, 10) + '.pdf')
    this.temp = true
  }

  setPath (path) {
    this.path = path
    this.temp = false
  }

  clean () {
    return this.temp ? this.delete() : Promise.resolve(true)
  }

  delete () {
    return this.exists().then((exists) => exists ? deleteFile(this.path) : Promise.resolve(false))
  }

  rename (to) {
    if (this.path === to) return Promise.resolve(false)
    return rename(this.path, to).then(() => {
      this.path = to
      this.temp = false
    })
  }

  exists () {
    return existsFile(this.path)
  }

  toString () {
    return this.path
  }
}

function rename (from, to) {
  return new Promise((resolve, reject) => {
    fs.rename(from, to, (err, res) => err ? reject(err) : resolve(res))
  })
}

function existsFile (path) {
  return new Promise((resolve, reject) => {
    fs.exists(path, (res) => resolve(res))
  })
}

function deleteFile (file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file, (err, res) => err ? reject(err) : resolve(res))
  })
}

module.exports = File
