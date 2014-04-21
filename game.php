<!doctype html>
<html lang="en">
<head>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
    <meta charset="UTF-8">
    <title>赛马</title>
    <style>
        #fps{position: absolute;left:300px;top:0;z-index:10;}
        #score{position: absolute;left:100px;top:0;z-index:10;}
        #gameover{position: absolute;left:50%;top:50%;z-index:10;display:none;font-size:30px;}
        #prograss{position: absolute;left:40%;top:40%;z-index:11;font-size:30px;}
        canvas{position: absolute;left:0;top:0;z-index:20}
        #pass{position: absolute;z-index:1;left:200px;top:200px;}
        #music{position: absolute;z-index:1;}
    </style>
    <script src="jquery.min.js"></script>
    <script>
        var __GAMEID = 123;
        var __OUTPUTVAL = 1;
        var __AGENT = 1;
        var __INITSOLUTION = [[100,1], [500, 2], [700,3], [1000,0]];
        $(document).ready(function(){
            startgame();
        });
    </script>
    <script src="game2.js"></script>
</head>
<body style="background:#00CCFF;">
    <canvas id="back">对不起,您的浏览器不支持canvas,请更新浏览器版本</canvas>
    <canvas id="main"></canvas>
    <canvas id="front"></canvas>

    <div id="fps">fps:0</div>
    <div id="score">score:0</div>
    <div id="gameover">game over!!!</div>
    <div id="prograss">0%</div>
    <div id="pass"></div>
    <div id="music" class="open" on='1'>music</div>
</body>
</html>
