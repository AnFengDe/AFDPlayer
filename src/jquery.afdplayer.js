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
	 */
	$.fn.afdplayer = function(options) {
		//audio 通过afd play class来区分是不是插件控制
		function addClass(o) {
			o.classList.add("afd");
			o.classList.add("play");
			o.controls = opts.controls;
		}

		function formatDuration(o) {
			var d = o.duration;
			return (typeof d === 'undefined' || d === null || isNaN(d)) ?
				"--:--" : Math.floor(d / 60) + ":" + Math.floor(d % 60);
		}

		function getSvgPath(o) {
			var p = opts.cb_getContainer(o);
			return $(p).find('path')[0];
		}

		function getSvg(o) {
			var p = opts.cb_getContainer(o);
			return $(p).find('svg')[0];
		}

		/**
	    播放器的选项
	    */
		var opts = {
			//语言选项
			language: {
				play: "播放",
				pause: "暂停"
			},
			//audio 默认控制面板是否显示
			controls: false,
			//是否只处理含有 afd player Class的audio tag
			strict: true,
			singlePlay: true,
			cb_click: function(o) {
				var b = opts.cb_getAFDPlayer(o);

				if (opts.singlePlay) {
					if (o.paused) {
						$.each($('.afd.player.container audio'),function(){
							this.pause();
							$(this).parent().find('a').removeClass("pause").addClass("play");
							//保证同一首歌播放暂停时svg进度不会被清除
							if(o !== this){
								getSvgPath(this).removeAttribute("d");
							}
                            //保证同一首歌播放暂停时播放时间不会归0
							if (this.currentTime > 0 && o !==this) {
								this.currentTime = 0;
							}
							opts.cb_setLabel(this);
						});
						o.play();
						b.classList.remove("play");
						b.classList.add("pause");
					} else {
						o.pause();
						b.classList.remove("pause");
						b.classList.add("play");
					}
				} else {
					if (o.paused || o.ended) {
						o.play();
						b.classList.remove("play");
						b.classList.add("pause");
					} else {
						o.pause();
						b.classList.remove("pause");
						b.classList.add("play");
					}
				}
			},
			cb_progress: function(o) {
				var percent = Math.floor((100 / o.duration) * o.currentTime);
				var svg = getSvg(o);
				var radius = 11;
				var centerX = svg.width.animVal.value / 2;
				var centerY = svg.height.animVal.value / 2;
				var startX = centerX;
				var startY = centerY - radius;
				var xAxisRotation = 0;
				var sweepFlag = 1;
				var cppercent = percent / 100;
				var circ = Math.PI * 2;
				var largeArcFlag = 0;
				if (cppercent * circ >= Math.PI) {
					largeArcFlag = 1;
				}
				var endX = centerX + radius * Math.sin(circ * cppercent);
				var endY = centerY - radius * Math.cos(circ * cppercent);
				var d = "M" + startX + "," + startY + " " + "A" + radius + "," + radius + " " + xAxisRotation + " " + largeArcFlag + " " + sweepFlag + " " + endX + "," + endY;
				var path = getSvgPath(o);
				path.setAttribute("d", d);
				path.setAttribute("fill", "none");
				path.setAttribute("stroke", "#007aff");
				path.setAttribute("stroke-width", 2);
				opts.cb_setLabel(o);
				var p = opts.cb_getAFDPlayer(o);
				if (o.ended) {
					o.currentTime = 0;
					p.textContent = formatDuration(o);
					p.classList.remove('pause');
					p.classList.add('play');
				}
			},
			cb_create: function(o) {
				$(o).wrap("<div class=\"afd player container\"></div>");
				var h = "<svg  class=\"progress\" width=\"24px\" height=\"24px\"><path/></svg><a class=\"play\" href=\"#\"></a>";
				$(h).insertBefore($(o));
				o.setAttribute('init', 'true');
			},
			cb_getContainer: function(o) {
				return o.parentNode;
			},
			cb_getAFDPlayer: function(o) {
				var p = opts.cb_getContainer(o);
				return $(p).find('a')[0];
			},
			cb_setLabel: function(o) {
				var p = opts.cb_getAFDPlayer(o);
				if (o.ended || o.currentTime === 0) {
					p.textContent = formatDuration(o);
				} else {
					var percent = Math.floor((100 / o.duration) * o.currentTime);
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
				addClass(this);
				//产生html布局
				opts.cb_create(this);
				opts.cb_setLabel(this);

				var self = this;

				//注册点击播放事件
				var container = this.parentNode;
				container.addEventListener('click', function() {
					opts.cb_click(self);
				}, false);

				this.addEventListener('timeupdate', function() {
					//				    opts.cb_progress(this);
					opts.cb_progress(this);
				}, false);

				this.addEventListener('loadedmetadata', function() {
					opts.cb_setLabel(this);
				}, false);
			};
		})());
	};
}(jQuery));