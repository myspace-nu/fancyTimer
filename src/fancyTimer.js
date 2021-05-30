var fancytimer = function(options) {
	var thisTimer = this;
	var mergeDeep=function r(...e){const c=r=>r&&"object"==typeof r;return e.reduce((e,t)=>(Object.keys(t).forEach(a=>{const o=e[a],n=t[a];Array.isArray(o)&&Array.isArray(n)?e[a]=o.concat(...n):c(o)&&c(n)?e[a]=r(o,n):e[a]=n}),e),{})};
	var settings = mergeDeep({
		hours:0, minutes: 0, seconds: 0,
		loop: false,
		style:{
			'color': "rgba(0,0,0,0.5)",
			'font-style': "Arial",
			'line-width': 8
		},
		formatter:function(timer){
			return { text: formatTime(Math.ceil(timer.remainingms / 1000)), percentDone: timer.remainingms / (settings.seconds * 1000) }
		},
		onElapsed: function(){}
	},options);
	settings.seconds = settings.hours*3600 + settings.minutes*60 + settings.seconds;

	this.startTime = settings.startTime ?? null;
	this.endTime = settings.endTime ?? null;
	if(this.endTime && settings.seconds)
		this.startTime = new Date(this.endTime.getTime()-settings.seconds*1000);

	this.elapsedms = 0;
	this.remainingms = settings.seconds * 1000;

	var c = document.getElementById(settings.canvas);
	var ctx = c.getContext("2d");
	this.start = function() {
		thisTimer.startTime = thisTimer.startTime ?? new Date();
		thisTimer.timer = window.setInterval(function() {
			updateTimer();
		}, 100);
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
		if(!thisTimer.startTime){

		} else if(new Date().getTime() > thisTimer.startTime.getTime()){
			thisTimer.elapsedms = new Date().getTime() - thisTimer.startTime.getTime();
			thisTimer.remainingms = settings.seconds * 1000 - thisTimer.elapsedms;
		}
		
		if (thisTimer.remainingms <= 0) {
			stopTimer();
			thisTimer.elapsedms = settings.seconds * 1000;
			thisTimer.remainingms = 0;
			settings.onElapsed.call(this, thisTimer);
		}
		var state = settings.formatter(thisTimer);
		var percent = (typeof state === 'object' && 'percentDone' in state) ? state.percentDone : thisTimer.remainingms / (settings.seconds * 1000);
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

		circle(ctx, 250, (ctx.lineWidth/2), (ctx.lineWidth/2), settings.style.color);
		var p = displace(c.width/2, c.height/2, 360*percent, (Math.min(c.width, c.height)/2)-(ctx.lineWidth/2));
		circle(ctx, p.x, p.y, (ctx.lineWidth/2), settings.style.color);

		for(var iperc=1; iperc>percent; iperc-=0.02){
			var p = displace(c.width/2, c.height/2, 360*iperc, (Math.min(c.width, c.height)/2)-(ctx.lineWidth/2));
			circle(ctx, p.x, p.y, (ctx.lineWidth/4), settings.style.color);
		}
		
		var textScale = (1/((""+timerText).length/6))*0.4; textScale=Math.min(textScale,1);
		var textSize = ((Math.min(c.width, c.height) * 0.5) * textScale);
		ctx.font = textSize + "px " + settings.style['font-style'];
		ctx.fillStyle = settings.style.color;
		ctx.textAlign = "center";
		ctx.fillText(timerText, c.width / 2, (c.height/2)+(textSize*0.75)/2 );

	};
	var stopTimer = function() {
		window.clearInterval(thisTimer.timer);
	}
	updateTimer();
	return thisTimer;
};