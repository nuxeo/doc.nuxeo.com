const debug = require('debug');
const path = require('path');
const pino = require('pino');
const mkdirp = require('mkdirp');

const level = (process.env.DEBUG_FILE_LEVEL || '').trim().toLowerCase();
const logToFile = !!level;

const logBase = path.join(__dirname, '..', 'logs');
const levels = ['debug', 'info', 'warn', 'error'];

const debugLog = (name) => {
  let logs;
  if (logToFile) {
    mkdirp(logBase);
    logs = pino(
      { name, level },
      pino.destination(path.join(logBase, `${name}.log`))
    );
  }

  const debugs = levels.reduce((debugging, logLevel, index) => {
    // Create base logging with name and then extend for subsequent log levels
    if (!index) {
      debugging[logLevel] = debug(name);
    } else {
      debugging[logLevel] = debugging[levels[0]].extend(logLevel);
    }
    return debugging;
  }, {});

  // Return object with appropriate log properties
  return levels.reduce((debugging, logLevel) => {
    debugging[logLevel] = (...args) => {
      debugs[logLevel](...args);

      if (logToFile) {
        logs[logLevel](...args);
      }
    };
    return debugging;
  }, {});
};

module.exports = debugLog;
