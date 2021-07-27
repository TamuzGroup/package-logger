const winston = require('winston');
require('winston-daily-rotate-file');

function createMessage (fileName, text, level, serviceName, env) {
  // Format: level|time|platform|Environment|file name|message|
  const tNowStr = new Date().toISOString();
  return `${level}|${tNowStr}|${serviceName}|${env}|${fileName}|${text}|`;
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
  return fullStr.trim().replace(new RegExp('\n', 'g'), () => '.\t');
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

class Logger {

  LOG_LEVELS = {
    DEBUG_LEVEL: 1,
    WARNING_LEVEL: 2,
    INFO_LEVEL: 3,
    ERROR_LEVEL: 4,
  };

  constructor(serviceName, environmentName, minimalLevel = this.LOG_LEVELS.WARNING_LEVEL) {
    try {
      this.service = serviceName;
      this.environment = environmentName;
      this.level = minimalLevel;

      this.logger = winston.createLogger({
        levels: winston.config.npm.levels,
        format: winston.format.simple(),
        transports: [
          new winston.transports.Console({format: winston.format.simple()}),
          new winston.transports.DailyRotateFile({
            filename: '/tmp/logs-%DATE%.log',
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

  error(...data) {
   try {
     if (this.level <= this.LOG_LEVELS.ERROR_LEVEL) {
       const detailedFile = getCallDetails();
       const fullStr = parseParameters(data);
       console.error(...data);
       this.logger.error(createMessage(detailedFile, fullStr, 'ERROR', this.service, this.environment));
     }
   } catch (e) { console.error(e); }
  };

  info(...data) {
     try {
       if (this.level <= this.LOG_LEVELS.INFO_LEVEL) {
         const detailedFile = getCallDetails();
         const fullStr = parseParameters(data);
         console.info(...data);
         this.logger.info(createMessage(detailedFile, fullStr, 'INFO', this.service, this.environment));
       }
     } catch (e) { console.error(e); }
   };

   warn(...data) {
     try {
       if (this.level <= this.LOG_LEVELS.WARNING_LEVEL) {
         const detailedFile = getCallDetails();
         const fullStr = parseParameters(data);
         console.warn(...data);
         this.logger.warn(createMessage(detailedFile, fullStr, 'WARN', this.service, this.environment));
       }
     } catch (e) { console.error(e); }
   };

   debug(...data) {
     try {
       if (this.level <= this.LOG_LEVELS.DEBUG_LEVEL) {
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

module.exports = Logger;
