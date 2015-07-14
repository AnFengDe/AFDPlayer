/**
 * @fileoverview AnFengDe HTML5 audio player.
 * @author chtian@anfengde.com smu@anfengde.com
 * @copyright Copyright (c) 2013-2015 HeFei AnFengDe Info Tech.
 * @license Licensed under the MIT license.
 */
/**
 * See (http://jquery.com/).
 * @name jQuery
 * @class
 * See the jQuery Library  (http://jquery.com/) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 */

/**
 * See (http://jquery.com/)
 * @name fn
 * @class
 * See the jQuery Library  (http://jquery.com/) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 * @memberOf jQuery
 */
(function($) {

	/**
	 * audio 音频标签播放按钮插件
	@example	    
    HTML的例子
	<audio class="afd play">
	  <source src="Imagine Me Without You.mp3" type="audio/mpeg" codecs="mp3" />
	</audio>
	    
	@example	    
	 javascript例子
	   $("selector").afdplayer()
	 
	 selector 一定是 audio 标签
	    
	 * @function
	 * @memberOf jQuery.fn
	 * @return Object audio 对象
	 * @TODO: 
	 * # 允许用户自定义播放点击和播放事件的回调 :总结哪些是核心控制的，哪些是外围必须处理的
	 * # 允许用户自定义播放的UI：规定UI CSS的书写规范
	 * # 增加编写自定义部分的手册
	 * # 完善播放事件：progress, iOS webview的hack,loadStart, buffering
	 * # 和jPlayer比较的部分：
	 * ## jPlayer构建了很多对象实例绑定在DOM上，开销大
	 * ## 在同一个页面的应用场景中，实际同时只能播放一个音频，因此处理多个音频的状态这个特性应该是过度设计
	 * ## 我们必须要想好如何给予调用者更多的定制能力
	 * 
	 */
	$.fn.afdplayer = function(options) {
		/**
	    播放器的选项
	    */
		var opts = {
			//audio 默认控制面板是否显示
			controls: false,
			//是否只处理含有 afd player Class的audio tag
			strict: true,
			//同时只允许一个播放
			singlePlay: true,
			//进度文字的格式 0:百分比 1：剩余时间 2：当前时间
			progressTextType: 0,
			//获取 audio 最外部的容器对象节点，如果是自定义的CSS，最外部的节点可以根据实际情况定制
			cb_getContainer: function(o) {
				return o.parentNode;
			},
			//获取进度显示有关的节点
			cb_getProgressNode: function(o) {
				var p = opts.cb_getContainer(o);
				return $(p).find('.progress')[0];
			},
			//获取显示状态有关的节点
			cb_getStateNode: function(o) {
				return $(opts.cb_getContainer(o)).find('.state')[0];
			},
			//获取显示进度文字有关的节点
			cb_getProgressTextNode: function(o) {
				return $(opts.cb_getContainer(o)).find('.state')[0];
			},
			//获取显示音频标题有关的节点
			cb_getAudioTitleNode: function(o) {
				return $(opts.cb_getContainer(o)).find('.state')[0];
			},
			cb_isPlayStyle: function(o) {
				var p = opts.cb_getStateNode(o);
				//当前播放时显示暂停按钮状态
				return p.classList.contains("pause") ? true : false;
			},
			cb_setStyle: function(o, s) {
				var p = opts.cb_getStateNode(o);

				if (p.classList.contains(s)) {
					return;
				}
				p.classList.add(s);
				var l = ['play', 'pause', 'load'];
				l.splice(l.indexOf(s), 1);
				$.each(l, function() {
					p.classList.remove(this.toString());
				});
			},
			cb_ended: function(o) {
				o.pause();
				if (o.currentTime>0) {
					o.currentTime = 0;
				}
				opts.cb_setProgressText(o);
				opts.cb_setStyle(o, 'play');
			},
			cb_click: function(o) {
				if (opts.singlePlay) {
					//找出所有的不是自身的audio进行状态处理
					$.each($('.afd.player.container audio'), function() {
						if (this === o) {
							return;
						}
						opts.cb_ended(this);
					});
				}
				if (o.paused || o.ended) {
					o.play();
				} else {
					o.pause();
				}
			},
			//默认直接从audio对象获取时长，但是某些iOS会处理错误，允许用户重定义该回调获取时长
			cb_getDuration: function(o) {
				return o.duration;
			},
			cb_progress: function(o) {
				opts.cb_setProgress(o);
				opts.cb_setProgressText(o);
				var p = opts.cb_getProgressTextNode(o);
				if (!o.paused && !opts.cb_isPlayStyle(o)) {
					opts.cb_setStyle(o, 'pause');
				}
			},
			cb_create: function(o) {
				$(o).wrap("<div class=\"afd player container\"></div>");
				var h = "<svg  class=\"progress\" width=\"24px\" height=\"24px\"><path/></svg><a class=\"state play\" href=\"#\"></a>";
				$(h).insertBefore($(o));
			},
			cb_formatDuration: function(o) {
				var d = opts.cb_getDuration(o);
				return (typeof d === 'undefined' || d === null || isNaN(d)) ?
					"--:--" : Math.floor(d / 60) + ":" + Math.floor(d % 60);
			},
			cb_setProgress: function(o) {
				var percent = Math.floor((100 / opts.cb_getDuration(o)) * o.currentTime) / 100;
				if (percent > 1) {
					percent = 1;
				}
				var svg = opts.cb_getProgressNode(o);
				var radius = 11,
					centerX = svg.width.animVal.value / 2,
					centerY = svg.height.animVal.value / 2,
					startX = centerX,
					startY = centerY - radius,
					xAxisRotation = 0,
					sweepFlag = 1,
					circ = Math.PI * 2,
					largeArcFlag = 0;
				if (percent * circ >= Math.PI) {
					largeArcFlag = 1;
				}
				var endX = centerX + radius * Math.sin(circ * percent),
					endY = centerY - radius * Math.cos(circ * percent);
				var d = "M" + startX + "," + startY + " " + "A" + radius + "," + radius + " " + xAxisRotation + " " + largeArcFlag + " " + sweepFlag + " " + endX + "," + endY;
				var path = $(svg).find('path')[0];
				path.setAttribute("d", d);
				path.setAttribute("fill", "none");
				path.setAttribute("stroke", "#007aff");
				path.setAttribute("stroke-width", 2);
			},
			cb_setProgressText: function(o) {
				var p = opts.cb_getProgressTextNode(o);
				if (o.ended || o.currentTime === 0) {
					p.textContent = opts.cb_formatDuration(o);
				} else {
					var percent = Math.floor((100 / opts.cb_getDuration(o)) * o.currentTime);
					p.textContent = percent + "%";
				}
			}
		};

		return this.each((function() {
			return function() {
				if (this.getAttribute('init') === 'true') {
					return;
				}
				opts = $.extend({}, opts, $.fn.afdplayer.prototype.defaults, options);

				//如果是严格限定class的audio tag, 不符合要求的不会处理
				if (opts.strict && !(this.classList.contains("afd") && this.classList.contains("play"))) {
					return;
				}
				//audio 通过afd play class来区分是不是插件控制
				this.classList.add("afd");
				this.classList.add("play");
				this.controls = opts.controls;

				//产生html布局
				opts.cb_create(this);
				this.setAttribute('init', 'true');

				opts.cb_setProgressText(this);

				var self = this;

				//注册点击播放事件
				var container = this.parentNode;
				container.addEventListener('click', function() {
					opts.cb_click(self);
				}, false);

				this.addEventListener('timeupdate', function() {
					opts.cb_progress(this);
				}, false);

				this.addEventListener('play', function() {
					opts.cb_setStyle(this, 'pause');
				}, false);
				this.addEventListener('pause', function() {
					opts.cb_setStyle(this, 'play');
				}, false);
				this.addEventListener('waiting', function() {
					opts.cb_setStyle(this, 'load');
				}, false);
//				this.addEventListener('stalled', function() {
//					opts.cb_setStyle(this, 'load');
//				}, false);
				this.addEventListener('error', function() {
					opts.cb_ended(this);
				}, false);

				this.addEventListener('ended', function() {
					opts.cb_ended(this);
				}, false);

				this.addEventListener('loadedmetadata', function() {
					opts.cb_setProgressText(this);
				}, false);
			};
		})());
	};
}(jQuery));