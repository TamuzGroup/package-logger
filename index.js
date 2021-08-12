const winston = require('winston');
const pJson = require('./package.json');
require('winston-daily-rotate-file');

function createMessage (fileName, text, level, serviceName, env) {
  // Format: level|time|platform|Environment|file name|message|
  const tNowStr = new Date().toISOString();
  return {level:level, time:tNowStr, service_name:serviceName, environment:env, path:fileName, message:text};
}

function parseParameters (data) {
  const fullStr = data.reduce((acc, s) => {
    let val = '';
    try {
      if (s.stack) val = `\n${s.stack}\n`; // if it is an exception
      else if (typeof s === 'object') val = JSON.stringify(s);
      else if (s) val = s.toString();
    } catch (e) { val = e.stack; }
    return `${acc} ${val}`;
  }, '');
  // convert all \n to .\t
  // return fullStr.trim().replace(new RegExp('\n', 'g'), () => '.\t');
  return fullStr.trim();
}

function getCallDetails() {
  try {
    const e = new Error();
    const frame = e.stack.split('\n')[3];
    const lineNumber = frame.split(':').reverse()[1];
    const fileName = frame.split('/').reverse()[0].split(':')[0];
    return `${fileName}:${lineNumber}`;
  } catch (e) {
    console.error(e);
    return 'FileNameError';
  }
}

const LOG_LEVELS = Object.freeze({
  DEBUG_LEVEL: 1,
  WARNING_LEVEL: 2,
  INFO_LEVEL: 3,
  ERROR_LEVEL: 4,
});

class Logger {

  constructor(serviceName, environmentName, minimalLevel = LOG_LEVELS.WARNING_LEVEL) {
    try {
      this.service = serviceName;
      this.environment = environmentName;
      this.level = minimalLevel;

      this.logger = winston.createLogger({
        levels: winston.config.npm.levels,
        format: winston.format.simple(),
        transports: [
          new winston.transports.Console({format: winston.format.json()}),
          new winston.transports.DailyRotateFile({
            filename: '/tmp/logs-%DATE%.log',
            format: winston.format.json(),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '100m', // 100MB
            maxFiles: '3', // delete older files, keep up to last 3
          }),
        ],
      });
    } catch (e) {
      console.error('Failed to create BaseLogger', e);
    }
  };

  getVersion() {
    return pJson.version;
  }

  error(...data) {
   try {
     if (this.level <= LOG_LEVELS.ERROR_LEVEL) {
       const detailedFile = getCallDetails();
       const fullStr = parseParameters(data);
       console.error(...data);
       this.logger.error(createMessage(detailedFile, fullStr, 'ERROR', this.service, this.environment));
     }
   } catch (e) { console.error(e); }
  };

  info(...data) {
     try {
       if (this.level <= LOG_LEVELS.INFO_LEVEL) {
         const detailedFile = getCallDetails();
         const fullStr = parseParameters(data);
         console.info(...data);
         this.logger.info(createMessage(detailedFile, fullStr, 'INFO', this.service, this.environment));
       }
     } catch (e) { console.error(e); }
   };

   warn(...data) {
     try {
       if (this.level <= LOG_LEVELS.WARNING_LEVEL) {
         const detailedFile = getCallDetails();
         const fullStr = parseParameters(data);
         console.warn(...data);
         this.logger.warn(createMessage(detailedFile, fullStr, 'WARN', this.service, this.environment));
       }
     } catch (e) { console.error(e); }
   };

   debug(...data) {
     try {
       if (this.level <= LOG_LEVELS.DEBUG_LEVEL) {
         const detailedFile = getCallDetails();
         const fullStr = parseParameters(data);
         console.debug(...data);
         this.logger.debug(createMessage(detailedFile, fullStr, 'DEBUG', this.service, this.environment));
       }
     } catch (e) { console.error(e); }
   };

   setMinimalLogLevel(minimalLevel) {
     this.level = minimalLevel;
   }
}

module.exports = {
  Logger,
  LOG_LEVELS
};
