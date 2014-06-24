var Game = function() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.assets = {};
    this.map = {};
    this.screen.x = 0;
    this.screen.y = 0;
    return this;
}

Game.prototype = {
    init: function() {

    	var game = this;
    	var w = window.innerWidth;
    	var h = window.innerHeight;

    	document.body.appendChild(game.canvas);
		game.canvas.width = w;
	    game.canvas.height = h;
	      
        game.loadImages(function() {
        	game.draw();
        });

        game.addEventListeners();
    },
    loadImages: function(cb) {
        var game = this;
        var loadedAssets = 0;
        var assets = [
            {
                "name": "starfield one",
                "src": "img/bg.layer.1.jpg",
                "group": "background",
                "settings": {
                    "layer": 0,
                    "size": 1,
                    "alpha": .1,
                    "originX": 0,
                    "originY": 0
                }
            },
            {
                "name": "large nebula",
                "src": "img/bg.layer.2.jpg",
                "group": "background",
                "settings": {
                    "layer": 2,
                    "size": 1,
                    "alpha": .175,
                    "originX": .45,
                    "originY": .45
                }
            },
            {
                "name": "starfield two",
                "src": "img/bg.layer.1.jpg",
                "group": "background",
                "settings": {
                    "layer": 2.15,
                    "size": 2,
                    "alpha": .115,
                    "originX": -.5,
                    "originY": -.5
                }
            },
            {
                "name": "small nebula",
                "src": "img/bg.layer.3.png",
                "group": "background",
                "settings": {
                    "layer": 3,
                    "size": .5,
                    "alpha": .15,
                    "originX": 0,
                    "originY": 0
                }
            },
            {
                "name": "Fog nebula",
                "src": "img/zoom-animation.jpg",
                "group": "zoom",
                "settings": {
                    "layer": 100,
                    "size": 2,
                    "alpha": .05,
                    "originX": -.5,
                    "originY": -.5
                }
            }

        ]
        
        var AssetKeys = Object.keys(assets).length;

        for(var i=0; i<assets.length; i++) {
            var name = assets[i].name;
            var src = assets[i].src
            var group = assets[i].group
            var settings = assets[i].settings

            game.assets[name] = new Image;
            game.assets[name].src = src;
            game.assets[name].group = group;
            game.assets[name].settings = settings;
        }
  		
        for(var src in game.assets) {
        	game.assets[src].onload = function() {
        		if(++loadedAssets >= Object.keys(game.assets).length) cb();		
        	}
        }

    },
    loadMap: function(name, cb) {
        var game = this;

        request = new XMLHttpRequest;
        request.open('GET', "maps/"+name+".json", true);

        request.onload = function() {
          if (request.status >= 200 && request.status < 400){
            var data = JSON.parse(request.responseText);
            game.map = data;
            console.log(game.map);
            cb();
          } else {
            console.log("We reached our target server, but it returned an error");
          }
        };

        request.onerror = function() {
          console.log("There was a connection error of some sort");
        };

        request.send();
    },
    setMap: function(map) {
        this.map = map;
    },
    draw: function() {
        
        var game = this;
        
        game.canvas.width = game.canvas.width;
        
        game.drawBG(game.screen.x, game.screen.y);
        game.drawMap("test-data");
        game.drawForgrownd();

    },
    drawBG: function(startX, startY) {
    	var game = this;



        for(var asset in game.assets) {
            var name = game.assets[asset].name;
            var src = game.assets[asset].src;
            var group = game.assets[asset].group;
            var settings = game.assets[asset].settings;

            if(group === "background") {
                game.ctx.globalAlpha  = settings.alpha;    
                game.ctx.drawImage(game.assets[asset], (startX*settings.layer)+(game.canvas.width*settings.originX), (startY*settings.layer)+(game.canvas.height*settings.originY), game.canvas.width*settings.size, window.innerHeight*settings.size);
                game.ctx.globalAlpha  = 1; 
            }
        }  
        
    },
    drawMap: function(map) {
        
        var game = this;

        game.loadMap(map, function() {
            var mapW = game.map.mapWidth;
            var mapH = game.map.mapHeight;
            var planets = game.map.planets;

            for(var i=0; i < planets.length; i++) {
                var x = planets[i].XCoordinate;
                var y = planets[i].YCoordinate;
                game.ctx.fillStyle = "#FF0000";
                game.ctx.fillRect(x,y,3,3);

            }
            
        });
    },
    drawForgrownd: function() {
    },
    addEventListeners: function() {
    	var game = this;
    	this.canvas.addEventListener('mousemove', function(evt) {
	        
	        var w = window.innerWidth;
	        var h = window.innerHeight;
            var sensativity = 5;


	        if((evt.x < sensativity)||(evt.x > (w-sensativity))||(evt.y < sensativity)||(evt.y > (h-sensativity))) {	
	        	if (evt.x < sensativity) game.screen.move(game, "left");
                if (evt.x > (w-sensativity)) game.screen.move(game, "right");
                if (evt.y < sensativity) game.screen.move(game, "up");
                if (evt.y > (h-sensativity)) game.screen.move(game, "down");   
	        } else {
                
                if(typeof(moveScreen)!='undefined') {
                    clearInterval(moveScreen);
                    moveScreen = false;
                }
            }

	    }, false);

    },
    screen: {
        move: function($this, direction) {
            game = $this;
            if((typeof(moveScreen)==='undefined')||(moveScreen===false)) {
               moveScreen = setInterval(function() {           
                    if(direction === "left") game.screen.x -= 1;
                    if(direction === "right") game.screen.x += 1;
                    if(direction === "up") game.screen.y -= 1;
                    if(direction === "down") game.screen.y += 1;
                    if(direction != "stop") game.draw(game.screen.x, game.screen.y);
                }, 100); 
            }
        }
    }
}

var myGame = new Game('myGame');
myGame.init();