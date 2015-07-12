(function($) {

	module('play button 基本测试', {
		setup: function() {
			this.elems = $('#qunit-fixture').children();
		}
	});

	test('检查链式调用关系', function() {
		expect(1);
		strictEqual(this.elems.afdplayer(), this.elems, '可以进行链式调用');

	});

	test('检查有几个符合插件要求的对象', function() {
		expect(1);
		this.elems.afdplayer();
		strictEqual($('#qunit-fixture').find('.afd.player').length, 1, '初始测试数据只有一个符合要求');
	});
	test('重复初始化测试', function() {
		expect(1);
		var count1 = $('#qunit-fixture').find('a').length;
		this.elems.afdplayer();
		this.elems.afdplayer();
		var count2 = $('#qunit-fixture').find('a').length;
		strictEqual(count1 === 0 && count2 === 1, true, '链接数量不变');
	});
	test('强制所有audio转成要求的对象', function() {
		expect(1);
		this.elems.afdplayer({
			strict: false
		});
		strictEqual($('#qunit-fixture').find('.afd.player').length, 3, '初始测试数据只有一个符合要求');
	});

	asyncTest('测试id为a1的歌曲获取到的时间是否符合要求', function() {
		expect(1);
		this.elems.afdplayer();
		setTimeout(function() {
			strictEqual($('#a1')[0].duration, 49.475918, '获取到的音频时间是否符合要求');
			start();
		}, 200);
	});
	asyncTest('反复动态增加进行测试', function() {
		expect(2);
		var html = '<audio class="afd play" controls id="a6"><source src="../audio/Imagine Me Without You.mp3" type="audio/mp3" /></audio>';
		$(html).insertAfter(this.elems);
		$('#a6').afdplayer();
		$('#a6').parent().trigger('click');
		setTimeout(function() {
			strictEqual($('#a6')[0].duration, 49.475918, '获取到的音频时间是否符合要求');
			$('#a6').parent().remove();
			$(html).insertAfter(this.elems);
			$('#a6').afdplayer();
			$('#a6').parent().trigger('click');
			setTimeout(function() {
				strictEqual($('#a6')[0].duration, 49.475918, '获取到的音频时间是否符合要求');
				start();
			}, 2000);
		}, 2000);
	});
	test('测试id为a2的歌曲获取到的时间是否符合要求', function() {
		expect(1);
		this.elems.afdplayer();
		strictEqual(isNaN($('#a2')[0].duration), true, '没有设置音频');
	});

	module('play button 扩展测试', {
		setup: function() {
			this.elems = $('#qunit-fixture').children();
		}
	});
	asyncTest('测试是否调用了回调方法', function() {
		expect(5);
		var a = 0;
		var percent = 0;
		var b = 0;
		var c = 0;
		var d = 0;
		var e = 0;
		this.elems.afdplayer({
			strict: false,
			cb_click: function(o) {
				a = 1;
				setTimeout(function() {
					o.play();
					if (o.play) {
						$(o.parentNode).find('a')[0].classList.remove('play');
						$(o.parentNode).find('a')[0].classList.add('pause');
						b = 1;
					}
				}, 500);
				setTimeout(function() {
					o.pause();
					if (o.paused) {
						$(o.parentNode).find('a')[0].classList.remove('pause');
						$(o.parentNode).find('a')[0].classList.add('play');
						c = 1;
					}
				}, 700);
				setTimeout(function() {
					o.play();
					if (o.play) {
						$(o.parentNode).find('a')[0].classList.remove('play');
						$(o.parentNode).find('a')[0].classList.add('pause');
					}
				}, 1000);
				o.addEventListener('ended', function() {
					$(o.parentNode).find('a')[0].classList.remove('pause');
					$(o.parentNode).find('a')[0].classList.add('play');
					d = 1;
				});
			},
			cb_create: function(o) {
				$(o).wrap("<div class=\"afd player container\"></div>");
				var h = "<svg  class=\"progress\" width=\"24px\" height=\"24px\"><path/></svg><a class=\"state play\" href=\"#\"></a>";
				$(h).insertBefore($(o));
				e = 1;
			}
		});
		setTimeout(function() {
			$('#a3').parent().trigger('click');
			$('#a3').parent().trigger('timeupdate');
		}, 200);

		setTimeout(function() {
			strictEqual(a, 1, '是否调用了cb_click方法');
			strictEqual(b, 1, '是否是播放状态');
			strictEqual(c, 1, '是否是暂停状态');
			strictEqual(d, 1, '是否是播放完成状态');
			strictEqual(e, 1, '是否插入自定义html');
			start();
		}, 6500);
	});

	asyncTest('测试是否是单例播放模式', function() {
		//expect(7);
		var a = 0;
		var b = 0;
		var c = 0;
		this.elems.afdplayer({
			strict: false,
			singlePlay: true,
			cb_click: function(o) {
				if (this.singlePlay) {
					if (o.paused) {
						$.each($('audio'), function() {
							this.pause();
							a = 1;
							console.log("a=" + a);
						});
						o.play();
						b = 1;
						console.log("b=" + b);
					} else {
						o.pause();
						c = 1;
						console.log("c=" + c);
					}
				}
			}
		});
		setTimeout(function() {
			$('#a1').parent().trigger('click');
			console.log("first click a1");
		}, 200);

		setTimeout(function() {
			$('#a3').parent().trigger('click');
			console.log("first click a3");
		}, 400);

		setTimeout(function() {
			$('#a1').parent().trigger('click');
			console.log("second click a1");
		}, 600);

		setTimeout(function() {
			$('#a1').parent().trigger('click');
			console.log("third click a1");
		}, 800);

		setTimeout(function() {
			$('#a1').parent().trigger('click');
			console.log("forth click a1");
		}, 1000);
		setTimeout(function() {
			strictEqual(b, 1, '第一次点击id为a1的歌曲后a1进入播放状态');
			strictEqual(a, 1, '点击id为a3的歌曲后a1是否停止');
			strictEqual(b, 1, '点击id为a3的歌曲是否进入播放状态');
			strictEqual(a, 1, '再次点击id为a1的歌曲后a3是否停止');
			strictEqual(b, 1, '再次点击id为a1的歌曲后是否进入播放状态');
			strictEqual(c, 1, '再一次点击a1歌曲后是否暂停');
			strictEqual(b, 1, '最后再次点击a1歌曲后是否播放');
			start();
		}, 1300);
	});
}(jQuery));