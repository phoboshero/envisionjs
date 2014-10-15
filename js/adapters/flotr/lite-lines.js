/** Lines **/
Flotr.addType('lite-lines', {
  options: {
    show: false,           // => setting to true will show lines, false will hide
    lineWidth: 2,          // => line width in pixels
    fill: false,           // => true to fill the area from the line to the x axis, false for (transparent) no fill
    fillBorder: false,     // => draw a border around the fill
    fillColor: null,       // => fill color
    fillOpacity: 0.4       // => opacity of the fill color, set to 1 for a solid fill, 0 hides the fill
  },

  /**
   * Draws lines series in the canvas element.
   * @param {Object} options
   */
  draw : function (options) {

    var
      context     = options.context,
      lineWidth   = options.lineWidth,
      shadowSize  = options.shadowSize,
      offset;

    context.save();
    context.lineCap = 'butt';
    context.lineWidth = lineWidth;
    context.strokeStyle = options.color;

    if (options.dashMissingPoint)
        this.plot2(options);
    else if (options.gapMissingPoint)
        this.plot3(options);
    else if (options.byPassMissingPoint)
        this.plot4(options);
    else
        this.plot(options);

    context.restore();
  },

  // use 0 for missing point
  plot : function (options) {

    var
      context   = options.context,
      xScale    = options.xScale,
      yScale    = options.yScale,
      data      = options.data,
      length    = data.length - 1,
      zero      = yScale(0),
      x0, y0;

    if (length < 1) return;

    x0 = xScale(data[0][0]);
    y0 = yScale(data[0][1]);

    context.beginPath();
    context.moveTo(x0, y0);
    for (i = 0; i < length; ++i) {
      context.lineTo(
        xScale(data[i+1][0]),
        yScale(data[i+1][1])
      );
    }

    if (!options.fill || options.fill && !options.fillBorder) context.stroke();

    if (options.fill){
      x0 = xScale(data[0][0]);
      context.fillStyle = options.fillStyle;
      context.lineTo(xScale(data[length][0]), zero);
      context.lineTo(x0, zero);
      context.lineTo(x0, yScale(data[0][1]));
      context.fill();
      if (options.fillBorder) {
        context.stroke();
      }
    }
  },

  // draw dashes for missing point
  plot2 : function (options) {

    var
      context   = options.context,
      xScale    = options.xScale,
      yScale    = options.yScale,
      data      = options.data, 
      length    = data.length - 1,
      zero      = yScale(0),
      x0, y0;
      
    if (length < 1) return;

    x0 = xScale(data[0][0]);
    y0 = yScale(data[0][1]);

    context.beginPath();
    context.moveTo(x0, y0);

    // function for dash line, draw from x1,y1 to x2,y2 with dash length
    function drawDashLine(ctx, x1, y1, x2, y2, dashLen) {
        if (dashLen === undefined || dashLen === null)
            dashLen = 2;
        ctx.moveTo(x1, y1);

        var dX = x2 - x1;
        var dY = y2 - y1;
        var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen);
        var dashX = dX / dashes;
        var dashY = dY / dashes;

        var q = 0,
            currX = x1,
            currY = y1;
        while (q++ < dashes) {
            currX += dashX;
            currY += dashY;
            if (q % 2 === 0 )
                ctx.moveTo(currX, currY);
            else
                ctx.lineTo(currX, currY);
        }
        ctx.lineTo(x2, y2);
    }

    // preparation for data drawing logic
    var missingDataFound = false;
    if (data[0][1] === undefined || data[0][1] === null)
        missingDataFound = true;
    var prevScaleX = missingDataFound ? null : x0;
    var prevScaleY = missingDataFound ? null : y0;
    var currX, currY;
    var scaleX, scaleY;
    // loop through data and update context for drawing
    for (i = 0; i < length; ++i) {
        currX = data[i+1][0];
        currY = data[i+1][1];
        scaleX = xScale(currX);
        scaleY = yScale(currY);
        // skipping null value
        if (currY === undefined || currY === null) {
            missingDataFound = true;
            continue;
        }

        // move to if missing data found
        if (missingDataFound) {
            // missing data from prev value
            if (prevScaleX && prevScaleY) {
                // previous value found, draw dash line from prev to new point
                drawDashLine(context, prevScaleX, prevScaleY, scaleX, scaleY, 5);
            } else {
                // no previous value, move to new point directly
                context.moveTo(scaleX, scaleY);
            }
            missingDataFound = false;
        } else {
          // actual data found continuously
            context.lineTo(scaleX, scaleY);
        }

        // update prev x and y
        prevScaleX = scaleX;
        prevScaleY = scaleY;
    } // end of series for value loop

    if (!options.fill || options.fill && !options.fillBorder) context.stroke();

    if (options.fill){
      x0 = xScale(data[0][0]);
      context.fillStyle = options.fillStyle;
      context.lineTo(xScale(data[length][0]), zero);
      context.lineTo(x0, zero);
      context.lineTo(x0, yScale(data[0][1]));
      context.fill();
      if (options.fillBorder) {
        context.stroke();
      }
    }
  },

  // show gap for missing point
  plot3 : function (options) {

    var
      context   = options.context,
      xScale    = options.xScale,
      yScale    = options.yScale,
      data      = options.data,
      length    = data.length - 1,
      zero      = yScale(0),
      x0, y0;

    if (length < 1) return;

    x0 = xScale(data[0][0]);
    y0 = yScale(data[0][1]);

    context.beginPath();
    context.moveTo(x0, y0);
    // preparation for data drawing logic
    var missingDataFound = false;
    if (data[0][1] === undefined || data[0][1] === null)
        missingDataFound = true;

    for (i = 0; i < length; ++i) {
        // skipping null value
        if (data[i+1][1] === undefined || data[i+1][1] === null) {
            missingDataFound = true;
            continue;
        }

        if (missingDataFound) {
            context.moveTo(xScale(data[i+1][0]), yScale(data[i+1][1]));
        } else {
            context.lineTo(xScale(data[i+1][0]), yScale(data[i+1][1]));
        }
        missingDataFound = false;
    }

    if (!options.fill || options.fill && !options.fillBorder) context.stroke();

    if (options.fill){
      x0 = xScale(data[0][0]);
      context.fillStyle = options.fillStyle;
      context.lineTo(xScale(data[length][0]), zero);
      context.lineTo(x0, zero);
      context.lineTo(x0, yScale(data[0][1]));
      context.fill();
      if (options.fillBorder) {
        context.stroke();
      }
    }
  },

  // draw line though for missing point
  plot4 : function (options) {

    var
      context   = options.context,
      xScale    = options.xScale,
      yScale    = options.yScale,
      data      = options.data,
      length    = data.length - 1,
      zero      = yScale(0),
      x0, y0;

    if (length < 1) return;

    x0 = xScale(data[0][0]);
    y0 = yScale(data[0][1]);

    context.beginPath();
    context.moveTo(x0, y0);
    for (i = 0; i < length; ++i) {
        // skipping null value
        if (data[i+1][1] === undefined || data[i+1][1] === null) {
            continue;
        }
      context.lineTo(
        xScale(data[i+1][0]),
        yScale(data[i+1][1])
      );
    }

    if (!options.fill || options.fill && !options.fillBorder) context.stroke();

    if (options.fill){
      x0 = xScale(data[0][0]);
      context.fillStyle = options.fillStyle;
      context.lineTo(xScale(data[length][0]), zero);
      context.lineTo(x0, zero);
      context.lineTo(x0, yScale(data[0][1]));
      context.fill();
      if (options.fillBorder) {
        context.stroke();
      }
    }
  },

  extendYRange : function (axis, data, options, lines) {

    var o = axis.options;

    // HACK
    if ((!o.max && o.max !== 0) || (!o.min && o.min !== 0)) {
      axis.max += options.lineWidth * 0.01;
      axis.min -= options.lineWidth * 0.01;
      /*
      axis.max = axis.p2d((axis.d2p(axis.max) + options.lineWidth));
      axis.min = axis.p2d((axis.d2p(axis.max) - options.lineWidth));
      */
    }
  }
});