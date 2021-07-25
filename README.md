# package-logger

Logger utility for Givers repos

### Installation
```npm i --save TamuzGroup/package-logger```

### Parameters
1. Logs output location: /tmp/logs-%DATE%.log',
2. Date Pattern: 'YYYY-MM-DD-HH',
3. Each file size is up to: 100MB
4. Maximum number of files is 3

### Messages Format
level|time|serviceName|environmentName|fileName:LineNumber|text|

level, time, fileName:LineNumber - automatic fields

text - is the logged argument

serviceName, environmentName - can be configured via dedicated functions


### Usage 
1. Add to package.json dependencies

2. creating the myLogger module:
   const Logger = require('package-logger');

   const logger = new Logger('ServiceName', 'EnvironmentName');

   module.exports = logger;

3. creating the logger in each file where it will be used:
   const logger = require('myLogger');

4. Using the logger:
   logger.info('this is an info level log');
   logger.warn('this is a warning level log');
   try { throw new Error('logging an exception'); }
   catch (e) { logger.error('this is an exception', e); }