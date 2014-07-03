var planets = new Game('Planets');



planets.listen("mousemove", function(evt) {
	var w = window.innerWidth;
    var h = window.innerHeight;
    var sensativity = 5;


    if((evt.x < sensativity)||(evt.x > (w-sensativity))||(evt.y < sensativity)||(evt.y > (h-sensativity))) {	
    	if (evt.x < sensativity) planets.screen.move(planets, "left");
        if (evt.x > (w-sensativity)) planets.screen.move(planets, "right");
        if (evt.y < sensativity) planets.screen.move(planets, "up");
        if (evt.y > (h-sensativity)) planets.screen.move(planets, "down");   
    } else {
        planets.screen.move(planets, "stop");
    }
});

planets.listen('mousewheel', function(evt) {
    planets.screen.delta += evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
    planets.screen.z = planets.screen.mg.getTransform().a/100;
    return evt.preventDefault() && false;
});

planets.listen('mousedown', function(evt) {
    planets.input.drag.active = true;
    planets.input.drag.start.x = evt.clientX;
    planets.input.drag.start.y = evt.clientY;
    return evt.preventDefault() && false;
});

planets.listen('mouseup', function(evt) {
    planets.input.drag.active = false;
    planets.input.drag.lastOffset = {
        x: 0,
        y: 0
    };
    return evt.preventDefault() && false;
});

planets.listen('mousemove', function(evt) {
    planets.input.mouse.offset.x = evt.offsetX || (evt.pageX - planets.screen.mg.offsetLeft);
    planets.input.mouse.offset.y = evt.offsetY || (evt.pageY - planets.screen.mg.offsetTop);
    planets.input.mouse.pos.x = evt.clientX;
    planets.input.mouse.pos.y = evt.clientY;

    var adjustScreenX = (planets.input.mouse.pos.x-planets.input.drag.start.x)-planets.input.drag.lastOffset.x;
    var adjustScreenY = (planets.input.mouse.pos.y-planets.input.drag.start.y)-planets.input.drag.lastOffset.y;

    if((planets.input.drag.active)) {
        planets.screen.x += (adjustScreenX/12.55);
        planets.screen.y += (adjustScreenY/12.55);

        planets.input.drag.lastOffset = {
            x: planets.input.mouse.pos.x-planets.input.drag.start.x,
            y: planets.input.mouse.pos.y-planets.input.drag.start.y
        }
    }

});

planets.init();

console.log(planets);