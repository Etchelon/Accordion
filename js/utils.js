"use strict";

/**
 * Returns whether the provided object is nil (null or undefined)
 * @param {any} value The object to test
 * @returns {boolean}
 */
function isNil(value) {
	return value === void 0 || value === null;
}

/**
 * Assert that a condition is true, and throw an error message otherwise
 * @param {boolean} condition The condition that should be true
 * @param {string} message The error message if the assertion fails
 */
function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}
