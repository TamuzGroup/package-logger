# package-logger

Logger utility for Givers repos

### Installation
```npm i --save TamuzGroup/package-logger```

### Parameters
1. Logs output location: /tmp/logs-%DATE%.log',
2. Date Pattern: 'YYYY-MM-DD-HH',
3. Each file size is up to: 100MB
4. Maximum number of files is 3

### Usage
1. Add to package.json dependencies

2. creating the logger in each file where it will be used:
const logger = require('package-logger')(__filename);

3. Using the logger:
logger.info('this is an info level log');
logger.warn('this is a warning level log');
try { throw new Error('logging an exception'); }
catch (e) { logger.error('this is an exception', e); }
