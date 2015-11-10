

var Town = function (earthCX, earthCY, earthRadius) {

	this.heat = 50;
	this.maxHeat = 75;
	this.minHeat = 25;

	this.angle = Math.random() * (Math.PI * 2);
	this.maxHP = 1000;
	this.HP = this.maxHP;
	this.radius = 15;
	this.x = Math.cos(this.angle) * (earthRadius - this.radius) + earthCX;
	this.y = Math.sin(this.angle) * (earthRadius - this.radius) + earthCY;

};

(function () {

	var currentState = 'game',
	container,
	canvas,
	context,
	w,
	h,

	earth = {

		w : 640,
		h : 480,
		cx : 320,
		cy : 240,
		radius : 340,

		water : {

			total : 1000, // the total amount of water that there is in the earth
			perRadian : 500, // the max amount of water that can be in an area per radian of angular distance

			ground : 1000, // the amount of water that is in the ground
			air : 0, // the amount of water that is in the air

			areas : [], // areas that are lakes, oceans, ect that also may store some of earths water.
			drops : [], // water drops that are going up to or down from air reserves.

			seepRate : 2,

			// set the total amount of water, and the areas where water may appear.
			setup : function (total, areaArray) {

				var i,
				len,
				tempArea,
				r,
				rLen,
				x,
				y,
				radian,
				step;

				// set total water
				this.total = total;

				// all water starts in the ground
				this.ground = this.total;

				// nothing in the air
				this.air = 0;

				// set up areas
				this.areas = [];
				i = 0;
				len = areaArray.length;
				while (i < len) {

					tempArea = {

						sRadian : areaArray[i].sRadian,
						rSize : areaArray[i].rSize

					};

					tempArea.capacity = this.perRadian * tempArea.rSize;
					tempArea.amount = 0;
					tempArea.points = [];

					tempArea.points = [];
					rLen = 5; // number of points along surface to check distance to sun
					r = 0;
					radian = tempArea.sRadian;
					step = tempArea.rSize / rLen;
					while (r < rLen + 1) {

						x = Math.cos(radian) * earth.radius + earth.cx;
						y = Math.sin(radian) * earth.radius + earth.cy;
						tempArea.points.push({
							x : x,
							y : y,
							lastUpdate : new Date()
						});

						radian += step;
						r += 1;
					}

					this.areas.push(tempArea);

					i += 1;
				}

			},

			addDrops : function () {},

			evaporation : function (earth, area, point) {

				var maxWater = 100,
				waterPerUnit,
				unitCount,
				per,
				deltaWater,
				remaining,
				drop,d;

				if (area.amount > 0) {

					deltaWater = Math.ceil((area.points[point].heat - 50 + 1) / 51 * maxWater);

					if (area.amount - deltaWater < 0) {

						deltaWater = area.amount;
					}

					per = deltaWater / maxWater;

					unitCount = Math.ceil(per * 10);
					remaining = deltaWater % unitCount;
					waterPerUnit = Math.floor(deltaWater / unitCount);

					d=0;
					while(d < unitCount){
						
						var step = area.rSize / 5;
						
						drop = {
							
							angle: area.sRadian + step * point + (Math.random() * step),
							distance: earth.radius,
							
							x:area.points[point].x,
							y:area.points[point].y,
							water : waterPerUnit,
							kill: false
						};
						
						
						
						// if last append remaining
						if(d === unitCount - 1){
							
							drop.water += remaining;
							
						}
						
						this.drops.push(drop);
						
						d++;
					}
					
					area.amount -= deltaWater;
					//this.air += deltaWater;
				}

			},

			update : function (earth) {

				var i,
				len,
				area,
				deltaWater,

				//waterPerUnit,
				//unitCount,

				p,
				pLen;

				// update areas
				i = 0;
				len = this.areas.length;
				while (i < len) {

					area = this.areas[i];

					// if there is water in the ground it can seep into the area
					if (this.ground > 0) {

						// if the area is not filled to capacity, then water can seep in from the ground
						if (area.amount < area.capacity) {

							//if(area.capacity - area.amount < this.seepRate){
							if (this.ground < this.seepRate) {

								deltaWater = this.ground;
								//deltaWater = area.capacity - area.amount;

							} else {

								deltaWater = this.seepRate;
							}

							// do not fill area over capacity
							if (area.amount + deltaWater > area.capacity) {

								deltaWater = area.capacity - area.amount;

							}

							this.ground -= deltaWater;
							area.amount += deltaWater;

						}
					}

					// the sun

					// find the distance for each point in area, so we know which parts will be hotter than others
					p = 0;
					pLen = area.points.length;
					while (p < pLen) {

						// set heat of section based on distance to sun
						area.points[p].d = api.distance(area.points[p].x, area.points[p].y, earth.sun.x, earth.sun.y) - 30;
						area.points[p].heat = Math.round(earth.sun.heat - area.points[p].d / 620 * earth.sun.heat);

						if (new Date() - area.points[p].lastUpdate >= 1000) {

							if (area.points[p].heat - 50 >= 0) {

								this.evaporation(earth,area, p);

							}
							area.points[p].lastUpdate = new Date();

						}

						p += 1;
					}

					i += 1;
				}

				// drops
				i = 0;
				len = this.drops.length,
				killList = [];
				while(i < len){
					
					this.drops[i].x = Math.cos(this.drops[i].angle) * this.drops[i].distance + earth.cx;
					this.drops[i].y = Math.sin(this.drops[i].angle) * this.drops[i].distance + earth.cy;
					
					if(this.drops[i].distance > earth.radius / 2){
					    
						this.drops[i].distance--;
					
					}else{
						
						// this.kill = true;
						
						killList.push(i);
						
					}
					
					i++;
				}
				
				i = killList.length;
				while(i--){
					
					this.air += this.drops[killList[i]].water;
					
					this.drops.splice(killList[i],1);
					
				}
				
				
				// AIR Water
				// if there is water in the air it may rain.
				if (this.air > 0) {

					this.air -= 1;
					this.ground += 1;

				}

			}

		},

		sun : {

			heat : 100,
			x : 0, // set by angle and distance from center of earth
			y : 0,
			radius : 30,

			angle : 0,
			fromCenter : 0,

			surfaceX : 0,
			surfaceY : 0

		},

		// ALERT! I might not need this
		maxDistance : 0,

		towns : [],

		update : function () {

			var i,
			len,
			d,
			per,
			town,
			diff,
			x,
			y;

			this.sun.x = Math.cos(this.sun.angle) * this.sun.fromCenter + this.cx;
			this.sun.y = Math.sin(this.sun.angle) * this.sun.fromCenter + this.cy;

			this.sun.surfaceX = Math.cos(this.sun.angle) * this.radius + this.cx;
			this.sun.surfaceY = Math.sin(this.sun.angle) * this.radius + this.cy;

			// update towns
			i = 0;
			len = this.towns.length;
			while (i < len) {

				town = this.towns[i];

				// distance
				d = api.distance(this.sun.x, this.sun.y, this.towns[i].x, this.towns[i].y) - 15;
				per = 1 - d / (this.maxDistance - 30);

				// heat the building is getting from the sun
				town.heat = per * this.sun.heat;

				diff = 0;

				// if everything is fine.
				if (town.heat < town.maxHeat && town.heat > town.minHeat) {

					if (town.HP < town.maxHP) {

						town.HP += 1;

						if (town.HP > town.maxHP) {

							town.HP = town.maxHP;

						}

					}

				} else {

					// if to hot.
					if (town.heat > town.maxHeat) {

						diff = town.heat - town.maxHeat;
						town.HP -= diff;

						if (town.HP <= 0) {

							town.HP = 0;

						}

					}

					// if to cold.
					if (town.heat < town.minHeat) {

						diff = town.heat - town.minHeat;

					}

				}

				i += 1;
			}

			// update water
			this.water.update(this);

			// a point on the surface that is below the sun


		},

		setup : function () {

			// ALERT! this might change depending on the size of a town ( 30 is town size times 2 )
			this.maxDistance = this.radius * 2 - 30;

			this.sun.x = this.cx;
			this.sun.y = this.cy;

			// water
			this.water.setup(2000, [{
						sRadian : Math.PI * 0.5,
						rSize : 3
					}
				]);

			// towns
			this.towns.push(new Town(this.cx, this.cy, this.radius));

		},

		// set screen related values to something else
		setSize : function (w, h) {

			this.w = w;
			this.h = h;
			this.cx = Math.floor(this.w / 2);
			this.cy = Math.floor(this.h / 2);

		},

		setSun : function (e) {

			var el = e.target,
			box = el.getBoundingClientRect(),
			x = e.touches[0].clientX - box.left,
			y = e.touches[0].clientY - box.top,

			d = api.distance(x, y, this.cx, this.cy),
			angle = Math.atan2(y - this.cy, x - this.cx);

			if (angle < 0) {
				angle += Math.PI * 2;
			}

			e.preventDefault();

			this.sun.angle = angle;
			if (d < this.radius - this.sun.radius) {

				this.sun.fromCenter = d - this.sun.radius;

			} else {

				this.sun.fromCenter = this.radius - this.sun.radius;

			}

		},

		event_start : function (e) {

			this.setSun.call(this, e);

		},
		event_move : function (e) {

			this.setSun.call(this, e);

		},
		event_end : function (e) {

			this.sun.fromCenter = 0;

		}

	},

	// set size of container and canvas
	setSize = function () {

		w = window.innerWidth - 5;
		h = window.innerHeight - 5;

		container.style.width = w + 'px';
		container.style.height = h + 'px';
		canvas.width = w;
		canvas.height = h;

		earth.setSize(w, h);

	},

	update = {

		game : function () {

			earth.update();

		}

	},

	draw = {

		game : function (ctx) {

			var i,
			len,
			area,
			per,
			p,
			pLen,
			x,
			y;

			ctx.fillStyle = '#804010';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.lineWidth = 3;

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
			//ctx.beginPath();
			//ctx.moveTo(earth.sun.x,earth.sun.y);
			//ctx.lineTo(earth.sun.surfaceX, earth.sun.surfaceY);
			//ctx.stroke();


			// draw towns
			i = 0;
			len = earth.towns.length;
			while (i < len) {

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
				ctx.arc(earth.towns[i].x, earth.towns[i].y, 15, Math.PI / 2, Math.PI / 2 - (earth.towns[i].HP / earth.towns[i].maxHP) * (Math.PI / 2), true);
				ctx.stroke();

				i += 1;
			}

			// draw water areas


			ctx.strokeStyle = '#0000ff';
			i = 0;
			len = earth.water.areas.length;
			while (i < len) {

				area = earth.water.areas[i];

				per = area.amount / area.capacity;

				// draw water lines to sun
				p = 0;
				pLen = area.points.length;
				while (p < pLen) {

					ctx.lineWidth = 1 + 10 * per;
					ctx.beginPath();
					ctx.strokeStyle = 'rgb(' + Math.round(area.points[p].heat / 100 * 255) + ',0,255)';
					ctx.arc(earth.cx, earth.cy, earth.radius, area.sRadian + area.rSize / pLen * p, area.sRadian + area.rSize / pLen * p + area.rSize / pLen);
					ctx.stroke();

					if (area.points[p].heat > 75) {

						ctx.lineWidth = 1;
						ctx.beginPath();
						ctx.moveTo(area.points[p].x, area.points[p].y);
						ctx.lineTo(earth.sun.x, earth.sun.y);

						ctx.stroke();
					}

					p += 1;
				}
				
				// draw drops
				
				ctx.lineWidth = 1;
				ctx.strokeStyle='#0000ff';
				p = 0, pLen = earth.water.drops.length;
				while(p < pLen){
					
					ctx.beginPath();
					ctx.arc(earth.water.drops[p].x, earth.water.drops[p].y, 5, 0, Math.PI*2);
					ctx.stroke();
					
					
					p++;
				}
				

				// amount
				ctx.fillText('area amount: ' + area.amount, 20, 300 + 20 * i);

				i += 1;
			}

			//
			ctx.fillText('total water: ' + earth.water.total, 20, 20);
			ctx.fillText('ground water: ' + earth.water.ground, 20, 40);
			ctx.fillText('air water: ' + earth.water.air, 20, 60);

		}

	},

	loop = function () {

		requestAnimationFrame(loop);

		update[currentState]();
		draw[currentState](context);

	},

	start = function () {

		container = document.getElementById('game_container');
		canvas = document.createElement('canvas');
		context = canvas.getContext('2d');

		setSize();

		window.addEventListener('resize', function () {

			setSize();
			//earth.setSize(w,h);
		});

		canvas.addEventListener('touchstart', earth.event_start.bind(earth));
		canvas.addEventListener('touchmove', earth.event_move.bind(earth));
		canvas.addEventListener('touchend', earth.event_end.bind(earth));

		context.fillStyle = '#ffffff';
		context.fillRect(0, 0, canvas.width, canvas.height);

		container.appendChild(canvas);

		earth.setup();

		loop();
	};

	start();

}
	());
