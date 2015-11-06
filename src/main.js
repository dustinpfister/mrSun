

var Town = function(earthCX, earthCY, earthRadius){
	
	this.heat = 50;
	this.maxHeat = 75;
	this.minHeat = 25;
	
	this.angle = Math.random() * (Math.PI*2);
	this.maxHP = 1000;
	this.HP = this.maxHP;
	this.radius = 15;	
	this.x = Math.cos(this.angle) * (earthRadius - this.radius) + earthCX;
	this.y = Math.sin(this.angle) * (earthRadius - this.radius) + earthCY;
	
};

var Lake = function(sRadian, rSize){
	
	this.sRadian = sRadian;
	this.rSize = rSize;
	
};


(function(){
	
	var currentState = 'game',container,canvas,context,w,h,
	
	earth = {
		
		w:640,
		h:480,
		cx : 320,
		cy : 240,
		radius : 340,
		
		
		water : {
			
			total : 1000,
			
		},
		
		sun : {
			
			heat: 100,
			x: 0, // set by angle and distance from center of earth
			y: 0,
			radius: 30,
			angle:0,
			fromCenter:0
			
		},
		
		maxDistance:0,
		waterPerRadian: 1000,
		towns : [],
		lakes : [],
		
		update : function(){
			
			var i,len, d, per, town, diff;
			
			this.sun.x = Math.cos(this.sun.angle) * this.sun.fromCenter + this.cx;
			this.sun.y = Math.sin(this.sun.angle) * this.sun.fromCenter + this.cy;
			
			i=0;len = this.towns.length;
			while( i < len ){
				
				town = this.towns[i];
				
				// distance
				d = api.distance(this.sun.x,this.sun.y,this.towns[i].x,this.towns[i].y)-15;
				per = 1 - d / (this.maxDistance-30);
				
				// heat the building is getting from the sun
			    town.heat = per * this.sun.heat;
				
				diff = 0;
				
				// if everything is fine.
				if(town.heat < town.maxHeat && town.heat > town.minHeat){
					
					if(town.HP < town.maxHP){
						
						town.HP++;
						
						if(town.HP > town.maxHP){
							
							town.HP = town.maxHP;
							
						}
						
					}
					
				}else{
				
				
				    // if to hot.
				    if(town.heat > town.maxHeat){
					
					    diff = town.heat - town.maxHeat;
					    town.HP -= diff;
					
					    
					
					    if(town.HP <= 0){
						
						    town.HP = 0;
						
					    }
						
						//console.log(town.HP);
						console.log('per: ' + Number(town.HP / town.maxHP));
						
				    }
				
				    // if to cold.
				    if(town.heat < town.minHeat){
					
					    diff = town.heat- town.minHeat;
				    
					}
				
				}
				
				
				i++;
			}
		},
		
		setup : function(){
			
			// ALERT! this might change depending on the size of a town ( 30 is town size times 2 )
			this.maxDistance = this.radius * 2 - 30;
			
			this.sun.x = this.cx;
			this.sun.y = this.cy;
			this.towns.push(new Town(this.cx,this.cy,this.radius));
			
		},
		
		// set screen related values to something else
		setSize : function(w,h){
			
			this.w = w;
			this.h = h;
			this.cx = Math.floor(this.w / 2);
			this.cy = Math.floor(this.h / 2);
			
		},
		
		setSun : function(e){
			
			var el = e.target,
			box = el.getBoundingClientRect(),
			x = e.touches[0].clientX - box.left,
			y = e.touches[0].clientY - box.top,
			
			d = api.distance(x,y,this.cx,this.cy),
			angle = Math.atan2(y - this.cy, x - this.cx);
			
			if(angle < 0){ angle += Math.PI*2;}
			
			e.preventDefault();
			
			this.sun.angle = angle;
			if(d < this.radius - this.sun.radius){
			
			    this.sun.fromCenter = d - this.sun.radius;
				
			
			}else{
				
				this.sun.fromCenter = this.radius - this.sun.radius;
				
			}
			
		},
		
		event_start : function(e){
			
			this.setSun.call(this,e);
			
		},
		event_move : function(e){
			
			this.setSun.call(this,e);
			
		},
		event_end : function(e){
			
			this.sun.fromCenter = 0;
			
			
		}
		
		
	},
	
	
	
	// set size of container and canvas
	setSize = function(){
		
		w = window.innerWidth -5;
		h = window.innerHeight - 5;
			
		container.style.width = w + 'px';
		container.style.height = h + 'px';
		canvas.width = w;
		canvas.height = h;
		
		
		earth.setSize(w,h);
			
	},
	
	start = function(){
		
		container = document.getElementById('game_container');
		canvas = document.createElement('canvas');
		context = canvas.getContext('2d');
		
		
		setSize();
		
		window.addEventListener('resize', function(){
			
			setSize();
		    //earth.setSize(w,h);	
		});
		
		canvas.addEventListener('touchstart', earth.event_start.bind(earth));
		canvas.addEventListener('touchmove', earth.event_move.bind(earth));
		canvas.addEventListener('touchend', earth.event_end.bind(earth));
		
		context.fillStyle='#ffffff';
		context.fillRect(0,0,canvas.width,canvas.height);
		
		container.appendChild(canvas);
		
		earth.setup();
		
		loop();
	},
	
	update = {
		
		game : function(){
			
			earth.update();
			
		}
		
	},
	
	
	draw = {
		
		game : function(ctx){
		
		    var i,len,x,y;
		
			ctx.fillStyle = '#804010';
			ctx.fillRect(0,0,canvas.width,canvas.height);
			
			ctx.lineWidth=3;
			
			// draw earth
			ctx.strokeStyle = '#000000';
			
			ctx.beginPath();
			ctx.arc(earth.cx, earth.cy, earth.radius, 0, Math.PI * 2);
			ctx.stroke();
			ctx.fillStyle = 'rgba(255,255,255,1)';
			ctx.fill();
			ctx.fillStyle = 'rgba(0,255,255,0.5)';
			ctx.fill();
			
			
			
			// draw sun
			ctx.fillStyle = '#ffff00';
			ctx.beginPath();
			ctx.arc(earth.sun.x, earth.sun.y, earth.sun.radius, 0, Math.PI * 2);
			ctx.stroke();
			ctx.fill();
			
			// draw towns
			i = 0, len = earth.towns.length;
			while(i < len){
				
				// town area
			    ctx.beginPath();
			    ctx.arc(earth.towns[i].x, earth.towns[i].y, 15, 0, Math.PI * 2);
			    ctx.stroke();
				
				// HP bar
				ctx.strokeStyle = '#a0a0a0';
				ctx.beginPath();
			    ctx.arc(earth.towns[i].x, earth.towns[i].y, 15, 0, Math.PI / 2);
			    ctx.stroke();
				
				// HP
				ctx.strokeStyle = '#00ff00';
				ctx.beginPath();
			   
				//ctx.arc(earth.towns[i].x, earth.towns[i].y, 15, 0, earth.towns[i].HP / earth.towns[i].maxHP * (Math.PI / 2) );
				ctx.arc(earth.towns[i].x, earth.towns[i].y, 15,Math.PI / 2, Math.PI/2 - (earth.towns[i].HP / earth.towns[i].maxHP) * (Math.PI/2),true  );
			    ctx.stroke();
				
				i++;
			}
			
			
		}
		
	},
	
	
	loop = function(){
		
		requestAnimationFrame(loop);
		
		update[currentState]();
		draw[currentState](context);
		
	};
	
	
	start();
	
}());