// gap：间距
function flow(gap,cols,largeFlag) {
  // var pageWidth = document.documentElement.offsetWidth;
  var container = document.querySelector(".sublinks-container");
  var itemBox =  document.querySelectorAll(".sublinks-container > li:not(.sm-show)");
  // var itemWidth = itemBox[0].offsetWidth + gap;
  var itemWidth = 338 + gap;
  let column = cols == 0 ? 1 : cols;
  let h_1 = 0,h_2 = 0;
  // console.log(itemWidth,cols);405,1/338,2
  if (cols == 2) {
    container.style.width = "676px";
    container.style.marginRight = '0px';
  }else{
    container.style.width = '810px';
    container.style.marginRight = '-134px';
  }
  var liLen = itemBox.length;
  var lenArr = [];
  for (var i = 0; i < liLen; i++) {
    lenArr.push(itemBox[i].offsetHeight);
  }

  var oArr = [];
  for (var i = 0; i < column; i++) {
    itemBox[i].style.top = "0";
    itemBox[i].style.left = itemWidth * i + "px";
    if(i == 0){
      h_1 += itemBox[i].offsetHeight;
    }else{
      h_2 += itemBox[i].offsetHeight;
    }

    oArr.push(lenArr[i]);
  }
  for (var i = column; i < liLen; i++) {
    var x = getMin(oArr);
    itemBox[i].style.top = oArr[x] + gap + "px";
    itemBox[i].style.left = itemWidth * x + "px";

    if(itemWidth * x == 0){
      h_1 += itemBox[i].offsetHeight;
    }else{
      h_2 += itemBox[i].offsetHeight;
    }

    oArr[x] = lenArr[i] + oArr[x] + gap;
  }

  let h_t = h_1 > h_2 ? h_1 : h_2;
  if(h_t == 0){
    container.style.height = 0;
    container.style.width = 0;
    container.style.marginLeft = '456px';
  }else{
    if (cols == 2) {
      container.style.width = "676px";
      container.style.marginRight = '0px';
    }else{
      container.style.width = '810px';
      container.style.marginRight = '-134px';
    }
    container.style.marginLeft = "320px";
    container.style.height = h_t > container.previousElementSibling.offsetHeight ?  h_t + 'px' : 'unset';
  }
}

// window.onload = function () { 
//   flow(0) 
// };
// let timer;
// window.onresize = function () {
//   clearTimeout(timer);
//   timer = setTimeout(function () { 
//     flow(0); 
//   }, 200);
// }

function getMin(arr) {
  var a = arr[0]; var b = 0;
  for (var k in arr) {
    if (arr[k] < a) {
      a = arr[k];
      b = k;
    }
  }
  return b;
}