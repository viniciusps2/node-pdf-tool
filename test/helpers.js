const wrap = require('co').wrap
const chai = require('chai')

require('co-mocha')

global.chai = chai
global.expect = chai.expect

global.returnError = wrap(function * (fn) {
  try {
    yield fn()
  } catch (err) {
    return err
  }
  return false
})
