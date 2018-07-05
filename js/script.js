(function() {

  function initArr(type, length) {
    length = length || 15
    var tempArr = []
    for (var i = 0; i < length; i++) {
      tempArr[i] = (type > 1 ? [] : 0) 
      if (type > 1) {
        for (var j = 0; j < length; j++) {
          tempArr[i][j] = (type > 2 ? [] : 0) 
        }
      }
    };
    return tempArr;
  }


  //获取canvas应该放大的倍数的方法；
  function getPixelRatio(context) {
    var backingStore = context.backingStorePixelRatio 
    || context.webkitBackingStorePixelRatio 
    || context.mozBackingStorePixelRatio 
    || context.msBackingStorePixelRatio 
    || context.oBackingStorePixelRatio 
    || context.backingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
  }


  function Game() {
    this.chess = document.getElementById('chess');
    this.context = chess.getContext('2d');

    this.userScore = document.getElementById('userScore');
    this.computerScore = document.getElementById('computerScore');
    
    this.ratio = getPixelRatio(this.context)
    this.scale =  (this.chess.clientWidth / 450) * this.ratio;

    this.me = true;
    this.chessBoard = initArr(2);

    this.over = false

    // 赢法数组
    this.wins = initArr(3);
    this.count = 0;
    // 赢法统计数组
    this.myWin = [];
    this.computerWin = [];
  }

  Game.prototype = {
    init: function() {
      // 初始化画布
      this.initCanvas()
      // 绑定事件
      this.bindEvent()
      // 初始化赢法数组
      this.initWins()
    },
    initCanvas() {
      var _this = this;
      // canvas 样式
      this.context.canvas.width  = 450 * this.scale;
      this.context.canvas.height = 450 * this.scale;
      this.context.strokeStyle = '#bfbfbf'
      this.context.lineWidth = 1
      var logo = new Image();
      logo.src = './img/x.png'
      logo.onload = function() {
        // 画logo
        _this.context.drawImage(logo, 0, 0, 450*_this.scale, 450*_this.scale)
        // 画棋盘
        _this.drawChessBoard()
      }
    },
    // 画棋盘
    drawChessBoard: function() {
      for (var i = 0; i < 15; i++) {
        this.context.moveTo(15*this.scale + i*30*this.scale, 15*this.scale)
        this.context.lineTo(15*this.scale + i*30*this.scale, 435*this.scale)
        this.context.stroke()
        this.context.moveTo(15*this.scale, 15*this.scale + i*30*this.scale)
        this.context.lineTo(435*this.scale, 15*this.scale + i*30*this.scale)
        this.context.stroke()
      }
    },
    // 画棋子
    oneStep: function(i, j, me) {
      this.context.beginPath()
      this.context.arc(15*this.scale + i*30*this.scale, 15*this.scale + j*30*this.scale, 13*this.scale, 0, 2 * Math.PI)
      this.context.closePath()
      var gradient = this.context.createRadialGradient(15*this.scale + i*30*this.scale + 2*this.scale, 15*this.scale + j*30*this.scale - 2*this.scale, 13*this.scale, 15*this.scale + i*30*this.scale + 2*this.scale, 15*this.scale + j*30*this.scale - 2*this.scale, 0)
      if (me) {
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#636766');
      } else {
        gradient.addColorStop(0, '#d1d1d1');
        gradient.addColorStop(1, '#f9f9f9');
      }
      this.context.fillStyle = gradient
      this.context.fill()
    },
    // 绑定事件
    bindEvent: function() {
      var _this = this;
      this.chess.onclick = function(e) {
        if (_this.over) {
          return
        }
        if (!_this.me) {
          return
        }

        var x = e.offsetX * _this.ratio;
        var y = e.offsetY * _this.ratio;
        var i = Math.floor(x / (30*_this.scale));
        var j = Math.floor(y / (30*_this.scale));
        if (_this.chessBoard[i][j] == 0) {
          _this.oneStep(i, j, _this.me)
          _this.chessBoard[i][j] = 1
        }
        _this.judgeWin(i, j, true)

        if (!this.over) {
          _this.me = !_this.me
          _this.computerAI()
        }
        return false
      }
    },
    // 判断胜负
    judgeWin: function(i, j, user) {
      var _this = this;
      var temA = user ? _this.myWin : _this.computerWin
      var temB = user ? _this.computerWin : _this.myWin
      for(var k = 0; k < _this.count; k++) {
        if (_this.wins[i][j][k]) {
          temA[k]++
          temB[k] = 6;
          if (temA[k] == 5) {
            setTimeout(function() {
              var confirm = window.confirm((user ? '你' : '计算机') +'赢了，再来一局')
              if(confirm) {
                _this.reset(user)
              } else {
                _this.over = true;
              }
            }, 500)
          }
        }
      }
    },
    // 计算机落子
    computerAI() {
      var myScore = initArr(2);
      var computerScore = initArr(2);
      var max = 0;
      var u = 0, v = 0;

      for (var i = 0; i < 15; i++) {
          for (var j = 0; j < 15; j++) {
            if (this.chessBoard[i][j] == 0) {
              for (var k = 0; k < this.count; k++) {
                if (this.wins[i][j][k]) {
                  if (this.myWin[k] == 1) {
                    myScore[i][j] += 200
                  } else if (this.myWin[k] == 2) {
                    myScore[i][j] += 400
                  } else if (this.myWin[k] == 3) {
                    myScore[i][j] += 2000
                  } else if (this.myWin[k] == 4) {
                    myScore[i][j] += 10000
                  }
                  if (this.computerWin[k] == 1) {
                    computerScore[i][j] += 220
                  } else if(this.computerWin[k] == 2) {
                    computerScore[i][j] += 420
                  } else if(this.computerWin[k] == 3) {
                    computerScore[i][j] += 2100
                  } else if(this.computerWin[k] == 4) {
                    computerScore[i][j] += 20000
                  }
                }
              }
              if (myScore[i][j] > max) {
                max = myScore[i][j];
                u = i;
                v = j;
              } else if(myScore[i][j] == max) {
                if (computerScore[i][j] > computerScore[u][v]) {
                  u = i;
                  v = j;
                }
              }
              if (computerScore[i][j] > max) {
                max = computerScore[i][j];
                u = i;
                v = j;
              } else if(computerScore[i][j] == max) {
                if (myScore[i][j] > myScore[u][v]) {
                  u = i;
                  v = j;
                }
              }

            }
          }
        }
        this.oneStep(u, v, false);
        this.chessBoard[u][v] = 2;
        this.judgeWin(u, v, false)
        if (!this.over) {
          this.me = !this.me
        }
    },
    // 初始化赢法数组
    initWins: function() {
      // 横线
      for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 11; j++) {
          for (var k = 0; k <5; k++) {
            this.wins[i][j+k][this.count] = true;
          }
          this.count++;
        }
      }
      // 竖线
      for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 11; j++) {
          for (var k = 0; k <5; k++) {
            this.wins[j+k][i][this.count] = true;
          }
          this.count++;
        }
      }
      // 斜线
      for (var i = 0; i < 11; i++) {
        for (var j = 0; j < 11; j++) {
          for (var k = 0; k <5; k++) {
            this.wins[i+k][j+k][this.count] = true;
          }
          this.count++;
        }
      }
      // 反斜线
      for (var i = 0; i < 11; i++) {
        for (var j = 14; j > 3; j--) {
          for (var k = 0; k <5; k++) {
            this.wins[i+k][j-k][this.count] = true;
          }
          this.count++;
        }
      }
      // console.log(this.count + '种赢法')
      this.myWin = initArr(1, this.count)
      this.computerWin = initArr(1, this.count)
    },
    reset(user) {
      if (user) {
        this.userScore.innerHTML = ++this.userScore.innerHTML
      } else {
        this.computerScore.innerHTML = ++this.computerScore.innerHTML
      }
      this.initCanvas()
      this.me = true;
      this.chessBoard = initArr(2);
      this.myWin = initArr(1, this.count)
      this.computerWin = initArr(1, this.count)
    }
  }

  var game = new Game();
  game.init();
})()