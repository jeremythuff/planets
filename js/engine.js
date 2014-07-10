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

    this.screen.gui.selected = false;

    this.screen.x = 0;
    this.screen.y = 0;
    this.screen.z = .01;
    this.screen.delta = false;
    this.screen.factor = 1;

    this.input = {
        drag: {
            active: false,
            init: false,
            start: {
                x: 0,
                y: 0
            },
            lastOffset: {
                x: 0,
                y:0
            }
        },
        mouse: {
            click: {
                x: 0,
                y: 0
            },
            pos: {
                x: 0,
                y: 0
            },
            offset: {
                x: 0,
                y: 0
            }
        }
    };

    this.assets= {
        images: {},
        map: {},
        bg: {}
    };
    
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
        game.screen.utils.trackTransforms(game.screen.mg);

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

            for(var planet in planets) {
                var planetTemp = planets[planet].temp;
                if((planetTemp >= 0)&&(planetTemp <=14)) planets[planet].planetImage = game.assets.images["ice"];
                if((planetTemp >= 15)&&(planetTemp <=35)) planets[planet].planetImage = game.assets.images["cold"];
                if((planetTemp >= 36)&&(planetTemp <=60)) planets[planet].planetImage = game.assets.images["earthlike"];
                if((planetTemp >= 61)&&(planetTemp <=84)) planets[planet].planetImage = game.assets.images["warm"];
                if((planetTemp >= 85)&&(planetTemp <=100)) planets[planet].planetImage = game.assets.images["hot"];
            }


            var allConnections = {
                warp: data["connections"],
                gravatonic: data["gravatonic-connections"],
                hyp: data["hyp-connections"]
            }

            for(var originId in allConnections.warp) {

                var originPlanet; 
                
                for(var planet in game.assets.map.planets) {
                    if(planets[planet].id == originId) originPlanet = planets[planet];  
                }

                var originX = originPlanet.XCoordinate
                var originY = originPlanet.YCoordinate

                for(var i=0;i<allConnections.warp[originId].length;i++) {

                    var destinationPlanet; 
                
                    for(var planet in planets) {
                        if(planets[planet].id == allConnections.warp[originId][i]) destinationPlanet = planets[planet];  
                    }
                    
                    var index = allConnections.warp[destinationPlanet.id].indexOf(originPlanet.id);
                    
                    if (index > -1) {
                        allConnections.warp[destinationPlanet.id].splice(index, 1);
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
        
        game.drawBG(x,y);
        game.drawMap(x,y);
        game.drawForgrownd(x,y);
        game.drawGUI();

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
            game.assets.bg.x = Math.round((x*settings.layer)+(game.screen.bgCanvas.width*settings.originX));
            game.assets.bg.y = Math.round((y*settings.layer)+(game.screen.bgCanvas.height*settings.originY));

            if(group === "background") {
                game.screen.ctx.globalAlpha  = settings.alpha;    
                game.screen.ctx.drawImage(game.assets.images[asset], game.assets.bg.x, game.assets.bg.y, game.screen.bgCanvas.width*settings.size, window.innerHeight*settings.size);
                game.screen.ctx.globalAlpha  = 1; 
            }
        }  
        
    },
    drawMap: function(x,y) {

        var game = this;

        //game.screen.mgCanvas.width = game.screen.mgCanvas.width;

        var p1 = game.screen.mg.transformedPoint(0,0);
        var p2 =  game.screen.mg.transformedPoint(game.screen.mgCanvas.width, game.screen.mgCanvas.height);
        game.screen.mg.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);

        x = Math.round(x);
        y = Math.round(y);


        game.assets.map.w = (game.screen.mgCanvas.height)-(game.screen.mgCanvas.height*.1);
        game.assets.map.h = game.assets.map.w;
        game.assets.map.x = ((Math.round(x*25)+game.screen.mgCanvas.width)/2)-(game.assets.map.w/2);
        game.assets.map.y = ((Math.round(y*25)+game.screen.mgCanvas.height)/2)-(game.assets.map.h/2);
        game.assets.map.oneLightYear = game.assets.map.w/2000;
        
        // var time = 1000*Math.abs(game.screen.delta);
        // console.log(time);

        if(game.screen.delta) {
            
            var pt = game.screen.mg.transformedPoint(game.input.mouse.offset.x,game.input.mouse.offset.y);
            game.screen.mg.translate(pt.x,pt.y);
            game.screen.factor = Math.pow(1.005,game.screen.delta);
            game.screen.mg.scale(game.screen.factor,game.screen.factor);
            game.screen.mg.translate(-pt.x,-pt.y);            
            
            setTimeout(function() {
                game.screen.delta = false;
                game.screen.z = ((planets.screen.mg.getTransform().a/100).toFixed(2));
            }, 500);
     
        }

        game.drawRings(game.assets.map.planets);
        game.drawConnections(game.assets.map.planets);
        game.drawPlanets(game.assets.map.planets);

    },
    drawRings: function(planets) {
        var game = this;
        var selected = game.screen.gui.selected;
        for(var i=0; i < planets.length; i++) {
        
            var planetX = game.assets.map.x + planets[i].XCoordinate*game.assets.map.oneLightYear;
            var planetY = game.assets.map.y + planets[i].YCoordinate*game.assets.map.oneLightYear;
            
            planetX = Math.round(planetX);
            planetY = Math.round(planetY);

            if(planets[i].colonistsPopulation > 0) {

                var width = (game.assets.map.w/(100))*((planets[i].colonistsPopulation*planets[i].colonistsPopulation)/500000);
                if(width > 30) width = 30;
                if(width < 10) width = 10;
                
                game.screen.mg.globalAlpha  = .1;    
                game.screen.mg.fillStyle = "#3FEBE8";
                game.screen.mg.beginPath();
                game.screen.mg.arc(planetX, planetY, width, 0, Math.PI*2, true); 
                game.screen.mg.closePath();
                game.screen.mg.fill();
                game.screen.mg.globalAlpha  = 1; 
            }

            if(planets[i].name === selected) {   
                game.screen.mg.fillStyle = "#f90";
                game.screen.mg.beginPath();
                game.screen.mg.arc(planetX, planetY, game.assets.map.w/(100)/1.35, 0, Math.PI*2, true); 
                game.screen.mg.closePath();
                game.screen.mg.fill();
                
            }       
        }
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


            game.screen.mg.strokeStyle = "#fff";
            game.screen.mg.lineWidth = .2;
           
            game.screen.mg.moveTo(originX, originY);
            game.screen.mg.lineTo(destX, destY);
            
        }
        game.screen.mg.stroke();
    },
    drawPlanets: function(planets) {
        var game = this;
        var selected = game.screen.gui.selected;

        for(var i=0; i < planets.length; i++) {
        
            var planetX = game.assets.map.x + planets[i].XCoordinate*game.assets.map.oneLightYear;
            var planetY = game.assets.map.y + planets[i].YCoordinate*game.assets.map.oneLightYear;
            
            planetX = Math.round(planetX);
            planetY = Math.round(planetY);

            var planetName = planets[i].name;
            var planetTemp = parseInt(planets[i].temp);
            var planetImage = planets[i].planetImage;
            var settings = planetImage.settings;
            var planetColor = "#efefef"
            if(game.screen.z<.02) planetImage = game.assets.images["uknown"];

            if(planets[i].name === selected) {   
                game.screen.mg.drawImage(planetImage, planetX-(((game.assets.map.w/(100))*1.5)/2), planetY-(((game.assets.map.w/(100))*1.5)/2), (game.assets.map.w/(100))*1.5, (game.assets.map.w/(100))*1.5);
            } else {
                game.screen.mg.drawImage(planetImage, planetX-((game.assets.map.w/(100))/2), planetY-((game.assets.map.w/(100))/2), game.assets.map.w/(100), game.assets.map.w/(100));
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
        var game = this;
        game.screen.guiCanvas.width = game.screen.guiCanvas.width;

        game.leftPanel();        
        
    },
    leftPanel: function() {
        var game = this;
        var selected = game.screen.utils.getPlanetByName(game, game.screen.gui.selected);
        var boxWidth = game.screen.fgCanvas.width*.18;
        var boxHeight = game.screen.fgCanvas.height;

        if(game.screen.gui.selected != false) {

            //panel bg
            game.screen.gui.fillStyle = '#4b757f';
            game.screen.gui.globalAlpha=0.5;
            game.screen.gui.fillRect(0,0,boxWidth, boxHeight);
            game.screen.gui.globalAlpha=1;

            //close x
            game.screen.gui.drawImage(game.assets.images["close"], 10, 10, 15, 15);


            //planet name
            var planetName = selected.name;
            game.screen.gui.fillStyle = '#efefef';
            game.screen.gui.font = 'italic bold 30px sans-serif';
            var textWidth = game.screen.gui.measureText(planetName).width;
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText(planetName, boxWidth-textWidth-10, boxHeight/20);

            //coords
            var coord = selected.XCoordinate + ", " + selected.YCoordinate;
            game.screen.gui.fillStyle = '#f90';
            game.screen.gui.font = 'italic bold 11px sans-serif';
            var coordWidth = game.screen.gui.measureText(coord).width;
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText(coord, boxWidth-coordWidth-10, boxHeight/20+10);
  
            game.screen.gui.drawImage(selected.planetImage, (boxWidth/2)-((boxWidth/1)/2), boxHeight/10, boxWidth/1, boxWidth/1);

            //temp
            var temp = "Temp " + selected.temp;
            game.screen.gui.fillStyle = '#f90';
            game.screen.gui.font = 'italic bold 11px sans-serif';
            var tempdWidth = game.screen.gui.measureText(coord).width;
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText(temp, (boxWidth/2)-(tempdWidth/2), (boxHeight/10)+(boxWidth/1));


            //infastructure
            game.screen.gui.fillStyle = '#fff';
            game.screen.gui.font = 'italic bold 20px sans-serif';
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText("Infastructure", 10, boxHeight*.50);

            //money
            var money = "Money: " + selected.money;
            game.screen.gui.fillStyle = '#f90';
            game.screen.gui.font = '11px sans-serif';
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText(money, 10, (boxHeight*.50)+15);

            //supplies
            var supplies = "Supplies: " + selected.supplies;
            game.screen.gui.fillStyle = '#f90';
            game.screen.gui.font = '11px sans-serif';
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText(supplies, 10, (boxHeight*.50)+30);

            // mines
            var mines = "Mines: " + selected.mines;
            game.screen.gui.fillStyle = '#f90';
            game.screen.gui.font = '11px sans-serif';
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText(mines, 10, (boxHeight*.50)+45);

            // factories
            var factories = "Factories: " + selected.factories;
            game.screen.gui.fillStyle = '#f90';
            game.screen.gui.font = '11px sans-serif';
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText(factories, 10, (boxHeight*.50)+60);

            //minerals
            game.screen.gui.fillStyle = '#fff';
            game.screen.gui.font = 'italic bold 20px sans-serif';
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText("Minerals", 10, boxHeight*.65);

            // neutronium
            
            game.screen.gui.beginPath();
            game.screen.gui.fillStyle = "#4b757f";
            var neutHeight = (100)*(selected.neutroniumInGround/10000);
            if (neutHeight < 20) neutSurfHeight = 20;
            var neutBaseLine = ((boxHeight*.65)+100)-neutHeight;
            game.screen.gui.rect(20, neutBaseLine, 25, neutHeight);
            game.screen.gui.fill();
            game.screen.gui.closePath();

            game.screen.gui.beginPath();
            game.screen.gui.fillStyle = "#f90";
            var neutSurfHeight = (100)*(selected.neutroniumOnSurface/10000);
            if (neutSurfHeight < 10) neutSurfHeight = 10;
            var neutSurfBaseLine = ((boxHeight*.65)+100)-neutSurfHeight;
            game.screen.gui.rect(20, neutSurfBaseLine, 25, neutSurfHeight);
            game.screen.gui.fill();
            game.screen.gui.closePath();

            game.screen.gui.fillStyle = '#f90';
            game.screen.gui.font = '9px sans-serif';
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText(selected.neutroniumInGround, 20+(10-(game.screen.gui.measureText(selected.neutroniumInGround).width/2)), neutBaseLine+10);

            game.screen.gui.fillStyle = '#4b757f';
            game.screen.gui.font = '9px sans-serif';
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText(selected.neutroniumOnSurface, 20, neutSurfBaseLine+10);

            game.screen.gui.fillStyle = '#f90';
            game.screen.gui.font = '9px sans-serif';
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText("NEUT", 20, neutBaseLine+neutHeight+10);

            game.screen.gui.fillStyle = '#f90';
            game.screen.gui.font = '9px sans-serif';
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText(selected.neutroniumRate+"%", 20, neutBaseLine+neutHeight+20);




            // tritanium
            game.screen.gui.beginPath();
            game.screen.gui.fillStyle = "#4b757f";
            var neutHeight = (100)*(selected.neutroniumInGround/10000);
            if (neutHeight < 20) neutSurfHeight = 20;
            var neutBaseLine = ((boxHeight*.65)+100)-neutHeight;
            game.screen.gui.rect(25, neutBaseLine, 25, neutHeight);
            game.screen.gui.fill();
            game.screen.gui.closePath();

            game.screen.gui.beginPath();
            game.screen.gui.fillStyle = "#f90";
            var neutSurfHeight = (100)*(selected.neutroniumOnSurface/10000);
            if (neutSurfHeight < 10) neutSurfHeight = 10;
            var neutSurfBaseLine = ((boxHeight*.65)+100)-neutSurfHeight;
            game.screen.gui.rect(20, neutSurfBaseLine, 25, neutSurfHeight);
            game.screen.gui.fill();
            game.screen.gui.closePath();

            game.screen.gui.fillStyle = '#f90';
            game.screen.gui.font = '9px sans-serif';
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText(selected.neutroniumInGround, 20+(10-(game.screen.gui.measureText(selected.neutroniumInGround).width/2)), neutBaseLine+10);

            game.screen.gui.fillStyle = '#4b757f';
            game.screen.gui.font = '9px sans-serif';
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText(selected.neutroniumOnSurface, 20, neutSurfBaseLine+10);

            game.screen.gui.fillStyle = '#f90';
            game.screen.gui.font = '9px sans-serif';
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText("NEUT", 20, neutBaseLine+neutHeight+10);

            game.screen.gui.fillStyle = '#f90';
            game.screen.gui.font = '9px sans-serif';
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText(selected.neutroniumRate+"%", 20, neutBaseLine+neutHeight+20);

            // // duranium
            // var duranium = "Duranium: " + selected.duraniumOnSurface +" / "+ selected.duraniumInGround + "  @  %" + selected.duraniumRate;
            // game.screen.gui.fillStyle = '#f90';
            // game.screen.gui.font = '11px sans-serif';
            // game.screen.gui.textBaseline = 'bottom';
            // game.screen.gui.fillText(duranium, 10, (boxHeight*.65)+45);

            // // molybdenum
            // var molybdenum = "Molybdenum: " + selected.molybdenumOnSurface +" / "+ selected.molybdenumInGround + "  @  %" + selected.molybdenumRate;
            // game.screen.gui.fillStyle = '#f90';
            // game.screen.gui.font = '11px sans-serif';
            // game.screen.gui.textBaseline = 'bottom';
            // game.screen.gui.fillText(molybdenum, 10, (boxHeight*.65)+60);

             //population
            game.screen.gui.fillStyle = '#fff';
            game.screen.gui.font = 'italic bold 20px sans-serif';
            game.screen.gui.textBaseline = 'bottom';
            game.screen.gui.fillText("Population", 10, boxHeight*.80);

            if((selected.natives != "NONE")&&(selected.natives != null)) {
                // natives
                console.log(selected.natives)
                var natives = "Natives: " + selected.nativesPopulation +" "+ selected.natives +" ("+selected.nativesGovernment+"), " + selected.nativesHappiness + " & taxed @ " + selected.nativesTaxRate;
                game.screen.gui.fillStyle = '#f90';
                game.screen.gui.font = '11px sans-serif';
                game.screen.gui.textBaseline = 'bottom';
                game.screen.gui.fillText(natives, 10, (boxHeight*.80)+15);
            } else {
                 // natives
                var natives = "Natives: none";
                game.screen.gui.fillStyle = '#f90';
                game.screen.gui.font = '11px sans-serif';
                game.screen.gui.textBaseline = 'bottom';
                game.screen.gui.fillText(natives, 10, (boxHeight*.80)+15);

            }
                

            if(selected.colonistPopulation > 0) {
                // colonist
                var colonist = "Colonist: " + selected.colonistPopulation +" "+selected.player.raceType+", " + selected.colonistsHappiness + " & taxed @ " + selected.colonistsTaxRate;
                game.screen.gui.fillStyle = '#f90';
                game.screen.gui.font = '11px sans-serif';
                game.screen.gui.textBaseline = 'bottom';
                game.screen.gui.fillText(colonist, 10, (boxHeight*.80)+30);
            } else {
                // colonist
                var colonist = "Colonist: none";
                game.screen.gui.fillStyle = '#f90';
                game.screen.gui.font = '11px sans-serif';
                game.screen.gui.textBaseline = 'bottom';
                game.screen.gui.fillText(colonist, 10, (boxHeight*.80)+30);
            }
        }

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
            },
            getPlanetByName: function(game, name) {
                var planets = game.assets.map.planets;
                var planetObj = {};
                for(var planet in planets) {
                    if(planets[planet].name === name) planetObj = planets[planet];
                }
                return planetObj;
            },
            trackTransforms: function(ctx){
                var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
                var xform = svg.createSVGMatrix();
                ctx['matrix'] = [1,0,0,1,0,0];
                ctx.getTransform = function(){ return xform; };
                
                var savedTransforms = [];
                var save = ctx.save;
                ctx.save = function(){
                    savedTransforms.push(xform.translate(0,0));
                    return save.call(ctx);
                };
                var restore = ctx.restore;
                ctx.restore = function(){
                    xform = savedTransforms.pop();
                    return restore.call(ctx);
                };

                var scale = ctx.scale;
                ctx.scale = function(sx,sy){
                    xform = xform.scaleNonUniform(sx,sy);
                    ctx.matrix[0] *= sx;
                    ctx.matrix[1] *= sx;
                    ctx.matrix[2] *= sy;
                    ctx.matrix[3] *= sy; 
                    return scale.call(ctx,sx,sy);
                };
                var rotate = ctx.rotate;
                ctx.rotate = function(radians){
                    xform = xform.rotate(radians*180/Math.PI);
                    return rotate.call(ctx,radians);
                };
                var translate = ctx.translate;
                ctx.translate = function(dx,dy){
                    xform = xform.translate(dx,dy);
                    ctx.matrix[4] += ctx.matrix[0] * dx + ctx.matrix[2] * dy;
                    ctx.matrix[5] += ctx.matrix[1] * dx + ctx.matrix[3] * dy;
                    return translate.call(ctx,dx,dy);
                };
                var transform = ctx.transform;
                ctx.transform = function(a,b,c,d,e,f){
                    var m2 = svg.createSVGMatrix();
                    m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
                    xform = xform.multiply(m2);
                    return transform.call(ctx,a,b,c,d,e,f);
                };
                var setTransform = ctx.setTransform;
                ctx.setTransform = function(a,b,c,d,e,f){
                    xform.a = a;
                    xform.b = b;
                    xform.c = c;
                    xform.d = d;
                    xform.e = e;
                    xform.f = f;
                    return setTransform.call(ctx,a,b,c,d,e,f);
                };
                var pt  = svg.createSVGPoint();
                ctx.transformedPoint = function(x,y){
                    pt.x=x; pt.y=y;
                    return pt.matrixTransform(xform.inverse());
                },
                ctx.getScaledXY = function(matrix,x,y) {
                    x = x * matrix["a"] + y * matrix["c"] + matrix["e"];
                    y = x * matrix["b"] + y * matrix["d"] + matrix["f"];
                    return({x:x,y:y});
                }
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