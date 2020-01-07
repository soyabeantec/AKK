/**!
 * behave - 2015-11-12
 * https://github.com/tableau-mkt/behave
 * Copyright (c) 2015 Joel Walters <jwalters@tableau.com>
 * License: GPL2
 */
var Drupal=window.Drupal||{settings:{},behaviors:{},locale:{}};!function(a){Drupal.behave=function(b,c){var d,e,f={only:document};if(Drupal.behaviors[b]=Drupal.behaviors[b]||{},d=Drupal.behaviors[b],d.name=b,d._behave={options:a.extend({},f,c)},e=d._behave,!b||"string"!=typeof b)throw"name required (as type String)";return d.attach=function(b,c){e.options.only&&b!==e.options.only||("function"==typeof e.attach&&e.attach.call(this,b,c,a,d),"function"==typeof e.ready&&e.ready.call({context:b,settings:c,behavior:d},a))},d.detach=function(b,c,d){"function"==typeof e.detach&&e.detach.call(this,b,c,d,a)},e.api={attach:function(a){return e.attach=a,e.api},detach:function(a){return e.detach=a,e.api},ready:function(a){return e.ready=a,e.api},behave:function(){return e},behavior:function(){return d},extend:function(b){return a.extend(d,b),e.api}},e.api}}(jQuery);;
/**
 * Global, client-side behaviors for the TabWow theme.
 * Included early in the page, immediately after jQuery (behave).
 */

