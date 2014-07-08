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
    planets.screen.z = ((planets.screen.mg.getTransform().a/100).toFixed(2));

    var mouseX = planets.input.mouse.offset.x;
    var mouseY = planets.input.mouse.offset.y;
    var scaleFactor = Math.pow(1.005,planets.screen.delta);

    var allPlanets = planets.assets.map.planets;

    for(planet in allPlanets) {

      var thisPlanet = allPlanets[planet];
      var x = mouseX - (planets.assets.map.x + thisPlanet.XCoordinate*planets.assets.map.oneLightYear);
      var y = mouseY - (planets.assets.map.y + thisPlanet.YCoordinate*planets.assets.map.oneLightYear);
      var userSpaceDif = Math.sqrt(x*x + y*y)/scaleFactor;

    }

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

planets.listen('dblclick', function(evt) {
    
    var allPlanets = planets.assets.map.planets;

    for(planet in allPlanets) {
        var clickX = evt.clientX;
        var clickY = evt.clientY;
        var planetX = (planets.assets.map.x + allPlanets[planet].XCoordinate*planets.assets.map.oneLightYear);
        var planetY = (planets.assets.map.y + allPlanets[planet].YCoordinate*planets.assets.map.oneLightYear);

        var click = planets.screen.mg.getScaledXY(planets.screen.mg.getTransform(), clickX, clickY);
        var p = planets.screen.mg.getScaledXY(planets.screen.mg.getTransform(), planetX, planetY);
        var factor = planets.screen.mg.getTransform()['a'];

        var x = click.x - p.x;
        var y = click.y - p.y;
        var dist = (Math.sqrt(y*y + x*x)*factor);

        var pw = (planets.assets.map.w/(100)/factor);

        // var p1 = planets.screen.mg.getScaledXY(planets.screen.mg.getTransform(), pw, 0); 
        // var p2 = planets.screen.mg.getScaledXY(planets.screen.mg.getTransform(), 0, 0); 
        // var dx = p1.x - p2.x;
        // var dy = p1.y -p2.y;
        // var pw = Math.sqrt(dy*dy + dx*dx);

        if(allPlanets[planet].name === "Helion Prime") {
          console.debug(allPlanets[planet].name);
          console.log("click x: " + click.x);
          console.log("click y: " + click.y); 
          console.log("planet x: " + p.x);
          console.log("planet y: " + p.y);
          console.log("distance: " + dist);
          console.log("width: " + pw); 
        }
        
        if(allPlanets[planet].name === "Aebrynis") {
          console.debug(allPlanets[planet].name);
          console.log("click x: " + click.x);
          console.log("click y: " + click.y); 
          console.log("planet x: " + p.x);
          console.log("planet y: " + p.y);
          console.log("distance: " + dist);
          console.log("width: " + pw); 
        }
        
        if(dist < pw) {
          console.log(planets.screen.mg.getTransform());
          console.debug(allPlanets[planet].name);
        }  
    }
        
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