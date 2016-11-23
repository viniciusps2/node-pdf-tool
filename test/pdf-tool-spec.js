const path = require('path')
const PdfTool = require('../')
const File = require('../lib/file')

const mainPdf = path.join(__dirname, './fixtures/pdf-sample.pdf')
const mainPdf2 = path.join(__dirname, './fixtures/pdf-sample2.pdf')
const stampPdf = path.join(__dirname, './fixtures/stamp-file.pdf')
const savedFile = path.join(__dirname, './output/saved.pdf')

describe('PdfTool', () => {
  const clean = () => File.open(savedFile).delete()
  beforeEach(clean)
  after(clean)

  it('should rotate and move frame', function * () {
    let stampFile = yield PdfTool.open(stampPdf).slicePage(1).moveFrame(5950, 8420, 0, -400).rotate('1west').save(savedFile).exec()
    expect(stampFile.getResults()[0].res).to.contains('Processing pages 1')
    expect(stampFile.getResults()[1].res).to.contains('Processing pages 1')
    expect(stampFile.getResults()[2].res).to.contains('Adding page 1')
    yield stampFile.clean()
  })

  it('should get first page and stamp', function * () {
    let stampFile = yield PdfTool.open(stampPdf).slicePage(1).moveFrame(5950, 8420, 0, -400).rotate('1west').exec()

    let onePage = yield PdfTool.open(mainPdf).slicePage(1).stamp(stampFile).save(savedFile).exec()
    yield onePage.clean()
    yield stampFile.clean()

    expect(onePage.getResults()[0].res).to.contains('Processing pages 1 through 1')
    expect(onePage.getResults()[1].res).to.contains('Creating Output')
    expect(onePage.getResults()[2].cmd).to.contains('rename')
    expect(File.open(savedFile).exists()).to.be.ok
  })

  it('should get first page, move frame, and stamp', function * () {
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

    expect(onePage.getResults()[0].res).to.contains('Processing pages 1 through 1')
    expect(onePage.getResults()[1].res).to.contains('Creating Output')
    expect(onePage.getResults()[2].cmd).to.contains('rename')
    expect(File.open(savedFile).exists()).to.be.ok
  })

  it('should get first page, move frame to right, and stamp it', function * () {
    let stampFile = yield PdfTool
    .open(stampPdf)
    .rotate('1west')
    .exec()

    let onePage = yield PdfTool
    .open(mainPdf)
    .slicePage(1)
    .moveFrame(8420, 5950, 380, 0)
    .stamp(stampFile)
    .save(savedFile).exec()

    yield onePage.clean()
    yield stampFile.clean()

    expect(onePage.getResults()[0].res).to.contains('Processing pages 1 through 1')
    expect(File.open(savedFile).exists()).to.be.ok
  })
})
