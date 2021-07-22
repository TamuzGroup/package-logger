const winston = require('winston');
require('winston-daily-rotate-file');

const logger = winston.createLogger({
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

const service = 'SERVICE';
const environment = 'ENV';

const createMessage = (fileName, text, level, serviceName, env) => {
  // Format: level|time|platform|Environment|file name|message|
  const tNowStr = new Date().toISOString();
  return `${level}|${tNowStr}|${serviceName}|${env}|${fileName}|${text}|`;
};

const parseParameters = function (data) {
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

const getCallDetails = () => {
  const e = new Error();
  const frame = e.stack.split('\n')[3];
  return frame.split(':').reverse()[1];
};

module.exports = function (fileName, serviceName = service, envName = environment) {
  return {
    error(...data) {
      try {
        const call = getCallDetails();
        const detailedFile = `${fileName}:${call}`;
        const fullStr = parseParameters(data);
        console.error(...data);
        logger.error(createMessage(detailedFile, fullStr, 'ERROR', serviceName, envName));
      } catch (e) { console.error(e); }
    },
    info(...data) {
      try {
        const call = getCallDetails();
        const detailedFile = `${fileName}:${call}`;
        const fullStr = parseParameters(data);
        console.info(...data);
        logger.info(createMessage(detailedFile, fullStr, 'INFO', serviceName, envName));
      } catch (e) { console.error(e); }
    },
    warn(...data) {
      try {
        const call = getCallDetails();
        const detailedFile = `${fileName}:${call}`;
        const fullStr = parseParameters(data);
        console.warn(...data);
        logger.warn(createMessage(detailedFile, fullStr, 'WARN', serviceName, envName));
      } catch (e) { console.error(e); }
    },
    debug(...data) {
      try {
        const call = getCallDetails();
        const detailedFile = `${fileName}:${call}`;
        const fullStr = parseParameters(data);
        console.debug(...data);
        logger.debug(createMessage(detailedFile, fullStr, 'DEBUG', serviceName, envName));
      } catch (e) { console.error(e); }
    },
  };
};
