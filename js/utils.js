"use strict";

/**
 * Returns whether the provided object is nil (null or undefined)
 * @param {any} value The object to test
 * @returns {boolean}
 */
function isNil(value) {
  return value === void 0 || value === null;
}

const identity = value => value;
