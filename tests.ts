import * as deepstream from 'deepstream.io-client-js'
import * as chai from 'chai'

const expect = chai.expect
const Deepstream = require('deepstream.io')
const portastic = require('portastic')

describe('stuff', () => {
  let server: any, url: string, client: deepstreamIO.Client
  // action$ is requests to deepstream - shamefully sent next elements through the tests
  // deep$ is events coming from deepstream

  before('start deepstream server', (next) => {
    portastic.find({ min: 6020, max: 6030 }).then((ports: Array<number>) => {
      url = `localhost:${ports[0]}`
      server = new Deepstream({ port: ports[0], logLevel: 'DEBUG' })
      server.on('started', () => {
        expect(server.isRunning()).to.be.true
        client = deepstream(url)
        next()
      })
      server.start()
    })
  })

  it('login should work', next => {
    client.login()
    client.on('connectionStateChanged', (state: string) => {
      if (state === 'OPEN') {
        next()
      }
    })
  })

  it('should allow creating records', next => {
    client.record.getRecord('record1').whenReady((record1: deepstreamIO.Record) => record1.set('name', 'record1'))
    client.record.getRecord('record2').whenReady((record1: deepstreamIO.Record) => record1.set('name', 'record2'))
    client.record.getRecord('record3').whenReady((record1: deepstreamIO.Record) => record1.set('name', 'record3', next))
  })

  it('should allow creating a list', next => {
    client.record.getList('list1').whenReady((list: deepstreamIO.List) => {
      list.setEntries(['record1', 'record2', 'record3'])
      next()
    })
  })

  it('should allow modifying a list', next => {
    client.record.getList('list1').whenReady((list: deepstreamIO.List) => {
      list.on('entry-removed', (entry: string, position: number) => {
        expect(entry).to.equal('record2')
        next()
      })
      list.removeEntry('record2')
    })
  })

  it('should allow retrieving list contents', next => {
    client.record.getList('list1').whenReady((list: deepstreamIO.List) => {
      expect(list.getEntries()).to.deep.equal(['record1', 'record3'])
      next()
    })
  })
})
