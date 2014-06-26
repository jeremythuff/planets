var Game = function(name) {
    this.name = name;
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
      
        
        game.getResource({
            url: "assets/asset-list.json" 
        }, function(images) {
            var loadedImages = 0;
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
        });
        
        

    },
    getResource: function(req, cb) {

        var game = this;

        request = new XMLHttpRequest;
        request.open('GET', req.url, true);

        request.onload = function() {
          if (request.status >= 200 && request.status < 400){
            cb(JSON.parse(request.responseText));
          } else {
            console.log("We reached our target server, but it returned an error");
          }
        };

        request.onerror = function() {
          console.log("There was a connection error of some sort");
        };

        request.send();

    },
    loadMap: function(name, cb) {
        var game = this;

        game.getResource({
            url: "maps/"+name+".json" 
        }, function(data) {
            game.assets.map = data.game;
            game.assets.map.connections = data.connections
            cb();
        });

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

        game.assets.map.w = ((game.canvas.height)*z)-(game.canvas.height*.1);
        game.assets.map.h = game.assets.map.w;
        game.assets.map.x = (x + ((game.canvas.width/2)-(game.assets.map.w/2)))+game.screen.x*4;
        game.assets.map.y = (y + ((game.canvas.height/2)-(game.assets.map.h/2)))+game.screen.y*4;
        game.assets.map.oneLightYear = game.assets.map.w/2000;
   
        game.drawConnections(game.assets.map.planets);
        game.drawPlanets(game.assets.map.planets);

    },
    drawConnections: function(planets) {
        var game = this;
        var allConnections = game.assets.map.connections;
        for(var originId in allConnections) {

            var originPlanet; 
            
            for(var planet in planets) {
                if(planets[planet].id == originId) originPlanet = planets[planet];  
            }

            var originX = game.assets.map.x+originPlanet.XCoordinate*game.assets.map.oneLightYear;
            var originY = game.assets.map.y+originPlanet.YCoordinate*game.assets.map.oneLightYear;

            for(var i=0;i<allConnections[originId].length;i++) {

                var destinationPlanet; 
            
                for(var planet in planets) {
                    if(planets[planet].id == allConnections[originId][i]) destinationPlanet = planets[planet];  
                }

                var destX = game.assets.map.x+destinationPlanet.XCoordinate*game.assets.map.oneLightYear;
                var destY = game.assets.map.y+destinationPlanet.YCoordinate*game.assets.map.oneLightYear

                game.ctx.strokeStyle = "#fff";
                game.ctx.lineWidth = .05;
                game.ctx.beginPath();
                game.ctx.moveTo(originX, originY);
                game.ctx.lineTo(destX, destY);
                game.ctx.stroke();

            }

        }
    },
    drawPlanets: function(planets, x, y, z) {
        var game = this;
        for(var i=0; i < planets.length; i++) {
            var planetX = game.assets.map.x + planets[i].XCoordinate*game.assets.map.oneLightYear;
            var planetY = game.assets.map.y + planets[i].YCoordinate*game.assets.map.oneLightYear;
            var planetName = planets[i].name;
            var planetTemp = parseInt(planets[i].temp);
            var planetImage = game.assets.images["uknown"];
            var settings = planetImage.settings;
            var planetColor = "#efefef"
            if((planetTemp >= 0)&&(planetTemp <=14)) planetImage = game.assets.images["ice"];
            if((planetTemp >= 15)&&(planetTemp <=35)) planetImage = game.assets.images["cold"];
            if((planetTemp >= 36)&&(planetTemp <=60)) planetImage = game.assets.images["earthlike"];
            if((planetTemp >= 61)&&(planetTemp <=84)) planetImage = game.assets.images["warm"];
            if((planetTemp >= 85)&&(planetTemp <=100)) planetImage = game.assets.images["hot"];

            game.ctx.globalAlpha  = settings.alpha;    
            game.ctx.drawImage(planetImage, planetX-((game.assets.map.w/(150))/2), planetY-((game.assets.map.w/(150))/2), game.assets.map.w/(150), game.assets.map.w/(150));
            game.ctx.globalAlpha  = 1; 

        }
    },
    drawForgrownd: function() {
        
    },
    listen: function(listener, cb) {
    	
        this.canvas.addEventListener(listener, function(evt) {
            cb(evt);
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
                            console.log("screen scrollable");
                        }  
                        if(direction === "left") game.screen.x += game.screen.z;
                        if(direction === "right") game.screen.x -= game.screen.z;
                        if(direction === "up") game.screen.y += game.screen.z;
                        if(direction === "down") game.screen.y -= game.screen.z;
                        if(direction != "stop") game.draw(game.screen.x, game.screen.y, game.screen.z);
                
                }, 100/game.screen.z); 
            }
        },
        zoom: function($this, clientX, clientY, delta) {
            var game = $this;
            //get the cursors absolute screen position over the canvas
            //NOTE this will not work as it is written unless the canvas is in the top left corner of the screen
            var mouseXOnScreen = clientX;
            var mouseYOnScreen = clientY;

            //this calculates the position of the mouse over the drawn object on the screen
            var mouseXOnImg = mouseXOnScreen-game.assets.map.x;
            var mouseYOnImg = mouseYOnScreen-game.assets.map.y;

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
            game.screen.z < 1 ? game.screen.z = 1: game.screen.z=game.screen.z;
            game.screen.z > 25 ? game.screen.z = 25: game.screen.z=game.screen.z;

            //this recalculates the cursors position as a % of the total images size at the new level of zoom
             var newMouseXPosPercentOfImg = mouseXOnImg/(game.canvas.height*game.screen.z);
             var newMouseYPosPercentOfImg = mouseYOnImg/(game.canvas.height*game.screen.z);




            //this calculates the difference in the % of the total images size both before and after the zoom
            var percentXShift = newMouseXPosPercentOfImg - oldMouseXPosPercentOfImg;
            var percentYShift = newMouseYPosPercentOfImg - oldMouseYPosPercentOfImg;

            // this converts the % into the the relative pixel distance at this level of zoom
            var pixelsNowEqualToPercentXShift = (game.assets.map.x*game.screen.z)*percentXShift;
            var pixelsNowEqualToPercentYShift = (game.assets.map.y*game.screen.z)*percentYShift;

            //this shifts x and y by the number of pixels represented by the shift in the cursors position relative tot eh image.
            game.assets.map.x += pixelsNowEqualToPercentXShift;
            game.assets.map.y += pixelsNowEqualToPercentYShift;

            game.draw(game.screen.x,game.screen.y,game.screen.z);

        }
    }
}

var Planet = function() {
    return this;
}