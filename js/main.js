var Game = function() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.assets= {
        images: {},
        map: {}
    };
    this.screen.x = 0;
    this.screen.y = 0;
    this.screen.z = 1;
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
	      
        game.loadAssets(function() {
        	game.draw(game.screen.x, game.screen.y, game.screen.z);
        });

        game.addEventListeners();
    },
    loadAssets: function(cb) {
        var game = this;
        game.loadImages(function() {
            game.loadMap("test-data", function() { 
                cb();
            });
        });
    },
    loadImages: function(cb) {
        var game = this;
        var loadedImages = 0;
        var images = [
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
        
        var AssetKeys = Object.keys(images).length;

        for(var i=0; i<images.length; i++) {
            var name = images[i].name;
            var src = images[i].src
            var group = images[i].group
            var settings = images[i].settings

            game.assets.images[name] = new Image;
            game.assets.images[name].src = src;
            game.assets.images[name].group = group;
            game.assets.images[name].settings = settings;
        }
  		
        for(var src in game.assets.images) {
        	game.assets.images[src].onload = function() {
        		if(++loadedImages >= Object.keys(game.assets.images).length) cb();		
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
            game.assets.map = data;
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
        this.assets.map = map;
    },
    draw: function(x,y,z) {
        
        var game = this;
        
        game.canvas.width = game.canvas.width;
        
        game.drawBG(x,y,z);
        game.drawMap(x,y,z);
        game.drawForgrownd(x,y,z);

    },
    drawBG: function(startX, startY) {
    	var game = this;



        for(var asset in game.assets.images) {
            var name = game.assets.images[asset].name;
            var src = game.assets.images[asset].src;
            var group = game.assets.images[asset].group;
            var settings = game.assets.images[asset].settings;

            if(group === "background") {
                game.ctx.globalAlpha  = settings.alpha;    
                game.ctx.drawImage(game.assets.images[asset], (startX*settings.layer)+(game.canvas.width*settings.originX), (startY*settings.layer)+(game.canvas.height*settings.originY), game.canvas.width*settings.size, window.innerHeight*settings.size);
                game.ctx.globalAlpha  = 1; 
            }
        }  
        
    },
    drawMap: function(x, y, z) {

        var game = this;
        var w = ((game.canvas.height)*z)-(game.canvas.height*.1);
        game.assets.map.w = w; 
        var h = w;
        game.assets.map.h = h; 
        var x = (x + ((game.canvas.width/2)-(w/2)))+game.screen.x*4;
        game.assets.map.x = x;
        var y = (y + ((game.canvas.height/2)-(h/2)))+game.screen.y*4;
        game.assets.map.y = y;
        var oneLightYear = w/2000;
        var planets = game.assets.map.planets;

        for(var i=0; i < planets.length; i++) {
            var planetX = x + planets[i].XCoordinate*oneLightYear;
            var planetY = y + planets[i].YCoordinate*oneLightYear;
            var planetName = planets[i].name;
            var planetTemp = parseInt(planets[i].temp);

            game.ctx.beginPath();
            game.ctx.arc(planetX, planetY, w/(500), 0, 2 * Math.PI);
            game.ctx.closePath();
            game.ctx.fillStyle = "#2f2f2f";
            game.ctx.fill();

            // game.ctx.font = ((z*3)*(planetSize))+'pt Calibri';
            // game.ctx.fillStyle = 'blue';
            // game.ctx.fillText(planetName, planetX, planetY-((w/(500/planetSize))+10));
        }
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

        this.canvas.addEventListener('mousewheel', function(evt) {
           game.screen.zoom(game, evt.clientX, evt.clientY, evt.wheelDelta);

        }, false);

    },
    screen: {
        move: function($this, direction) {
            var game = $this;

            if((typeof(moveScreen)==='undefined')||(moveScreen===false)) {
                moveScreen = setInterval(function() {
                        if((game.assets.map.w < game.canvas.width)&&(game.assets.map.h < game.canvas.height)) {
                            if(game.assets.map.x < 10) {
                                clearInterval(moveScreen);
                                moveScreen = false;
                                game.screen.x += 2;
                            }
                            if((game.assets.map.x+game.assets.map.w) > game.canvas.width-10) {
                                clearInterval(moveScreen);
                                moveScreen = false;
                                game.screen.x -= 2;
                            }
                            if(game.assets.map.y < 10) {
                                clearInterval(moveScreen);
                                moveScreen = false;
                                game.screen.y += 2;
                            }
                            if((game.assets.map.y+game.assets.map.h) > game.canvas.height-10) {
                                clearInterval(moveScreen);
                                moveScreen = false;
                                game.screen.y -= 2;
                            }
                        } else {
                            console.log("blah");
                        }  
                        if(direction === "left") game.screen.x += 1;
                        if(direction === "right") game.screen.x -= 1;
                        if(direction === "up") game.screen.y += 1;
                        if(direction === "down") game.screen.y -= 1;
                        if(direction != "stop") game.draw(game.screen.x, game.screen.y, game.screen.z);
                
                }, 100); 
            }
        },
        zoom: function($this, clientX, clientY, delta) {
            var game = $this;
            //get the cursors absolute screen position over the canvas
            //NOTE this will not work as it is written unless the canvas is in the top left corner of the screen
            var mouseXOnScreen = clientX;
            var mouseYOnScreen = clientY;

            //this calculates the position of the mouse over the drawn object on the screen
            var mouseXOnImg = mouseXOnScreen-game.screen.x;
            var mouseYOnImg = mouseYOnScreen-game.screen.y;

            //this calculated the cursors offset over the image as a % of the total images size
            var oldMouseXPosPercentOfImg = mouseXOnImg/(game.canvas.height*game.screen.z);
            var oldMouseYPosPercentOfImg = mouseYOnImg/(game.canvas.height*game.screen.z);

            /*
                z is a result of delta squared so that it willl zoom faster the harder you scroll the wheel,
                one of the deltas is held at an absolut value so that the product will be positive or negative
                depending on the direction of the wheel's spin, finally z is reduced by a factor of z/n so that
                zooming will occure more and more quickly as the zoom increases.
            */
            game.screen.z += Math.abs(delta)*delta*(game.screen.z/150000);
            //this places a min/max zoom in/out level
            game.screen.z<.5 ? game.screen.z=.5: game.screen.z=game.screen.z;
            game.screen.z>50 ? game.screen.z=50: game.screen.z=game.screen.z;

            // //this recalculates the cursors position as a % of the total images size at the new level of zoom
            //  var newMouseXPosPercentOfImg = mouseXOnImg/(game.canvas.height*game.screen.z);
            //  var newMouseYPosPercentOfImg = mouseYOnImg/(game.canvas.height*game.screen.z);




            // //this calculates the difference in the % of the total images size both before and after the zoom
            // var percentXShift = newMouseXPosPercentOfImg - oldMouseXPosPercentOfImg;
            // var percentYShift = newMouseYPosPercentOfImg - oldMouseYPosPercentOfImg;

            // // this converts the % into the the relative pixel distance at this level of zoom
            // var pixelsNowEqualToPercentXShift = (game.screen.x*game.screen.z)*percentXShift;
            // var pixelsNowEqualToPercentYShift = (game.screen.y*game.screen.z)*percentYShift;

            // //this shifts x and y by the number of pixels represented by the shift in the cursors position relative tot eh image.
            // game.screen.x += pixelsNowEqualToPercentXShift;
            // game.screen.y += pixelsNowEqualToPercentYShift;

            game.draw(game.screen.x,game.screen.y,game.screen.z);

            console.log(game.screen.z);

        }
    }
}

var Planet = function() {
    return this;
}

var myGame = new Game('myGame');
myGame.init();