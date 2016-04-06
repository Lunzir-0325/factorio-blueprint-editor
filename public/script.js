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
var blueprintString = "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 49P/A4luUqQBJQEA";

textarea.value = blueprintString;
function renderBlueprint(){
	var topLeft = {x: 0, y: 0};
	var bottomRight = {x: 0, y: 0};
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
	blueprint.entities.forEach(function(entity){
		var src = "";
		var width, height;
		var shiftLeft = 0, shiftTop = 0;
		if(entity.entity && entity.entity.off_animation){
			src = entity.entity.off_animation.filename;
			width = entity.entity.off_animation.width;
			height = entity.entity.off_animation.height;
			shiftLeft = entity.entity.off_animation.shift[0];
			shiftTop = entity.entity.off_animation.shift[1];
		} else if(entity.entity && entity.entity.platform_picture){
			src = entity.entity.platform_picture.sheet.filename;
			width = entity.entity.platform_picture.sheet.width;
			height = entity.entity.platform_picture.sheet.height;
		} else if(entity.entity && entity.entity.animations){
			src = entity.entity.animations.filename;
			width = entity.entity.animations.width;
			height = entity.entity.animations.height;
			if(entity.entity.animations.shift) {
				shiftLeft = entity.entity.animations.shift[0];
				shiftTop = entity.entity.animations.shift[1];
			}
		} else if(entity.entity && entity.entity.animation && entity.entity.animation.filename){
			src = entity.entity.animation.filename;
			width = entity.entity.animation.width;
			height = entity.entity.animation.height;
			if(entity.entity.animation.shift) {
				shiftLeft = entity.entity.animation.shift[0];
				shiftTop = entity.entity.animation.shift[1];
			}
		} else if(entity.entity && entity.entity.animation && entity.entity.animation.north){
			src = entity.entity.animation.north.filename;
			width = entity.entity.animation.north.width;
			height = entity.entity.animation.north.height;
			if(entity.entity.animation.north.shift) {
				shiftLeft = entity.entity.animation.north.shift[0];
				shiftTop = entity.entity.animation.north.shift[1];
			}
		} else if(entity.entity && entity.type && entity.entity.structure){
			var dir = entity.type == 'input' ? 'direction_in' : "direction_out";
			src = entity.entity.structure[dir].sheet.filename;
			width = entity.entity.structure[dir].sheet.width;
			height = entity.entity.structure[dir].sheet.height;
			if(entity.entity.structure[dir].sheet.shift) {
				shiftLeft = entity.entity.structure[dir].sheet.shift[0];
				shiftTop = entity.entity.structure[dir].sheet.shift[1];
			}
		} else if(entity.entity && entity.entity.pictures && entity.entity.pictures.filename){
			src = entity.entity.pictures.filename;
			width = entity.entity.pictures.width;
			height = entity.entity.pictures.height;
			if(entity.entity.pictures.shift) {
				shiftLeft = entity.entity.pictures.shift[0];
				shiftTop = entity.entity.pictures.shift[1];
			}
		} else if(entity.entity && entity.entity.picture){
			src = entity.entity.picture.filename;
			width = entity.entity.picture.width;
			height = entity.entity.picture.height;
			if(entity.entity.picture.shift) {
				shiftLeft = entity.entity.picture.shift[0];
				shiftTop = entity.entity.picture.shift[1];
			}
		} else if(entity.entity && entity.entity.structure){
			src = entity.entity.structure.south.filename;
			width = entity.entity.structure.south.width;
			height = entity.entity.structure.south.height;
		} else if(entity.entity && entity.entity.base){
			src = entity.entity.base.filename;
			width = entity.entity.base.width;
			height = entity.entity.base.height;
			if(entity.entity.base.shift) {
				shiftLeft = entity.entity.base.shift[0];
				shiftTop = entity.entity.base.shift[1];
			}
		} else {
			console.log(JSON.stringify(entity));
			return;
		}
		var div = document.createElement('div');
		div.style.backgroundImage = "url('/image?src=" + src + "')";
		div.style.position = 'absolute';

		var left = entity.position.x - topLeft.x + shiftLeft;
		var top = entity.position.y - topLeft.y + shiftTop;
		left = left * 33 - width / 2;
		top = top * 33 - height / 2;

		div.style.left = left + 'px';
		div.style.top =  top + 'px';
		if(width) div.style.width = width + 'px';
		if(height) div.style.height = height + 'px';
		div.style.color = 'transparent';
		setRotation(div, entity);
		div.style.zIndex = Math.round(top + height);
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
			innerDiv.style.left = ((entity.position.x - topLeft.x) * 33 - 15) + 'px';
			innerDiv.style.top = ((entity.position.y - topLeft.y) * 33 - 25) + 'px';
			innerDiv.style.width = '32px';
			innerDiv.style.height = '32px';
			document.body.appendChild(innerDiv);
			blueprintEntities.push({
				image: innerDiv,
				recipe: entity.recipe,
				owner: entity
			});
		}
	});
	for(var x = Math.floor(topLeft.x + 2); x < bottomRight.x; x += 1){
		for(var y = Math.floor(topLeft.y + 2); y < bottomRight.y; y += 1){
			var div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.border = '1px solid #000';
			div.style.width = '33px';
			div.style.height = '33px';
			div.style.top = (y - topLeft.y) * 33 + 'px';
			div.style.left = (x - topLeft.x) * 33 + 'px';
			div.style.fontSize = '10pt';
			div.innerText = x + '\n' + y;
			document.body.appendChild(div);
			blueprintEntities.push({
				image: div
			});
		}
	}
}