Drupal.behave('tabwowSearch', {only: false}).ready(function($) {
  var $searchForms = $('.google-appliance-block-form, .search-google-appliance-search-form');

  // Use jquery.once to ensure we don't attach event listeners multiple times.
  $searchForms.once('search-forms', function() {
    var $form = $(this),
        $searchInput = $form.find('input[name="search_keys"]');

    // Prevent submit when search input is empty.
    $form.submit(function() {
      // If search query is empty, prevent submit and stop propagation.
      if (!$(this).find('input[name="search_keys"]').val().length) {
        return false;
      }
    });

    // Prevent mousedown when search input is empty.
    $form.find('.content-search__submit').mousedown(function(e) {
      if (!$searchInput.val().length) {
        e.stopImmediatePropagation();
        return false;
      }
    });

    // Prevent ENTER key when search input is empty.
    $searchInput
      .bind('keypress.tabwow keydown.tabwow keyup.tabwow', function(e) {
        if (e.which === 13 && !$(this).val().length) {
          e.stopImmediatePropagation();
          return false;
        }
      });
  });
});
;
(function ($) {

/**
 * Attaches the autocomplete behavior to all required fields.
 */
Drupal.behaviors.autocomplete = {
  attach: function (context, settings) {
    var acdb = [];
    $('input.autocomplete', context).once('autocomplete', function () {
      var uri = this.value;
      if (!acdb[uri]) {
        acdb[uri] = new Drupal.ACDB(uri);
      }
      var $input = $('#' + this.id.substr(0, this.id.length - 13))
        .attr('autocomplete', 'OFF')
        .attr('aria-autocomplete', 'list');
      $($input[0].form).submit(Drupal.autocompleteSubmit);
      $input.parent()
        .attr('role', 'application')
        .append($('<span class="element-invisible" aria-live="assertive"></span>')
          .attr('id', $input.attr('id') + '-autocomplete-aria-live')
        );
      new Drupal.jsAC($input, acdb[uri]);
    });
  }
};

/**
 * Prevents the form from submitting if the suggestions popup is open
 * and closes the suggestions popup when doing so.
 */
Drupal.autocompleteSubmit = function () {
  return $('#autocomplete').each(function () {
    this.owner.hidePopup();
  }).length == 0;
};

/**
 * An AutoComplete object.
 */
Drupal.jsAC = function ($input, db) {
  var ac = this;
  this.input = $input[0];
  this.ariaLive = $('#' + this.input.id + '-autocomplete-aria-live');
  this.db = db;

  $input
    .keydown(function (event) { return ac.onkeydown(this, event); })
    .keyup(function (event) { ac.onkeyup(this, event); })
    .blur(function () { ac.hidePopup(); ac.db.cancel(); });

};

/**
 * Handler for the "keydown" event.
 */
Drupal.jsAC.prototype.onkeydown = function (input, e) {
  if (!e) {
    e = window.event;
  }
  switch (e.keyCode) {
    case 40: // down arrow.
      this.selectDown();
      return false;
    case 38: // up arrow.
      this.selectUp();
      return false;
    default: // All other keys.
      return true;
  }
};

/**
 * Handler for the "keyup" event.
 */
Drupal.jsAC.prototype.onkeyup = function (input, e) {
  if (!e) {
    e = window.event;
  }
  switch (e.keyCode) {
    case 16: // Shift.
    case 17: // Ctrl.
    case 18: // Alt.
    case 20: // Caps lock.
    case 33: // Page up.
    case 34: // Page down.
    case 35: // End.
    case 36: // Home.
    case 37: // Left arrow.
    case 38: // Up arrow.
    case 39: // Right arrow.
    case 40: // Down arrow.
      return true;

    case 9:  // Tab.
    case 13: // Enter.
    case 27: // Esc.
      this.hidePopup(e.keyCode);
      return true;

    default: // All other keys.
      if (input.value.length > 0 && !input.readOnly) {
        this.populatePopup();
      }
      else {
        this.hidePopup(e.keyCode);
      }
      return true;
  }
};

/**
 * Puts the currently highlighted suggestion into the autocomplete field.
 */
Drupal.jsAC.prototype.select = function (node) {
  this.input.value = $(node).data('autocompleteValue');
  $(this.input).trigger('autocompleteSelect', [node]);
};

/**
 * Highlights the next suggestion.
 */
Drupal.jsAC.prototype.selectDown = function () {
  if (this.selected && this.selected.nextSibling) {
    this.highlight(this.selected.nextSibling);
  }
  else if (this.popup) {
    var lis = $('li', this.popup);
    if (lis.length > 0) {
      this.highlight(lis.get(0));
    }
  }
};

/**
 * Highlights the previous suggestion.
 */
Drupal.jsAC.prototype.selectUp = function () {
  if (this.selected && this.selected.previousSibling) {
    this.highlight(this.selected.previousSibling);
  }
};

/**
 * Highlights a suggestion.
 */
Drupal.jsAC.prototype.highlight = function (node) {
  if (this.selected) {
    $(this.selected).removeClass('selected');
  }
  $(node).addClass('selected');
  this.selected = node;
  $(this.ariaLive).html($(this.selected).html());
};

/**
 * Unhighlights a suggestion.
 */
Drupal.jsAC.prototype.unhighlight = function (node) {
  $(node).removeClass('selected');
  this.selected = false;
  $(this.ariaLive).empty();
};

/**
 * Hides the autocomplete suggestions.
 */
Drupal.jsAC.prototype.hidePopup = function (keycode) {
  // Select item if the right key or mousebutton was pressed.
  if (this.selected && ((keycode && keycode != 46 && keycode != 8 && keycode != 27) || !keycode)) {
    this.select(this.selected);
  }
  // Hide popup.
  var popup = this.popup;
  if (popup) {
    this.popup = null;
    $(popup).fadeOut('fast', function () { $(popup).remove(); });
  }
  this.selected = false;
  $(this.ariaLive).empty();
};

/**
 * Positions the suggestions popup and starts a search.
 */
Drupal.jsAC.prototype.populatePopup = function () {
  var $input = $(this.input);
  var position = $input.position();
  // Show popup.
  if (this.popup) {
    $(this.popup).remove();
  }
  this.selected = false;
  this.popup = $('<div id="autocomplete"></div>')[0];
  this.popup.owner = this;
  $(this.popup).css({
    top: parseInt(position.top + this.input.offsetHeight, 10) + 'px',
    left: parseInt(position.left, 10) + 'px',
    width: $input.innerWidth() + 'px',
    display: 'none'
  });
  $input.before(this.popup);

  // Do search.
  this.db.owner = this;
  this.db.search(this.input.value);
};

/**
 * Fills the suggestion popup with any matches received.
 */
Drupal.jsAC.prototype.found = function (matches) {
  // If no value in the textfield, do not show the popup.
  if (!this.input.value.length) {
    return false;
  }

  // Prepare matches.
  var ul = $('<ul></ul>');
  var ac = this;
  for (key in matches) {
    $('<li></li>')
      .html($('<div></div>').html(matches[key]))
      .mousedown(function () { ac.hidePopup(this); })
      .mouseover(function () { ac.highlight(this); })
      .mouseout(function () { ac.unhighlight(this); })
      .data('autocompleteValue', key)
      .appendTo(ul);
  }

  // Show popup with matches, if any.
  if (this.popup) {
    if (ul.children().length) {
      $(this.popup).empty().append(ul).show();
      $(this.ariaLive).html(Drupal.t('Autocomplete popup'));
    }
    else {
      $(this.popup).css({ visibility: 'hidden' });
      this.hidePopup();
    }
  }
};

Drupal.jsAC.prototype.setStatus = function (status) {
  switch (status) {
    case 'begin':
      $(this.input).addClass('throbbing');
      $(this.ariaLive).html(Drupal.t('Searching for matches...'));
      break;
    case 'cancel':
    case 'error':
    case 'found':
      $(this.input).removeClass('throbbing');
      break;
  }
};

/**
 * An AutoComplete DataBase object.
 */
Drupal.ACDB = function (uri) {
  this.uri = uri;
  this.delay = 300;
  this.cache = {};
};

/**
 * Performs a cached and delayed search.
 */
Drupal.ACDB.prototype.search = function (searchString) {
  var db = this;
  this.searchString = searchString;

  // See if this string needs to be searched for anyway. The pattern ../ is
  // stripped since it may be misinterpreted by the browser.
  searchString = searchString.replace(/^\s+|\.{2,}\/|\s+$/g, '');
  // Skip empty search strings, or search strings ending with a comma, since
  // that is the separator between search terms.
  if (searchString.length <= 0 ||
    searchString.charAt(searchString.length - 1) == ',') {
    return;
  }

  // See if this key has been searched for before.
  if (this.cache[searchString]) {
    return this.owner.found(this.cache[searchString]);
  }

  // Initiate delayed search.
  if (this.timer) {
    clearTimeout(this.timer);
  }
  this.timer = setTimeout(function () {
    db.owner.setStatus('begin');

    // Ajax GET request for autocompletion. We use Drupal.encodePath instead of
    // encodeURIComponent to allow autocomplete search terms to contain slashes.
    $.ajax({
      type: 'GET',
      url: db.uri + '/' + Drupal.encodePath(searchString),
      dataType: 'json',
      success: function (matches) {
        if (typeof matches.status == 'undefined' || matches.status != 0) {
          db.cache[searchString] = matches;
          // Verify if these are still the matches the user wants to see.
          if (db.searchString == searchString) {
            db.owner.found(matches);
          }
          db.owner.setStatus('found');
        }
      },
      error: function (xmlhttp) {
        Drupal.displayAjaxError(Drupal.ajaxError(xmlhttp, db.uri));
      }
    });
  }, this.delay);
};

/**
 * Cancels the current autocomplete request.
 */
Drupal.ACDB.prototype.cancel = function () {
  if (this.owner) this.owner.setStatus('cancel');
  if (this.timer) clearTimeout(this.timer);
  this.searchString = '';
};

})(jQuery);
;
/*! lazysizes - v4.0.0-rc3 */
!function(a,b){var c=b(a,a.document);a.lazySizes=c,"object"==typeof module&&module.exports&&(module.exports=c)}(window,function(a,b){"use strict";if(b.getElementsByClassName){var c,d,e=b.documentElement,f=a.Date,g=a.HTMLPictureElement,h="addEventListener",i="getAttribute",j=a[h],k=a.setTimeout,l=a.requestAnimationFrame||k,m=a.requestIdleCallback,n=/^picture$/i,o=["load","error","lazyincluded","_lazyloaded"],p={},q=Array.prototype.forEach,r=function(a,b){return p[b]||(p[b]=new RegExp("(\\s|^)"+b+"(\\s|$)")),p[b].test(a[i]("class")||"")&&p[b]},s=function(a,b){r(a,b)||a.setAttribute("class",(a[i]("class")||"").trim()+" "+b)},t=function(a,b){var c;(c=r(a,b))&&a.setAttribute("class",(a[i]("class")||"").replace(c," "))},u=function(a,b,c){var d=c?h:"removeEventListener";c&&u(a,b),o.forEach(function(c){a[d](c,b)})},v=function(a,d,e,f,g){var h=b.createEvent("CustomEvent");return e||(e={}),e.instance=c,h.initCustomEvent(d,!f,!g,e),a.dispatchEvent(h),h},w=function(b,c){var e;!g&&(e=a.picturefill||d.pf)?e({reevaluate:!0,elements:[b]}):c&&c.src&&(b.src=c.src)},x=function(a,b){return(getComputedStyle(a,null)||{})[b]},y=function(a,b,c){for(c=c||a.offsetWidth;c<d.minSize&&b&&!a._lazysizesWidth;)c=b.offsetWidth,b=b.parentNode;return c},z=function(){var a,c,d=[],e=[],f=d,g=function(){var b=f;for(f=d.length?e:d,a=!0,c=!1;b.length;)b.shift()();a=!1},h=function(d,e){a&&!e?d.apply(this,arguments):(f.push(d),c||(c=!0,(b.hidden?k:l)(g)))};return h._lsFlush=g,h}(),A=function(a,b){return b?function(){z(a)}:function(){var b=this,c=arguments;z(function(){a.apply(b,c)})}},B=function(a){var b,c=0,d=125,e=666,g=e,h=function(){b=!1,c=f.now(),a()},i=m?function(){m(h,{timeout:g}),g!==e&&(g=e)}:A(function(){k(h)},!0);return function(a){var e;(a=a===!0)&&(g=44),b||(b=!0,e=d-(f.now()-c),0>e&&(e=0),a||9>e&&m?i():k(i,e))}},C=function(a){var b,c,d=99,e=function(){b=null,a()},g=function(){var a=f.now()-c;d>a?k(g,d-a):(m||e)(e)};return function(){c=f.now(),b||(b=k(g,d))}},D=function(){var g,l,m,o,p,y,D,F,G,H,I,J,K,L,M=/^img$/i,N=/^iframe$/i,O="onscroll"in a&&!/glebot/.test(navigator.userAgent),P=0,Q=0,R=0,S=-1,T=function(a){R--,a&&a.target&&u(a.target,T),(!a||0>R||!a.target)&&(R=0)},U=function(a,c){var d,f=a,g="hidden"==x(b.body,"visibility")||"hidden"!=x(a,"visibility");for(F-=c,I+=c,G-=c,H+=c;g&&(f=f.offsetParent)&&f!=b.body&&f!=e;)g=(x(f,"opacity")||1)>0,g&&"visible"!=x(f,"overflow")&&(d=f.getBoundingClientRect(),g=H>d.left&&G<d.right&&I>d.top-1&&F<d.bottom+1);return g},V=function(){var a,f,h,j,k,m,n,p,q,r=c.elements;if((o=d.loadMode)&&8>R&&(a=r.length)){f=0,S++,null==K&&("expand"in d||(d.expand=e.clientHeight>500&&e.clientWidth>500?500:370),J=d.expand,K=J*d.expFactor),K>Q&&1>R&&S>2&&o>2&&!b.hidden?(Q=K,S=0):Q=o>1&&S>1&&6>R?J:P;for(;a>f;f++)if(r[f]&&!r[f]._lazyRace)if(O)if((p=r[f][i]("data-expand"))&&(m=1*p)||(m=Q),q!==m&&(y=innerWidth+m*L,D=innerHeight+m,n=-1*m,q=m),h=r[f].getBoundingClientRect(),(I=h.bottom)>=n&&(F=h.top)<=D&&(H=h.right)>=n*L&&(G=h.left)<=y&&(I||H||G||F)&&(d.loadHidden||"hidden"!=x(r[f],"visibility"))&&(l&&3>R&&!p&&(3>o||4>S)||U(r[f],m))){if(ba(r[f]),k=!0,R>9)break}else!k&&l&&!j&&4>R&&4>S&&o>2&&(g[0]||d.preloadAfterLoad)&&(g[0]||!p&&(I||H||G||F||"auto"!=r[f][i](d.sizesAttr)))&&(j=g[0]||r[f]);else ba(r[f]);j&&!k&&ba(j)}},W=B(V),X=function(a){s(a.target,d.loadedClass),t(a.target,d.loadingClass),u(a.target,Z),v(a.target,"lazyloaded")},Y=A(X),Z=function(a){Y({target:a.target})},$=function(a,b){try{a.contentWindow.location.replace(b)}catch(c){a.src=b}},_=function(a){var b,c=a[i](d.srcsetAttr);(b=d.customMedia[a[i]("data-media")||a[i]("media")])&&a.setAttribute("media",b),c&&a.setAttribute("srcset",c)},aa=A(function(a,b,c,e,f){var g,h,j,l,o,p;(o=v(a,"lazybeforeunveil",b)).defaultPrevented||(e&&(c?s(a,d.autosizesClass):a.setAttribute("sizes",e)),h=a[i](d.srcsetAttr),g=a[i](d.srcAttr),f&&(j=a.parentNode,l=j&&n.test(j.nodeName||"")),p=b.firesLoad||"src"in a&&(h||g||l),o={target:a},p&&(u(a,T,!0),clearTimeout(m),m=k(T,2500),s(a,d.loadingClass),u(a,Z,!0)),l&&q.call(j.getElementsByTagName("source"),_),h?a.setAttribute("srcset",h):g&&!l&&(N.test(a.nodeName)?$(a,g):a.src=g),f&&(h||l)&&w(a,{src:g})),a._lazyRace&&delete a._lazyRace,t(a,d.lazyClass),z(function(){(!p||a.complete&&a.naturalWidth>1)&&(p?T(o):R--,X(o))},!0)}),ba=function(a){var b,c=M.test(a.nodeName),e=c&&(a[i](d.sizesAttr)||a[i]("sizes")),f="auto"==e;(!f&&l||!c||!a[i]("src")&&!a.srcset||a.complete||r(a,d.errorClass))&&(b=v(a,"lazyunveilread").detail,f&&E.updateElem(a,!0,a.offsetWidth),a._lazyRace=!0,R++,aa(a,b,f,e,c))},ca=function(){if(!l){if(f.now()-p<999)return void k(ca,999);var a=C(function(){d.loadMode=3,W()});l=!0,d.loadMode=3,W(),j("scroll",function(){3==d.loadMode&&(d.loadMode=2),a()},!0)}};return{_:function(){p=f.now(),c.elements=b.getElementsByClassName(d.lazyClass),g=b.getElementsByClassName(d.lazyClass+" "+d.preloadClass),L=d.hFac,j("scroll",W,!0),j("resize",W,!0),a.MutationObserver?new MutationObserver(W).observe(e,{childList:!0,subtree:!0,attributes:!0}):(e[h]("DOMNodeInserted",W,!0),e[h]("DOMAttrModified",W,!0),setInterval(W,999)),j("hashchange",W,!0),["focus","mouseover","click","load","transitionend","animationend","webkitAnimationEnd"].forEach(function(a){b[h](a,W,!0)}),/d$|^c/.test(b.readyState)?ca():(j("load",ca),b[h]("DOMContentLoaded",W),k(ca,2e4)),c.elements.length?(V(),z._lsFlush()):W()},checkElems:W,unveil:ba}}(),E=function(){var a,c=A(function(a,b,c,d){var e,f,g;if(a._lazysizesWidth=d,d+="px",a.setAttribute("sizes",d),n.test(b.nodeName||""))for(e=b.getElementsByTagName("source"),f=0,g=e.length;g>f;f++)e[f].setAttribute("sizes",d);c.detail.dataAttr||w(a,c.detail)}),e=function(a,b,d){var e,f=a.parentNode;f&&(d=y(a,f,d),e=v(a,"lazybeforesizes",{width:d,dataAttr:!!b}),e.defaultPrevented||(d=e.detail.width,d&&d!==a._lazysizesWidth&&c(a,f,e,d)))},f=function(){var b,c=a.length;if(c)for(b=0;c>b;b++)e(a[b])},g=C(f);return{_:function(){a=b.getElementsByClassName(d.autosizesClass),j("resize",g)},checkElems:g,updateElem:e}}(),F=function(){F.i||(F.i=!0,E._(),D._())};return function(){var b,c={lazyClass:"lazyload",loadedClass:"lazyloaded",loadingClass:"lazyloading",preloadClass:"lazypreload",errorClass:"lazyerror",autosizesClass:"lazyautosizes",srcAttr:"data-src",srcsetAttr:"data-srcset",sizesAttr:"data-sizes",minSize:40,customMedia:{},init:!0,expFactor:1.5,hFac:.8,loadMode:2,loadHidden:!0};d=a.lazySizesConfig||a.lazysizesConfig||{};for(b in c)b in d||(d[b]=c[b]);a.lazySizesConfig=d,k(function(){d.init&&F()})}(),c={cfg:d,autoSizer:E,loader:D,init:F,uP:w,aC:s,rC:t,hC:r,fire:v,gW:y,rAF:z}}});;
var Tabia=window.Tabia||{};!function(Tabia){var userData={};$(function(){window.groucho&&window.newrelic&&(userData.ip=groucho.userGet("ip"),userData.ip&&newrelic.setCustomAttribute("ip",userData.ip))}),Tabia.debug=function(message,options){Tabia.log(message,_.extend(options||{},{severity:7}))},Tabia.notice=function(message,options){Tabia.log(message,_.extend(options||{},{severity:5}))},Tabia.warning=function(message,options){Tabia.log(message,_.extend(options||{},{severity:4}))},Tabia.error=function(message,options){Tabia.log(message,_.extend(options||{},{severity:3}))},Tabia.log=function(message,options){var err,severityStrings={7:"DEBUG",5:"NOTICE",4:"WARNING",3:"ERROR"},severity=options.severity||5,type=options.type||"watchLog",settings=Drupal.settings.tableauSite;if(severity<=settings.watchLogLevel){if(settings.watchLogDebug&&window.console&&window.console.debug){if(settings.watchLogDebugTrace)try{throw new Error(type+" | "+severityStrings[severity]+" | "+message)}catch(e){console.debug(e.stack)}else console.debug(type+" | "+severityStrings[severity]+" | "+message);options.data&&console.debug(options.data)}if(7===severity)return;window.NREUM&&severity<=settings.watchLogErrorLevel&&(err=new Error(type+" ("+severityStrings[severity]+") "+message),NREUM.noticeError(err)),Tabia.insightsLogger(_.extend({},options.data,{severity:severity,message:message}),options.type)}},Tabia.insightsLogger=function(data,type){window.newrelic&&(type=type||"logger",newrelic.addPageAction(type,data))},Tabia.insightsDecorator=function(name,value){window.newrelic&&newrelic.setCustomAttribute(name,value)}}(Tabia);;
var Tabia=window.Tabia||{};Tabia.mobileCheck=function(compareOSName){var parsedOSName,knownMobile=["android","ios","blackberry","windows mobile","windows phone"];try{return parsedOSName=UAParser().os.name.toLowerCase(),!!Modernizr.touchevents&&(compareOSName?Tabia.util.textEqual(parsedOSName,compareOSName):_.contains(knownMobile,parsedOSName))}catch(e){return Tabia.warning("Uncaught error: "+e.message,{type:"Tabia_mobileCheck"}),null}};;
/*!
Waypoints - 4.0.0
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blog/master/licenses.txt
*/
!function(){"use strict";function t(o){if(!o)throw new Error("No options passed to Waypoint constructor");if(!o.element)throw new Error("No element option passed to Waypoint constructor");if(!o.handler)throw new Error("No handler option passed to Waypoint constructor");this.key="waypoint-"+e,this.options=t.Adapter.extend({},t.defaults,o),this.element=this.options.element,this.adapter=new t.Adapter(this.element),this.callback=o.handler,this.axis=this.options.horizontal?"horizontal":"vertical",this.enabled=this.options.enabled,this.triggerPoint=null,this.group=t.Group.findOrCreate({name:this.options.group,axis:this.axis}),this.context=t.Context.findOrCreateByElement(this.options.context),t.offsetAliases[this.options.offset]&&(this.options.offset=t.offsetAliases[this.options.offset]),this.group.add(this),this.context.add(this),i[this.key]=this,e+=1}var e=0,i={};t.prototype.queueTrigger=function(t){this.group.queueTrigger(this,t)},t.prototype.trigger=function(t){this.enabled&&this.callback&&this.callback.apply(this,t)},t.prototype.destroy=function(){this.context.remove(this),this.group.remove(this),delete i[this.key]},t.prototype.disable=function(){return this.enabled=!1,this},t.prototype.enable=function(){return this.context.refresh(),this.enabled=!0,this},t.prototype.next=function(){return this.group.next(this)},t.prototype.previous=function(){return this.group.previous(this)},t.invokeAll=function(t){var e=[];for(var o in i)e.push(i[o]);for(var n=0,r=e.length;r>n;n++)e[n][t]()},t.destroyAll=function(){t.invokeAll("destroy")},t.disableAll=function(){t.invokeAll("disable")},t.enableAll=function(){t.invokeAll("enable")},t.refreshAll=function(){t.Context.refreshAll()},t.viewportHeight=function(){return window.innerHeight||document.documentElement.clientHeight},t.viewportWidth=function(){return document.documentElement.clientWidth},t.adapters=[],t.defaults={context:window,continuous:!0,enabled:!0,group:"default",horizontal:!1,offset:0},t.offsetAliases={"bottom-in-view":function(){return this.context.innerHeight()-this.adapter.outerHeight()},"right-in-view":function(){return this.context.innerWidth()-this.adapter.outerWidth()}},window.Waypoint=t}(),function(){"use strict";function t(t){window.setTimeout(t,1e3/60)}function e(t){this.element=t,this.Adapter=n.Adapter,this.adapter=new this.Adapter(t),this.key="waypoint-context-"+i,this.didScroll=!1,this.didResize=!1,this.oldScroll={x:this.adapter.scrollLeft(),y:this.adapter.scrollTop()},this.waypoints={vertical:{},horizontal:{}},t.waypointContextKey=this.key,o[t.waypointContextKey]=this,i+=1,this.createThrottledScrollHandler(),this.createThrottledResizeHandler()}var i=0,o={},n=window.Waypoint,r=window.onload;e.prototype.add=function(t){var e=t.options.horizontal?"horizontal":"vertical";this.waypoints[e][t.key]=t,this.refresh()},e.prototype.checkEmpty=function(){var t=this.Adapter.isEmptyObject(this.waypoints.horizontal),e=this.Adapter.isEmptyObject(this.waypoints.vertical);t&&e&&(this.adapter.off(".waypoints"),delete o[this.key])},e.prototype.createThrottledResizeHandler=function(){function t(){e.handleResize(),e.didResize=!1}var e=this;this.adapter.on("resize.waypoints",function(){e.didResize||(e.didResize=!0,n.requestAnimationFrame(t))})},e.prototype.createThrottledScrollHandler=function(){function t(){e.handleScroll(),e.didScroll=!1}var e=this;this.adapter.on("scroll.waypoints",function(){(!e.didScroll||n.isTouch)&&(e.didScroll=!0,n.requestAnimationFrame(t))})},e.prototype.handleResize=function(){n.Context.refreshAll()},e.prototype.handleScroll=function(){var t={},e={horizontal:{newScroll:this.adapter.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.adapter.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};for(var i in e){var o=e[i],n=o.newScroll>o.oldScroll,r=n?o.forward:o.backward;for(var s in this.waypoints[i]){var a=this.waypoints[i][s],l=o.oldScroll<a.triggerPoint,h=o.newScroll>=a.triggerPoint,p=l&&h,u=!l&&!h;(p||u)&&(a.queueTrigger(r),t[a.group.id]=a.group)}}for(var c in t)t[c].flushTriggers();this.oldScroll={x:e.horizontal.newScroll,y:e.vertical.newScroll}},e.prototype.innerHeight=function(){return this.element==this.element.window?n.viewportHeight():this.adapter.innerHeight()},e.prototype.remove=function(t){delete this.waypoints[t.axis][t.key],this.checkEmpty()},e.prototype.innerWidth=function(){return this.element==this.element.window?n.viewportWidth():this.adapter.innerWidth()},e.prototype.destroy=function(){var t=[];for(var e in this.waypoints)for(var i in this.waypoints[e])t.push(this.waypoints[e][i]);for(var o=0,n=t.length;n>o;o++)t[o].destroy()},e.prototype.refresh=function(){var t,e=this.element==this.element.window,i=e?void 0:this.adapter.offset(),o={};this.handleScroll(),t={horizontal:{contextOffset:e?0:i.left,contextScroll:e?0:this.oldScroll.x,contextDimension:this.innerWidth(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:e?0:i.top,contextScroll:e?0:this.oldScroll.y,contextDimension:this.innerHeight(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};for(var r in t){var s=t[r];for(var a in this.waypoints[r]){var l,h,p,u,c,d=this.waypoints[r][a],f=d.options.offset,w=d.triggerPoint,y=0,g=null==w;d.element!==d.element.window&&(y=d.adapter.offset()[s.offsetProp]),"function"==typeof f?f=f.apply(d):"string"==typeof f&&(f=parseFloat(f),d.options.offset.indexOf("%")>-1&&(f=Math.ceil(s.contextDimension*f/100))),l=s.contextScroll-s.contextOffset,d.triggerPoint=y+l-f,h=w<s.oldScroll,p=d.triggerPoint>=s.oldScroll,u=h&&p,c=!h&&!p,!g&&u?(d.queueTrigger(s.backward),o[d.group.id]=d.group):!g&&c?(d.queueTrigger(s.forward),o[d.group.id]=d.group):g&&s.oldScroll>=d.triggerPoint&&(d.queueTrigger(s.forward),o[d.group.id]=d.group)}}return n.requestAnimationFrame(function(){for(var t in o)o[t].flushTriggers()}),this},e.findOrCreateByElement=function(t){return e.findByElement(t)||new e(t)},e.refreshAll=function(){for(var t in o)o[t].refresh()},e.findByElement=function(t){return o[t.waypointContextKey]},window.onload=function(){r&&r(),e.refreshAll()},n.requestAnimationFrame=function(e){var i=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||t;i.call(window,e)},n.Context=e}(),function(){"use strict";function t(t,e){return t.triggerPoint-e.triggerPoint}function e(t,e){return e.triggerPoint-t.triggerPoint}function i(t){this.name=t.name,this.axis=t.axis,this.id=this.name+"-"+this.axis,this.waypoints=[],this.clearTriggerQueues(),o[this.axis][this.name]=this}var o={vertical:{},horizontal:{}},n=window.Waypoint;i.prototype.add=function(t){this.waypoints.push(t)},i.prototype.clearTriggerQueues=function(){this.triggerQueues={up:[],down:[],left:[],right:[]}},i.prototype.flushTriggers=function(){for(var i in this.triggerQueues){var o=this.triggerQueues[i],n="up"===i||"left"===i;o.sort(n?e:t);for(var r=0,s=o.length;s>r;r+=1){var a=o[r];(a.options.continuous||r===o.length-1)&&a.trigger([i])}}this.clearTriggerQueues()},i.prototype.next=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints),o=i===this.waypoints.length-1;return o?null:this.waypoints[i+1]},i.prototype.previous=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints);return i?this.waypoints[i-1]:null},i.prototype.queueTrigger=function(t,e){this.triggerQueues[e].push(t)},i.prototype.remove=function(t){var e=n.Adapter.inArray(t,this.waypoints);e>-1&&this.waypoints.splice(e,1)},i.prototype.first=function(){return this.waypoints[0]},i.prototype.last=function(){return this.waypoints[this.waypoints.length-1]},i.findOrCreate=function(t){return o[t.axis][t.name]||new i(t)},n.Group=i}(),function(){"use strict";function t(t){this.$element=e(t)}var e=window.jQuery,i=window.Waypoint;e.each(["innerHeight","innerWidth","off","offset","on","outerHeight","outerWidth","scrollLeft","scrollTop"],function(e,i){t.prototype[i]=function(){var t=Array.prototype.slice.call(arguments);return this.$element[i].apply(this.$element,t)}}),e.each(["extend","inArray","isEmptyObject"],function(i,o){t[o]=e[o]}),i.adapters.push({name:"jquery",Adapter:t}),i.Adapter=t}(),function(){"use strict";function t(t){return function(){var i=[],o=arguments[0];return t.isFunction(arguments[0])&&(o=t.extend({},arguments[1]),o.handler=arguments[0]),this.each(function(){var n=t.extend({},o,{element:this});"string"==typeof n.context&&(n.context=t(this).closest(n.context)[0]),i.push(new e(n))}),i}}var e=window.Waypoint;window.jQuery&&(window.jQuery.fn.waypoint=t(window.jQuery)),window.Zepto&&(window.Zepto.fn.waypoint=t(window.Zepto))}();;
/*!
Waypoints Sticky Element Shortcut - 4.0.0
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blog/master/licenses.txt
*/
!function(){"use strict";function t(s){this.options=e.extend({},i.defaults,t.defaults,s),this.element=this.options.element,this.$element=e(this.element),this.createWrapper(),this.createWaypoint()}var e=window.jQuery,i=window.Waypoint;t.prototype.createWaypoint=function(){var t=this.options.handler;this.waypoint=new i(e.extend({},this.options,{element:this.wrapper,handler:e.proxy(function(e){var i=this.options.direction.indexOf(e)>-1,s=i?this.$element.outerHeight(!0):"";this.$wrapper.height(s),this.$element.toggleClass(this.options.stuckClass,i),t&&t.call(this,e)},this)}))},t.prototype.createWrapper=function(){this.options.wrapper&&this.$element.wrap(this.options.wrapper),this.$wrapper=this.$element.parent(),this.wrapper=this.$wrapper[0]},t.prototype.destroy=function(){this.$element.parent()[0]===this.wrapper&&(this.waypoint.destroy(),this.$element.removeClass(this.options.stuckClass),this.options.wrapper&&this.$element.unwrap())},t.defaults={wrapper:'<div class="sticky-wrapper" />',stuckClass:"stuck",direction:"down right"},i.Sticky=t}();;
/*!
Waypoints Inview Shortcut - 4.0.0
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blog/master/licenses.txt
*/
!function(){"use strict";function t(){}function e(t){this.options=i.Adapter.extend({},e.defaults,t),this.axis=this.options.horizontal?"horizontal":"vertical",this.waypoints=[],this.element=this.options.element,this.createWaypoints()}var i=window.Waypoint;e.prototype.createWaypoints=function(){for(var t={vertical:[{down:"enter",up:"exited",offset:"100%"},{down:"entered",up:"exit",offset:"bottom-in-view"},{down:"exit",up:"entered",offset:0},{down:"exited",up:"enter",offset:function(){return-this.adapter.outerHeight()}}],horizontal:[{right:"enter",left:"exited",offset:"100%"},{right:"entered",left:"exit",offset:"right-in-view"},{right:"exit",left:"entered",offset:0},{right:"exited",left:"enter",offset:function(){return-this.adapter.outerWidth()}}]},e=0,i=t[this.axis].length;i>e;e++){var n=t[this.axis][e];this.createWaypoint(n)}},e.prototype.createWaypoint=function(t){var e=this;this.waypoints.push(new i({context:this.options.context,element:this.options.element,enabled:this.options.enabled,handler:function(t){return function(i){e.options[t[i]].call(e,i)}}(t),offset:t.offset,horizontal:this.options.horizontal}))},e.prototype.destroy=function(){for(var t=0,e=this.waypoints.length;e>t;t++)this.waypoints[t].destroy();this.waypoints=[]},e.prototype.disable=function(){for(var t=0,e=this.waypoints.length;e>t;t++)this.waypoints[t].disable()},e.prototype.enable=function(){for(var t=0,e=this.waypoints.length;e>t;t++)this.waypoints[t].enable()},e.defaults={context:window,enabled:!0,enter:t,entered:t,exit:t,exited:t},i.Inview=e}();;
var Tabia=window.Tabia||{};!function($){Tabia.paramPass=function(){var mergedParams,splitUrl,parsedLink,urlParams=Tabia.util.parseUrl(window.location.href).params,prefix="tabui:goto-url?url=",cleanedPageParams={};"undefined"!=typeof Tabia.passParam&&(_.each(urlParams,function(value,key){Tabia.util.isAlphaPlus(value)&&(cleanedPageParams[key]=value)}),$.each(Tabia.passParam,function(i,elm){$(elm).find('a[data-param-pass-whitelist][data-param-pass-whitelist!=""]').each(function(){var paramPassWhitelist;if(0!==$(this).attr("href").indexOf(prefix)){paramPassWhitelist=$(this).data("paramPassWhitelist").split(/,\s*/),mergedParams={},parsedLink=Tabia.util.parseUrl(this.href),paramPassWhitelist.forEach(function(key){cleanedPageParams[key]&&(mergedParams[key]=cleanedPageParams[key]),parsedLink.params[key]&&(mergedParams[key]=parsedLink.params[key])});for(var key in parsedLink.params)parsedLink.params.hasOwnProperty(key)&&(mergedParams[key]=parsedLink.params[key]);this.href=parsedLink.protocol+"://"+parsedLink.host+parsedLink.path,$.isEmptyObject(mergedParams)||(this.href+="?"+$.param(mergedParams)),$.isEmptyObject(parsedLink.hash)||(this.href+="#"+parsedLink.hash)}})})),"undefined"!=typeof Tabia.tabUiForce&&$.each(Tabia.tabUiForce,function(i,elm){$(elm).find("a").each(function(){$(this).hasClass("nolink")||(0!==$(this).attr("href").indexOf(prefix)&&$(this).attr("href",prefix+$(this).attr("href")),splitUrl=this.href.split("?"),3===splitUrl.length&&$(this).attr("href",splitUrl[0]+"?"+splitUrl[1]+encodeURIComponent("?"+splitUrl[2])))})})},$(document).bind("Tabia:paramPass",Tabia.paramPass),$(window).load(Tabia.paramPass)}(jQuery);;
/*
 * jQuery doTimeout: Like setTimeout, but better! - v1.0 - 3/3/2010
 * http://benalman.com/projects/jquery-dotimeout-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($){var a={},c="doTimeout",d=Array.prototype.slice;$[c]=function(){return b.apply(window,[0].concat(d.call(arguments)))};$.fn[c]=function(){var f=d.call(arguments),e=b.apply(this,[c+f[0]].concat(f));return typeof f[0]==="number"||typeof f[1]==="number"?this:e};function b(l){var m=this,h,k={},g=l?$.fn:$,n=arguments,i=4,f=n[1],j=n[2],p=n[3];if(typeof f!=="string"){i--;f=l=0;j=n[1];p=n[2]}if(l){h=m.eq(0);h.data(l,k=h.data(l)||{})}else{if(f){k=a[f]||(a[f]={})}}k.id&&clearTimeout(k.id);delete k.id;function e(){if(l){h.removeData(l)}else{if(f){delete a[f]}}}function o(){k.id=setTimeout(function(){k.fn()},j)}if(p){k.fn=function(q){if(typeof p==="string"){p=g[p]}p.apply(m,d.call(n,i))===true&&!q?o():e()};o()}else{if(k.fn){j===undefined?e():k.fn(j===false);return true}else{e()}}}})(jQuery);;
!function($){$(document).ready(function(){var $globalNavDrawers=$(".global-nav__drawer"),$secondaryHomepagePromo=$(".view-id-homepage.view-display-id-secondary"),$generalCTA=$(".l-main a.cta, .global-footer a.cta"),$loadMorePager=$(".pager-load-more").find("a"),$socialWidgetLink=$(".social-share__link"),$siteSearchForms=$('.google-appliance-block-form, form[class*="google-appliance-block-form"]');$secondaryHomepagePromo.find(".teaser-item").each(function(ind,val){$(this).find("a").attr("data-name","node").attr("data-location",ind+1).attr("data-type",$(this).find(".teaser-item__title").text())}),$socialWidgetLink.each(function(ind,val){$(this).attr("data-name","social-interact").attr("data-location",$(this).data("social"))}),$globalNavDrawers.find("a").attr("data-name","sub-nav"),$generalCTA.attr("data-name","unique-cta"),$loadMorePager.attr("data-name","load-more"),$siteSearchForms.bind("submit.googleanalytics",function(){dataLayer.push({event:"search",searchTerm:$(this).find('input[type="search"]').val()})})})}(jQuery);;
!function(){"use strict";function e(n){return"undefined"==typeof this||Object.getPrototypeOf(this)!==e.prototype?new e(n):(O=this,O.version="3.3.2",O.tools=new E,O.isSupported()?(O.tools.extend(O.defaults,n||{}),O.defaults.container=t(O.defaults),O.store={elements:{},containers:[]},O.sequences={},O.history=[],O.uid=0,O.initialized=!1):"undefined"!=typeof console&&null!==console,O)}function t(e){if(e&&e.container){if("string"==typeof e.container)return window.document.documentElement.querySelector(e.container);if(O.tools.isNode(e.container))return e.container}return O.defaults.container}function n(e,t){return"string"==typeof e?Array.prototype.slice.call(t.querySelectorAll(e)):O.tools.isNode(e)?[e]:O.tools.isNodeList(e)?Array.prototype.slice.call(e):[]}function i(){return++O.uid}function o(e,t,n){t.container&&(t.container=n),e.config?e.config=O.tools.extendClone(e.config,t):e.config=O.tools.extendClone(O.defaults,t),"top"===e.config.origin||"bottom"===e.config.origin?e.config.axis="Y":e.config.axis="X"}function r(e){var t=window.getComputedStyle(e.domEl);e.styles||(e.styles={transition:{},transform:{},computed:{}},e.styles.inline=e.domEl.getAttribute("style")||"",e.styles.inline+="; visibility: visible; ",e.styles.computed.opacity=t.opacity,t.transition&&"all 0s ease 0s"!==t.transition?e.styles.computed.transition=t.transition+", ":e.styles.computed.transition=""),e.styles.transition.instant=s(e,0),e.styles.transition.delayed=s(e,e.config.delay),e.styles.transform.initial=" -webkit-transform:",e.styles.transform.target=" -webkit-transform:",a(e),e.styles.transform.initial+="transform:",e.styles.transform.target+="transform:",a(e)}function s(e,t){var n=e.config;return"-webkit-transition: "+e.styles.computed.transition+"-webkit-transform "+n.duration/1e3+"s "+n.easing+" "+t/1e3+"s, opacity "+n.duration/1e3+"s "+n.easing+" "+t/1e3+"s; transition: "+e.styles.computed.transition+"transform "+n.duration/1e3+"s "+n.easing+" "+t/1e3+"s, opacity "+n.duration/1e3+"s "+n.easing+" "+t/1e3+"s; "}function a(e){var t,n=e.config,i=e.styles.transform;t="top"===n.origin||"left"===n.origin?/^-/.test(n.distance)?n.distance.substr(1):"-"+n.distance:n.distance,parseInt(n.distance)&&(i.initial+=" translate"+n.axis+"("+t+")",i.target+=" translate"+n.axis+"(0)"),n.scale&&(i.initial+=" scale("+n.scale+")",i.target+=" scale(1)"),n.rotate.x&&(i.initial+=" rotateX("+n.rotate.x+"deg)",i.target+=" rotateX(0)"),n.rotate.y&&(i.initial+=" rotateY("+n.rotate.y+"deg)",i.target+=" rotateY(0)"),n.rotate.z&&(i.initial+=" rotateZ("+n.rotate.z+"deg)",i.target+=" rotateZ(0)"),i.initial+="; opacity: "+n.opacity+";",i.target+="; opacity: "+e.styles.computed.opacity+";"}function l(e){var t=e.config.container;t&&O.store.containers.indexOf(t)===-1&&O.store.containers.push(e.config.container),O.store.elements[e.id]=e}function c(e,t,n){var i={target:e,config:t,interval:n};O.history.push(i)}function f(){if(O.isSupported()){y();for(var e=0;e<O.store.containers.length;e++)O.store.containers[e].addEventListener("scroll",d),O.store.containers[e].addEventListener("resize",d);O.initialized||(window.addEventListener("scroll",d),window.addEventListener("resize",d),O.initialized=!0)}return O}function d(){T(y)}function u(){var e,t,n,i;O.tools.forOwn(O.sequences,function(o){i=O.sequences[o],e=!1;for(var r=0;r<i.elemIds.length;r++)n=i.elemIds[r],t=O.store.elements[n],q(t)&&!e&&(e=!0);i.active=e})}function y(){var e,t;u(),O.tools.forOwn(O.store.elements,function(n){t=O.store.elements[n],e=w(t),g(t)?(t.config.beforeReveal(t.domEl),e?t.domEl.setAttribute("style",t.styles.inline+t.styles.transform.target+t.styles.transition.delayed):t.domEl.setAttribute("style",t.styles.inline+t.styles.transform.target+t.styles.transition.instant),p("reveal",t,e),t.revealing=!0,t.seen=!0,t.sequence&&m(t,e)):v(t)&&(t.config.beforeReset(t.domEl),t.domEl.setAttribute("style",t.styles.inline+t.styles.transform.initial+t.styles.transition.instant),p("reset",t),t.revealing=!1)})}function m(e,t){var n=0,i=0,o=O.sequences[e.sequence.id];o.blocked=!0,t&&"onload"===e.config.useDelay&&(i=e.config.delay),e.sequence.timer&&(n=Math.abs(e.sequence.timer.started-new Date),window.clearTimeout(e.sequence.timer)),e.sequence.timer={started:new Date},e.sequence.timer.clock=window.setTimeout(function(){o.blocked=!1,e.sequence.timer=null,d()},Math.abs(o.interval)+i-n)}function p(e,t,n){var i=0,o=0,r="after";switch(e){case"reveal":o=t.config.duration,n&&(o+=t.config.delay),r+="Reveal";break;case"reset":o=t.config.duration,r+="Reset"}t.timer&&(i=Math.abs(t.timer.started-new Date),window.clearTimeout(t.timer.clock)),t.timer={started:new Date},t.timer.clock=window.setTimeout(function(){t.config[r](t.domEl),t.timer=null},o-i)}function g(e){if(e.sequence){var t=O.sequences[e.sequence.id];return t.active&&!t.blocked&&!e.revealing&&!e.disabled}return q(e)&&!e.revealing&&!e.disabled}function w(e){var t=e.config.useDelay;return"always"===t||"onload"===t&&!O.initialized||"once"===t&&!e.seen}function v(e){if(e.sequence){var t=O.sequences[e.sequence.id];return!t.active&&e.config.reset&&e.revealing&&!e.disabled}return!q(e)&&e.config.reset&&e.revealing&&!e.disabled}function b(e){return{width:e.clientWidth,height:e.clientHeight}}function h(e){if(e&&e!==window.document.documentElement){var t=x(e);return{x:e.scrollLeft+t.left,y:e.scrollTop+t.top}}return{x:window.pageXOffset,y:window.pageYOffset}}function x(e){var t=0,n=0,i=e.offsetHeight,o=e.offsetWidth;do isNaN(e.offsetTop)||(t+=e.offsetTop),isNaN(e.offsetLeft)||(n+=e.offsetLeft),e=e.offsetParent;while(e);return{top:t,left:n,height:i,width:o}}function q(e){function t(){var t=c+a*s,n=f+l*s,i=d-a*s,y=u-l*s,m=r.y+e.config.viewOffset.top,p=r.x+e.config.viewOffset.left,g=r.y-e.config.viewOffset.bottom+o.height,w=r.x-e.config.viewOffset.right+o.width;return t<g&&i>m&&n>p&&y<w}function n(){return"fixed"===window.getComputedStyle(e.domEl).position}var i=x(e.domEl),o=b(e.config.container),r=h(e.config.container),s=e.config.viewFactor,a=i.height,l=i.width,c=i.top,f=i.left,d=c+a,u=f+l;return t()||n()}function E(){}var O,T;e.prototype.defaults={origin:"bottom",distance:"20px",duration:500,delay:0,rotate:{x:0,y:0,z:0},opacity:0,scale:.9,easing:"cubic-bezier(0.6, 0.2, 0.1, 1)",container:window.document.documentElement,mobile:!0,reset:!1,useDelay:"always",viewFactor:.2,viewOffset:{top:0,right:0,bottom:0,left:0},beforeReveal:function(e){},beforeReset:function(e){},afterReveal:function(e){},afterReset:function(e){}},e.prototype.isSupported=function(){var e=document.documentElement.style;return"WebkitTransition"in e&&"WebkitTransform"in e||"transition"in e&&"transform"in e},e.prototype.reveal=function(e,s,a,d){var u,y,m,p,g,w;if(void 0!==s&&"number"==typeof s?(a=s,s={}):void 0!==s&&null!==s||(s={}),u=t(s),y=n(e,u),!y.length)return O;a&&"number"==typeof a&&(w=i(),g=O.sequences[w]={id:w,interval:a,elemIds:[],active:!1});for(var v=0;v<y.length;v++)p=y[v].getAttribute("data-sr-id"),p?m=O.store.elements[p]:(m={id:i(),domEl:y[v],seen:!1,revealing:!1},m.domEl.setAttribute("data-sr-id",m.id)),g&&(m.sequence={id:g.id,index:g.elemIds.length},g.elemIds.push(m.id)),o(m,s,u),r(m),l(m),O.tools.isMobile()&&!m.config.mobile||!O.isSupported()?(m.domEl.setAttribute("style",m.styles.inline),m.disabled=!0):m.revealing||m.domEl.setAttribute("style",m.styles.inline+m.styles.transform.initial);return!d&&O.isSupported()&&(c(e,s,a),O.initTimeout&&window.clearTimeout(O.initTimeout),O.initTimeout=window.setTimeout(f,0)),O},e.prototype.sync=function(){if(O.history.length&&O.isSupported()){for(var e=0;e<O.history.length;e++){var t=O.history[e];O.reveal(t.target,t.config,t.interval,!0)}f()}return O},E.prototype.isObject=function(e){return null!==e&&"object"==typeof e&&e.constructor===Object},E.prototype.isNode=function(e){return"object"==typeof window.Node?e instanceof window.Node:e&&"object"==typeof e&&"number"==typeof e.nodeType&&"string"==typeof e.nodeName},E.prototype.isNodeList=function(e){var t=Object.prototype.toString.call(e),n=/^\[object (HTMLCollection|NodeList|Object)\]$/;return"object"==typeof window.NodeList?e instanceof window.NodeList:e&&"object"==typeof e&&n.test(t)&&"number"==typeof e.length&&(0===e.length||this.isNode(e[0]))},E.prototype.forOwn=function(e,t){if(!this.isObject(e))throw new TypeError('Expected "object", but received "'+typeof e+'".');for(var n in e)e.hasOwnProperty(n)&&t(n)},E.prototype.extend=function(e,t){return this.forOwn(t,function(n){this.isObject(t[n])?(e[n]&&this.isObject(e[n])||(e[n]={}),this.extend(e[n],t[n])):e[n]=t[n]}.bind(this)),e},E.prototype.extendClone=function(e,t){return this.extend(this.extend({},e),t)},E.prototype.isMobile=function(){return/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)},T=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(e){window.setTimeout(e,1e3/60)},"function"==typeof define&&"object"==typeof define.amd&&define.amd?define(function(){return e}):"undefined"!=typeof module&&module.exports?module.exports=e:window.ScrollReveal=e}();;
!function($,groucho,module){module.activityDatePush=function(activities,where,dataLayerName){var timestamp,actvity,pushed={};actvity=_.findWhere(activities,where),_.isEmpty(actvity)||(timestamp=actvity._key.split(".")[2],Tabia.util.isNumeric(timestamp)&&(pushed[dataLayerName]=timestamp,dataLayer.push(pushed)))},module.checkTrialAttempts=function(){var formSubmits=groucho.getActivities("formSubmit").reverse();module.activityDatePush(formSubmits,{lead_source:"Free Trial",lead_source_detail:"Tableau Online Trial Request"},"trialSubmitOnline"),module.activityDatePush(formSubmits,{lead_source:"Free Trial",lead_source_detail:"14 Day Desktop Trial Request"},"trialSubmitDesktop")},$(document).ready(function(){module.checkTrialAttempts()})}(jQuery,groucho,{});;
!function(){$(window).load(function(){var paintEvents,pageTiming;if(window.performance){if(window.performance.getEntriesByType&&(paintEvents=window.performance.getEntriesByType("paint"),paintEvents.length))for(var i=0;i<paintEvents.length;i++)"first-contentful-paint"===paintEvents[i].name&&Tabia.insightsDecorator("FirstContentfulPaint",Math.floor(paintEvents[i].startTime));window.performance.timing&&(pageTiming=window.performance.timing,Tabia.insightsDecorator("DomInteractiveFromNavigation",Math.floor(pageTiming.domInteractive-pageTiming.navigationStart)),Tabia.insightsDecorator("DomInteractiveFromLoading",Math.floor(pageTiming.domInteractive-pageTiming.domLoading)),Tabia.insightsDecorator("DomContentLoadedDuration",Math.floor(pageTiming.domContentLoadedEventEnd-pageTiming.domContentLoadedEventStart))),$(".js-perf-authenticated").length&&Tabia.insightsDecorator("PerfIsAuthenticated","TRUE"),$(".js-perf-authenticated-internal").length&&Tabia.insightsDecorator("PerfIsAuthenticatedInternal","TRUE")}})}();;
!function($,window){function EzConvert(settings){var defaults={base:"/ezconvert",timeout:2e3};this._settings=$.extend(settings,defaults)}window.ezConvert=new EzConvert,EzConvert.prototype.base=function(base){if(!base)return this._settings.base;this._settings.base=base},EzConvert.prototype.timeout=function(timeout){if(!timeout)return this._settings.timeout;this._settings.timeout=timeout},EzConvert.prototype.convert=function(details){var url=this.base().replace(/\/?$/,"/");details=details||{},url+="?"+$.param(details),this._generateIframe(url)},EzConvert.prototype._generateIframe=function(url){var timeout,$iframe=$("<iframe/>",{src:url,frameborder:"0",scrolling:"no",style:"display:none;"});timeout=setTimeout(function(){$(document).trigger("ezconvertTimeout")},this.timeout()),$iframe.load(function(){clearTimeout(timeout),$(document).trigger("ezconverted")}),$("body").append($iframe)}}(jQuery,window);;
Drupal.behave("ezConvert").ready(function($){function tableauEzConvertDataLayer($regForm){var dataLayerPush={event:"tableau-form-submit",formName:"no_form"};$regForm&&$regForm.length&&(dataLayerPush.formName=$regForm.find('input[name="form_id"]').val()),dlHelper.get("userMail")&&(dataLayerPush.email=dlHelper.get("userMail")),$.extend(dataLayerPush,details),window.dataLayer.push(dataLayerPush)}var dlHelper=new DataLayerHelper(dataLayer),referrer=Tabia.util.parseUrl(window.location),details={campaignId:dlHelper.get("eloquaDetails.field_campaign_id"),leadSourceDetail:dlHelper.get("eloquaDetails.field_lead_source_detail"),leadSource:dlHelper.get("eloquaDetails.field_lead_src"),contentType:dlHelper.get("entityBundle"),referrerPath:referrer.path,referrerNid:dlHelper.get("entityId")};$.extend(details,referrer.params),ezConvert.base("/webconversion"),$(".field--name-field-link-offsite a").on("click",function(e){e.preventDefault(),$(document).one("ezconverted",{target:e.currentTarget.href},function(e){window.location.href=e.data.target}),$(document).on("ezconvertTimeout",{target:e.currentTarget.href},function(e){window.location.href=e.data.target}),details.conversionType="offsite link",ezConvert.convert(details),tableauEzConvertDataLayer(null)}),$(document).on("tab_form_submitted",function(e,$regForm){var target=$regForm.attr("target")||"_self";"true"!==$regForm.attr("data-event-register-cancel")?($(document).one("ezconverted",{form:$regForm},function(e){"_blank"!==target&&$regForm[0].submit()}),$(document).on("ezconvertTimeout",{form:$regForm},function(e){"_blank"!==target&&$regForm[0].submit()}),details.conversionType="non-ajax form",ezConvert.convert(details),tableauEzConvertDataLayer($regForm)):$regForm[0].submit()}),$(document).on("tab_form_ajax_submitted",function(e,$regForm){details.conversionType="ajax form",ezConvert.convert(details),tableauEzConvertDataLayer($regForm)})});;
"use strict";!function(root,factory){"object"==typeof module&&"object"==typeof module.exports?module.exports=factory(require("jQuery"),require("_"),require("Drupal"),require("Tabia"),require("groucho")):root.tableauEloquaAttribution=factory(root.jQuery,root._,root.Drupal,root.Tabia,root.groucho)}(this,function($,_,Drupal,Tabia,groucho){function _getValueFromInput(name){return $('input[name="'+name+'"]').val()||""}function _getFieldValueFromDataLayer(name){var fieldName="field_"+name,dlHelper=new DataLayerHelper(dataLayer),eloquaDetails=dlHelper.get("eloquaDetails");return"object"==typeof eloquaDetails&&eloquaDetails[fieldName]?eloquaDetails[fieldName]:""}var exports={},CONSTANTS={GROUCHO_NAMESPACE:"eloquaAttribution",NEW_RELIC_INSIGHTS_ACTIVITY_NAME:"CampaignActivity",NEW_RELIC_INSIGHTS_NO_GUID:"CampaignActivityNoGuid"},defaults={activityTTL:31556952e3,eloquaGuidTimeout:2e4,searchEngines:{Google:"google.com/search"}},eloquaCampaignActivity={entry_date:(new Date).getTime(),is_overriding_activity:!1,lead_source:"",lead_source_detail:"",campaign_id:"",utm_campaign:"",utm_campaign_id:"",utm_source:"Direct",utm_medium:"Website",partner_code:"",utm_language:"",utm_country:"",keyword:"",adgroup:"",adused:"",budget_id:"",matchtype:"",placement:"",kcid:"",url:"object"==typeof window?window.location.href:"",referrer_full_url:document.referrer||"",elqCustomerGUID:"",gaClientID:"",nid:""},activityKeys=["utm_medium","utm_source","utm_campaign","utm_campaign_id","utm_language","utm_country","keyword","adgroup","adused","budget_id","placement","matchtype","kcid","partner_code"];return exports._setDefaults=function(){defaults.activityTTL=Drupal.settings.tableauEloqua.campaignActivityTTL?Drupal.settings.tableauEloqua.campaignActivityTTL:defaults.activityTTL,defaults.eloquaGuidTimeout=Drupal.settings.tableauEloqua.campaignActivityGuidTimeout?Drupal.settings.tableauEloqua.campaignActivityGuidTimeout:defaults.eloquaGuidTimeout,defaults.searchEngines=Drupal.settings.tableauEloqua.searchEngines?Drupal.settings.tableauEloqua.searchEngines:defaults.searchEngines},exports.getQueue=function(){var existingActivities=groucho.getActivities(CONSTANTS.GROUCHO_NAMESPACE);return existingActivities&&existingActivities.length?existingActivities:[]},exports.enqueueOverridingActivity=function(){var activity=exports.getData();activity.is_overriding_activity&&(groucho.createActivity(CONSTANTS.GROUCHO_NAMESPACE,activity,defaults.activityTTL),Tabia.debug("Enqueue CampaignActivity",{type:CONSTANTS.NEW_RELIC_INSIGHTS_ACTIVITY_NAME,data:exports.getData()}))},exports.logActivityNewRelicInsights=function(hasGUID){var key,activityType=hasGUID?CONSTANTS.NEW_RELIC_INSIGHTS_ACTIVITY_NAME:CONSTANTS.NEW_RELIC_INSIGHTS_NO_GUID,loggingData=_.clone(exports.getData()),overridingActivity=exports.getMostRecentOverridingActivity();if("object"==typeof overridingActivity)for(var i=0;i<activityKeys.length;i++)key=activityKeys[i],_.has(overridingActivity,key)&&(loggingData[key]=overridingActivity[key]);Tabia.insightsLogger(loggingData,activityType),Tabia.debug("Log CampaignActivity to Insights",{type:activityType,data:loggingData})},exports.includeActivityOnEloquaForm=function(){var i,key,$eloquaForm=$("[data-form-eloqua]"),activity=exports.getMostRecentOverridingActivity();if($eloquaForm.length){for(i=0;i<activityKeys.length;i++)key=activityKeys[i],_.has(activity,key)&&activity[key].trim().length&&$eloquaForm.find('input[name="'+key+'"]').val(activity[key].trim());Tabia.debug("Include activity on Eloqua form",{type:CONSTANTS.NEW_RELIC_INSIGHTS_ACTIVITY_NAME,data:activity})}},exports.getMostRecentOverridingActivity=function(){var activities=groucho.getActivities(CONSTANTS.GROUCHO_NAMESPACE),mostRecentActivity=-1;return activities.length>1&&"object"==typeof activities[activities.length-1]?mostRecentActivity=activities[activities.length-1]:1===activities.length&&"object"==typeof activities[0]&&(mostRecentActivity=activities[0]),mostRecentActivity},exports.overrideValues=function(){var hasPartnerCode=Tabia.util.getUrlParameter("partner_code"),partnerLogicFields=["utm_campaign","utm_source","utm_medium","partner_code"];exports._setDrupalData(),exports._setOrganicSearchPromoData(),exports._setGoogleAnalyticsClientId(),_.each(eloquaCampaignActivity,function(defaultVal,param){exports.overrideSingleValue(param),hasPartnerCode&&_.contains(partnerLogicFields,param)&&(eloquaCampaignActivity.is_overriding_activity=!0,exports._applyPartnerDetails(param))})},exports.overrideSingleValue=function(param){var returnValue="",paramValue=Tabia.util.getUrlParameter(param);switch(param){case"lead_source":_getFieldValueFromDataLayer("lead_src")?returnValue=_getFieldValueFromDataLayer("lead_src"):_getValueFromInput(param)&&(returnValue=_getValueFromInput(param));break;case"lead_source_detail":case"campaign_id":_getFieldValueFromDataLayer(param)?returnValue=_getFieldValueFromDataLayer(param):_getValueFromInput(param)&&(returnValue=_getValueFromInput(param));break;case"keyword":paramValue=Tabia.util.getUrlParameter("kw");case"utm_campaign":case"utm_campaign_id":case"utm_source":case"utm_medium":case"utm_language":case"utm_country":case"adgroup":case"adused":case"budget_id":case"matchtype":case"placement":case"kcid":paramValue&&"PANTHEON_STRIPPED"!==paramValue&&(eloquaCampaignActivity.is_overriding_activity=!0,returnValue=paramValue);break;default:returnValue=""}returnValue&&(eloquaCampaignActivity[param]=returnValue)},exports._applyPartnerDetails=function(param){var returnValue="",dlHelper=new DataLayerHelper(dataLayer),partnerDetails=dlHelper.get("partnerDetails"),isValidDetails="object"==typeof partnerDetails;switch(param){case"utm_campaign":_getValueFromInput("utm_campaign")?returnValue=_getValueFromInput("utm_campaign"):isValidDetails&&partnerDetails.code&&(returnValue=[_getFieldValueFromDataLayer("lead_source_detail"),partnerDetails.code].join(" - "));break;case"utm_source":returnValue=isValidDetails?partnerDetails.name||"[PARTNER NAME]":"[PARTNER NAME]";break;case"utm_medium":returnValue="Partner";break;case"partner_code":returnValue=isValidDetails?partnerDetails.code||"[PARTNER CODE]":"[PARTNER CODE]"}returnValue&&(eloquaCampaignActivity[param]=returnValue)},exports.getData=function(){return eloquaCampaignActivity},exports._processEloquaData=function(){var localGuid="";Drupal.behaviors.eloquaApiTracking.getGuid(function(guid){localGuid=guid}),exports.enqueueOverridingActivity(),exports.includeActivityOnEloquaForm(),Tabia.util.waitFor(function(){return localGuid.length>0},function(){window.dataLayer.push({EloquaGuid:localGuid}),eloquaCampaignActivity.elqCustomerGUID=localGuid,exports.logActivityNewRelicInsights(!0)},function(){exports.logActivityNewRelicInsights(!1)},{waitTimeout:defaults.eloquaGuidTimeout})},exports._getOrganicSearchEngine=function(){var referrer=document.referrer;return!!referrer&&(_.findKey(defaults.searchEngines,function(url,name){return-1!==referrer.indexOf(url)})||!1)},exports._setDrupalData=function(){var dlHelper=new DataLayerHelper(dataLayer);eloquaCampaignActivity.nid=dlHelper.get("entityId")},exports._setOrganicSearchPromoData=function(){var languageCode=Drupal.settings.pathPrefix?Drupal.settings.pathPrefix.replace("/",""):"en-us",generatedUtmCampaign=_getFieldValueFromDataLayer("lead_source_detail")+" - "+languageCode,searchEngine=exports._getOrganicSearchEngine();searchEngine&&(eloquaCampaignActivity.is_overriding_activity=!0,eloquaCampaignActivity.utm_medium="Organic Search",eloquaCampaignActivity.utm_source=searchEngine,eloquaCampaignActivity.utm_campaign=generatedUtmCampaign)},exports._setGoogleAnalyticsClientId=function(){Tabia.util.getGoogleAnalyticsClientId(function(clientId){eloquaCampaignActivity.gaClientID=clientId})},exports.init=function(){(_getFieldValueFromDataLayer("lead_src")||_getFieldValueFromDataLayer("lead_source_detail"))&&(exports._setDefaults(),exports.overrideValues(),exports._processEloquaData())},exports});;
Drupal.behave("tableauEloquaAttribution").ready(function($){tableauEloquaAttribution.init()});;
(function(){/*
 jQuery v1.9.1 (c) 2005, 2012
 jQuery Foundation, Inc. jquery.org/license.
*/
var g=/\[object (Boolean|Number|String|Function|Array|Date|RegExp)\]/;function h(a){return null==a?String(a):(a=g.exec(Object.prototype.toString.call(Object(a))))?a[1].toLowerCase():"object"}function k(a,b){return Object.prototype.hasOwnProperty.call(Object(a),b)}function m(a){if(!a||"object"!=h(a)||a.nodeType||a==a.window)return!1;try{if(a.constructor&&!k(a,"constructor")&&!k(a.constructor.prototype,"isPrototypeOf"))return!1}catch(b){return!1}for(var c in a);return void 0===c||k(a,c)};/*
 Copyright 2012 Google Inc. All rights reserved. */
