# prom-query
Prometheus Query API Wrapper


## Usage

### Constructor

```
const prom = new PromQuery({ url: 'http://PROMETHEUS:PORT' });
````

### `getMetricNames(job, cb)`

Return an array of metric names for a given job.


### `getMetrics(options, cb)`

Return an array of metrics given the following options:
- `names`: array of metric names
- `instances`: array of instance names
- `start`: string representation of start date range to get metrics for
- `end`: string representation of end date range to get metrics for

Resulting metrics have the following format:

```
[
  {
    name: String,
    instance: String,
    metrics: [
      time: Date,
      value: Number
    ]
  }
]
```