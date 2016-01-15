var util=function(){var _0=require('./util');return _0.hasOwnProperty("default")?_0["default"]:_0}();


  function KLine(dom, data, option) {
    this.dom = util.isString(dom) ? document.querySelector(dom) : dom;
    if(!this.dom || !this.dom.getContext) {
      return;
    }
    this.data = data || {};
    this.option = option || {};
    this.render();
  }

  KLine.prototype.render = function() {
    var lineHeight;var fontSize;var fontWeight;var fontFamily;var fontVariant;var fontStyle;var self = this;
    var context = self.dom.getContext('2d');
    var width = self.option.width || 300;
    var height = self.option.height || 150;
    var padding = self.option.padding || [10, 10, 10, 10];
    if(Array.isArray(padding)) {
      switch(padding.length) {
        case 0:
          padding = [10, 10, 10, 10];
          break;
        case 1:
          padding[3] = padding[2] = padding[1] = padding[0];
          break;
        case 2:
          padding[3] = padding[1];
          padding[2] = padding[0];
          break;
        case 3:
          padding[3] = padding[1];
          break;
      }
    }
    else {
      padding = [padding, padding, padding, padding];
    }

    var font = self.option.font || 'normal normal normal 12px/1.5 Arial';
    (function(){var _1= util.calFont(font);fontStyle=_1["fontStyle"];fontVariant=_1["fontVariant"];fontFamily=_1["fontFamily"];fontWeight=_1["fontWeight"];fontSize=_1["fontSize"];lineHeight=_1["lineHeight"]}).call(this);
    context.textBaseline = 'top';

    if(self.option.fontSize) {
      fontSize = parseInt(self.option.fontSize) || 12;
    }

    if(self.option.lineHeight) {
      lineHeight = self.option.lineHeight;
      if(util.isString(lineHeight)) {
        if(/[a-z]$/i.test(lineHeight)) {
          lineHeight = parseInt(lineHeight);
        }
        else {
          lineHeight *= fontSize;
        }
      }
      else {
        lineHeight *= fontSize;
      }
    }
    else {
      lineHeight = fontSize * 1.5;
    }
    lineHeight = Math.max(lineHeight, fontSize);

    font = fontStyle + ' ' + fontVariant + ' ' + fontWeight + ' ' + fontSize + 'px/' + lineHeight + 'px ' + fontFamily;
    context.font = font;

    var offset = this.option.offset || 0;
    offset = Math.max(offset, 0);
    offset = Math.min(offset, this.data.length - 1);
    var number = this.option.number || 1;
    number = Math.max(number, 1);
    number = Math.min(number, this.data.length);

    //去除时分秒，最小单位天数
    var start = new Date(this.option.start);
    start = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    var end = new Date(this.option.end);
    end = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    var xNum = parseInt(this.option.xNum) || 2;
    xNum = Math.max(xNum, 2);
    var step = (end - start) / (xNum - 1);
    var xAxis = [];
    xAxis.step = step;
    xAxis.start = start;
    xAxis.end = end;
    xAxis.offset = offset;
    xAxis.number = number;

    switch(this.option.type) {
      case 'month':
        break;
      case 'week':
        break;
      default:
        for(var i = 0; i < xNum; i++) {
          var v = util.format('YYYY-MM-DD', +start + step * i);
          xAxis.push({
            v: v,
            w: context.measureText(v).width
          });
        }
    }

    var color = this.option.color || '#999';
    if(color.charAt(0) != '#' && color.charAt(0) != 'r') {
      color = '#' + color;
    }
    context.fillStyle = color;
    this.option.color = color;
    this.option.rgb = util.rgb2int(color);

    var gridWidth = parseInt(this.option.gridWidth) || 1;
    gridWidth = Math.max(gridWidth, 1);
    context.lineWidth = gridWidth;
    var gridColor = this.option.gridColor || '#DDD';
    context.strokeStyle = gridColor;

    this.reRender(context, padding, width, height, fontSize, lineHeight, xAxis, xNum);
  }
  KLine.prototype.reRender = function(context, padding, width, height, fontSize, lineHeight, xAxis, xNum) {
    var y0 = padding[0];
    var y1 = (height - y0 - padding[2]) * 0.7 + y0;
    var y2 = height - padding[0] - lineHeight;

    var max = this.data[xAxis.offset].max;
    var min = this.data[xAxis.offset].min;
    var maxVolume = this.data[xAxis.offset].volume;
    var minVolume = this.data[xAxis.offset].volume;
    for(var i = xAxis.offset, len = Math.min(this.data.length, xAxis.offset + xAxis.number); i < len; i++) {
      max = Math.max(this.data[i].max, max);
      min = Math.min(this.data[i].min, min);
      maxVolume = Math.max(this.data[i].volume, maxVolume);
      minVolume = Math.min(this.data[i].volume, minVolume);
    }

    var x0 = padding[3];
    var x2 = width - padding[1];
    var x1 = this.renderY(context, x0, x2, y0, y1, fontSize, max, min);
    this.renderX(context, xAxis, xNum, x1, x2, y0, y1, y2, fontSize, lineHeight, max, min, maxVolume, minVolume);
  }
  KLine.prototype.renderY = function(context, x0, x2, y0, y1, fontSize, max, min) {
    var yNum = parseInt(this.option.yNum) || 2;
    yNum = Math.max(yNum, 2);

    var stepY = (y1 - y0 - fontSize) / (yNum - 1);
    var stepV = Math.abs(max - min) / (yNum - 1);
    var left = 0;
    var vs = [];
    var ws = [];
    for(var i = 0; i < yNum; i++) {
      var v = String((min + i * stepV).toFixed(2));
      if(/\.0*$/.test(v)) {
        v = v.replace(/\.0*/, '');
      }
      else if(/\./.test(v)) {
        v = v.replace(/\.([\d]*?)0$/, '.$1');
      }
      vs.push(v);
      var w = context.measureText(v).width;
      ws.push(w);
      left = Math.max(left, w);
    }

    var gap = fontSize / 2;
    for(var i = 0; i < yNum; i++) {
      var y = y1 - stepY * i - fontSize;
      var v = vs[i];
      var w = ws[i];
      context.fillText(v, x0 + left - w, y);
    }

    left += 10 + x0;
    context.setLineDash(this.option.yLineDash || [1, 0]);
    for(var i = 0; i < yNum; i++) {
      var y = y1 - stepY * i - gap;
      context.beginPath();
      context.moveTo(left, y);
      context.lineTo(x2, y);
      context.stroke();
      context.closePath();
    }

    return left;
  }
  KLine.prototype.renderX = function(context, xAxis, xNum, x1, x2, y0, y1, y2, fontSize, lineHeight, max, min, maxVolume, minVolume) {
    var stepVol = (y2 - y1 - 10) / (maxVolume - minVolume);

    switch(this.option.type) {
      case 'month':
        break;
      case 'week':
        break;
      default:
        this.renderDay(context, xAxis, x1, x2, y0, y1, y2, xNum, fontSize, lineHeight, max, min, minVolume, stepVol);
        break;
    }
  }
  KLine.prototype.renderDay = function(context, xAxis, x1, x2, y0, y1, y2, xNum, fontSize, lineHeight, max, min, minVolume, stepVol) {
    var w = x2 - x1;
    var split = 10;
    var wa = w * this.data.length / xAxis.number - split;
    var perX = wa / (xNum - 1);
    var perItem = (w + split) / xAxis.number;
    var halfItem = perItem / 2;
    var left = perItem * xAxis.offset;
    var right = left + w;

    //2分查找找到第一个需要渲染的
    var i = util.find2(xAxis, 0, xAxis.length - 1, left, perX);
    var last = -1;
    var first = true;
    var rgb = this.option.rgb.join(',');
    for(; i < xAxis.length; i++) {
      var item = xAxis[i];
      var x = x1 + perX * i + halfItem;
      var v = item.v;
      var w2 = item.w >> 1;
      if(x - w2 >= right + x1) {
        break;
      }
      x -= w2 + left;
      //第一个不能超过最左
      if(i == 0) {
        x = Math.max(x, x1 - w2);
      }
      //最后一个不能超过最右
      else if(i == xAxis.length -1) {
        x = Math.min(x, x2 - w2);
      }
      //防止挤在一起
      if(x <= last) {
        continue;
      }
      last = x + item.w;
      context.fillStyle = this.option.color;
      //最左
      if(first) {
        first = false;
        if(x < x1) {
          var gr = context.createLinearGradient(x, 0, x1 + 10, 0);
          gr.addColorStop(0, 'rgba(' + rgb + ',0.1)');
          gr.addColorStop((x1-x-10)/(x1-x+10), 'rgba(' + rgb + ',0.3)');
          gr.addColorStop(1, 'rgba(' + rgb + ',1)');
          context.fillStyle = gr;
        }
      }
      //最右
      if(x1 + perX * (i + 1) + halfItem - w2 + item.w >= right + x1) {
        if(last > x2) {
          var gr = context.createLinearGradient(x2 - 10, 0, x + item.w, 0);
          gr.addColorStop(0, 'rgba(' + rgb + ',1)');
          gr.addColorStop(10/(x + item.w - x2), 'rgba(' + rgb + ',0.3)');
          gr.addColorStop(1, 'rgba(' + rgb + ',0.1)');
          context.fillStyle = gr;
        }
      }
      context.fillText(v, x, y2 + ((lineHeight - fontSize) / 2));
    }

    var step = (y1 - y0 - fontSize) / (max - min);
    var gap = fontSize / 2;

    context.lineWidth = 1;
    for(var i = xAxis.offset, length = Math.min(this.data.length, xAxis.offset + xAxis.number); i < length; i++) {
      this.renderItem(context, i, xAxis, perItem, split, x1, y1 - gap, y2, fontSize, min, step, minVolume, stepVol);
    }
  }
  KLine.prototype.renderItem = function(context, i, xAxis, per, split, x1, y1, y2, fontSize, min, step, minVolume, stepVol) {
    var item = this.data[i];
    var left = x1 + (i - xAxis.offset) * per;
    var middle = left + ((per - split) >> 1);
    var top = y1 - (item.max - min) * step;
    var yt = y1 - (Math.max(item.close, item.open) - min) * step;
    var yb = y1 - (Math.min(item.close, item.open) - min) * step;
    var bottom = y1 - (item.min - min) * step;
    var volY = (item.volume - minVolume) * stepVol;

    context.beginPath();
    if(item.close > item.open) {
      context.strokeStyle = '#F33';
      context.rect(left, yb, per - split, yt - yb);
      context.stroke();
      context.rect(left, y2 - volY, per - split, Math.max(1, volY));
      context.stroke();
    }
    else if(item.close < item.open) {
      context.strokeStyle = '#3F3';
      context.fillStyle = '#3F3';
      context.fillRect(left, yb, per - split, yt - yb);
      context.fillRect(left, y2 - volY, per - split, Math.max(1, volY));
    }
    else {
      context.strokeStyle = '#333';
      context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    }
    context.closePath();

    context.beginPath();
    if(item.max > item.close) {
      context.moveTo(middle, top);
      context.lineTo(middle, yt);
      context.stroke();
    }
    if(item.min < item.open) {
      context.moveTo(middle, yb);
      context.lineTo(middle, bottom);
      context.stroke();
    }
    context.closePath();
  }


exports["default"]=KLine;
