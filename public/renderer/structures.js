/**
 * Created by Victor on 19-Jun-16.
 */
renderer["lab"] = function(entity){
	var anim = entity.entity.off_animation;
	renderEntity(entity, {
		width: anim.width,
		height: anim.height,
		shift: {
			x: anim.shift[0],
			y: anim.shift[1]
		},
		src: anim.filename
	});
};

renderer["assembling-machine"] = function(entity){
	var anim = entity.entity.animation;
	var offset = { x: 0, y: 0 };
	if(anim.east){
		switch(entity.direction || 0){
			case UP8: anim = anim.north; offset.x = 0 * anim.width; break;
			case RIGHT8: anim = anim.east; offset.x = 1 * anim.width; break;
			case DOWN8: anim = anim.south; offset.x = 2 * anim.width; break;
			case LEFT8: anim = anim.west; offset.x = 3 * anim.width; break;
		}
	}
	var options = {
		width: anim.width,
		height: anim.height,
		src: anim.filename,
		offset: offset
	};
	if(anim.shift){
		options.shift = {
			x: anim.shift[0],
			y: anim.shift[1]
		};
	}
	renderEntity(entity, options);
};

renderer["electric-pole"] = function(entity) {
	renderEntity(entity, {
		width: entity.entity.pictures.width,
		height: entity.entity.pictures.height,
		src: entity.entity.pictures.filename,
		shift: {
			x: entity.entity.pictures.shift[0],
			y: entity.entity.pictures.shift[1]
		}
	});
};

renderer["lamp"] = function(entity) {
	renderEntity(entity, {
		width: entity.entity.picture_off.width,
		height: entity.entity.picture_off.height,
		src: entity.entity.picture_off.filename,
		shift: {
			x: entity.entity.picture_off.shift[0],
			y: entity.entity.picture_off.shift[1]
		}
	});
};