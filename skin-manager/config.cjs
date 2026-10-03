'use strict';
const fs = require('node:fs');
const path = require('node:path');
const registry = require('./registry.js');
const defaults = () => ({version: 1, skin: 'default', remember: false, hideOnStartup: false});
function hideOnStartup(value) {
  // Read existing installations; new writes use the canonical startup flag.
  if (Object.hasOwn(value, 'hideOnStartup')) return value.hideOnStartup;
  if (Object.hasOwn(value, 'hideSelector')) return value.hideSelector;
  return false;
}
function valid(value) {
  return value && value.version === 1 && registry.has(value.skin) &&
    typeof value.remember === 'boolean' && typeof hideOnStartup(value) === 'boolean';
}
function read(file) {
  try {
    const value = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
    if (!valid(value)) throw Error('Invalid skin config');
    const config = {version: 1, skin: value.remember ? value.skin : 'default', remember: value.remember, hideOnStartup: hideOnStartup(value)};
    return {config, showSelector: !config.hideOnStartup, recovered: false};
  } catch (error) {
    return {config: defaults(), showSelector: true, recovered: error.code !== 'ENOENT'};
  }
}
function save(file, selection) {
  if (!selection || !registry.has(selection.skin) ||
    typeof selection.remember !== 'boolean' || typeof hideOnStartup(selection) !== 'boolean') throw Error('Invalid skin selection');
  const remember = selection.remember;
  const config = {version: 1, skin: remember ? selection.skin : 'default', remember, hideOnStartup: hideOnStartup(selection)};
  fs.mkdirSync(path.dirname(file), {recursive: true});
  const temporary = file + '.' + process.pid + '.tmp';
  try { fs.writeFileSync(temporary, JSON.stringify(config, null, 2) + '\n', {mode: 0o600}); fs.renameSync(temporary, file); }
  finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
  return config;
}
module.exports = {defaults, valid, read, save, hideOnStartup};