function isBelt(entity){
	return entity.entity.type === 'transport-belt';
}

function isUndergroundBelt(entity){
	return entity.entity.type === "transport-belt-to-ground";
}

function isSplitter(entity){
	return entity.entity.name === "splitter"
}

function setRotation(div, entity){
	if(isBelt(entity)) {
		var facing = entity.direction || 0;
		var y = 0;
		var flipped = false;
		switch (facing) {
			case 0:
				y = -40;
				break;
			case 2:
				y = 0;
				break;
			case 4:
				y = -40;
				flipped = true;
				break;
			case 6:
				y = 0;
				flipped = true;
				break;
			default:
				console.log('Unknown belt facing: ', facing);
		}

		if(entity.direction == 2 || entity.direction == 6){
			// horizontal, look for belts north and south of here that face into this
			var beltFromNorth = blueprint.entities.find(e => e.position.x == entity.position.x
				 && e.position.y === entity.position.y - 1
				 && (isBelt(e) && e.direction == 4)
			);
			var beltFromSouth = blueprint.entities.find(e => e.position.x == entity.position.x
				 && e.position.y === entity.position.y + 1
				 && (isBelt(e) && !e.direction)
			);
			if(beltFromNorth != null && beltFromSouth == null){
				// we have a belt from north
				div.style.backgroundPosition = '0px -' + 360 + 'px';

				if (flipped) {
					div.style.transform = 'rotateY(180deg)';
				}
			}
			if(beltFromSouth != null && beltFromNorth == null){
				// we have a belt from south
				div.style.backgroundPosition = '0px -' + 440 + 'px';

				if (flipped) {
					div.style.transform = 'rotateY(180deg)';
				}
			}
		} else {
			// vertical, look for belts west and east of here that face into us
			var beltFromWest = blueprint.entities.find(e => e.position.x == entity.position.x - 1
				&& e.position.y === entity.position.y
				&& (isBelt(e) && e.direction == 2)
			);
			var beltFromEast = blueprint.entities.find(e => e.position.x == entity.position.x + 1
				&& e.position.y === entity.position.y
				&& (isBelt(e) && e.direction == 6)
			);
			//if(beltFromEast != null && beltFromWest == null){
			//	// we have a belt from east
			//	div.style.backgroundPosition = '0px -' + 320 + 'px';
			//}
			//if(beltFromWest != null && beltFromEast == null) {
			//	// we have a belt from west
			//	div.style.backgroundPosition = '0px -' + 400 + 'px';
			//}
		}

		if(!div.style.backgroundPosition) {
			div.style.backgroundPosition = '0px ' + y + 'px';
			if (flipped) {
				div.style.transform = 'rotate(180deg)';
			}
		}
	} else if(entity.name === 'express-transport-belt-to-ground' || entity.name === 'transport-belt-to-ground' || entity.name == 'fast-transport-belt-to-ground'){
		var dir = entity.direction || 0;

		if(entity.type == "output") {
			dir -= 4;
			if(dir < 0) dir += 8;
		}
		var x = (dir / 2) * 57;
		div.style.backgroundPosition = '-' + x + 'px 0px';
	} else {
		if(!entity.direction) return;
		//var rotation = entity.direction;
		//div.style.transform = 'rotate(' + (-0.125 * rotation) + 'turn)';
	}
}

function updateBlueprintString(){

}