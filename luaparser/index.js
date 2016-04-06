var luaparse = require('luaparse'),
	fs = require('fs'),
	path = require('path');

module.exports = function(mod){
	var dataName = path.join(mod.path, 'data.lua');
	var context = { mod: mod, data: [], parsed: {} };
	return parseFile(context, dataName, mod.files[dataName]).then(() => {
		mod.data = context.data;
		mod.filesLoaded = Object.keys(context.parsed);
		fs.writeFile('output/' + context.mod.name + '.json', JSON.stringify(mod.filesLoaded, undefined, 4));

		return mod;
	});
};

function loadFile(context, file){
	//console.log('loading', file);
	return new Promise((res, rej) => {
		fs.readFile(file, { encoding: 'utf-8' }, function(err, content){
			if(err) {
				console.log('could not read file', file);
				return res();
			}
			Promise.resolve(parseFile(context, file, content)).then(res);
		})
	})
}

function parseFile(context, fileName, fileContents){
	context.mod.files[fileName] = fileContents;

	var contents = luaparse.parse(fileContents);
	context.parsed[fileName] = contents;

	var requires = contents.body.filter(c => c.type == "CallStatement"
										  && c.expression.type == "CallExpression"
										  && c.expression.base.name == "require"
	);

	var ifStatementIndex = contents.body.findIndex(c => {
		if (c.type != "IfStatement") return;
		return c.clauses[0].type == 'IfClause'
			&& c.clauses[0].condition.base
			&& c.clauses[0].condition.base.name == 'data'
			&& c.clauses[0].condition.identifier.name == 'is_demo';
	});
	if(ifStatementIndex > -1){
		contents.body[ifStatementIndex].clauses[1].body.forEach(c => {
			if(c.type == "CallStatement"
				&& c.expression.type == "CallExpression"
				&& c.expression.base.name == "require") requires.push(c);
		});
	}

	if(requires.length){
		return Promise.all(requires.map(r => {
			var file =  r.expression.arguments[0].value;
			file =  path.resolve(context.mod.path, file.replace(/\./g,'/') + '.lua');
			return loadFile(context, file);
		})).then(() => evaluateFile(context, context.parsed[fileName], fileName));
	} else {
		return evaluateFile(context, context.parsed[fileName], fileName);
	}
}

function evaluateFile(context, parsed, fileName){
	var callExpressions = parsed.body.filter(c => c.type == "CallStatement"
											   && c.expression.type == "CallExpression"
											   && c.expression.base.type == "MemberExpression"
											   && c.expression.base.base.name == "data"
											   && c.expression.base.identifier.name == "extend"
	);

	callExpressions.forEach(expression => {
		// these are all the data:extend() calls
		var fields = expression.expression.arguments[0].fields;
		if(!expression.expression.arguments[0].fields){
			console.log('Could not load', fileName);
			return;
		}
		var json = toJSON(parsed, fields);
		for(var item of json){
			item.file = fileName;
			context.data.push(item);
		}
	});
}

function evaluateFunction(parsed, caller){
	console.log('finding function', caller.base.name);
	var func = parsed.body.find(b => {
		if(b.identifier && b.identifier.name == caller.base.name) return true;
		if(b.type == "AssignmentStatement" && b.variables[0].name == caller.base.name) return b;
	});
	if(!func) {
		console.log('function not found');
		return null;
	}
	if(func.type == "AssignmentStatement"){
		func = func.init[0];
	}
	if(!func.body || func.body.length != 1 || func.body[0].type != "ReturnStatement"){
		console.log('invalid body', func.body);
		return null;
	}
	return getJSONValue(parsed, func.body[0].arguments[0]);
}

function getJSONValue(parsed, field){
	switch(field.type){
		case 'StringLiteral': return field.value;
		case 'TableConstructorExpression': return toJSON(parsed, field.fields);
		case 'TableCallExpression': return toJSON(parsed, field.fields);
		case 'UnaryExpression': return -1 * field.argument.value;
		case 'NumericLiteral': return field.value;
		case 'BooleanLiteral': return field.value;
		case 'BinaryExpression': {
			var left = getJSONValue(parsed, field.left);
			var right = getJSONValue(parsed, field.right);
			switch(field.operator){
				case '*': return left * right;
				case '/': return left / right;
				case '-': return left - right;
				default:
					console.log('Unknown operator', field.operator, field);
			}
			return;
		}
		case 'CallExpression':
			if(field.base.name == "pipepictures") {
				return evaluateFunction(parsed, field);
			}
			break;
		case 'MemberExpression':
		case 'Identifier':
			// TODO: Implement?
			return;
		case 'LogicalExpression':
			if(field.left.type == "LogicalExpression" && field.left.left.type == "MemberExpression"
				&& field.left.left.identifier.name == "is_demo" && field.left.left.base.name == "data"
			) {
				return field.right.value;
			}
			console.log(JSON.stringify(field))
			break;
		default:
			if(field.type != 'CallExpression' && field.type != 'TableCallExpression')
				console.log('Unknown value', field.type, field);
	}
}

function toJSON(parsed, luaTable){
	var result = {};
	var index = 0;

	if(!luaTable) return [];

	for(var field of luaTable){
		switch(field.type){
			case 'TableValue':
				result[index++] = getJSONValue(parsed, field.value);
				break;
			case 'TableKeyString':
				if(field.key.name == "position"){
					console.log(JSON.stringify(field.value));
				}
				result[field.key.name] = getJSONValue(parsed, field.value);
				break;
			case '':
				break;
			default:
				console.log('Unknown type', field.type);
		}
	}
	if(Object.keys(result).every(k => k == parseInt(k))){
		result = Object.keys(result).map(key => result[key])
	}
	return result;
}