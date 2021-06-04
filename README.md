# fancyTimer

[![Build Status](https://travis-ci.com/myspace-nu/fancyTimer.svg?branch=main)](https://travis-ci.com/myspace-nu/fancyTimer)
[![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/myspace-nu/fancyTimer/blob/master/LICENSE)

## Usage

	<canvas id="myCanvas" width="100" height="100">
	<script type="text/javascript">
		$(document).ready(function() {
			var myTimer = new fancytimer({ canvas: "myCanvas", seconds:60 });
			myTimer.start();
		});
	</script>

## Options

**canvas** - Id of the canvas to use

    canvas: "myCanvas"

**seconds** - Number of seconds for the timer count down (optional)

    seconds: 60

**minutes** - Number of minutes for the timer count down (optional)

    minutes: 60

**hours** - Number of hours for the timer count down (optional)

    hours: 24

**startTime** - Date object of the starting time of the timer (optional)

    startTime: new Date(new Date().getTime()+60000) // Timer will start in 1 minute from now

**endTime** - Date object of the stop time of the timer (optional)

    endTime: new Date(new Date().getTime()+60000) // Timer will elapse in 1 minute from now

**showGrains** - Show grains around the timer (boolean, optional)

    showGrains: false

*Default: true*

**loop** - Should the timer reset and start again (boolean, optional)

    loop: true

*Default: false*

**style** - Style object for the timer (optional)

    style: {
        'color': "#aaa", // Color for the line and text
        'font': "Arial", // Font name
        'line-width': 8  // Line with in percent
    }

**formatter** - Formatter function for timer text and percent complete (optional)

    formatter:function(timer){
        return { text: formatTime(Math.ceil(timer.remainingms / 1000)), percentDone: (timer.remainingms/(timer.endTime.getTime()-timer.startTime.getTime()))*100 }
    },

**onElapsed** - Event function for timer elapsed (optional)

    onElapsed: function(){
        console.log("Timer elapsed");
    }

**onPause** - Event function for timer paused (optional)

    onPause: function(){
        console.log("Timer paused");
    }

**onResume** - Event function for timer resumed (optional)

    onResume: function(){
        console.log("Timer resumed");
    }

**onStop** - Event function for timer stopped (optional)

    onStop: function(){
        console.log("Timer stopped");
    }

**onStart** - Event function for timer started (optional)

    onStart: function(){
        console.log("Timer started");
    }

**onReset** - Event function for timer reseted (optional)

    onReset: function(){
        console.log("Timer reseted");
    }

### Author: [Johan Johansson](https://github.com/myspace-nu)
