

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
			
			total : 1000,   // the total amount of water that there is in the earth
			perRadian: 200, // the max amount of water that can be in an area per radian of angular distance
			
			ground: 1000,  // the amount of water that is in the ground
			air:0,         // the amount of water that is in the air
			
			areas: [],      // areas that are lakes, oceans, ect that also may store some of earths water. 
		    seepRate : 3,
		
		    // set the total amount of water, and the areas where water may appear.
		    setup : function(total, areaArray){
				
				var i,len, tempArea;
				
				// set total water
				this.total = total;
				
				// all water starts in the ground
				this.ground = this.total;
				
				// nothing in the air
				this.air = 0;
				
				
				// set up areas
				this.areas = [];
				i = 0; len = areaArray.length;
				while(i < len){
					
					tempArea = {
						
						sRadian : areaArray[i].sRadian,
						rSize : areaArray[i].rSize
					
					};
				
					tempArea.capacity = this.perRadian * tempArea.rSize;
					tempArea.amount = 0;
					tempArea.points = [];
					
					this.areas.push(tempArea);
					
					i++;
				}
				
			},
			
			
			update : function(earth){
					
					var i,len,area,deltaWater,rLen,radian,step,r,x,y;
					
					
					
					
					
                    i=0;len=this.areas.length					
					while(i < len){
							
						area = this.areas[i];
					
                        // if there is water in the ground it can seep into the area					
						if(this.ground > 0){
					
         					if(area.amount < area.capacity){
							
							
							    if(area.capacity - area.amount < this.seepRate){
									
									deltaWater = area.capacity - area.amount;
									
								}else{
									
									deltaWater = this.seepRate;
								}
							
                                this.ground -= deltaWater;
								area.amount += deltaWater;
								
							}
						}
						
						// the sun?
						
						// check distances
						area.points = [];
						rLen = 5, // number of points along surface to check distance to sun 
						r=0,
						radian = area.sRadian, 
						step = area.rSize / rLen;
						while(r < rLen+1){
							
							x = Math.cos(radian) * earth.radius + earth.cx;
							y = Math.sin(radian) * earth.radius + earth.cy;
							area.points.push({x:x,y:y});
							
							radian += step;
							r++;
						}
						
						// sun angle within area?
						if(earth.sun.angle > area.sRadian && earth.sun.angle < area.sRadian + area.rSize){
							
							//	console.log(true);
						}
						
		
                		i++;
					}
						
					
					
					
					
					
					
					
				}
		
		},
		
		sun : {
			
			heat: 100,
			x: 0, // set by angle and distance from center of earth
			y: 0,			
			radius: 30,
			
			angle:0,
			fromCenter:0,
			
			surfaceX:0,
			surfaceY:0
			
		},
		
		maxDistance:0,
		
		towns : [],
		
		
		update : function(){
			
			var i,len, d, per, town, diff,x,y;
			
			this.sun.x = Math.cos(this.sun.angle) * this.sun.fromCenter + this.cx;
			this.sun.y = Math.sin(this.sun.angle) * this.sun.fromCenter + this.cy;
			
			this.sun.surfaceX = Math.cos(this.sun.angle) * this.radius + this.cx;
			this.sun.surfaceY = Math.sin(this.sun.angle) * this.radius + this.cy;
			
			// update towns
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
						
						
				    }
				
				    // if to cold.
				    if(town.heat < town.minHeat){
					
					    diff = town.heat- town.minHeat;
				    
					}
				
				}
				
				
				i++;
			}
			
			
			// update water
			this.water.update(this);
			
			
			
			// a point on the surface that is below the sun
			
			
		},
		
		setup : function(){
			
			// ALERT! this might change depending on the size of a town ( 30 is town size times 2 )
			this.maxDistance = this.radius * 2 - 30;
			
			this.sun.x = this.cx;
			this.sun.y = this.cy;
			
			// water
			this.water.setup(1000, [
			    
				{
					sRadian:Math.PI * 0.5,
					rSize: 1
				}
			
			]);
			
			// towns
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
			
			// draw line from sun to surface
			ctx.beginPath();
			ctx.moveTo(earth.sun.x,earth.sun.y);
			ctx.lineTo(earth.sun.surfaceX, earth.sun.surfaceY);
			ctx.stroke();
			
			
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
			
			
			// draw water areas
			
			var area,per;
			
			ctx.strokeStyle = '#0000ff';
			i=0, len = earth.water.areas.length;
			while( i < len ){
				
				area = earth.water.areas[i];
				
				per = area.amount / area.capacity;
				
				ctx.lineWidth = 1 + 10 * per;
				ctx.beginPath();
				//ctx.arc(earth.cx,earth.cy,earth.radian,earth.water.areas[i].sRadian,earth.water.areas[i].rSize );
				
				ctx.arc(earth.cx,earth.cy,earth.radius,area.sRadian,area.sRadian+area.rSize);
				ctx.stroke();
			
                // draw water lines to sun
				ctx.lineWidth = 1;
				var p = 0, pLen = area.points.length;
				
				while(p < pLen){
				
                    ctx.beginPath();				
					ctx.moveTo(area.points[p].x,area.points[p].y);
					ctx.lineTo(earth.sun.x,earth.sun.y);
					
					ctx.stroke();
					
					p++;
				}
			
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