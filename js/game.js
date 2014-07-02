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
    return evt.preventDefault() && false;
});

planets.listen('mousedown', function(evt) {
    planets.input.drag = true;
    return evt.preventDefault() && false;
});

planets.listen('mouseup', function(evt) {
    planets.input.drag = false;
    return evt.preventDefault() && false;
});

planets.listen('mousemove', function(evt) {
   planets.screen.offX = evt.offsetX || (evt.pageX - planets.screen.mg.offsetLeft);
   planets.screen.offY = evt.offsetY || (evt.pageY - planets.screen.mg.offsetRight);
   
   if(planets.input.drag) {
        planets.screen.x = evt.clientX;
        planets.screen.y = evt.clientY;
   }

   console.log(("x: " + planets.screen.offX) + "  " + ("y: " + planets.screen.offY));
});

planets.init();

console.log(planets);