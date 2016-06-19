var UP8 = 0,
	RIGHT8 = 2,
	DOWN8 = 4,
	LEFT8 = 6;

var renderer = {};

function load(url, cb){
	var request = new XMLHttpRequest();
	request.open('GET', url);
	request.addEventListener('load', function(){
		try {
			var json = JSON.parse(this.responseText);
			cb(null, json);
		} catch(ex){
			cb(ex);
		}
	});
	request.send();
}

load('/files.json', function(err, files){
	var loaded = 0;
	for(var x in files){
		if(!files.hasOwnProperty(x)) continue;

		load(files[x], function(err, loadedEntities){
			entities = entities.concat(loadedEntities);
			loaded++;
			if(loaded == files.length){
				button.onclick();
			}
		});
	}
});

var animating = false;
var animations = [];

function startAnimations(){
	function update(){
		if(!animating){
			return;
		}
		animations.forEach(function(animation){
			if(!animation.image.style.backgroundPosition) animation.image.style.backgroundPosition = '0px 0px';
			var position = animation.image.style.backgroundPosition.split(' ');
			var value = parseInt(position[0]);
			value += animation.settings.step;
			if((animation.settings.maxValue > 0 && value > animation.settings.maxValue) || (animation.settings.maxValue < 0 && value < animation.settings.maxValue)){
				value = animation.settings.minValue;
			}
			animation.image.style.backgroundPosition = value + 'px ' + position[1];
		});
		if(animating){
			window.requestAnimationFrame(update);
		}
	}
	animating = true;
	window.requestAnimationFrame(update);
}

var textarea = document.createElement('textarea');
textarea.onchange = function(){
	var start = Date.now();
	window.parseBlueprintString(textarea.value.replace(/\r\n\t /g, '')).then(def => {
		for(var x in def.entities){
			if(!def.entities.hasOwnProperty(x)) continue;
			def.entities[x].entity = entities.find(j => j.name == def.entities[x].name
				&& j.type != 'item'
				&& j.type != 'recipe'
			);
			if(def.entities[x].recipe){
				def.entities[x].recipe = entities.find(j => j.name == def.entities[x].recipe
					&& j.type == 'recipe'
				);
				def.entities[x].recipe.entity = entities.find(j => {
					if(j.type != 'item' && j.type != 'fluid' && j.type != 'tool') return false;
					if(def.entities[x].recipe.results){
						return def.entities[x].recipe.results.some(r => r.name == j.name);
					} else {
						return j.name == def.entities[x].recipe.result;
					}
				});
			}
		}
		var entityNotFoundNames = [];
		def.entities.filter(e => !e.entity).forEach(function(e){
			if(entityNotFoundNames.indexOf(e.name) > -1) return;
			entityNotFoundNames.push(e.name);
			console.log('Could not find entity', e.name);
		});
		blueprint = def;
		console.log('loaded', def.entities.length, 'entities in', Date.now() - start, 'ms');
		renderBlueprint();
	});
};
document.body.appendChild(textarea);
var button = document.createElement('button');
button.onclick = function() { textarea.onchange(); };
button.innerText = 'update';
document.body.appendChild(button);

var blueprint = {};
var blueprintEntities = [];
var entities = [];
var blueprintString = "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";

var topLeft, bottomRight;
textarea.value = blueprintString;

