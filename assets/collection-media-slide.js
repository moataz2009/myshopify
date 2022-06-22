if (window.screen.width < 1025) {
  (function (window, document) {
    var currentPosition = 0;
    var currentPoint = -1;
    var pageNow = 1;
    var logos = null;
    var contents = null;
    var app = {
      init: function () {
        document.addEventListener('DOMContentLoaded', function () {
          logos = document.querySelectorAll('.product-media .m-item');
          contents = document.querySelectorAll('.product-media #contentBox .content-item');
          app.bindTouchEvent();
          app.bindClickEvent();
          app.bindLogoClickEvent();
          app.setPageNow();
          app.setMobileDisplay();
        }.bind(app), false);
      }(),

      transform: function (translate) {
        this.style.webkitTransform = 'translateX(' + translate + 'px)';
        currentPosition = translate;
      },
      setPageNow: function () {
        currentPoint = pageNow - 1;
        for (var i = 0; i < logos.length; i++) {
          logos[i].classList.remove('active');
          contents[i].classList.remove('active');
        }
        logos[currentPoint].classList.add('active');
        contents[currentPoint].classList.add('active');
      },
      bindLogoClickEvent: function () {
        var viewport = document.querySelector('.product-media #contentBox');
        var logoBox = document.querySelector('.product-media .media-logos');
        var pageWidth = window.innerWidth;
        var translate = 0;
        viewport.style.webkitTransition = '0.3s ease -webkit-transform';
        var list = logoBox.querySelectorAll('.m-item');
        for (var i = 0; i < list.length; i++) {
          list[i].index = i;
        }
        logoBox.addEventListener('click', function (e) {
          var itemIndex;
          var tg = e.target.tagName.toLowerCase();
          switch (tg) {
            case 'ul':
              break;
            case 'li':
              itemIndex = e.target.index;
              translate = - (pageWidth * itemIndex);
              this.transform.call(viewport, translate);
              pageNow = itemIndex + 1;
              setTimeout(function () {
                this.setPageNow();
                this.setMobileDisplay();
              }.bind(this), 100);
              break;
            case 'img':
              itemIndex = e.target.parentNode.index;
              translate = - (pageWidth * itemIndex);
              this.transform.call(viewport, translate);
              pageNow = itemIndex + 1;
              setTimeout(function () {
                this.setPageNow();
                this.setMobileDisplay();
              }.bind(this), 100);
              break;
            default:
              break;
          }
        }.bind(this), false);
      },
      bindClickEvent: function () {
        var viewport = document.querySelector('.product-media #contentBox');
        var arrowLeft = document.querySelector('.product-media #arrow_prev');
        var arrowRight = document.querySelector('.product-media #arrow_next');
        var pageWidth = window.innerWidth;
        var maxWidth = -pageWidth * (contents.length - 1);
        var translate = 0;
        viewport.style.webkitTransition = '0.3s ease -webkit-transform';

        arrowRight.addEventListener('click', function (e) {
          e.preventDefault();
          translate = currentPosition - pageWidth;
          translate = translate < maxWidth ? maxWidth : translate;
          if (currentPosition === maxWidth) {
            return;
          }

          this.transform.call(viewport, translate);
          pageNow = Math.round(Math.abs(translate) / pageWidth) + 1;
          setTimeout(function () {
            this.setPageNow();
            this.setMobileDisplay();

          }.bind(this), 100);

        }.bind(this), false);

        arrowLeft.addEventListener('click', function (e) {
          e.preventDefault();
          translate = currentPosition + pageWidth;
          translate = translate > 0 ? 0 : translate;
          if (currentPosition === 0) {
            return;
          }
          this.transform.call(viewport, translate);
          pageNow = Math.round(Math.abs(translate) / pageWidth) + 1;
          setTimeout(function () {
            this.setPageNow();
            this.setMobileDisplay();

          }.bind(this), 100);

        }.bind(this), false);
      },
      bindTouchEvent: function () {
        var viewport = document.querySelector('.product-media #contentBox');
        var pageWidth = window.innerWidth;
        var maxWidth = -pageWidth * (contents.length - 1);
        var startX, startY;
        var initialPos = 0;
        var moveLength = 0;
        var direction = 'left';
        var isMove = false;
        var startT = 0;
        var isTouchEnd = true;
        var swipeX, swipeY;
        viewport.addEventListener('touchstart', function (e) {
          swipeX = true;
          swipeY = true;
          if (e.touches.length === 1 || isTouchEnd) {
            var touch = e.touches[0];
            startX = touch.pageX;
            startY = touch.pageY;
            initialPos = currentPosition;
            viewport.style.webkitTransition = '';
            startT = +new Date();
            isMove = false;
            isTouchEnd = false;
          }
        }.bind(this), false);

        viewport.addEventListener('touchmove', function (e) {
          if (isTouchEnd) return;

          var touch = e.touches[0];
          var deltaX = touch.pageX - startX;
          var deltaY = touch.pageY - startY;
          if (swipeX && Math.abs(deltaX) - Math.abs(deltaY) > 0) {
            e.stopPropagation();
            e.preventDefault();
            swipeY = false;

            var translate = initialPos + deltaX;
            if (translate > 0) {
              translate = 0;
            }
            if (translate < maxWidth) {
              translate = maxWidth;
            }
            deltaX = translate - initialPos;
            this.transform.call(viewport, translate);
            isMove = true;
            moveLength = deltaX;
            direction = deltaX > 0 ? 'right' : 'left';
          } else if (swipeY && Math.abs(deltaX) - Math.abs(deltaY) < 0) {
            swipeX = false;
          }
        }.bind(this), false);

        viewport.addEventListener('touchend', function (e) {
          var translate = 0;
          var deltaT = +new Date() - startT;
          if (isMove && !isTouchEnd) {
            isTouchEnd = true;
            viewport.style.webkitTransition = '0.3s ease -webkit-transform';
            if (deltaT < 300) {
              if (currentPosition === 0 && translate === 0) {
                return;
              }
              translate = direction === 'left' ?
                currentPosition - (pageWidth + moveLength) :
                currentPosition + pageWidth - moveLength;
              translate = translate > 0 ? 0 : translate;
              translate = translate < maxWidth ? maxWidth : translate;
            } else {
              if (Math.abs(moveLength) / pageWidth < 0.5) {
                translate = currentPosition - moveLength;
              } else {
                translate = direction === 'left' ?
                  currentPosition - (pageWidth + moveLength) :
                  currentPosition + pageWidth - moveLength;
                translate = translate > 0 ? 0 : translate;
                translate = translate < maxWidth ? maxWidth : translate;
              }
            }

            this.transform.call(viewport, translate);
            pageNow = Math.round(Math.abs(translate) / pageWidth) + 1;

            setTimeout(function () {
              this.setPageNow();
              this.setMobileDisplay();
            }.bind(this), 100);
          }
        }.bind(this), false);
      },
      /* css mobile display */
      setMobileDisplay: () => {
        let logoBox = $('.product-media .media-logos');
        let logos = $('.product-media .media-logos .m-item');
        let activeLogo = logoBox.find('.m-item.active');
        let curIndex = activeLogo.index();
        logoBox.css('flex-wrap', 'nowrap');
        if (logos.length === 3) {
          activeLogo.siblings().css('order', '');
          activeLogo.css('order', '1');
          if (curIndex === logos.length - 1) {
            logos.eq(0).css('order', '2');
          } else {
            activeLogo.next().css('order', '2');
          }
          return;
        } else if (logos.length === 4) {
          logos.css('order', '');
          return;
        }
        logos.css('display', 'none');
        for (let i = curIndex - 2; i < curIndex + 3; i++) {
          if (curIndex < 2) {
            let order = i + 2;
            logos.eq(i).css({
              display: 'flex',
              order: order + '',
              width: '18%'
            })
          } else if (curIndex > logos.length - 3) {
            let order = i - 3;
            if (i === logos.length) {
              logos.eq(0).css({
                display: 'flex',
                order: `${order}`,
                width: '18%'
              })
            } else if (i === logos.length + 1) {
              logos.eq(1).css({
                display: 'flex',
                order: `${order}`,
                width: '18%'
              })
            }
            logos.eq(i).css({
              display: 'flex',
              order: `${order}`,
              width: '18%'
            })
          } else {
            logos.eq(i).css({
              display: 'flex',
              order: `${i}`,
              width: '18%'
            })
          }
        }
        activeLogo.css({
          transform: 'scale(1.1)',
          transition: 'all 0.5s linear',
          width: '28%'
        })
      }
    }
  })(window, document);
} else if (window.CSS) {
  let view = {
    mediaContainer: '.media-logos',
    logos: '.media-logos .m-item',
    mainColPercent: 26,
    activeLogo: '.m-item.active',
  };
  let model = {
    row: { gridRowNum: 0, gridRowPercent: 0 },
    col: { leftNum: 0, rightNum: 0, colNum: 0, colPercent: 0 }
  };
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.bindEvents(this.view.mediaContainer, this.view.logos, this.view.mainColPercent);
    },
    bindEvents(mediaContainer, logos, mainColPercent) {
      //part 1 - generate grid layout for logos;
      mediaContainer = $(mediaContainer);
      logos = $(logos);
      activeLogo = $(mediaContainer).find(this.view.activeLogo);
      inactiveLogos = $(logos).not(activeLogo);
      this.generateGridBox(mediaContainer, logos, activeLogo, inactiveLogos, mainColPercent);
      //part 2 - bind click event;
      logos.on('click', (e) => {
        activeLogo = document.querySelector('.media-logos .m-item.active');
        let clickedLogo = $(e.currentTarget);
        let temp, clickedLogoGridArea, curActiveGridArea;
        clickedLogoGridArea = e.currentTarget.style['grid-area'];

        if (clickedLogoGridArea && clickedLogoGridArea.indexOf('/') === -1) {
          clickedLogoGridArea = clickedLogoGridArea.split(' ').join('/');
        }
        if (clickedLogoGridArea) {
          curActiveGridArea = activeLogo.style['grid-area'];
          if (curActiveGridArea.indexOf('/') === -1) {
            curActiveGridArea = curActiveGridArea.split(' ').join('/');
          }
          temp = clickedLogoGridArea;
          clickedLogo.addClass('active').siblings().removeClass('active');
          clickedLogo.css('grid-area', curActiveGridArea);
          $(activeLogo).css('grid-area', temp);
        } else {
          clickedLogo.addClass('active').siblings().removeClass('active');
        }
      })
    },
    generateGridBox(mediaContainer, logos, activeLogo, inactiveLogos, mainColPercent) {
      if (logos.length > 7) { //multiple rows
        let logoNum = logos.length - 1;
        //determine how many grid-rows;
        this.rowsToGenerate(logoNum);
        //determine how many logos on each side and how many columns on one side;
        this.colsToGenerate(logoNum, mainColPercent);
        //generate grid layout for el;
        this.generateGridLayout(mediaContainer, this.model.row, this.model.col, mainColPercent);
        //generate grids based on colNum;
        if (this.model.col.colNum === 2) {
          this.generateCol2Grid(this.model.row, this.model.col, activeLogo, inactiveLogos);
        } else if (this.model.col.colNum === 3) {
          this.generateCol3Grid(this.model.row, this.model.col, activeLogo, inactiveLogos);
        } else {
          this.generateCol6Grid(this.model.row, this.model.col, activeLogo, inactiveLogos);
        }
      } else { // one row
        let logoNum = logos.length - 1;
        if (logos.length % 2) { //odd number of logos;
          mainColPercent = 35;
          if (logoNum === 0) { // in the case of only 1 logo in total
            this.generateFlex(mediaContainer);
          } else if (logoNum === 2) { // 3 logos in total
            this.rowsToGenerate(logoNum);
            this.colsToGenerate(logoNum, mainColPercent);
            this.generateGridLayout(mediaContainer, this.model.row, this.model.col, mainColPercent);
            //left part;
            this.generateGrid(inactiveLogos, 0, 1, 1, 1, 2);
            //right part;
            this.generateGrid(inactiveLogos, 1, 1, 3, 1, 4);
            //active logo;
            activeLogo.css({
              gridArea: '1 / 2 / 2 / 3'
            })
          } else if (logoNum === 4) { //5 logos in total
            this.rowsToGenerate(logoNum);
            this.colsToGenerate(logoNum, mainColPercent);
            this.generateGridLayout(mediaContainer, this.model.row, this.model.col, mainColPercent);
            this.generateCol2Grid(this.model.row, this.model.col, activeLogo, inactiveLogos);
          } else { //7 logos in total
            this.rowsToGenerate(logoNum);
            this.colsToGenerate(logoNum, mainColPercent);
            this.generateGridLayout(mediaContainer, this.model.row, this.model.col, mainColPercent);
            this.generateCol3Grid(this.model.row, this.model.col, activeLogo, inactiveLogos);
          }
        } else { // even number of logos;
          this.generateFlex(mediaContainer);
        }
      }
    },
    rowsToGenerate(num) {
      let gridRowNum = Math.ceil(num / 6);
      this.model.row.gridRowNum = gridRowNum;
      this.model.row.gridRowPercent = 100 / gridRowNum;
    },
    colsToGenerate(num, mainColPercent) {
      let leftNum, rightNum, colNum, colPercent;
      leftNum = num % 2 ? Math.ceil(num / 2) : (num / 2);
      rightNum = num - leftNum;
      if (num < 7) {
        colNum = leftNum;
      } else {
        if (leftNum < 5) {
          colNum = 2;
        } else if (leftNum % 3 === 2 || rightNum % 3 === 2) {
          colNum = 6;
        } else {
          colNum = 3;
        }
      }
      colPercent = (100 - mainColPercent) / (2 * colNum);
      //destructuring assignment
      this.model.col = { leftNum, rightNum, colNum, colPercent };
    },
    generateGridLayout(el, row, col, mainColPercent) {
      el.css({
        display: 'grid',
        justifyItems: 'center',
        alignItems: 'center',
        gridTemplateColumns: `repeat(${col.colNum},${col.colPercent}%) ${mainColPercent}% repeat(${col.colNum},${col.colPercent}%)`,
        gridTemplateRows: `repeat(${row.gridRowNum},${row.gridRowPercent}%)`,
      })
    },
    generateCol2Grid(row, col, activeLogo, inactiveLogos) {
      let colSpan = 1;
      let curRow, curCol, colStart, nextStartCol;
      let n = 0;
      if (col.leftNum === col.rightNum) {//in this case, 8 inactive items in total;
        //left part;
        for (let i = 0; i < col.leftNum; i++) {
          curRow = parseInt(i / 2) + 1;
          curCol = i % 2;
          curCol === 0 ? colStart = 1 : colStart = nextStartCol;
          nextStartCol = colStart + colSpan;
          this.generateGrid(inactiveLogos, i, curRow, colStart, 1, nextStartCol);
        }
        //right part;
        for (let i = col.leftNum; i < col.leftNum + col.rightNum; i++) {
          curRow = parseInt(n / 2) + 1;
          curCol = n % 2;
          curCol === 0 ? colStart = 4 : colStart = nextStartCol;
          nextStartCol = colStart + colSpan;
          this.generateGrid(inactiveLogos, i, curRow, colStart, 1, nextStartCol);
          n++;
        }
      } else {// in this case, 7 inactive logos in total
        n = 0;
        //left part;
        for (let i = 0; i < col.leftNum; i++) {
          curRow = parseInt(i / 2) + 1;
          curCol = i % 2;
          curCol === 0 ? colStart = 1 : colStart = nextStartCol;
          nextStartCol = colStart + colSpan;
          this.generateGrid(inactiveLogos, i, curRow, colStart, 1, nextStartCol);
        }
        //right part;
        for (let i = col.leftNum; i < col.leftNum + col.rightNum; i++) {
          curRow = parseInt(n / 2) + 1;
          curCol = n % 2;
          if (curRow < row.gridRowNum) {
            curCol === 0 ? colStart = 4 : colStart = nextStartCol;
            nextStartCol = colStart + colSpan;
          } else {
            colSpan = 2;
            curCol === 0 ? colStart = 4 : colStart = nextStartCol;
            nextStartCol = colStart + colSpan;
          }
          this.generateGrid(inactiveLogos, i, curRow, colStart, 1, nextStartCol);
          n++;
        }
      }
      //active logo;
      activeLogo.css({
        gridArea: '1/3/' + (row.gridRowNum + 1) + '/4'
      })
    },
    generateCol3Grid(row, col, activeLogo, inactiveLogos) {
      let colSpan = 1;
      let curRow, curCol, colStart, nextStartCol;
      let n = 0;
      //left part
      for (let i = 0; i < col.leftNum; i++) {
        curRow = parseInt(i / 3) + 1;
        curCol = i % 3;
        if (curRow < row.gridRowNum) {
          colStart = curCol + 1;
          nextStartCol = colStart + colSpan;
          this.generateGrid(inactiveLogos, i, curRow, colStart, 1, nextStartCol);
        } else {
          if (col.leftNum % 3) {
            colStart = curCol + 1;
            nextStartCol = colStart + 3 * colSpan;
          } else {
            colStart = curCol + 1;
            nextStartCol = colStart + colSpan;
          }
          this.generateGrid(inactiveLogos, i, curRow, colStart, 1, nextStartCol);
        }
      }
      //right part
      for (let i = col.leftNum; i < col.leftNum + col.rightNum; i++) {
        curRow = parseInt(n / 3) + 1;
        curCol = n % 3;
        if (curRow < row.gridRowNum) {
          colStart = curCol + 5;
          nextStartCol = colStart + colSpan;
        } else {
          if (col.rightNum % 3) {
            colStart = 5;
            nextStartCol = colStart + 3 * colSpan;
          } else {
            colStart = curCol + 5;
            nextStartCol = colStart + colSpan;
          }
        }
        this.generateGrid(inactiveLogos, i, curRow, colStart, 1, nextStartCol);
        n++;
      }
      //active logo;
      activeLogo.css({
        gridArea: '1/4/' + (row.gridRowNum + 1) + '/5'
      })
    },
    generateCol6Grid(row, col, activeLogo, inactiveLogos) {
      let colSpan = 2;
      let curRow, curCol, colStart, nextStartCol;
      let n = 0;
      // left part;
      for (let i = 0; i < col.leftNum; i++) {
        curRow = parseInt(i / 3) + 1;
        curCol = i % 3;
        if (curRow < row.gridRowNum) { //not the last row
          curCol === 0 ? colStart = 1 : colStart = nextStartCol;
          nextStartCol = colStart + colSpan;
          this.generateGrid(inactiveLogos, i, curRow, colStart, 1, nextStartCol);
        } else {
          if (col.leftNum % 3 === 1) {
            colStart = 1;
            nextStartCol = colStart + 3 * colSpan;
          } else if (col.leftNum % 3 === 2) {
            curCol === 0 ? colStart = 1 : colStart = nextStartCol;
            nextStartCol = colStart + colSpan + 1;
          } else {
            curCol === 0 ? colStart = 1 : colStart = nextStartCol;
            nextStartCol = colStart + colSpan;
          }
          this.generateGrid(inactiveLogos, i, curRow, colStart, 1, nextStartCol);
        }
      }
      //right part;
      for (let i = col.leftNum; i < col.leftNum + col.rightNum; i++) {
        curRow = parseInt(n / 3) + 1;
        curCol = n % 3;
        if (curRow < row.gridRowNum) {
          curCol === 0 ? colStart = 8 : colStart = nextStartCol;
          nextStartCol = colStart + colSpan;
          this.generateGrid(inactiveLogos, i, curRow, colStart, 1, nextStartCol);
        } else {
          if (col.rightNum % 3 === 1) {
            colStart = 8;
            nextStartCol = colStart + 3 * colSpan;
          } else if (col.rightNum % 3 === 2) {
            curCol === 0 ? colStart = 8 : colStart = nextStartCol;
            nextStartCol = colStart + colSpan + 1;
          } else {
            curCol === 0 ? colStart = 8 : colStart = nextStartCol;
            nextStartCol = colStart + colSpan;
          }
          this.generateGrid(inactiveLogos, i, curRow, colStart, 1, nextStartCol);
        }
        n++;
      }
      //active logo;
      activeLogo.css({
        gridArea: '1/7/' + (row.gridRowNum + 1) + '/8'
      });
    },
    generateGrid(el, item, curRow, colStart, rowSpan, nextStartCol) {
      el.eq(item).css({
        gridArea: `${curRow} / ${colStart} / ${curRow + rowSpan} / ${nextStartCol}`
      })
    },
    generateFlex(el) {
      el.css({
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      })
    }
  }
  controller.init(view, model);
}
