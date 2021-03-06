/*
Axis Labels Plugin for flot.
http://github.com/markrcote/flot-axislabels

Original code is Copyright (c) 2010 Xuan Luo.
Original code was released under the GPLv3 license by Xuan Luo, September 2010.
Original code was rereleased under the MIT license by Xuan Luo, April 2012.

Improvements by Mark Cote.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */
(function ($) {
    var options = { };

    function css3TransitionSupported() {
        var div = document.createElement('div');
        return typeof div.style.MozTransition != 'undefined'    // Gecko
            || typeof div.style.OTransition != 'undefined'      // Opera
            || typeof div.style.webkitTransition != 'undefined' // WebKit
            || typeof div.style.transition != 'undefined';
    }

    /* *************************************************** */

    function AxisLabel(axisName, position, padding, plot, opts) {
        this.axisName = axisName;
        this.position = position;
        this.padding = padding;
        this.plot = plot;
        this.opts = opts;
        this.width = 0;
        this.height = 0;
    }

    /* *************************************************** */

    HtmlAxisLabel.prototype = new AxisLabel();
    HtmlAxisLabel.prototype.constructor = HtmlAxisLabel;
    function HtmlAxisLabel(axisName, position, padding, plot, opts) {
        AxisLabel.prototype.constructor.call(this, axisName, position,
                                             padding, plot, opts);
    }

    HtmlAxisLabel.prototype.calculateSize = function() {
        var elem = $('<div class="axisLabels" style="position:absolute; left:0; top:0;" />');
        elem.html(this.opts.axisLabel);
        // fix by ejvos: graph placeholder might be hidden,
        // which causes the label w & h to be 0.
        // append to body instead
        $(document.body).append(elem);
        // store height and width of label itself, for use in draw()
        this.labelWidth = elem.outerWidth(true);
        this.labelHeight = elem.outerHeight(true);
        elem.remove();

        this.width = this.height = 0;
        if (this.position == 'left' || this.position == 'right') {
            this.width = this.labelWidth + this.padding;
        } else {
            this.height = this.labelHeight + this.padding;
        }
    };

    HtmlAxisLabel.prototype.draw = function(box) {
        this.plot.getPlaceholder().find('.' + this.axisName + 'Label').remove();
        var elem = $('<div class="axisLabels ' + this.axisName + 'Label" style="position:absolute; background-color:#fff;"/>');
        elem.html(this.opts.axisLabel);
        this.plot.getPlaceholder().append(elem);
        if (this.position == 'top') {
            elem.css('left', box.left + box.width/2 - this.labelWidth/2 + 'px');
            elem.css('top', box.top + 'px');
        } else if (this.position == 'bottom') {
            elem.css('left', box.left + box.width/2 - this.labelWidth/2 + 'px');
            elem.css('top', box.top + box.height - this.labelHeight + 'px');
        } else if (this.position == 'left') {
            elem.css('top', box.top + box.height/2 - this.labelHeight/2 + 'px');
            elem.css('left', box.left + 'px');
        } else if (this.position == 'right') {
            elem.css('top', box.top + box.height/2 - this.labelHeight/2 + 'px');
            elem.css('left', box.left + box.width - this.labelWidth + 'px');
        }
    };

    /* *************************************************** */

    CssTransformAxisLabel.prototype = new HtmlAxisLabel();
    CssTransformAxisLabel.prototype.constructor = CssTransformAxisLabel;
    function CssTransformAxisLabel(axisName, position, padding, plot, opts) {
        HtmlAxisLabel.prototype.constructor.call(this, axisName, position,
                                                 padding, plot, opts);
    }

    CssTransformAxisLabel.prototype.calculateSize = function() {
        HtmlAxisLabel.prototype.calculateSize.call(this);
        this.width = this.height = 0;
        if (this.position == 'left' || this.position == 'right') {
            this.width = this.labelHeight + this.padding;
        } else {
            this.height = this.labelHeight + this.padding;
        }
    };

    CssTransformAxisLabel.prototype.transforms = function(degrees, x, y) {
        var stransforms = {
            '-moz-transform': '',
            '-webkit-transform': '',
            '-o-transform': '',
            '-ms-transform': ''
        };
        if (x != 0 || y != 0) {
            var stdTranslate = ' translate(' + x + 'px, ' + y + 'px)';
            stransforms['-moz-transform'] += stdTranslate;
            stransforms['-webkit-transform'] += stdTranslate;
            stransforms['-o-transform'] += stdTranslate;
            stransforms['-ms-transform'] += stdTranslate;
        }
        if (degrees != 0) {
            var rotation = degrees / 90;
            var stdRotate = ' rotate(' + degrees + 'deg)';
            stransforms['-moz-transform'] += stdRotate;
            stransforms['-webkit-transform'] += stdRotate;
            stransforms['-o-transform'] += stdRotate;
            stransforms['-ms-transform'] += stdRotate;
        }
        var s = 'top: 0; left: 0; ';
        for (var prop in stransforms) {
            if (stransforms[prop]) {
                s += prop + ':' + stransforms[prop] + ';';
            }
        }
        s += ';';
        return s;
    };

    CssTransformAxisLabel.prototype.calculateOffsets = function(box) {
        var offsets = { x: 0, y: 0, degrees: 0 };
        if (this.position == 'bottom') {
            // fix by ejvos: put on bottom
            offsets.x = box.left + box.width/2 - this.labelWidth/2;
            offsets.y = box.top + box.height;
        } else if (this.position == 'top') {
            // fix by ejvos: put on top
            offsets.x = box.left + box.width/2 - this.labelWidth/2;
            offsets.y = box.top - this.labelHeight;
        } else if (this.position == 'left') {
            offsets.degrees = -90;
            // fix by ejvos: put left of label box
            // note: rotation is around center
            offsets.x = box.left - this.labelWidth/2 - this.labelHeight/2;
            offsets.y = box.height/2 + box.top;
        } else if (this.position == 'right') {
            // fix by ejvos: put on full right
            offsets.degrees = 90;
            offsets.x = box.left + box.width + this.labelWidth/2 + this.labelHeight/2;
            offsets.y = box.height/2 + box.top;
        }
        return offsets;
    };

    CssTransformAxisLabel.prototype.draw = function(box) {
        this.plot.getPlaceholder().find("." + this.axisName + "Label").remove();
        var offsets = this.calculateOffsets(box);
        var elem = $('<div class="axisLabels ' + this.axisName +
                     'Label" style="position:absolute; ' +
                     'color: ' + this.opts.color + '; ' +
                     this.transforms(offsets.degrees, offsets.x, offsets.y) +
                     '"/>');
        elem.html(this.opts.axisLabel);
        this.plot.getPlaceholder().append(elem);
    };

    /* *************************************************** */

    IeTransformAxisLabel.prototype = new CssTransformAxisLabel();
    IeTransformAxisLabel.prototype.constructor = IeTransformAxisLabel;
    function IeTransformAxisLabel(axisName, position, padding, plot, opts) {
        CssTransformAxisLabel.prototype.constructor.call(this, axisName,
                                                         position, padding,
                                                         plot, opts);
        this.requiresResize = false;
    }

    IeTransformAxisLabel.prototype.transforms = function(degrees, x, y) {
        // I didn't feel like learning the crazy Matrix stuff, so this uses
        // a combination of the rotation transform and CSS positioning.
        var s = '';
        if (degrees != 0) {
            var rotation = degrees/90;
            while (rotation < 0) {
                rotation += 4;
            }
            s += ' filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=' + rotation + '); ';
            // fix by ejvos: IE's rendering is unreadable without this
            s += ' zoom:1; background-color:white; ';
            // see below
            this.requiresResize = (this.position == 'right');
        }
        if (x != 0) {
            s += 'left: ' + x + 'px; ';
        }
        if (y != 0) {
            s += 'top: ' + y + 'px; ';
        }
        return s;
    };

    IeTransformAxisLabel.prototype.calculateOffsets = function(box) {
        // note: used by CssTransformAxisLabel.draw
        var offsets = CssTransformAxisLabel.prototype.calculateOffsets.call(
                          this, box);
        // adjust some values to take into account differences between
        // CSS and IE rotations.
        if (this.position == 'top') {
            // FIXME: not sure why, but placing this exactly at the top causes 
            // the top axis label to flip to the bottom...
            offsets.y = box.top + 1;
        } else if (this.position == 'left') {
            // fix by ejvos: put on left
            offsets.x = box.left - this.labelHeight;
            offsets.y = box.height/2 + box.top - this.labelWidth/2;
        } else if (this.position == 'right') {
            // fix by ejvos: put on right
            offsets.x = box.left + box.width + this.labelHeight;
            offsets.y = box.height/2 + box.top - this.labelWidth/2;
        }
        return offsets;
    };

    IeTransformAxisLabel.prototype.draw = function(box) {
        // apply superclass draw method
        CssTransformAxisLabel.prototype.draw.call(this, box);
        if (this.requiresResize) {
            var elem = this.plot.getPlaceholder().find("." + this.axisName + "Label");
            // Since we used CSS positioning instead of transforms for
            // translating the element, and since the positioning is done
            // before any rotations, we have to reset the width and height
            // in case the browser wrapped the text (specifically for the
            // y2axis).
            elem.css('width', this.labelWidth);
            elem.css('height', this.labelHeight);
        }
    };

    // determine renderer class
    var renderer = null;
    var optsAxisLabelTryRotate = true;
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var rv = null;
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null) {
            rv = parseFloat(RegExp.$1);
        }
        if (optsAxisLabelTryRotate) {
            if (rv >= 9) { renderer = CssTransformAxisLabel; }
            else         { renderer = IeTransformAxisLabel; }
        }
        else {
            renderer = HtmlAxisLabel;
        }
    }
    else {
        if (optsAxisLabelTryRotate && css3TransitionSupported()) {
            renderer = CssTransformAxisLabel;
        }
        else {
            renderer = HtmlAxisLabel;
        }
    }

    function init(plot) {
        var sizesCalculated = false;
        var axisLabels = {};
        var axisOffsetCounts = { left: 0, right: 0, top: 0, bottom: 0 };
        var defaultPadding = 2;  // padding between axis and tick labels

        plot.hooks.draw.push(function (plot, ctx) {
            // MEASURE AND SET OPTIONS
            if (!sizesCalculated) {
                $.each(plot.getAxes(), function(axisName, axis) {
                    var opts = axis.options // Flot 0.7
                        || plot.getOptions()[axisName]; // Flot 0.6
                    if (!opts || !opts.axisLabel || !axis.show)
                        return;

                    var padding = opts.axisLabelPadding === undefined ?
                                  defaultPadding : opts.axisLabelPadding;

                    axisLabels[axisName] = new renderer(axisName,
                                                        axis.position, padding,
                                                        plot, opts);

                    axisLabels[axisName].calculateSize();

                    // AxisLabel.height and .width are the size of the
                    // axis label and padding.
                    //axis.labelHeight += axisLabels[axisName].height;
                    //axis.labelWidth += axisLabels[axisName].width;
                    //opts.labelHeight = axis.labelHeight;
                    //opts.labelWidth = axis.labelWidth;
                });
                sizesCalculated = true;
            }
            // DRAW
            $.each(plot.getAxes(), function(axisName, axis) {
                var opts = axis.options // Flot 0.7
                    || plot.getOptions()[axisName]; // Flot 0.6
                if (!opts || !opts.axisLabel || !axis.show)
                    return;
                axisLabels[axisName].draw(axis.box);
            });
        });
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'axisLabels',
        version: '2.0b0-nens'
    });
})(jQuery);
