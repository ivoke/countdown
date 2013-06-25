;(function($) {

  /* templating function https://gist.github.com/jed/964762 */
  var templ = function(a,b){return function(c,d){return a.replace(/#{([^}]*)}/g,function(a,e){return Function("x","with(x)return "+e).call(c,d||b||{})})}};

  function Countdown(el, conf) {
    this.el = el;
    this.conf = conf;
    this.ends = Date.parse(conf["zero"]);
    this.init();
  }

  Countdown.prototype.init = function() {
    var self = this,
        firstChange = this.left() % this.period();

    self.render();

    if (this.period() === false) {
      return;
    }

    setTimeout(function() {
      console.dir(new Date().toLocaleString());

      self.render();
      self.nextCall();
    }, firstChange );
  };

  Countdown.prototype.nextCall = function() {
    var self = this;

    if (this.period() === false) {
      return;
    }

    setTimeout(function() {
      console.dir(new Date().toLocaleString());
      self.render();
      self.nextCall();
    }, self.period());
  };

  Countdown.prototype.render = function() {
    var left = this.sLeft(),
        cTemplate = templ(this.template()),
        daysLeft, hoursLeft, minutesLeft, secondsLeft;

    daysLeft = Math.floor(left / 86400);
    left = left % 86400;
    hoursLeft = Math.floor(left / 3600);
    left = left % 3600;
    minutesLeft = Math.floor(left / 60);
    left = left % 60;
    secondsLeft = left;

    this.el.html(cTemplate({
      d: daysLeft,
      h: hoursLeft,
      m: minutesLeft,
      s: secondsLeft
    }));
  };

  Countdown.prototype.template = function () {
    var templates = this.conf["templates"],
        applicableTemplate,
        applicableTemplatePrio = 0;

    /* static template */
    if (typeof(templates) === "string") {
      return templates;
    }

    if (this.period() === false) {
      return templates["end"];
    }

    /* variable template */
    for (key in templates) {
      if ( parseInt(key) < this.sLeft() && parseInt(key) > applicableTemplatePrio ) {
        applicableTemplatePrio = key;
        applicableTemplate = templates[key];
      }
    }

    return applicableTemplate;
  };

  Countdown.prototype.period = function() {
    var intervals = this.conf["intervals"],
        applicablePeriods = [];

    if (this.left() < 0) {
      return false;
    }

    /* static period */
    if (typeof(intervals) === "number" || typeof(intervals) === "string") {
      return parseInt(intervals) * 1000;
    }

    /* variable period */
    for (key in intervals) {
      if (parseInt(key) <= this.left() / 1000 ) {
        applicablePeriods.push(intervals[key]);
      }
    }

    return Math.max.apply(null, applicablePeriods) * 1000;
  };

  /* returns msseconds left */
  Countdown.prototype.left = function() {
    return this.ends - new Date();
  };

  Countdown.prototype.sLeft = function() {
    return Math.ceil(this.left() / 1000);
  };

  $.fn.countdown = function(options) {
    var settings = $.extend({
      intervals: { 3600: 3600, 60: 60, 1: 1},
      templates: {
        3599: "#{ (this.h == 1) ? this.h + ' hour': this.h + ' hours' } left",
        59: "#{ (this.m == 1) ? this.m + ' minute': this.m + ' minutes' } left",
        0: "#{ (this.s == 1) ? this.s + ' second': this.s + ' seconds' } left",
        end: "ended"
      },
      onChange: $.noop(),
      onEnd: $.noop()
    }, options );

    this.each(function() {

      var el = $(this),
          settings_per_el = $.extend({}, settings);

      /* merge data-attributes */
      $.each(["zero"], function(key, dataAttr) {
        var value = el.data(dataAttr);

        if (value) {
          settings_per_el[dataAttr] = value;
        }

      });

      el.data('cnd', new Countdown(el, settings_per_el));
    })

    return this;
  };

}(jQuery));
