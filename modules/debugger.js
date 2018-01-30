'use strict';
/* eslint-env es6 */

const debug = require('debug');
const path = require('path');
const bunyan = require('bunyan');
const mkdirp = require('mkdirp');

const level = (process.env.DEBUG_FILE_LEVEL || '').trim().toLowerCase();
const logToFile = !!level;

const noLogging = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {}
};

const debugLog = name => {
  if (logToFile) {
    mkdirp(path.join(__dirname, '..', 'logs'));
  }
  const log = logToFile
    ? bunyan.createLogger({
        name,
        streams: [
          {
            path: path.join(__dirname, '..', 'logs', `${name}.log`),
            level
          }
        ]
      })
    : noLogging;

  const debugs = {
    debug: debug(name),
    info: debug(`${name}:info`),
    warn: debug(`${name}:warn`),
    error: debug(`${name}:error`)
  };

  return {
    debug: (...args) => {
      debugs.debug(...args);
      log.debug(...args);
    },
    info: (...args) => {
      debugs.info(...args);
      log.info(...args);
    },
    warn: (...args) => {
      debugs.warn(...args);
      log.warn(...args);
    },
    error: (...args) => {
      debugs.error(...args);
      log.error(...args);
    }
  };
};

module.exports = debugLog;
