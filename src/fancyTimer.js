var fancytimer = function(options) {
	var thisTimer = this;
	var mergeDeep=function r(...e){const c=r=>r&&"object"==typeof r;return e.reduce((e,t)=>(Object.keys(t).forEach(a=>{const o=e[a],n=t[a];Array.isArray(o)&&Array.isArray(n)?e[a]=o.concat(...n):c(o)&&c(n)?e[a]=r(o,n):e[a]=n}),e),{})};
	var settings = mergeDeep({
		hours:0, minutes: 0, seconds: 0,
		showGrains: true,
		loop: false,
		style:{
			'color': "#aaa",
			'font': "Arial",
			'line-width': 8
		},
		formatter:function(timer){
			return { text: formatTime(Math.ceil(timer.remainingms / 1000)), percentDone: (timer.remainingms/(timer.endTime.getTime()-timer.startTime.getTime()))*100 }
		},
		onElapsed: function(){},
		onPause: function(){},
		onResume: function(){},
		onStop: function(){},
		onStart: function(){},
		onReset: function(){},
	},options);
	settings.seconds = settings.hours*3600 + settings.minutes*60 + settings.seconds;

	// Private functions
	var stopTimer = function() {
		window.clearInterval(thisTimer.timer);
	};
	var reset = function() {
		if(!settings.loop)
			stopTimer();
		thisTimer.paused = false;
		thisTimer.started = false;
		thisTimer.startTime = settings.startTime ?? new Date();
		thisTimer.endTime = settings.endTime ?? null;
		if(thisTimer.endTime && settings.seconds)
			thisTimer.startTime = new Date(thisTimer.endTime.getTime()-settings.seconds*1000);
		if(thisTimer.endTime && !settings.seconds)
			thisTimer.startTime = new Date();
		thisTimer.endTime = thisTimer.endTime ?? (settings.seconds)?new Date(thisTimer.startTime.getTime()+settings.seconds*1000) : new Date();
		if(settings.loop){
			thisTimer.startTime = new Date();
			thisTimer.endTime = new Date(thisTimer.startTime.getTime() + settings.seconds*1000);
			thisTimer.started = true;
		}
		thisTimer.elapsedms = 0;
		thisTimer.remainingms = (settings.seconds) ? settings.seconds * 1000 : thisTimer.endTime.getTime() - thisTimer.startTime.getTime();
	};
	var formatTime = function(seconds) {
		seconds = Math.round(seconds);
		var h = Math.floor(seconds / 3600);
		var m = Math.floor((seconds - h * 3600) / 60);
		m = (seconds >= 3600 && m < 10) ? "0" + m : m;
		var s = seconds - h * 3600 - m * 60;
		s = (seconds >= 60 && s < 10) ? "0" + s : s;
		return (seconds >= 3600) ? h + ":" + m + ":" + s : (seconds > 60) ? m + ":" + s : seconds;
	};
	var circle = function(ctx,x,y,radius,color){
		ctx.beginPath();
		ctx.lineWidth = 0;
		if (color) ctx.fillStyle = color;
		ctx.arc(x, y, radius, 0, 2*Math.PI );
		ctx.fill();
	};
	var displace = function(x,y,angle,distance){
		return {
			x: x + (distance * Math.cos((angle - 90) * (Math.PI / 180))),
			y: y + (distance * Math.sin((angle - 90) * (Math.PI / 180)))
		}
	}
	var updateTimer = function() {
		if(thisTimer.paused)
			return;
		if(!thisTimer.startTime){

		} else if(new Date().getTime() > thisTimer.startTime.getTime()){
			thisTimer.elapsedms = new Date().getTime() - thisTimer.startTime.getTime();
			thisTimer.remainingms = thisTimer.endTime.getTime() - new Date().getTime(); //   settings.seconds * 1000 - thisTimer.elapsedms;
		}
		if (thisTimer.remainingms <= 0) {
			if(settings.loop){
				reset();
			} else {
				stopTimer();
				thisTimer.elapsedms = settings.seconds * 1000;
				thisTimer.remainingms = 0;
			}
			settings.onElapsed.call(this, thisTimer);
		}
		var state = settings.formatter(thisTimer);
		var percent = (typeof state === 'object' && 'percentDone' in state) ? state.percentDone/100 : thisTimer.remainingms / (thisTimer.endTime.getTime()-thisTimer.startTime.getTime());
		var timerText = (typeof state === 'object' && 'text' in state) ? state.text : state;

		ctx.clearRect(0, 0, c.width, c.height);
		ctx.beginPath();
		ctx.strokeStyle = settings.style.color;
		ctx.lineWidth = c.width*(settings.style['line-width']/200);

		ctx.arc(
			c.width / 2,
			c.height / 2,
			(Math.min(c.width, c.height)/2) - (ctx.lineWidth/2),
			(0 - 90) * (Math.PI / 180),
			(percent * 360 - 90) * (Math.PI / 180)
		);
		ctx.stroke();

		var p = displace(c.width/2, c.height/2, 0, (Math.min(c.width, c.height)/2)-(ctx.lineWidth/2));
		circle(ctx, p.x, p.y, (ctx.lineWidth/2), settings.style.color);
		p = displace(c.width/2, c.height/2, 360*percent, (Math.min(c.width, c.height)/2)-(ctx.lineWidth/2));
		circle(ctx, p.x, p.y, (ctx.lineWidth/2), settings.style.color);

		if(settings.showGrains){
			for(var iperc=1; iperc>percent; iperc-= 1/(300/settings.style['line-width'])   ){
				var p = displace(c.width/2, c.height/2, 360*iperc, (Math.min(c.width, c.height)/2)-(ctx.lineWidth/2));
				circle(ctx, p.x, p.y, (ctx.lineWidth/4), settings.style.color);
			}
		}
		
		var textScale = (1/((""+timerText).length/6))*0.4; textScale=Math.min(textScale,1);
		var textSize = ((Math.min(c.width, c.height) * 0.5) * textScale);
		ctx.font = textSize + "px " + settings.style['font'];
		ctx.fillStyle = settings.style.color;
		ctx.textAlign = "center";
		ctx.fillText(timerText, c.width / 2, (c.height/2)+(textSize*0.75)/2 );

	};
	// Private variables
	var pauseTime = null;
	var c = document.getElementById(settings.canvas);
	var ctx = c.getContext("2d");
	// Public functions
	this.start = function() {
		reset();
		thisTimer.startTime = settings.startTime ?? new Date();
		if(settings.seconds)
			thisTimer.endTime = new Date(thisTimer.startTime.getTime() + settings.seconds*1000);
		// if(thisTimer.started) return;
		thisTimer.started = true;
		thisTimer.timer = window.setInterval(function() {
			updateTimer();
		}, 100);
		settings.onStart.call(this, thisTimer);
		return thisTimer;
	};
	this.pause = function(){
		if(!thisTimer.started || thisTimer.paused)
			return;
		pauseTime = new Date();
		thisTimer.paused = true;
		settings.onPause.call(this, thisTimer);
		return thisTimer;
	};
	this.resume = function(){
		if(!thisTimer.started || !thisTimer.paused)
			return;
		var ms = new Date().getTime() - pauseTime.getTime();
		thisTimer.endTime = new Date(thisTimer.endTime.getTime()+ms);
		thisTimer.paused = false;
		settings.onResume.call(this, thisTimer);
		return thisTimer;
	};
	this.stop = function(){
		settings.loop = false;
		reset();
		updateTimer();
		settings.onStop.call(this, thisTimer);
		return thisTimer;
	}
	this.reset = function(){
		reset();
		settings.onReset.call(this, thisTimer);
		return thisTimer;
	}
	reset();
	updateTimer();
	return thisTimer;
};