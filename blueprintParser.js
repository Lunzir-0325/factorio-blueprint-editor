window.parseBlueprintString = function(str) {
	"use strict";
	var zlib = require('zlib'),
		fs = require('fs');

	class LuaParser {
		// Creates the LUA parser and sets initial variables
		constructor(buffer) {
			this._buffer = buffer;
			this._index = 0;
		}

		// Parses the LUA object
		parse() {
			// parses the stack and store the result
			var result = this.parseStack();

			// Our first (and only) entry will be something like:
			// {"do local _": {<actual blueprint>}}
			// we'll just strip this because we can

			return result[Object.keys(result)[0]];
		}

		// Convert a stack to an object
		// This can be one of the following options:

		// ["name=", "\"straight-rail\""]
		// This needs to be converted into:
		// { name: "straight-rail" }

		// ["[3]=", "\"chemical-plant\""]
		// Here we simply convert it to:
		// [3: "chemical-plant"]

		// [<inner stack>, <inner stack>]
		// we can just leave this as it is
		convertStackToObject(stack) {
			var result = {};

			// parse all keys, even index (0, 2, 4, etc)
			for (var i = 0; i < stack.length - 1; i += 2) {
				if (typeof(stack[i]) !== "string") {
					// This entry is not a key! This means we're dealing with an array of objects
					// This means we can just return the original stack, as this is already an array

					return stack;
				}

				// parse the key and value
				var key = stack[i].substring(0, stack[i].length - 1);
				var value = this.parseValue(stack[i + 1]);

				result[key] = value;
			}

			// Now we have an object of key-value pairs
			// There is one exception; if all keys are
			// [0], [1], etc
			// This means we're actually dealing with a LUA array
			// NOT an object
			// so we check for this

			if (Object.keys(result).length) {
				var keys = Object.keys(result);

				// Check if every key is [0], [1], etc
				var resultIsArray = keys.every(key => /^\[\d+\]$/.test(key));

				if (resultIsArray) {
					// Okay, so we just return all the values
					// NOTE: we could possibly change the index here
					// This might be desired to keep in the future
					var resultArray = [];
					for (var i = 0; i < keys.length; i++) {
						resultArray[i] = result[keys[i]];
					}
					result = resultArray;
				}
			}

			return result;
		}

		// Parses the value of a key. This is one of the following:
		// <object>: return the object, don't change it
		// "someText": return the value as text between quotes
		// "-15.3": return the float value of the string
		// TODO: Are there other possibilities?
		parseValue(value) {
			if (typeof(value) !== "string") return value;
			if (value[0] == '"' && value[value.length - 1] == '"') {
				return value.substring(1, value.length - 1);
			}
			return parseFloat(value);
		}

		// Parse a single stack
		// A stack is one of the following formats:

		// LUA: {key="value"}
		// JSON: { "key": "value" }

		// LUA: {key={{x=-1},{x=-2}}}
		// JSON: { "key": [ { "x": -1 }, { "x": -2 } ] }
		parseStack() {
			var index = 0;
			var result = [];
			while (this._index < this._buffer.length) {
				var char = this.takeChar();
				if (char == '}') {
					break;
				}
				if (char == '{') {
					result.push(this.parseStack());
					index++;
					if (this.peekChar() == ',') {
						this.takeChar();
					}
				} else if (char == ',') {
					index++;
				} else {
					result[index] = (result[index] || '') + char;
					if (char == '=') {
						index++;
					}
				}
			}

			return this.convertStackToObject(result);
		}

		// Return the next character, but leaves the character intact
		peekChar() {
			return String.fromCharCode(this._buffer[this._index]);
		}

		// Returns the next character. After this call, the internal
		// pointer will point to the character after this one
		takeChar() {
			return String.fromCharCode(this._buffer[this._index++]);
		}
	}

	var buffer = new Buffer(str, 'base64');

	return new Promise((res, rej) => {
		zlib.gunzip(buffer, function (error, data) {
			if(error) return rej(error);

			// Do the actual parsing
			var table = new LuaParser(data).parse();

			res(table);
		});
	});

};