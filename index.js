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

let service = 'SERVICE';
let environment = 'ENV';

const updateServiceName = (serviceName) => { service = serviceName; }

const updateEnvironmentName = (environmentName) => { environment = environmentName; }

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
  try {
    const e = new Error();
    const frame = e.stack.split('\n')[3];
    const lineNumber = frame.split(':').reverse()[1];
    // const fileName = frame.split('/').reverse()[0].split(':')[0];
    const fileName = frame.split('/').reverse()[0];
    return `${fileName}:${lineNumber}`;
  } catch (e) {
    console.log(e);
    return 'FileNameError';
  }
};

module.exports = {
  function () {
    return {
      error(...data) {
        try {
          const detailedFile = getCallDetails();
          const fullStr = parseParameters(data);
          console.error(...data);
          logger.error(createMessage(detailedFile, fullStr, 'ERROR', service, environment));
        } catch (e) { console.error(e); }
      },
      info(...data) {
        try {
          const detailedFile = getCallDetails();
          const fullStr = parseParameters(data);
          console.info(...data);
          logger.info(createMessage(detailedFile, fullStr, 'INFO', service, environment));
        } catch (e) { console.error(e); }
      },
      warn(...data) {
        try {
          const detailedFile = getCallDetails();
          const fullStr = parseParameters(data);
          console.warn(...data);
          logger.warn(createMessage(detailedFile, fullStr, 'WARN', service, environment));
        } catch (e) { console.error(e); }
      },
      debug(...data) {
        try {
          const detailedFile = getCallDetails();
          const fullStr = parseParameters(data);
          console.debug(...data);
          logger.debug(createMessage(detailedFile, fullStr, 'DEBUG', service, environment));
        } catch (e) { console.error(e); }
      },
    };
  },
  updateServiceName,
  updateEnvironmentName,
};
