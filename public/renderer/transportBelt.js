/**
 * Created by Victor on 19-Jun-16.
 */
renderer["transport-belt"] = function(entity){
	var anim = entity.entity.animations;
	var options = {
		src: anim.filename,
		width: anim.width,
		height: anim.height
	};
	var connections = {
		left: entityExistsAt(entity.position.x - 1, entity.position.y, RIGHT8, ['transport-belt']),
		right: entityExistsAt(entity.position.x + 1, entity.position.y, LEFT8, ['transport-belt']),
		bottom: entityExistsAt(entity.position.x, entity.position.y + 1, UP8, ['transport-belt']),
		top: entityExistsAt(entity.position.x, entity.position.y - 1, DOWN8, ['transport-belt'])
	};
	entity.connections = connections;
	switch(entity.direction || 0){
		case UP8:
			options.offset = { x: 0, y: 40 };
			if(connections.left && !connections.right && !connections.bottom){
				options.offset = { x: 0, y: 320 };
				options.flip = { x: true };
			}
			if(connections.right && !connections.left && !connections.bottom){
				options.offset = { x: 0, y: 320 };
			}
			break;
		case RIGHT8:
			options.offset = { x: 0, y: 0 };
			options.flip = { };
			if(connections.bottom && !connections.top && !connections.left){
				options.offset = { x: 0, y: 440 };
			}
			if(connections.top && !connections.bottom && !connections.left){
				options.offset = { x: 0, y: 360 };
			}
			break;
		case DOWN8:
			options.offset = { x: 0, y: 40 };
			options.flip = { y: true };
			if(connections.left && !connections.right && !connections.top){
				options.offset = { x: 0, y: 400 };
				options.flip.y = false;
			}
			if(connections.right && !connections.left && !connections.top){
				options.offset = { x: 0, y: 320 };
			}
			break;
		case LEFT8:
			options.offset = { x: 0, y: 0 };
			options.flip = { x: true };
			if(connections.top && !connections.bottom && !connections.right){
				options.offset = { x: 0, y: 360 };
			}
			if(connections.bottom && !connections.top && !connections.right){
				options.offset = { x: 0, y: 440 };
			}
			break;
	}
	renderEntity(entity, options);
};

renderer["splitter"] = function(entity){
	var anim = {};
	switch(entity.direction || 0){
		case UP8: anim = entity.entity.structure.north; break;
		case DOWN8: anim = entity.entity.structure.south; break;
		case LEFT8: anim = entity.entity.structure.west; break;
		case RIGHT8: anim = entity.entity.structure.east; break;
	}

	var options = {
		src: anim.filename,
		width: anim.width,
		height: anim.height,
		shift: {
			x: anim.shift[0],
			y: anim.shift[1]
		}
	};
	renderEntity(entity, options);
};
renderer["transport-belt-to-ground"] = function(entity){
	var isOutput = entity.type == "output";
	var anim = isOutput ? entity.entity.structure.direction_out.sheet : entity.entity.structure.direction_in.sheet;
	var options = {
		src: anim.filename,
		width: anim.width,
		height: anim.height,
		shift: {
			x: anim.shift[0],
			y: anim.shift[1]
		}
	};

	switch(entity.direction || 0){
		case UP8:
			if(isOutput)
				options.offset = { x: options.width * 2, y: 0 };
			else
				options.offset = { x: 0, y: 0 };
		break;
		case DOWN8:
			if(isOutput)
				options.offset = { x: 0, y: 0 };
			else
				options.offset = { x: options.width * 2, y: 0 };
		break;
		case LEFT8:
			if(isOutput)
				options.offset = { x: options.width * 1, y: 0 };
			else
				options.offset = { x: options.width * 3, y: 0 };
		break;
		case RIGHT8:
			if(isOutput)
				options.offset = { x: options.width * 3, y: 0 };
			else
				options.offset = { x: options.width * 1, y: 0 };
		break;
	}
	renderEntity(entity, options);
};