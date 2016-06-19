/**
 * Created by Victor on 19-Jun-16.
 */
renderer["inserter"] = function(entity){
	var anim = entity.entity.platform_picture.sheet;

	var options = {
		width: anim.width,
		height: anim.height,
		src: anim.filename
	};

	entity.direction = entity.direction || 0;
	switch(entity.direction){
		case UP8: options.offset = { x:0, y: 0}; break;
		case RIGHT8: options.offset = { x:options.width, y: 0}; break;
		case DOWN8: options.offset = { x:options.width*2, y: 0}; break;
		case LEFT8: options.offset = { x:options.width*3, y: 0}; break;
	}
	renderEntity(entity, options);

	options = {
		src: entity.entity.hand_open_picture.filename,
		width: entity.entity.hand_open_picture.width,
		height: entity.entity.hand_open_picture.height,
		scale: {
			x: entity.entity.hand_size || 1,
			y: 1
		},
		shift: {
			x: 0,
			y: -.75
		},
		rotation: entity.direction * 45,
		rotationOrigin: {
			x: 0.5,
			y: 1
		},
		highPriority: true
	};
	renderEntity(entity, options);
};
