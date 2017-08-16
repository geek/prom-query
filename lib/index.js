'use strict';

const Assert = require('assert');
const Url = require('url');
const Wreck = require('wreck');

module.exports = class PromQuery {
  constructor (options) {
    Assert(options && (typeof options.url === 'string'), 'options.url is required');

    const url = Url.parse(options.url);
    url.pathname = '/api/v1/';

    this._wreck = Wreck.defaults({ baseUrl: Url.format(url) });
  }

  getMetricNames (job, cb) {
    this._wreck.get(`series?match[]={job="${job}"}`, { json: true }, (err, res, payload) => {
      if (err) {
        return cb(err);
      }

      if (!payload || !payload.data || !payload.data.length) {
        return cb(null, []);
      }

      const names = payload.data.map((metric) => {
        return metric['__name__'];
      });

      const filteredNames = [];
      names.forEach((name) => {
        if (!filteredNames.includes(name)) {
          filteredNames.push(name);
        }
      });

      filteredNames.sort();

      cb(null, filteredNames);
    });
  }

  getMetrics (options, cb) {
    Assert(options && typeof options === 'object', 'options is required and must be an object with properties names, instances, start, end');
    Assert(Array.isArray(options.names), 'names are required and must be an array of metric names');
    Assert(Array.isArray(options.instances), 'instances are required and must be an array');
    Assert(typeof options.start === 'string', 'start is required and must be a date/time string');
    Assert(typeof options.end === 'string', 'end is required and must be a date/time string');

    const path = `query_range?query={__name__=~"${options.names.join('|')}",instance=~"${options.instances.join('|')}"}&start=${options.start}&end=${options.end}&step=30s`;
    this._wreck.get(path, { json: true }, (err, res, payload) => {
      if (err) {
        return cb(err);
      }

      if (!payload || !payload.data || !payload.data.result || !payload.data.result.length) {
        return cb(null, []);
      }

      const metrics = payload.data.result.map((result) => {
        const metric = {
          name: result.metric['__name__'],
          instance: result.metric.instance
        };

        metric.metrics = result.values.map((point) => {
          return {
            // returned as a unix timestamp
            time: new Date(point[0] * 1000),
            value: point[1]
          };
        });

        return metric;
      });

      cb(null, metrics);
    });
  }
};
