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
        firstChange = this.remaining() % this.period();

    self.render();

    if (this.period() === false) {
      return;
    }

    setTimeout(function() {
      self.render();
      self.trigger();
      self.nextCall();
    }, firstChange );
  };

  Countdown.prototype.nextCall = function() {
    var self = this;

    if (this.period() === false) {
      return;
    }

    setTimeout(function() {
      self.render();
      self.trigger()
      self.nextCall();
    }, this.period());
  };

  Countdown.prototype.render = function() {
    var left = this.sRemaining(),
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

  Countdown.prototype.trigger = function() {
    if (this.period()) {
      this.el.trigger('countdownOnChange', this.period());
      this.conf["onChange"].call(this);
    } else {
      this.conf["onEnd"].call(this);
      this.el.trigger('countdownOnEnd');
    }
  }

  Countdown.prototype.template = function () {
    var templates = this.conf["templates"],
        applicableTemplate = '',
        applicableTemplatePrio = -1;

    /* static template */
    if (typeof(templates) === "string") {
      return templates;
    }

    if (this.period() === false) {
      return templates["end"];
    }

    /* variable template */
    for (key in templates) {
      if ( parseInt(key) <= this.sRemaining() && parseInt(key) > applicableTemplatePrio ) {
        applicableTemplatePrio = key;
        applicableTemplate = templates[key];
      }
    }

    return applicableTemplate;
  };

  Countdown.prototype.period = function() {
    var interval = this.conf["interval"];

    if (this.remaining() < 0) {
      return false;
    }

    return interval * 1000;
  };

  /* returns msseconds left */
  Countdown.prototype.remaining = function() {
    return this.ends - new Date();
  };

  Countdown.prototype.sRemaining = function() {
    return Math.ceil(this.remaining() / 1000);
  };

  $.fn.countdown = function(options) {
    var settings = $.extend({
      interval: 1,
      templates: {
        86400: "#{ (this.d == 1) ? this.d + ' day': this.d + ' days' } left",
        3600: "#{ (this.h == 1) ? this.h + ' hour': this.h + ' hours' } left",
        60: "#{ (this.m == 1) ? this.m + ' minute': this.m + ' minutes' } left",
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
