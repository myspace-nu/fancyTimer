class fancytimer {
	constructor(options){
		var mergeDeep=function r(...e){const c=r=>r&&"object"==typeof r;return e.reduce((e,t)=>(Object.keys(t).forEach(a=>{const o=e[a],n=t[a];Array.isArray(o)&&Array.isArray(n)?e[a]=o.concat(...n):c(o)&&c(n)?e[a]=r(o,n):e[a]=n}),e),{})};
		this.settings = mergeDeep({
			hours:0, minutes: 0, seconds: 0,
			showGrains: true,
			loop: false,
			style:{
				'color': "#aaa",
				'font': "Arial",
				'line-width': 8
			},
			formatter:function(timer){
				return { text: Math.ceil(timer.remainingms / 1000), percentDone: (timer.remainingms/timer.totalTime)*100 }
			},
			onElapsed: function(){},
			onPause: function(){},
			onResume: function(){},
			onStop: function(){},
			onStart: function(){},
			onReset: function(){},
		},options);
		this.settings.seconds = this.settings.hours*3600 + this.settings.minutes*60 + this.settings.seconds;
		this.canvasElm = document.getElementById(this.settings.canvas);
		this.ctx = this.canvasElm.getContext("2d", { willReadFrequently: true });
		this.reset();
		this.updateTimer();
		return this;
	}
	stopTimer(){
		window.clearInterval(this.timer);
	}
	reset() {
		if(!this.settings.loop)
			this.stopTimer();
		this.paused = false;
		this.started = false;
		this.startTime = this.settings.startTime ?? new Date();
		this.endTime = this.settings.endTime ?? null;
		if(this.endTime && this.settings.seconds)
			this.startTime = new Date(this.endTime.getTime()-this.settings.seconds*1000);
		if(this.endTime && !this.settings.seconds)
			this.startTime = new Date();
		this.endTime = this.endTime ?? (this.settings.seconds)?new Date(this.startTime.getTime()+this.settings.seconds*1000) : new Date();
		if(this.settings.loop){
			this.startTime = new Date();
			this.endTime = new Date(this.startTime.getTime() + this.settings.seconds*1000);
			this.started = true;
		}
		this.elapsedms = 0;
		this.remainingms = (this.settings.seconds) ? this.settings.seconds * 1000 : this.endTime.getTime() - this.startTime.getTime();
		this.totalTime = this.remainingms;
		this.settings.onReset.call(this);
	}
	formatTime(seconds) {
		seconds = Math.round(seconds);
		var h = Math.floor(seconds / 3600);
		var m = Math.floor((seconds - h * 3600) / 60);
		m = (seconds >= 3600 && m < 10) ? "0" + m : m;
		var s = seconds - h * 3600 - m * 60;
		s = (seconds >= 60 && s < 10) ? "0" + s : s;
		return (seconds >= 3600) ? h + ":" + m + ":" + s : (seconds > 60) ? m + ":" + s : seconds;
	}
	circle(ctx, x, y, radius, color){
		ctx.beginPath();
		ctx.lineWidth = 0;
		if (color) ctx.fillStyle = color;
		ctx.arc(x, y, radius, 0, 2*Math.PI );
		ctx.fill();
	}
	displace(x, y, angle, distance){
		return {
			x: x + (distance * Math.cos((angle - 90) * (Math.PI / 180))),
			y: y + (distance * Math.sin((angle - 90) * (Math.PI / 180)))
		}
	}
	updateTimer() {
		if(this.paused)
			return;
		if(!this.startTime){

		} else if(new Date().getTime() > this.startTime.getTime()){
			this.elapsedms = new Date().getTime() - this.startTime.getTime();
			this.remainingms = this.endTime.getTime() - new Date().getTime(); //   this.settings.seconds * 1000 - this.elapsedms;
		}
		if (this.remainingms <= 0) {
			if(this.settings.loop){
				this.reset();
			} else {
				this.stopTimer();
				this.elapsedms = this.settings.seconds * 1000;
				this.remainingms = 0;
			}
			this.settings.onElapsed.call(this, this);
		}
		var state = this.settings.formatter(this);
		var percent = (typeof state === 'object' && 'percentDone' in state) ? state.percentDone/100 : this.remainingms / (this.endTime.getTime()-this.startTime.getTime());
		var timerText = (typeof state === 'object' && 'text' in state) ? state.text : state;

		this.ctx.clearRect(0, 0, this.canvasElm.width, this.canvasElm.height);
		this.ctx.beginPath();
		this.ctx.strokeStyle = this.settings.style.color;
		this.ctx.lineWidth = this.canvasElm.width*(this.settings.style['line-width']/200);

		this.ctx.arc(
			this.canvasElm.width / 2,
			this.canvasElm.height / 2,
			(Math.min(this.canvasElm.width, this.canvasElm.height)/2) - (this.ctx.lineWidth/2),
			(0 - 90) * (Math.PI / 180),
			(percent * 360 - 90) * (Math.PI / 180)
		);
		this.ctx.stroke();

		var p = this.displace(this.canvasElm.width/2, this.canvasElm.height/2, 0, (Math.min(this.canvasElm.width, this.canvasElm.height)/2)-(this.ctx.lineWidth/2));
		this.circle(this.ctx, p.x, p.y, (this.ctx.lineWidth/2), this.settings.style.color);
		p = this.displace(this.canvasElm.width/2, this.canvasElm.height/2, 360*percent, (Math.min(this.canvasElm.width, this.canvasElm.height)/2)-(this.ctx.lineWidth/2));
		this.circle(this.ctx, p.x, p.y, (this.ctx.lineWidth/2), this.settings.style.color);

		if(this.settings.showGrains){
			for(var iperc=1; iperc>percent; iperc-= 1/(300/this.settings.style['line-width'])   ){
				var p = this.displace(this.canvasElm.width/2, this.canvasElm.height/2, 360*iperc, (Math.min(this.canvasElm.width, this.canvasElm.height)/2)-(this.ctx.lineWidth/2));
				this.circle(this.ctx, p.x, p.y, (this.ctx.lineWidth/4), this.settings.style.color);
			}
		}
		
		var textScale = (1/((""+timerText).length/6))*0.4; textScale=Math.min(textScale,1);
		var textSize = ((Math.min(this.canvasElm.width, this.canvasElm.height) * 0.5) * textScale);
		this.ctx.font = textSize + "px " + this.settings.style['font'];
		this.ctx.fillStyle = this.settings.style.color;
		this.ctx.textAlign = "center";
		this.ctx.fillText(timerText, this.canvasElm.width / 2, (this.canvasElm.height/2)+(textSize*0.75)/2 );

	}
	start() {
		this.reset();
		this.startTime = this.settings.startTime ?? new Date();
		if(this.settings.seconds)
			this.endTime = new Date(this.startTime.getTime() + this.settings.seconds*1000);
		// if(this.started) return;
		this.started = true;
		this.timer = window.setInterval(function(fancy) {
			fancy.updateTimer();
		}, 100, this);
		this.settings.onStart.call(this, this);
		return this;
	}
	pause(){
		if(!this.started || this.paused)
			return;
		this.pauseTime = new Date();
		this.paused = true;
		this.settings.onPause.call(this, this);
		return this;
	}
	resume(){
		if(!this.started || !this.paused)
			return;
		var ms = new Date().getTime() - this.pauseTime.getTime();
		this.endTime = new Date(this.endTime.getTime()+ms);
		this.paused = false;
		this.settings.onResume.call(this, this);
		return this;
	}
	stop(){
		this.settings.loop = false;
		this.reset();
		this.updateTimer();
		this.settings.onStop.call(this, this);
		return this;
	}
}