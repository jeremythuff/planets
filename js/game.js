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
        
        if(typeof(moveScreen)!='undefined') {
            clearInterval(moveScreen);
            moveScreen = false;
        }
    }
});

planets.listen('mousewheel', function(evt) {
   planets.screen.zoom(planets, evt.clientX, evt.clientY, evt.wheelDelta);
});

planets.init();

console.log(planets);