/**
 * Created by Victor on 19-Jun-16.
 */
renderer["pipe"] = function(entity){
	var connections = {
		left: entityExistsAt(entity.position.x - 1, entity.position.y, ['pipe']) || entityExistsAt(entity.position.x - 1, entity.position.y, RIGHT8, ['pipe-to-ground']),
		right: entityExistsAt(entity.position.x + 1, entity.position.y, ['pipe']) || entityExistsAt(entity.position.x + 1, entity.position.y, LEFT8, ['pipe-to-ground']),
		bottom: entityExistsAt(entity.position.x, entity.position.y + 1, ['pipe']) || entityExistsAt(entity.position.x, entity.position.y + 1, UP8, ['pipe-to-ground']),
		top: entityExistsAt(entity.position.x, entity.position.y - 1, ['pipe']) || entityExistsAt(entity.position.x, entity.position.y - 1, DOWN8, ['pipe-to-ground'])
	};

	entity.connections = connections;
	
	var anim = null;

	// cross pipe
	if(connections.left && connections.right && connections.top && connections.bottom){
		anim = entity.entity.pictures.cross;
	}
	// T pipes
	else if(connections.left && connections.right && connections.top && !connections.bottom){
		anim = entity.entity.pictures.t_up;
	} else if(connections.left && connections.right && !connections.top && connections.bottom){
		anim = entity.entity.pictures.t_down;
	} else if(connections.left && !connections.right && connections.top && connections.bottom){
		anim = entity.entity.pictures.t_left;
	} else if(!connections.left && connections.right && connections.top && connections.bottom){
		anim = entity.entity.pictures.t_right;
	}

	// straight pipes
	else if(connections.left && connections.right && !connections.top && !connections.bottom){
		anim = entity.entity.pictures.straight_horizontal;
	} else if(!connections.left && !connections.right && connections.top && connections.bottom){
		anim = entity.entity.pictures.straight_vertical;
	}

	// corners
	else if(connections.left && !connections.right && connections.top && !connections.bottom){
		anim = entity.entity.pictures.corner_up_left;
	} else if(connections.left && !connections.right && !connections.top && connections.bottom){
		anim = entity.entity.pictures.corner_down_left;
	} else if(!connections.left && connections.right && connections.top && !connections.bottom){
		anim = entity.entity.pictures.corner_up_right;
	}else if(!connections.left && connections.right && !connections.top && connections.bottom){
		anim = entity.entity.pictures.corner_down_right;
	}

	// endings
	else if(connections.left && !connections.right && !connections.top && !connections.bottom){
		anim = entity.entity.pictures.ending_left;
	} else if(!connections.left && connections.right && !connections.top && !connections.bottom){
		anim = entity.entity.pictures.ending_right;
	} else if(!connections.left && !connections.right && connections.top && !connections.bottom){
		anim = entity.entity.pictures.ending_up;
	}else if(!connections.left && !connections.right && !connections.top && connections.bottom){
		anim = entity.entity.pictures.ending_down;
	}

	if(!anim) anim = entity.entity.pictures.cross;

	var options = {
		src: anim.filename,
		width: anim.width,
		height: anim.height
	};

	renderEntity(entity, options);
};

renderer["pipe-to-ground"] = function(entity){
	var anim = null;

	switch(entity.direction || 0){
		case UP8: anim = entity.entity.pictures.up; break;
		case DOWN8: anim = entity.entity.pictures.down; break;
		case LEFT8: anim = entity.entity.pictures.left; break;
		case RIGHT8: anim = entity.entity.pictures.right; break;
	}
	var options = {
		src: anim.filename,
		width: anim.width,
		height: anim.height
	};

	renderEntity(entity, options);
};
