'use strict';

const Http = require('http');
const Lab = require('lab');
const PromQuery = require('../');

const { describe, it, expect } = exports.lab = Lab.script();


describe('getMetricNames()', () => {
  it('makes a request', (done) => {
    const server = Http.createServer((req, res) => {
      const payload = JSON.stringify({'status': 'success', 'data': [{ '__name__': 'up', 'instance': 'test_traefik_1', 'job': 'triton' }, { '__name__': 'load_average', 'instance': 'joyentportal_prometheus_1', 'job': 'triton' }, { '__name__': 'net_agg_packets_out', 'instance': 'joyentportal_rethinkdb_1', 'job': 'triton' }, { '__name__': 'net_agg_packets_in', 'instance': 'joyentportal_prometheus_1', 'job': 'triton' }, { '__name__': 'mem_swap', 'instance': 'joyentportal_compose-api_1', 'job': 'triton' }, { '__name__': 'mem_swap_limit', 'instance': 'joyentportal_prometheus_1', 'job': 'triton' } ] });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(payload);
    });

    server.listen(0, () => {
      const prom = new PromQuery({ url: `http://localhost:${server.address().port}` });
      prom.getMetricNames('triton', (err, names) => {
        expect(err).to.not.be.an.error();
        expect(names).to.contain('load_average');
        server.close();
        done();
      });
    });
  });
});


describe('getMetricNames()', () => {
  it('makes a request', (done) => {
    const server = Http.createServer((req, res) => {
      const payload = JSON.stringify({ 'status': 'success', 'data': { 'resultType': 'matrix', 'result': [{ 'metric': { '__name__': 'mem_agg_usage', 'instance': 'joyentportal_compose-api_1', 'job': 'triton' }, 'values': [[1502896217.371, '60518400'], [1502899817.371, '60641280'], [1502903417.371, '60575744']] }, { 'metric': { '__name__': 'net_agg_bytes_out', 'instance': 'joyentportal_compose-api_1', 'job': 'triton' }, 'values': [[1502896217.371, '64262042'], [1502899817.371, '65743772'], [1502903417.371, '67226695']] }] } });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(payload);
    });

    server.listen(0, () => {
      const prom = new PromQuery({ url: `http://localhost:${server.address().port}` });
      const options = {
        names: ['net_agg_bytes_out', 'mem_agg_usage'],
        instances: ['joyentportal_compose-api_1'],
        start: '2017-08-15T17:10:17.371Z',
        end: '2017-08-16T17:10:17.371Z'
      };

      prom.getMetrics(options, (err, metrics) => {
        expect(err).to.not.be.an.error();
        expect(metrics[0].name).to.equal('mem_agg_usage');
        expect(metrics[0].instance).to.equal('joyentportal_compose-api_1');
        expect(metrics[0].metrics.length).to.equal(3);
        server.close();
        done();
      });
    });
  });
});
