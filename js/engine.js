/*TODOS:

    -Bound zoomed out map to the size of the screen
    -Bound zoomed in map to not show margins
    -Create fade effect
    -Create twinkle effect
    -Creat moving fog effect on zoom and screen motion
    -Create click and drag movement
    -Creat dbl click zoom
    -Create population halos on planets
    -Create warp well graffics on full zoom
    -Make planets clickable
    -Create wrap pathing


*/
var Game = function(name) {
    this.name = name;

    this.screen.bgCanvas = document.createElement('canvas');
    this.screen.ctx = this.screen.bgCanvas.getContext('2d');
    this.screen.mgCanvas = document.createElement('canvas');
    this.screen.mg = this.screen.mgCanvas.getContext('2d');
    this.screen.fgCanvas = document.createElement('canvas');
    this.screen.fg = this.screen.fgCanvas.getContext('2d');
    this.screen.guiCanvas = document.createElement('canvas');
    this.screen.gui = this.screen.guiCanvas.getContext('2d');
    this.screen.offScreenCanvas = document.createElement('canvas');
    this.screen.offScreen = this.screen.offScreenCanvas.getContext('2d');  
    
    this.assets= {
        images: {},
        map: {}
    };

    this.screen.x = 0;
    this.screen.y = 0;
    return this;
}