function entityExists(cb){
	return blueprint.entities.some(cb);
}
function entityExistsAt(x, y, direction, types){
	if(!Number.isInteger(direction)){
		types = direction;
		direction = -1;
	}
	if(!Array.isArray(types)) types = [types];
	return entityExists(e => types.indexOf(e.entity.type) > -1 && e.position.x == x && e.position.y == y && (direction == -1 || e.direction == direction || (direction == 0 && !e.direction)));
}
function renderBlueprint(){
	topLeft = {x: 0, y: 0};
	bottomRight = {x: 0, y: 0};
	blueprint.entities.forEach(function(entity) {
		topLeft.x = Math.min(topLeft.x, entity.position.x);
		topLeft.y = Math.min(topLeft.y, entity.position.y);

		bottomRight.x = Math.max(bottomRight.x, entity.position.x);
		bottomRight.y = Math.max(bottomRight.y, entity.position.y);
	});
	blueprintEntities.forEach(function(e){
		document.body.removeChild(e.image);
	});
	topLeft.y -= 2;
	topLeft.x -= 2;
	blueprintEntities = [];
	animations = [];
	animating = false;

	blueprint.entities.forEach(function(entity){
		if(!renderer[entity.entity.type]){
			console.log('Unknown entity type:', entity.entity.type, entity);
		} else {
			renderer[entity.entity.type](entity);
		}
	});
	startAnimations();
	/*
	for(var x = Math.floor(topLeft.x + 2); x < bottomRight.x; x += 1){
		for(var y = Math.floor(topLeft.y + 2); y < bottomRight.y; y += 1){
			var div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.border = '1px solid #000';
			div.style.width = '32px';
			div.style.height = '32px';
			div.style.top = (y - topLeft.y) * 32 + 'px';
			div.style.left = (x - topLeft.x) * 32 + 'px';
			div.style.fontSize = '10pt';
			div.innerText = x + '\n' + y;
			document.body.appendChild(div);
			blueprintEntities.push({
				image: div
			});
		}
	}*/
}

function renderEntity(entity, options = {}){
	var src = options.src || '';
	var shiftLeft = options.shift ? options.shift.x : 0;
	var shiftTop = options.shift ? options.shift.y : 0;
	var width = options.width || 0;
	var height = options.height || 0;
	var flip = options.flip || { x: false, y: false };
	var imageOffset = options.offset || {x: 0, y: 0};
	var rotation = options.rotation;
	var rotationOrigin = options.rotationOrigin;
	var isHighPriority = !!options.highPriority;
	var scale = options.scale || { x: 1, y: 1};
	var animation = options.animation;

	var div = document.createElement('div');
	div.style.backgroundImage = "url('/image?src=" + src + "')";
	div.style.position = 'absolute';

	var left = entity.position.x - topLeft.x + shiftLeft;
	var top = entity.position.y - topLeft.y + shiftTop;
	left = left * 32 - width / 2;
	top = top * 32 - height / 2;

	div.style.left = left + 'px';
	div.style.top =  top + 'px';
	if(width) div.style.width = width + 'px';
	if(height) div.style.height = height + 'px';
	div.style.color = 'transparent';
	if(imageOffset.x || imageOffset.y){
		div.style.backgroundPosition = '-' + imageOffset.x + 'px -' + imageOffset.y + 'px';
	}
	if(flip && flip.x){
		div.style.transform = 'rotateY(180deg)';
	}
	if(flip && flip.y){
		div.style.transform = 'rotateX(180deg)';
	}
	if(rotationOrigin && rotation){
		div.style.transformOrigin = (rotationOrigin.x * 100) + '% ' + (rotationOrigin.y * 100) + '%';
		div.style.transform = 'rotate(' + rotation + 'deg)';
	}

	if(scale){
		div.style.transform = 'scaleX(' + scale.x + ') scaleY(' + scale.y + ') ' + div.style.transform;
	}

	div.style.zIndex = Math.round(top + height);
	if(isHighPriority){
		div.style.zIndex = Math.round(top + height) + 100;
	}
	div.innerText = entity.position.x + '/' + entity.position.y;
	div.onclick = function(){
		console.log(div, entity);
	};
	document.body.appendChild(div);
	blueprintEntities.push({
		image: div,
		entity: entity
	});

	if(entity.recipe){
		var innerDiv = document.createElement('div');
		innerDiv.style.backgroundImage = "url('/image?src=" + (entity.recipe.icon || entity.recipe.entity.icon) + "')";
		innerDiv.style.position = 'absolute';
		innerDiv.style.zIndex = Math.round(top + height) + 1;
		innerDiv.style.left = ((entity.position.x - topLeft.x) * 32 - 15) + 'px';
		innerDiv.style.top = ((entity.position.y - topLeft.y) * 32 - 25) + 'px';
		innerDiv.style.width = '32px';
		innerDiv.style.height = '32px';
		document.body.appendChild(innerDiv);
		blueprintEntities.push({
			image: innerDiv,
			recipe: entity.recipe,
			owner: entity
		});
	}

	if(animation){
		animations.push({
			settings: animation,
			image: div,
			entity: entity
		});
	}
}

function updateBlueprintString(){

}