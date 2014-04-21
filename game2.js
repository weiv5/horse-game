(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());

(function(G) {
    var Config = function() {
        var _ratio = __AGENT===1 ? 2 : 1.333,
            _w = Math.floor(1280/_ratio),
            _h = Math.floor(720/_ratio),
            _speed = 12,
            _maxspeed = 12.8,
            _score = 0,
            _gameover = false,
            _stopstage = 0,
            _num = 0,
            _sleep = 34;
        return {
            addLevel : function() {
                if (_maxspeed >= 20) {
                    return false;
                }
                _num ++;
                if (_num >= 20) {
                    _num = 0;
                    _maxspeed = _maxspeed + 0.8;
                }
            },
            addSpeed : function() {
                if (_speed < _maxspeed) {
                    _speed = _speed+0.01;
                }
            },
            getSpeed : function() {
                return _speed/_ratio;
            },
            w : function() {
                return _w;
            },
            h : function() {
                return _h;
            },
            ratio : function() {
                return _ratio;
            },
            addScore: function(add) {
                if (add > 0 && add <= 400) {
                    _score = _score + add;
                }
            },
            getScore: function() {
                return Math.floor(_score);
            },
            getSleep : function() {
                return _sleep;
            },
            gameOver : function(flag) {
                if (flag === true) {
                    _gameover = true;
                    $("#gameover").show();
                } else {
                    return _gameover;
                }
            },
            stopstage : function(flag) {
                if (flag === "+") {
                    _stopstage++;
                } else {
                    return _stopstage;
                }
            },
            notSupport : function() {
                $("#sorry1").show();
            },
            netError : function() {
                _gameover = true;
                $("#sorry2").show();
            },
        };
    };

    var Images = function() {
        var _url = './images/',
            _needList = [
                {id: "cloud", res: _url+"bg-cloud-24.png"},
                {id: "grass", res:  _url+"bg-grass-24.png"},
                {id: "road", res:  _url+"bg-road-24.png"},
                {id: "z1", res:  _url+"z1.png"},
                {id: "z2", res:  _url+"z2.png"},
                {id: "z3", res:  _url+"z3.png"},
                {id: "z4", res:  _url+"z4.png"},
                {id: "run", res:  _url+"run_350_222.png"},
                {id: "jump", res:  _url+"jump_350_222.png"}
            ],
            _loadCnt = 0,
            _loadList = {},
            _done = null,
            _times = 0,
            _prograssDom = $("#prograss"),
            _hintDom = $("#hint");
        
        var getLoadState = function() {
            return Math.floor(_loadCnt/_needList.length*100);
        };
        var onload = function() {
            _loadCnt++;
            _prograssDom.find("h2").html(getLoadState()+"%");
            if (_loadCnt == _needList.length) {
                _done();return;
                start();
            }
        };
        var start = function() {
            $.ajax({
                type: "POST",
                url : 'startgame',
                data: {game_id: __GAMEID},
                timeout: 1000,
                dataType: 'json',
                success:function(data) {
                    if (data.status == 1) {
                        _prograssDom.hide();
                        _hintDom.show();
                        setTimeout(function(){_hintDom.hide();}, 2000);
                        if (_done) _done();
                    } else {
                        $c.netError();
                    }
                },
                error:function(){
                    _times++;
                    if (_times < 4) {
                        start();
                    } else {
                        $c.netError();
                    }
                }
            });
        };
        var load = function() {
            if (!document.createElement('canvas').getContext) {
                $c.notSupport();
                return false;
            }
            for (var i in _needList) {
                var item = _needList[i];
                var img = new Image();
                img.src = item.res;
                img.onload = onload;
                _loadList[item.id] = img;
            }
        };
        load();
        return {
            getImg : function(id) {
                return _loadList[id];
            },
            getLoadState : function() {
                return getLoadState();
            },
            setDone : function(done) {
                _done = done;
            },
        }
    };

    var Layer = function(option) {
        var _canvas = document.getElementById(option.canvas),
            _context = _canvas.getContext("2d"),
            _counter = option.counter || 0,
            _count = option.counter || _counter,
            _step = option.step,
            _ratio = option.ratio,
            _obj = option.obj;

        _canvas.setAttribute("width", $c.w());
        _canvas.setAttribute("height", $c.h());
        if (option.operation) {
            _context.globalCompositeOperation = "destination-over";
        }

        return {
            init : function() {
                _obj.init();
            },
            draw : function(delta) {
                if (_counter >= _count) {
                    var step = Math.floor(_step || delta/$c.getSleep()*_ratio*$c.getSpeed());
                    _context.clearRect(0, 0, $c.w(), $c.h());
                    _obj.draw(_context, step, delta);
                    _counter = 0; 
                } else {
                    _counter++;
                }
            },
            bind : function(type, callback) {
                _canvas.addEventListener(type, callback);
            }
        };
    };

    var Pattern = function(option) {
        var _img = Img.getImg(option.img),
            _w = Math.floor(6200/$c.ratio()),
            _h = option.h,
            _y = option.y,
            _d = 0,
            _left = 0,
            _canvas = document.createElement("canvas"),
            _context = _canvas.getContext("2d");

        _canvas.setAttribute("width", _w);
        _canvas.setAttribute("height", _h);

        var makePattern = function() {
            if (_w-_d-$c.w() > 100) return false;
            _left = _left+_w-_d;
            _context.clearRect(0, 0, _w, _h);
            if (_left > _w) _left = _left-_w;
            _context.drawImage(_img, Math.floor((_w-_left)*$c.ratio()), 0, Math.floor(_left*$c.ratio()), Math.floor(_h*$c.ratio()), 0, 0, _left, _h);
            _context.drawImage(_img, 0, 0, Math.floor((_w-_left)*$c.ratio()), Math.floor(_h*$c.ratio()), _left, 0, _w-_left, _h);
            _d = 0;
        };
        return {
            init : function() {
                _context.drawImage(_img, 0, 0, Math.floor(_w*$c.ratio()), Math.floor(_h*$c.ratio()), 0, 0, _w, _h);
            },
            draw : function(context, step) {
                _d = _d+step;
                makePattern();
                context.drawImage(_canvas, _d, 0, $c.w(), _h, 0, _y, $c.w(), _h);
            }
        };
    };

    var Compnent = function(horse) {
        var _img = Img.getImg("grass"),
            _w = Math.floor(6200/$c.ratio()),
            _h = Math.floor(356/$c.ratio()),
            _y = $c.h()-Math.floor(356/$c.ratio()),
            _d = 0,
            _left = 0,
            _hurdle = new Hurdle(_h),
            _horse = horse,
            _canvas = document.createElement("canvas"),
            _context = _canvas.getContext("2d");

        _canvas.setAttribute("width", _w);
        _canvas.setAttribute("height", _h);

        var render = function(step) {
            if (_w-_d-$c.w() <= 200 || _hurdle.needRender()) {
                if (_d == 0) {
                    put();
                } else {
                    _left = _left+_w-_d;
                    _context.clearRect(0, 0, _w, _h);
                    if (_left >= _w) _left = _left-_w;
                    _context.drawImage(_img, Math.floor((_w-_left)*$c.ratio()), 0, Math.floor(_left*$c.ratio()), Math.floor(_h*$c.ratio()), 0, 0, _left, _h);
                    _context.drawImage(_img, 0, 0, Math.floor((_w-_left)*$c.ratio()), Math.floor(_h*$c.ratio()), _left, 0, _w-_left, _h);
                    _d = 0;
                }
                _hurdle.render();
            }
            _d = _d+step;
        };
        var put = function() {
            _context.drawImage(_img, 0, 0, Math.floor(_w*$c.ratio()), Math.floor(_h*$c.ratio()), 0, 0, _w, _h);
        };
        return {
            init : function() {
                put();
                _hurdle.render();
            },
            draw : function(context, step, delta) {
                render(step);
                _hurdle.draw(_context, step);
                _horse.draw(context, step, delta);
                if (_hurdle.hitCheck(context, horse.getAttr(), _y)) {
                    $c.gameOver(true);
                }
                context.drawImage(_canvas, _d, 0, $c.w(), _h, 0, _y, $c.w(), _h);
            }
        };
    };

    var Hurdle = function(ch) {
        var __PARAM,
            _objs = [],
            _cache = __INITSOLUTION,
            _h = Math.floor(128/$c.ratio()),
            _y = Math.floor(ch*0.45),
            _w = Math.floor(6200/$c.ratio()),
            _times1 = 0,
            _doing1 = false,
            _times2 = 0,
            _valid = 0,
            _hid = 0,
            _num = _cache.length,
            _imgConf = {
                1: {id:"z1", w: Math.floor(74/$c.ratio())},
                2: {id:"z2", w: Math.floor(84/$c.ratio())},
                3: {id:"z3", w: Math.floor(157/$c.ratio())},
                4: {id:"z4", w: Math.floor(180/$c.ratio())},
            },
            _canvas = document.createElement("canvas"),
            _context = _canvas.getContext("2d"),
            _render = false;

        _canvas.setAttribute("width", _w);
        _canvas.setAttribute("height", _h);

        var addObj = function() {
            var x = $c.w();
            if (_objs.length > 0) {
                var attr = _objs[_objs.length-1];
                x = Math.max(attr.x+attr.w, x);
            }
            var cnt = 0;
            for (var i in _cache) {
                var hdata = _cache[i];
                var l = hdata[1]+1;
                var hashval = __OUTPUTVAL;
                x = Math.floor(x + hdata[0]/$c.ratio());
                if (x > _w || (x+_imgConf[l].w)>_w) {
                    _cache.splice(0, cnt);
                    return false;
                }
                cnt++;
                _objs.push({
                    img: _imgConf[l].id,
                    ox: x,
                    x: x,
                    w: _imgConf[l].w,
                    d : 0,
                    pass: false,
                    render : false,
                    level: l,
                    id: ++_hid,
                    hash: hashval
                });
                x  = x+_imgConf[l].w;
                __PARAM = hashval;
            }
        };
        var createObj = function() {
            _doing1 = true;
            $.ajax({
                type: "POST",
                url : 'getPlan',
                data: {game_id: __GAMEID, num: _num},
                timeout: 1000,
                dataType: 'json',
                success: function(data) {
                    if (data.status == 1) {
                        for (var i in data.msg) {
                            _cache.push(data.msg[i]);
                        }
                        _num = _num+data.msg.length;
                        _doing1 = false;
                        _times1 = 0;
                    } else {
                        $c.netError();
                    }
                },
                error: function() {
                    _times1++;
                    if (_times1 < 5) {
                        createObj();
                    } else {
                        $c.netError();
                    }
                }
            });
        }; 
        var postScore = function(attr) {
            $.ajax({
                type: "POST",
                url : 'score',
                data: {id: attr.id, hash: attr.hash, game_id: __GAMEID, score: $c.getScore(), ratio: $c.ratio()},
                timeout: 1000,
                dataType: 'json',
                success:function(data) {
                    if (data.status == 1) {
                        setTimeout(function() {
                            window.location.href = 'over?gameid='+__GAMEID
                        }, 2000);
                    } else {
                        $c.netError();
                    }
                },
                error : function() {
                    _times2++;
                    if (_times2 < 4) {
                        postScore(attr);
                    } else {
                        $c.netError();
                    }
                }
            });
        };
        var render = function() {
            addObj();
            _context.clearRect(0, 0, _w, _h);
            _render = false;
        };
        return {
            needRender : function() {
                if (_objs.length == 0) return true;
                return _objs[_objs.length-2].x<$c.w();
            },
            render : function() {
                render();
            },
            draw : function(context, step) {
                for (var i in _objs) {
                    _objs[i].x = _objs[i].x - step;
                    if (_objs[i].x + _objs[i].w <= 0) {
                        _objs.splice(i, 1);
                        if (_objs[i]) {
                            _objs[i].x = _objs[i].x - step;
                        }
                    }
                }
                if (!$c.gameOver() && _cache.length <= 1 && !_doing1) {
                    createObj();
                }
                for (var i in _objs) {
                    if (!_render) {
                        _objs[i].ox = _objs[i].x;
                        _context.drawImage(Img.getImg(_objs[i].img), 0, 0, Math.floor(_objs[i].w*$c.ratio()), Math.floor(_h*$c.ratio()), _objs[i].x, 0, _objs[i].w, _h);
                        _objs[i].render = true;
                    }
                }
                if (!_render) {
                    context.drawImage(_canvas, 0, _y);
                    _render = true;
                }
            },
            hitCheck : function(context, horse, dy) {
                if ($c.gameOver()) {
                    return false;
                }

                for (var i in _objs) {
                    if (_objs[i].pass || (_objs[i].x > horse.x+horse.w)) {
                        continue;
                    }
                    var attr = _objs[i];
                    if (attr.x+attr.w < horse.x) {
                        $c.addScore(_objs[i].level*100);
                        $("#pass").attr("class", "f-pass f-pass-"+_objs[i].level).show().fadeOut(1000);
                        _objs[i].pass = true;
                        $c.addLevel();
                    } else if (attr.x+attr.w<=$c.w() && attr.x < horse.x+horse.w) {
                        if (horse.jh > _h) {
                            return false;
                        }
                        var data1 = context.getImageData(attr.x, dy+_y, attr.w, _h).data,
                            data2 = _context.getImageData(attr.ox, 0, attr.w, _h).data,
                            hurdleimgdata = false;
                        for(var i = 0; i < data1.length; i = i+4) {
                            if(data1[i] > 0 && data2[i] > 0) {
                                postScore(attr);
                                return true;
                            }
                            if (data2[i] > 0 && !hurdleimgdata) {
                                hurdleimgdata = true;
                            }
                        }
                        if (!hurdleimgdata) {
                            $c.netError();
                            return false;
                        }
                    }
                }
                return false;
            }
        };
    };

    var Horse = function() {
        var _pw = 350,
            _ph = 222,
            _w = Math.floor(350/$c.ratio()),
            _h = Math.floor(222/$c.ratio()),
            _x = Math.floor($c.w()*0.1),
            _y = Math.floor($c.h()*0.9-_h),
            _run = Img.getImg("run"),
            _jump = img = Img.getImg("jump"),
            _jumping = {d:0,is:false},
            _pos = 0;

        return {
            getAttr : function() {
                return {
                    x: _x,
                    y: _y,
                    w: _w,
                    h: _h,
                    jh: _jumping.d
                };
            },
            draw : function(context, step, delta) {
                var ratio = delta/$c.getSleep();
                if (_jumping.is) {
                    var img = _jump;
                    if (_jumping.w_sum < Math.PI) {
                        _jumping.w_sum = ratio*_jumping.w_per + _jumping.w_sum;
                    }
                    _jumping.d = _jumping.h*Math.sin(_jumping.w_sum);
                    if ($c.gameOver()) {
                        _pos = 20;
                        img = _run;
                    } else {
                        _pos = _pos + ratio*(_jumping.w_sum < Math.pi/2 ? _jumping.frame_per1 : _jumping.frame_per1);
                        if (_pos > 34) {
                            _pos = 34;
                        }
                    }
                    if (_jumping.w_sum >= Math.PI) {
                        _jumping.is = false;
                        _jumping.d = 0;
                        if (!$c.gameOver()) _pos = 0;
                    }
                } else {
                    var img = _run;
                    if ($c.gameOver()) {
                        _pos = $c.stopstage()<3 ? 20 : 21;
                        $c.stopstage("+");
                    } else {
                        $c.addSpeed();
                        _pos = _pos +(0.7+($c.getSpeed()*$c.ratio()-12)*0.05)*ratio;
                        if (_pos > 19) {
                            _pos = 0;
                        }
                    }
                }
                context.drawImage(img, Math.floor(_pos)*_pw, 0, _pw, _ph, _x, _y-_jumping.d, _w, _h);
                var imgdata = context.getImageData(_x, _y-_jumping.d, _w, _h).data;
                for(var i = 0; i < imgdata.length; i = i+4) {
                    if(imgdata[i] > 0) {
                        return;
                    }
                }
                $c.netError();
            },
            jump : function() {
                if (_jumping.is || $c.gameOver()) {
                    return false;
                }
                var speed = $c.getSpeed();
                _jumping.is = true;
                _jumping.w = _w*(1.5+speed/20);
                _jumping.h = (1+speed/80) * 128/$c.ratio();
                _jumping.w_per = Math.PI/(_jumping.w/speed);
                _jumping.w_sum = 0;
                _jumping.frame_per1 = 14/Math.floor(_jumping.w/2/speed);
                _jumping.frame_per2 = 14/Math.floor(_jumping.w/2/speed);
                _pos = 7;
            }
        };
    };

    var Game = function() {
        var backlayer = null,
            mainlayer = null,
            frontlayer = null,
            horse = null,
            compnent = null,
            lasttime = null,

            init = function() {
                backlayer = new Layer({
                    canvas: "back",
                    counter: 5,
                    step: 1,
                    obj: new Pattern({
                        img: "cloud",
                        h: Math.floor(406/$c.ratio()),
                        y: 0
                    })
                });
                frontlayer = new Layer({
                    canvas: "front",
                    ratio: 3,
                    obj: new Pattern({
                        img: "road",
                        h: Math.floor(110/$c.ratio()),
                        y: $c.h()-Math.floor(110/$c.ratio())
                    })
                });
                horse = new Horse(),
                compnent = new Compnent(horse),
                mainlayer = new Layer({
                    canvas: "main",
                    ratio: 1,
                    obj: compnent,
                    operation: "destination-over"
                });
            },
            bind = function() {
                frontlayer.bind('touchstart', function(e) {horse.jump();});
                document.addEventListener('keydown', function(e) {
                    if (e.keyCode != 32) return false;
                    horse.jump();
                    if (e && e.preventDefault) {
                        e.preventDefault();
                    } else {
                        window.event.returnValue = false;
                    }
                    return false;
                });
            },
            draw = function(delta) {
                backlayer.draw(delta);
                mainlayer.draw(delta);
                frontlayer.draw(delta);
            },
            run = function(now) {
                var delta = now - (lasttime || now);
                if (delta > 2000) {
                    $c.gameOver(true);
                    delta = 0;
                    setTimeout(function() {
                        window.location.href = 'info'
                    }, 2000);
                }
                draw(delta);
                if (!$c.gameOver()) {
                    $c.addScore(delta/$c.getSleep()*$c.getSpeed()/10);
                    $("#score").html($c.getScore());
                }
                if (!$c.gameOver() || $c.stopstage() < 20) {
                    setTimeout(function() {
                        requestAnimationFrame(run);
                    }, $c.getSleep());
                }
                lasttime = now;
            };
        return {
            init: function() {
                init();
            },
            start: function() {
                backlayer.init();
                mainlayer.init();
                frontlayer.init();
                bind();
                requestAnimationFrame(run);
            }
        }
    };

    var $c;
    var Img;

    G.startgame = function() {
        $c = new Config();
        Img = new Images();

        var game = new Game();
        if (typeof __GAMEID !== 'undefined') {
            game.init();
            if (Img.getLoadState == 100) {
                game.start();
            } else {
                Img.setDone(game.start);
            }
        }
    }
})(this);
