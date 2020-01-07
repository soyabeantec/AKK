// Copyright 2006-2019 ClickTale Ltd., US Patent Pending


window.ClickTaleGlobal = window.ClickTaleGlobal || {};
window.ClickTaleSettings = window.ClickTaleSettings || {};

ClickTaleGlobal.init = ClickTaleGlobal.init || {};
ClickTaleGlobal.scripts = ClickTaleGlobal.scripts || {};


ClickTaleGlobal.scripts.filter = ClickTaleGlobal.scripts.filter || (function () {
	var recordingThreshold = Math.random() * 100;

	return {
		isRecordingApproved: function(percentage) {
			return recordingThreshold <= percentage;
		}
	}
})();
	
		
// Copyright 2006-2019 ClickTale Ltd., US Patent Pending
// PID: 1068



/*browsers exclusion start*/function doOnlyWhen(toDoHandler, toCheckHandler, interval, times, failHandler) {
    if ((!toDoHandler) || (!toCheckHandler)) return;
    if (typeof interval == "undefined") interval = 1000;
    if (typeof times == "undefined") times = 20;

    if (--times < 0 && typeof failHandler === 'function') {
        failHandler();
        return;
    }
    if (toCheckHandler()) {
        toDoHandler();
        return;
    }

    setTimeout(function () { doOnlyWhen(toDoHandler, toCheckHandler, interval, times); }, interval);
}
doOnlyWhen(function () { if (window.ClickTaleSettings.PTC.okToRunPCC) { (function(){
window.ClickTaleSettings = window.ClickTaleSettings || {};
window.ClickTaleSettings.PTC = window.ClickTaleSettings.PTC || {};
window.ClickTaleSettings.PTC.originalPCCLocation = "P32_PID1068";

var g;function k(a,b,c,d,e){a&&b&&("undefined"==typeof c&&(c=1E3),"undefined"==typeof d&&(d=20),0>--d?"function"===typeof e&&e():b()?a():setTimeout(function(){k(a,b,c,d,e)},c))}function l(a){var b="someText".trim,c=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;g=b&&!b.call(new String("\ufeff\u00a0"))?function(a){return null==a?"":b.call(a)}:function(a){return null==a?"":(a+"").replace(c,"")};return g(a)};function n(a,b){b||(b=document);return b instanceof Element||b instanceof Document?Array.prototype.slice.call(b.querySelectorAll(a)):"string"===typeof b?n(a,document.querySelectorAll(b)):Array.isArray(b)||b instanceof HTMLCollection||b instanceof NodeList?Array.prototype.reduce.call(b,function(b,d){return b.concat(Array.prototype.slice.call(d.querySelectorAll(a)))},[]):[]}
function p(a,b){if(a&&a.nodeType&&9===a.nodeType)return!1;var c=Element.prototype;p=function(a,b){return a&&document.documentElement.contains(a)?p.b.call(a,b):!1};p.b=c.matches||c.webkitMatchesSelector||c.mozMatchesSelector||c.msMatchesSelector;return p(a,b)}function r(a,b){r=Element.prototype.closest?function(a,b){return a&&a instanceof Element?Element.prototype.closest.call(a,b):null}:function(a,b){for(;a&&!p(a,b);)a=a.parentElement;return a};return r(a,b)};var t=!1,u=Object.defineProperty&&Object.defineProperty({},"passive",{get:function(){t=!0}});document.addEventListener("test",function(){},u);var v=t?{passive:!0,capture:!0}:!0,w=t?{passive:!0,capture:!1}:!1;function x(a){function b(){2==++x.b&&a()}y(b);if("function"==typeof ClickTaleIsRecording&&!0===ClickTaleIsRecording())b();else{var c=window.ClickTaleOnRecording||function(){};window.ClickTaleOnRecording=function(){b();return c.apply(this,arguments)}}}x.b=0;
function y(a){function b(){c||(c=!0,a())}var c=!1;"loading"!=document.readyState?b():document.addEventListener&&document.addEventListener("DOMContentLoaded",b,!1)}
function z(a,b,c,d,e){if("string"===typeof a)Array.prototype.forEach.call(document.querySelectorAll(a),function(a){z(a,b,c,d,e)});else if(a instanceof Array||a instanceof NodeList)Array.prototype.forEach.call(a,function(a){z(a,b,c,d,e)});else{var f="";"string"==typeof c&&("mouseenter"==b?(b="mouseover",f="mouseenter"):"mouseleave"==b&&(b="mouseout",f="mouseleave"));a.addEventListener(b,function(a,b,c,d,e,f){return function(m){if("function"===typeof c)c.apply(this,arguments),e&&a.removeEventListener(b,
arguments.callee,w);else{var q=m.relatedTarget,h=r(m.target,c);h&&a.compareDocumentPosition(h)&Node.DOCUMENT_POSITION_CONTAINED_BY&&("mouseenter"==f||"mouseleave"==f?q&&(q==h||h.compareDocumentPosition(q)&Node.DOCUMENT_POSITION_CONTAINED_BY)||d.apply(h,arguments):d.apply(h,arguments),e&&a.removeEventListener(b,arguments.callee,w))}}}(a,b,c,d,e,f),w)}}
function A(a,b,c,d,e){if("string"===typeof a)Array.prototype.forEach.call(document.querySelectorAll(a),function(a){A(a,b,c,d,e)});else if(a instanceof Array||a instanceof NodeList)Array.prototype.forEach.call(a,function(a){A(a,b,c,d,e)});else{var f="";"string"==typeof c&&("mouseenter"==b?(b="mouseover",f="mouseenter"):"mouseleave"==b&&(b="mouseout",f="mouseleave"));a.addEventListener(b,function(a,b,c,d,e,f){return function(q){if("function"===typeof c)c.apply(this,arguments),e&&a.removeEventListener(b,
arguments.callee,v);else{var m=q.relatedTarget,h=r(q.target,c);h&&a.compareDocumentPosition(h)&Node.DOCUMENT_POSITION_CONTAINED_BY&&("mouseenter"==f||"mouseleave"==f?m&&(m==h||h.compareDocumentPosition(m)&Node.DOCUMENT_POSITION_CONTAINED_BY)||d.apply(h,arguments):d.apply(h,arguments),e&&a.removeEventListener(b,arguments.callee,v))}}}(a,b,c,d,e,f),v)}}function B(a,b){document.addEventListener("mouseup",function(c){a===c.target&&b();document.removeEventListener("mouseup",arguments.callee,w)},w)}
function C(a,b){document.addEventListener("mouseup",function(c){a===c.target&&b();document.removeEventListener("mouseup",arguments.callee,v)},v)}function aa(a,b){function c(c){document.removeEventListener("touchend",arguments.callee,w);a===c.target&&b()}document.addEventListener("touchend",c,w);document.addEventListener("touchmove",function(a){document.removeEventListener("touchmove",arguments.callee,w);document.removeEventListener("touchend",c,w)},w)}
function ba(a,b){function c(c){document.removeEventListener("touchend",arguments.callee,v);a===c.target&&b()}document.addEventListener("touchend",c,v);document.addEventListener("touchmove",function(a){document.removeEventListener("touchmove",arguments.callee,v);document.removeEventListener("touchend",c,v)},v)}function D(a,b){var c=E();c&&(D=c.m?aa:B,D(a,b))}function F(a,b){var c=E();c&&(F=c.m?ba:C,F(a,b))}
function G(a,b){for(var c=0;c<a.length;c++){var d=a[c];if(d)if("string"===typeof d){if(d=l(d))H(d),b&&(50<d.length&&(d=d.substr(d.length-50)),I(b,d))}else Array.isArray(d)&&G(d,b)}};function J(a){if(window.CSS&&"function"===typeof window.CSS.escape)J=function(a){return window.CSS.escape.call(window.CSS,a)};else{var b=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g,c=function(a,b){return b?"\x00"===a?"\ufffd":a.slice(0,-1)+"\\"+a.charCodeAt(a.length-1).toString(16)+" ":"\\"+a};J=function(a){return a.replace(b,c)}}return J(a)}function K(a){return btoa(encodeURIComponent(a).replace(/%([0-9A-F]{2})/g,function(a,c){return String.fromCharCode(+("0x"+c))}))};function I(a,b){window.ClickTaleMonitor&&"function"===typeof ClickTaleMonitor.addPageTag&&(I=function(a,b){!isNaN(a)&&b&&ClickTaleMonitor.addPageTag(a,b)},I(a,b))}
function L(){var a=!1;if(window.ClickTaleMonitor&&"function"===typeof window.ClickTaleMonitor.isMonitoring&&window.ClickTaleMonitor.isMonitoring())a=!0;else if(window.ClickTaleMonitor){var b=window.ClickTaleMonitor&&ClickTaleMonitor.Settings&&"function"==typeof ClickTaleMonitor.Settings.get?ClickTaleMonitor.Settings.get():null;if(b)b.onStart(function(){L.b=!0})}else return k(L,function(){return!!window.ClickTaleMonitor},1E3,10),!1;L=function(){return L.b};L.b=a;return L.b}L.b=!1;L();function M(a){"function"===typeof ClickTaleExec&&ClickTaleExec(a)}function N(){"function"===typeof ClickTaleStop&&ClickTaleStop()}function H(a,b){"function"===typeof ClickTaleEvent&&(b?!0!==H.b[a]&&(H.b[a]=!0,ClickTaleEvent(a)):ClickTaleEvent(a))}H.b={};
function O(a,b){a&&"object"==typeof a&&"string"==typeof b&&(window.ClickTaleContext&&-1!=document.referrer.indexOf(location.hostname)&&window.parent.ct&&window.parent.ct.ElementAddressing&&"function"===typeof window.parent.ct.ElementAddressing.forceSetCustomElementID?window.parent.ct.ElementAddressing.forceSetCustomElementID(a,b):(window.ClickTaleContext||"function"!==typeof ClickTaleSetCustomElementID||-1==ClickTaleSetCustomElementID.toString().indexOf("duplicate registration of custom id")?window.ClickTaleSetCustomElementID=
window.ClickTaleSetCustomElementID||function(a,b){a.ClickTale=a.ClickTale||{};a.ClickTale.CustomID=b}:O=function(a,b){a.ClickTale=a.ClickTale||{};a.ClickTale.CustomID=b},window.ClickTaleSetCustomElementID(a,b)))}
function ca(){Array.prototype.forEach.call(document.querySelectorAll('[id]:not([id=""])'),function(a){if(!p(a,'input[type="hidden"], script')){var b=a.getAttribute("id");b.match(/(?:\r|\n)/)&&"function"===typeof ClickTaleNote&&ClickTaleNote("ctlib.api.SetCustomElementIdDuplicates: ids with line break found!");a=document.querySelectorAll('[id="'+J(b)+'"]');var c=P;1<a.length&&!c[b]&&(c[b]=!0,Array.prototype.forEach.call(a,function(a,c){O(a,b.replace(/(\r|\n|\r\n|\s+)+/g,"_").replace(/\W/g,"_")+"_"+
c)}))}})}var P={};function da(a,b){"function"===typeof ClickTaleLogical&&(H.b={},P={},Q.b&&Q.b instanceof R&&Q.b.clear(),b?ClickTaleLogical(a,b):ClickTaleLogical(a))}function E(){if("function"===typeof ClickTaleDetectAgent){var a=ClickTaleDetectAgent();if(a)return E=function(){return a},E()}return null}function S(a){if("function"===typeof ClickTaleRegisterTouchAction){var b=a.getBoundingClientRect();ClickTaleRegisterTouchAction(a,b.left+document.body.scrollLeft,b.top+document.body.scrollTop)}}
function ea(){if("boolean"!=typeof T){var a=E();a&&(T=!!a.m)}if(!b){var b="mousedown";T&&(b="touchstart")}a="img, a, button, textarea, input, select";T&&(a+=", label[for]");A(document,b,a,function(a){var b=a.target,c=this;if(T)if(p(this,"label[for]"))F(b,function(a){return function(){var b,c;(b=a.getAttribute("for"))&&(c=document.getElementById(b))&&S(c)}.bind(c)}(b,a));else{var f=function(d){document.removeEventListener("touchstart",arguments.callee,w);F(b,function(a){return function(){function b(a){document.removeEventListener("touchend",
arguments.callee,w)}document.addEventListener("touchend",b,w);setTimeout(function(){document.removeEventListener("touchend",b,w);S(a)},50)}.bind(c)}(b,a))};document.addEventListener("touchstart",f,w);setTimeout(function(){document.removeEventListener("touchstart",f,w);S(b)},50)}else F(b,function(a,b){return function(){function c(b){b.target===a&&(U=!0);document.removeEventListener("click",arguments.callee,!0);clearTimeout(d)}var d=setTimeout(function(){U||"function"===typeof window.ClickTaleRegisterElementAction&&
ClickTaleRegisterElementAction("click",b);document.removeEventListener("click",c,!0);U=void 0},200);document.addEventListener("click",c,!0)}.bind(c)}(b,a))})}var T,U;
function V(a,b){var c=W;if(V.b){V.b=!1;var d=d||400;"number"==typeof b&&(d=b,b="");a=a||document.location.href;N();window.ClickTaleIncludedOnDOMReady=!0;window.ClickTaleIncludedOnWindowLoad=!0;"function"===typeof ClickTaleUploadPage&&ClickTaleUploadPage(void 0,void 0);da(a,b);k(c,ClickTaleIsRecording,1E3,2);setTimeout(function(){V.b=!0},d)}}V.b=!0;
function R(){this.c=!1;this.b="";this.init=function(a){this.c||(this.c=!0,document.addEventListener("input",this.f,v));this.g(a);this.b=this.b?this.b+","+a:a};this.f=function(a){a=a.target;if(p(a,this.b)){var b=n(this.b).indexOf(a);M("document.querySelectorAll('"+this.b+"')["+b+"].value = Base64Decode('"+K(a.value)+"');")}}.bind(this);this.g=function(a){var b="";n(a).forEach(function(c,d){b+="document.querySelectorAll('"+a+"')["+d+"].value = Base64Decode('"+K(c.value)+"'); "});b&&M(b)};this.clear=
function(){document.removeEventListener("input",this.f,v);this.c=!1;this.b=""}}function Q(a){Q.b=Q.b||new R;Q.b.init(a)}Q.b=null;var fa=H,ha=D;var X=!1,Y=!0,Z=location.href;function W(){ca();var a=X.toString();"function"===typeof ClickTaleField&&ClickTaleField("isMobile",a);Z=location.href;if(Y)Y=!1;else{a=window.ClickTaleSettings&&window.ClickTaleSettings.PTC&&window.ClickTaleSettings.PTC.InitFuncs?window.ClickTaleSettings.PTC.InitFuncs:[];for(var b=0,c=a.length;b<c;b++)if("function"===typeof a[b])a[b]()}}
function ia(){if(!window.ClickTaleFirstPCCGo){window.ClickTaleFirstPCCGo=!0;var a=E();a&&(X=a.m);W();z(document,X?"touchstart":"mousedown","selectorHere",function(a){var b=a.target;ha(b,function(a,b,c){return function(){}.bind(c)}(b,a,this))})}}x(function(){ea();ia()});window.clickTaleStartEventSignal=function(a){V(location.href,Z);a&&"string"===typeof a&&fa(a)};window.clickTaleEndEventSignal=function(){N()};
window.ClicktaleIntegrationExperienceHandler=function(a,b,c){var d;return function(){var e=this,f=arguments,m=c&&!d;clearTimeout(d);d=setTimeout(function(){d=null;c||a.apply(e,f)},b);m&&a.apply(e,f)}}(function(){V(document.location.href);arguments.length&&G(arguments)},400,!1);})();} }, function () { return !!(window.ClickTaleSettings && window.ClickTaleSettings.PTC && typeof window.ClickTaleSettings.PTC.okToRunPCC != 'undefined'); }, 500, 20);


//Signature:HtqiOUR1hxIxnNESkm3gnAgiZtbcNm/xl1Mt9beDPGPzCy0EstFDGbgkrQH/pi1nWIHd3h0ncRzcoNljRObIHRcuFqc5NYz7oCtIFKKHlZqgIKWuZu72xIJEkeyvULPf06WMtGZiqWOxYRjMjUh1sfD6nIe1Ad7dzJSWfpyViIY=