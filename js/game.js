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

    var selectedCounter = 0;
    var factor = planets.screen.mg.getTransform()['a'];
    var pw = ((planets.assets.map.w)/(100))*(factor);

    for(planet in allPlanets) {
        
      var planetX = (planets.assets.map.x + allPlanets[planet].XCoordinate*planets.assets.map.oneLightYear);
      var planetY = (planets.assets.map.y + allPlanets[planet].YCoordinate*planets.assets.map.oneLightYear);
      var planetScaled = planets.screen.mg.getScaledXY(planets.screen.mg.getTransform(), planetX, planetY);    

      var x = evt.clientX - planetScaled.x;
      var y = evt.clientY - planetScaled.y;
      var dist = Math.sqrt(y*y + x*x);

      if(dist < pw) {
        planets.screen.gui.selected = allPlanets[planet].name;
        break;
      } else {
        planets.screen.gui.selected = false;
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

planets.listen('click', function(evt) {
   if(planets.screen.gui.selected != false) {
    if((evt.clientX>10)&&(evt.clientX<25)&&(evt.clientY>10)&&(evt.clientY<25)) {
      planets.screen.gui.selected = false;
    } 
   }

});

planets.init();

console.log(planets);