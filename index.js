const winston = require('winston');
require('winston-daily-rotate-file');

class BaseLogger {

  constructor(serviceName, environmentName) {
    this.service = serviceName;
    this.environment = environmentName;

    this.logger = winston.createLogger({
      levels: winston.config.npm.levels,
      format: winston.format.simple(),
      transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
        new winston.transports.DailyRotateFile({
          filename: '/tmp/logs-%DATE%.log',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: true,
          maxSize: '100m', // 100MB
          maxFiles: '3', // delete older files, keep up to last 3
        }),
      ],
    });
  };

  createMessage (fileName, text, level, serviceName, env) {
    // Format: level|time|platform|Environment|file name|message|
    const tNowStr = new Date().toISOString();
    return `${level}|${tNowStr}|${serviceName}|${env}|${fileName}|${text}|`;
  };

  parseParameters (data) {
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
  };

  getCallDetails() {
    try {
      const e = new Error();
      const frame = e.stack.split('\n')[3];
      const lineNumber = frame.split(':').reverse()[1];
      const fileName = frame.split('/').reverse()[0].split(':')[0];
      return `${fileName}:${lineNumber}`;
    } catch (e) {
      console.log(e);
      return 'FileNameError';
    }
  };

  error(...data) {
   try {
     const detailedFile = this.getCallDetails();
     const fullStr = this.parseParameters(data);
     console.error(...data);
     this.logger.error(this.createMessage(detailedFile, fullStr, 'ERROR', this.service, this.environment));
   } catch (e) { console.error(e); }
  };

  info(...data) {
     try {
       const detailedFile = this.getCallDetails();
       const fullStr = this.parseParameters(data);
       console.info(...data);
       this.logger.info(this.createMessage(detailedFile, fullStr, 'INFO', this.service, this.environment));
     } catch (e) { console.error(e); }
   };

   warn(...data) {
     try {
       const detailedFile = this.getCallDetails();
       const fullStr = this.parseParameters(data);
       console.warn(...data);
       this.logger.warn(this.createMessage(detailedFile, fullStr, 'WARN', this.service, this.environment));
     } catch (e) { console.error(e); }
   };

   debug(...data) {
     try {
       const detailedFile = this.getCallDetails();
       const fullStr = this.parseParameters(data);
       console.debug(...data);
       this.logger.debug(this.createMessage(detailedFile, fullStr, 'DEBUG', this.service, this.environment));
     } catch (e) { console.error(e); }
   };
}

module.exports = BaseLogger;