Game.prototype = {
    init: function() {

        var lastCalledTime;
        var fps = 1;
        var fpsCounter = 1;
        var fpsOut = document.getElementById('fps');

        window.requestAnimFrame = (function(){
          return  window.requestAnimationFrame       || 
                  window.webkitRequestAnimationFrame || 
                  window.mozRequestAnimationFrame    || 
                  window.oRequestAnimationFrame      || 
                  window.msRequestAnimationFrame     || 
                  function(callback){
                    window.setTimeout(callback, 1000 / 60);
                  };
        })();

    	var game = this;
    	var w = window.innerWidth;
    	var h = window.innerHeight;

    	document.body.appendChild(game.screen.bgCanvas);
		game.screen.bgCanvas.width = w;
	    game.screen.bgCanvas.height = h;

        document.body.appendChild(game.screen.mgCanvas);
        game.screen.mgCanvas.width = w;
        game.screen.mgCanvas.height = h;

        document.body.appendChild(game.screen.fgCanvas);
        game.screen.fgCanvas.width = w;
        game.screen.fgCanvas.height = h;

        document.body.appendChild(game.screen.guiCanvas);
        game.screen.guiCanvas.width = w;
        game.screen.guiCanvas.height = h;

        document.body.appendChild(game.screen.offScreenCanvas);
        game.screen.offScreenCanvas.width = w;
        game.screen.offScreenCanvas.height = h;
	      
        game.loadAssets(function() {
            (function animloop(){
                window.requestAnimFrame(animloop);
              
                if(!lastCalledTime) {
                    lastCalledTime = new Date().getTime();
                    fps = 0;
                    return;
                }
                
                delta = (new Date().getTime() - lastCalledTime)/1000;
                lastCalledTime = new Date().getTime();
                fps = 1/delta;

                if(fpsCounter++ % (Math.round(fps / 10)*10) === 0)fpsOut.innerHTML = "<span style='color:orange'>fps: "+Math.round(fps, 2)+"</span>";

                game.draw(game.screen.x, game.screen.y);
            })();	
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
        var prevImage;
      
        
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
                game.assets.images[name].buffer = {};
                prevImage = game.assets.images[name];

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

            game.assets.map.connections = [];

            var planets = game.assets.map.planets

            var allConnections = data.connections;

            for(var originId in allConnections) {

                var originPlanet; 
                
                for(var planet in game.assets.map.planets) {
                    if(planets[planet].id == originId) originPlanet = planets[planet];  
                }

                var originX = originPlanet.XCoordinate
                var originY = originPlanet.YCoordinate

                for(var i=0;i<allConnections[originId].length;i++) {

                    var destinationPlanet; 
                
                    for(var planet in planets) {
                        if(planets[planet].id == allConnections[originId][i]) destinationPlanet = planets[planet];  
                    }
                    
                    var index = allConnections[destinationPlanet.id].indexOf(originPlanet.id);
                    
                    if (index > -1) {
                        allConnections[destinationPlanet.id].splice(index, 1);
                    }

                    var destX = destinationPlanet.XCoordinate
                    var destY = destinationPlanet.YCoordinate

                    var connections = {
                        "originX": parseInt(originPlanet.XCoordinate),
                        "originY": parseInt(originPlanet.YCoordinate),
                        "destX": parseInt(destinationPlanet.XCoordinate),
                        "destY": parseInt(destinationPlanet.YCoordinate)
                    }

                    game.assets.map.connections.push(connections);

                }

            }
            cb();
        });

    },
    setMap: function(map) {
        this.assets.map = map;
    },
    draw: function(x,y) {
        var game = this;
        
        //game.drawBG(x,y);
        game.drawMap(x,y);
        game.drawForgrownd(x,y);

    },
    clearScreen: function() {
        var game = this;
        game.screen.bgCanvas.width = game.screen.bgCanvas.width;
        game.screen.mgCanvas.width = game.screen.mgCanvas.width;
        game.screen.fgCanvas.width = game.screen.fgCanvas.width;
        game.screen.guiCanvas.width = game.screen.guiCanvas.width;
    },
    drawBG: function(x,y) {
    	var game = this;

        game.screen.bgCanvas.width = game.screen.bgCanvas.width;

        for(var asset in game.assets.images) {
            var name = game.assets.images[asset].name;
            var src = game.assets.images[asset].src;
            var group = game.assets.images[asset].group;
            var settings = game.assets.images[asset].settings;
            game.bg.x = Math.round((x*settings.layer)+(game.screen.bgCanvas.width*settings.originX));
            game.bg.y = Math.round((y*settings.layer)+(game.screen.bgCanvas.height*settings.originY));

            if(group === "background") {
                game.screen.ctx.globalAlpha  = settings.alpha;    
                game.screen.ctx.drawImage(game.assets.images[asset], game.bg.x, game.bg.y, game.screen.bgCanvas.width*settings.size, window.innerHeight*settings.size);
                game.screen.ctx.globalAlpha  = 1; 
            }
        }  
        
    },
    drawMap: function(x,y) {

        var game = this;

        game.screen.mgCanvas.width = game.screen.mgCanvas.width;

        x = Math.round(x);
        y = Math.round(y);


        game.assets.map.w = (game.screen.mgCanvas.height)-(game.screen.mgCanvas.height*.1);
        game.assets.map.h = game.assets.map.w;
        game.assets.map.x = ((Math.round(x)+game.screen.mgCanvas.width)/2)-(game.assets.map.w/2);
        game.assets.map.y = ((Math.round(y)+game.screen.mgCanvas.height)/2)-(game.assets.map.h/2);
        game.assets.map.oneLightYear = game.assets.map.w/2000;
        

        console.log(game.screen.mgCanvas.height); 

        game.drawConnections(game.assets.map.planets);
        game.drawPlanets(game.assets.map.planets);

    },
    drawConnections: function(planets) {
        var game = this;
        var connections = game.assets.map.connections;
        game.screen.mg.beginPath();
        for(connection in connections) {

            var originX = game.assets.map.x + connections[connection]["originX"]*game.assets.map.oneLightYear;
            var originY = game.assets.map.y + connections[connection]["originY"]*game.assets.map.oneLightYear;
            var destX = game.assets.map.x + connections[connection]["destX"]*game.assets.map.oneLightYear;
            var destY = game.assets.map.y + connections[connection]["destY"]*game.assets.map.oneLightYear;
            originX = Math.round(originX);
            originY = Math.round(originY);
            destX = Math.round(destX);
            destY = Math.round(destY);


            if((game.screen.utils.pointIsOnScreen(game,originX,originY))||(game.screen.utils.pointIsOnScreen(game,destX,destY))) {    
                game.screen.mg.strokeStyle = "#fff";
                game.screen.mg.lineWidth = .2;
               
                game.screen.mg.moveTo(originX, originY);
                game.screen.mg.lineTo(destX, destY);
            }
        }
        game.screen.mg.stroke();
    },
    drawPlanets: function(planets) {
        var game = this;
        for(var i=0; i < planets.length; i++) {
        
            var planetX = game.assets.map.x + planets[i].XCoordinate*game.assets.map.oneLightYear;
            var planetY = game.assets.map.y + planets[i].YCoordinate*game.assets.map.oneLightYear;
            
            planetX = Math.round(planetX);
            planetY = Math.round(planetY);

            if(game.screen.utils.pointIsOnScreen(game,planetX,planetY)) {    
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

                game.screen.mg.globalAlpha  = settings.alpha;    
                game.screen.mg.drawImage(planetImage, planetX-((game.assets.map.w/(100))/2), planetY-((game.assets.map.w/(100))/2), game.assets.map.w/(100), game.assets.map.w/(100));
                game.screen.mg.globalAlpha  = 1; 
            }
        }
    },
    drawForgrownd: function() {
        var game = this;

        game.screen.fgCanvas.width = game.screen.fgCanvas.width;

        var image = game.assets.images["Fog nebula"];
        var settings = image.settings;

        game.screen.fg.globalAlpha  = settings.alpha;    
        game.screen.fg.drawImage(image, game.screen.x, game.screen.y, window.innerWidth*settings.size, window.innerHeight*settings.size);
        game.screen.fg.globalAlpha  = 1; 
        
    },
    drawGUI: function() {
        
    },
    listen: function(listener, cb) {
    	
        window.addEventListener(listener, function(evt) {
            cb(evt);
        }, false);

    },
    screen: {
            animate: function() {
                window.requestAnimationFrame(game.screen.animate());
                game.draw(game.screen.x, game.screen.Y);
            },
            move: function(game, direction) {

                if((typeof(moveScreen) ==='undefined')||(moveScreen === false)) {
                    moveScreen = setInterval(function() {
                        if(direction === "left") game.screen.x += .5;
                        if(direction === "right") game.screen.x -= .5;
                        if(direction === "up") game.screen.y += .5;
                        if(direction === "down") game.screen.y -= .5;
                    }, 25)
                }
                
                if(((direction === "stop")&&(typeof(moveScreen)!='undefined'))||(!game.screen.utils.canMove(game))) {
                    clearInterval(moveScreen);
                    moveScreen = false;
                }
            },
            zoom: function(game, clientX, clientY, delta) {


            },
            utils: {
                pointIsOnScreen: function(game,x,y) {
                    return (x>0)&&(x<game.screen.bgCanvas.width)&&(y>0)&&(y<game.screen.bgCanvas.height);
                },
                rectIsOnScreen: function(game,x,y,w,h) {
                    return ((x+w)>0)&&(x<game.screen.bgCanvas.width)&&((y+h)>0)&&(y<game.screen.bgCanvas.height);
                },
                circIsOnScreen: function(game,x,y,r) {
                    return ((x+r)>0)&&(x<game.screen.bgCanvas.width)&&((y+r)>0)&&(y<game.screen.bgCanvas.height);
                },
                canMove: function(game) {
                    if(game.screen.utils.mapIsContainedOnScreen(game)) {
                        return true;
                    }
                    return false;
                },
                mapIsContainedOnScreen: function(game) {
                    return true//((game.assets.map.y + game.assets.map.h)<game.screen.bgCanvas.height)&&((game.assets.map.x + game.assets.map.w)<game.screen.bgCanvas.width) ;
                }
            },
            effects: {
                fade: function(game,x,y) {
                    return (x>0)&&(x<game.screen.bgCanvas.width)&&(y>0)&&(y<game.screen.bgCanvas.height);
                },
                twinkle: function(game,x,y,w,h) {
                    return ((x+w)>0)&&(x<game.screen.bgCanvas.width)&&((y+h)>0)&&(y<game.screen.bgCanvas.height);
                }
            }
        }

}