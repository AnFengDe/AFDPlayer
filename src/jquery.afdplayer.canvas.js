/**
 * @fileoverview AnFengDe HTML5 canvas audio player.
 * @author chtian@anfengde.com smu@anfengde.com
 * @copyright Copyright (c) 2013-2015 HeFei AnFengDe Info Tech.
 * @license Licensed under the MIT license.
 */
(function($) {
	$.fn.afdplayer.prototype = {
		defaults: {
			cb_create: function(o) {
				$(o).wrap("<div class=\"afd player container\"></div>");
				var h = "<canvas class=\"progress\" width=\"250px\" height=\"250px\"></canvas><a class=\"play\" href=\"#\"></a>";
				$(h).insertBefore($(o));
			},
			getCanvas: function(o) {
				var p = this.cb_getContainer(o);
				return $(p).find('canvas')[0];
			},
			cb_progress: function(o) {
				var percent = Math.floor((100 / o.duration) * o.currentTime);
				//console.log(o.id + "播放进度：" + percent);
				var c = this.getCanvas(o);
				var ctx = c.getContext('2d');
				var x = c.width / 2 ;
				var y = c.height / 2 ;
				var r = y - 9;
				var circ = Math.PI * 2;
				ctx.beginPath();
				ctx.arc(x, y, r, 0, circ * percent / 100, false);
				ctx.lineWidth = 14;
				ctx.strokeStyle = '#FF4C97';
				ctx.stroke();
				this.cb_setLabel(o);
				if (o.ended) {
					o.currentTime = 0;
					ctx.clearRect(0, 0, c.width, c.height);
				}
			}
		}
	};
}(jQuery));