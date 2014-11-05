(function () {
    var V = envision;

    // Inject Flag Container and calls
    // require data in options:
    // 1. container - root container
    // 2. data - array of obj [{x:1, y:1, text:blah, img:blah.png}, {}, ...]
    // 3. chartObj - where we can refer to summary/price/other chart data
    function EnvisionFlagContainer (options) {
        var container = options.containerSelector;
        var chartObj = options.chartObj;

        // console.log(options);
        // inject flag container
        var flagContainer = jQuery('<div>').addClass("flagContainer");
        jQuery(options.containerSelector).find(".envision-visualization")
            .append(flagContainer);

        // members
        this.chart = chartObj;
        this.flagData = options.flagData;
        this.container = flagContainer;
        this.options= options;
        this.globalXmin = options.xMin;
        this.globalXmax = options.xMax;
        this.chartWidth = jQuery(options.containerSelector).find(".envision-visualization").width();
    }

    EnvisionFlagContainer.prototype = {
        // set flag data
        setFlags: function (flags) {
            this.flagData = flags;
            this.drawFlags();
        },

        // draw flags based on data
        drawFlags: function () {
            // test log
    //        console.log("Drawing Flags....");
    //        console.log(this);
    //        console.log("flag data");
    //        console.log(this.flagData);

            // validation check
            if (!this.flagData) return;

            // get data from option
            var extent = this.extent;
            var datamin = this.globalXmin;
            var datamax = this.globalXmax;
            if (extent && extent.xaxis) {
                datamin = extent.xaxis.min;
                datamax = extent.xaxis.max;
            }

            // clear current flag container
            this.container.html('');

            // loop through all flag data and inject DOM
            for (var i = 0; i < this.flagData.length; i++) {
                var x = this.flagData[i].x;
                var flagContent = this.flagData[i].content || this.options.defaultFlag;
                var flagTooltip = this.flagData[i].tooltip;

                if (x < datamin) {
                    continue;
                } else if (x >= datamin && x <= datamax) {
                    // prepare data
                    var leftOffset = (x - datamin) / (datamax - datamin) * this.chartWidth;

                    // Draw the flag
                    var flagDiv = jQuery("<flag>").addClass("envision-flag")
                        .css("left", leftOffset + "px");
                    flagDiv.html(flagContent);
                    var flagTipDiv = jQuery("<tooltip>").addClass("envision-flag-tooltip");
                    flagTipDiv.html(flagTooltip);
                    flagDiv.append(flagTipDiv);
                    this.container.append(flagDiv);

                } else if (x >= datamax) {
                    break;
                }
            }
        }
    }; // End of Inject Flag Container and calls

    V.FlagContainer = EnvisionFlagContainer;
})();