function n(a,b,c){this.b=a;this.f=b||function(){};this.d=!1;this.a={};this.c=[];this.e=p(this);r(this,a,!c);var d=a.push,e=this;a.push=function(){var b=[].slice.call(arguments,0),c=d.apply(a,b);r(e,b);return c}}window.DataLayerHelper=n;n.prototype.get=function(a){var b=this.a;a=a.split(".");for(var c=0;c<a.length;c++){if(void 0===b[a[c]])return;b=b[a[c]]}return b};n.prototype.flatten=function(){this.b.splice(0,this.b.length);this.b[0]={};s(this.a,this.b[0])};
function r(a,b,c){for(a.c.push.apply(a.c,b);!1===a.d&&0<a.c.length;){b=a.c.shift();if("array"==h(b))a:{var d=b,e=a.a;if("string"==h(d[0])){for(var f=d[0].split("."),u=f.pop(),d=d.slice(1),l=0;l<f.length;l++){if(void 0===e[f[l]])break a;e=e[f[l]]}try{e[u].apply(e,d)}catch(v){}}}else if("function"==typeof b)try{b.call(a.e)}catch(w){}else if(m(b))for(var q in b)s(t(q,b[q]),a.a);else continue;c||(a.d=!0,a.f(a.a,b),a.d=!1)}}
function p(a){return{set:function(b,c){s(t(b,c),a.a)},get:function(b){return a.get(b)}}}function t(a,b){for(var c={},d=c,e=a.split("."),f=0;f<e.length-1;f++)d=d[e[f]]={};d[e[e.length-1]]=b;return c}function s(a,b){for(var c in a)if(k(a,c)){var d=a[c];"array"==h(d)?("array"==h(b[c])||(b[c]=[]),s(d,b[c])):m(d)?(m(b[c])||(b[c]={}),s(d,b[c])):b[c]=d}};})();
;
