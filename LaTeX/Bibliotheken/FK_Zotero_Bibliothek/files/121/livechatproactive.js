/*********************************************************************************
	Live chat settings section. 
	Used in live chat implementation. OrgId refers to Salesforce OrgID;
    
    Change log:
    2018-11-16 - ext_vos - INC0151865 : delete PROACTIVE CHAT section.
    2018-11-22 - ext_vos - CHG0035060 : Slide Bar button opens popup.
    2018-11-22 - ext_bad - Update QA organization Id after refresh.
	
***********************************************************************************/

if (window.location.hostname.indexOf("qlik.qa.") > -1) {
    (function () {

/*================================================================================
 BEGIN QA BLOCK
 ================================================================================*/
        /*********************************************************************************
	Live chat settings section. 
	Used in live chat implementation. OrgId refers to Salesforce OrgID;
	
***********************************************************************************/

var ResourceBasePath = {
	QA: "https://s3-eu-west-1.amazonaws.com/qliklivechat/qa",
	Live: "https://s3-eu-west-1.amazonaws.com/qliklivechat/live"
};

var CSSPath = {
	QA: ResourceBasePath.QA + "/livechat.css",
	Live: ResourceBasePath.Live + "/livechat.css" 
};

var SFOrgID = {
	QA: '00D250000008s0i',
	Live: '00D20000000IGPX'
};

var ButtonIDs = {
	QA: {
		ContactSales: '573D000000002AN',
		QlikSense: '573D000000002AO',
		QlikView: '573D000000002AQ',
		QlikSenseCloud: '573D000000002AP'
	},
	Live: {
		ContactSales: '573D000000002AN',
		QlikSense: '573D000000002AO',
		QlikView: '573D000000002AQ',
		QlikSenseCloud: '573D000000002AP'
	}
};
/********************************************************************************
	END Live chat settings section 
***********************************************************************************/

/*********************************************************************************
	Live chat and proactive chat
***********************************************************************************/

/**************************/
/*    BEGIN LIVE CHAT     */
/**************************/

var liveChatEnvironment;
var liveChatCSSPath;
var liveChatCanInviteUser = true;
var orgId;
var buttonIDSet;
var chatCall;
var resourceBasePath;

if (window.location.hostname.indexOf("qlik.qa.") > -1) {
	liveChatEnvironment = 'dev_sales';
	liveChatCSSPath = CSSPath.QA;
	orgId = SFOrgID.QA;
	buttonIDSet = ButtonIDs.QA;
	resourceBasePath = ResourceBasePath.QA;
}
else {
	liveChatEnvironment = 'prod_sales';
	liveChatCSSPath = CSSPath.Live;
	orgId = SFOrgID.Live;
	buttonIDSet = ButtonIDs.Live;
	resourceBasePath = ResourceBasePath.Live;
}

try {
!function ($, e) { "use strict";
var t = {

        getItem: function (e) { return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*"
            + encodeURIComponent(e).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null
        },

        setItem: function (e, t, n, o, i, a) {
            if (!e || /^(?:expires|max\-age|path|domain|secure)$/i.test(e)) return !1;
            var c = ""; 
            if (n) switch (n.constructor) {
                case Number: 
                    c = n === 1 / 0 ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + n;
                    break; 
                case String: 
                    c = "; expires=" + n; 
                    break; 
                case Date: 
                    c = "; expires=" + n.toUTCString()
            }
            return document.cookie = encodeURIComponent(e) + "=" + encodeURIComponent(t) + c + (i ? "; domain=" + i : "") + (o ? "; path=" + o : "")
                + (a ? "; secure" : ""), !0
        },

        removeItem: function (e, t, n) {
            return e && this.hasItem(e) 
                ? (document.cookie = encodeURIComponent(e) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (n ? "; domain=" + n : "") + (t ? "; path=" + t : ""), !0) 
                : !1
        },

        hasItem: function (e) { 
            return new RegExp("(?:^|;\\s*)" + encodeURIComponent(e).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=").test(document.cookie)
        },

        keys: function () {
            for (var e = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "")
            .split(/\s*(?:\=[^;]*)?;\s*/), t = 0; t < e.length; t++) e[t] = decodeURIComponent(e[t]); return e
        }
    },

    n = function () {
        var e = window.location.hostname, t = e.split("."), n = t.length, o = 2; if (2 < t[n - 1].length) o = 2;
        else { if (2 !== t[n - 1].length) return t.join("."); o = 3 } for (; t.length > o && 2 < t.length;) t.shift();
        return t.join(".")
    },

    o = function () {
        for (var e = document.getElementsByTagName("script"),
                t = /\/liveagent\.(min\.)?js/, n = /(https?:\/\/[^\/]+).*/, o = 0, i = e.length; i > o; o++) {
                    var a = e[o].getAttribute("src"); if (t.test(a)) { 
                        var c = n.exec(a, "$1"); return null !== c && c.length > 1 ? c[1] : ""
                    }   
                }
        return ""
    },

    i = { version: "1.4.2",
        config: {
            environment: "",
            environment_loaded: !1,
            assetHost: o(),
            cssPath: "/stylesheets/socialqv-liveagent.css",
            baseJS: "https://d.la1-c1-lon.salesforceliveagent.com/content/g/js/42.0/deployment.js",
            endpoint: "https://d.la1-c1-lon.salesforceliveagent.com/chat",
            deployment_id: "",
            org_id: orgId,
            button_id: "",
            buttonClass: "",
            buttonText: "Need help?",
            isChatActive: !1,
            canInviteUser: !1,
            sessionCookieName: "qvla_invite",
            delayToInvite: 1e4,
            inviteCopy: {
                headline: "Need Help?",
                subhead: "Connect with Qlik today",
                startchat: "I am interested in Qlik products",
                opensupport: "I am looking for Support"
            },
            debug: !1
        },
        environment: {
            prod_sales: { deployment_id: "572D00000008Ohz", button_id: "573D0000000Cb3P" },
            dev_sales: {
                baseJS: "https://c.la1-c2cs-lon.salesforceliveagent.com/content/g/js/42.0/deployment.js",
                endpoint: "https://c.la1-c2cs-lon.salesforceliveagent.com/chat", 
                deployment_id: "572D00000008Ohz", 
                org_id: orgId,
                button_id: "573D0000000Cb3P"
            }
        },
        button: null, 
        extraButtons: [] };

        e.qvLiveAgent = i,
        i.refreshStatus = function () {
            setTimeout(i.refreshStatus, 5100);
            var e = i.config.isChatActive;
            i.config.isChatActive = i.button.is(":visible"), 
            e !== i.config.isChatActive && i.refreshButtons()
        },

        i.setEnvironment = function (e, t) {
            i.log("setEnvironment", e, t), 
            "undefined" != typeof i.environment[e] && $.extend(i.config, i.environment[e], { environment_loaded: !0, environment: e }, t)
        },

        i.addEnvironment = function (e, t) {
            i.log("addEnvironment", arguments), 
            "object" == typeof t && ("undefined" != typeof i.environment[e] ? $.extend(i.environment[e], t) : i.environment[e] = t)
        },

        i.init = function (e) {
            i.log("init", e),
            i.config.environment_loaded || ("undefined" != typeof e.environment 
                    ? i.setEnvironment(e.environment, e) 
                    : i.setEnvironment(i.environment.prod_sales, e)),
            document.createStyleSheet 
                    ? document.createStyleSheet(i.config.assetHost + i.config.cssPath) 
                    : $("head").append('<link rel="stylesheet" href="' + i.config.assetHost + i.config.cssPath + '" type="text/css" />'),            
            i.button = $('<div class="liveagent" style="display:none;"><p class="qvs_liveagent"></p></div>'), i.log("button created");
            var t = $('<div id="liveagent-tab"/>');
            t.append(i.button), $("body").append(t), 
            i.button.bind("click", "rail", i.bindClick), 
            i.log("button click bound"),
            $.getScript(i.config.baseJS, function () {
                "undefined" != typeof window.liveagent && 
                    (window.liveagent.init(i.config.endpoint, i.config.deployment_id, i.config.org_id), 
                        i.log("liveagent init complete"),                        
                        window._laq || (window._laq = []), 
                        window._laq.push(function () { 
                                window.liveagent.showWhenOnline(i.config.button_id, i.button[0]), 
                                i.refreshStatus(), 
                                i.config.canInviteUser && c.init(), 
                                i.log("liveagent setup hook complete")
                            })
                    ) 
            })            
        },

        i.bindClick = function (e) {            
            if ($('#liveagent-inviteoverlay').css('display') == 'block') {              
                $('.innercontent h2').addClass('highlight-head');
                setTimeout(function unHighlightHead() {
                    $('.innercontent h2').removeClass('highlight-head');
                }, 300);
            } else {
                i.config.isChatActive = i.button.is(":visible");
                i.inviteUser.resetStatus();
                i.inviteUser.buildControls();
                i.inviteUser.openInvite();
            }            
        },

        i.registerButton = function (e) {
            e = $(e), 
            i.log("Adding button", e), 
            e.each(function () {
                 void 0 === i.extraButtons[this] && (i.extraButtons.push(this), 
                    e.bind("click", i.bindClick, this.id)) 
            }), 
            i.refreshButtons()
        },

        i.refreshButtons = function () {
            $.each(i.extraButtons, 
                function () { 
                    i.log("refresh button status on", this), 
                    i.config.isChatActive ? $(this).show() : $(this).hide() 
                })
        },

        i.trackEvent = function () {
            "undefined" != typeof window.dataLayer 
                ? window.dataLayer.push({ 
                        pageEventCategory: "Live Agent", 
                        pageEventAction: arguments[0], 
                        pageEventLabel: void 0 !== arguments[1] ? arguments[1] : i.config.button_id, 
                        event: "pageEvent" }) 
                : "undefined" != typeof window._gaq && window._gaq.push(["_trackEvent", "Live Agent", arguments[0], void 0 !== arguments[1] 
                                    ? arguments[1] 
                                    : i.config.button_id])
        },

        i.log = function () {
            if ("undefined" != typeof window.console && i.config.debug) {
                var e = [].slice.call(arguments, 0); 
                e.unshift("[qvLiveAgent] "), 
                window.console.log.apply(window.console, e)
            }
        };

    var a = !1,
        c = {
        init: function (e) { 
                i.log("{prompt} init"), 
                $.extend(i.config, e), 
                c.getStatus().prompted && i.config.canInviteUser && (i.log("{prompt} user already prompted"), i.config.canInviteUser = !1), 
                !a && i.config.canInviteUser && c.buildControls(), 
                i.config.canInviteUser && (i.log("setting up initial invite"), setTimeout(c.timerPoll, i.config.delayToInvite))
        },

        timerPoll: function () {
            var e = c.getStatus();
            return  i.log("timerPoll hit", e), 
                    i.config.canInviteUser 
                        ? void (i.config.isChatActive && !e.prompted 
                                            ? (i.log("allowed to prompt"), c.openInvite()) 
                                            : e.decline || (i.log("bad poll window"), setTimeout(c.timerPoll, i.config.delayToInvite))
                                ) 
                        : void i.log("invalid poll window")
        },

        buildControls: function () {
            i.log("{prompt} buildControls"),
            a || (
                i.config.container = $('<div id="liveagent-inviteoverlay"/>'),
                i.config.container.append('<div class="bgtop"><div class="bgbottom content"/><p class="close"><a href="#" class="closelink">Close</a></p></div>'),
                i.config.container.find(".content").append(c.generateContent()),
                i.config.container.hide(),
                $("body").append(i.config.container),
                i.config.container.find(".close").bind("click", { decline: !0, closewindow: !0 }, c.closeInvite),
                i.config.container.find(".opensupport").bind("click", { decline: !0 }),
                i.config.container.find(".startchat").bind("click", { decline: !1, closewindow: !1 }, c.closeInvite),
                a = !0)
        },

        generateContent: function () {
            i.log("{prompt} generateContent");
            var e = $("<div class='innercontent'/>");
            return e.append($("<h2/>").text(i.config.inviteCopy.headline)),
                e.append($("<h3/>").text(i.config.inviteCopy.subhead)),
                e.append($("<img width='35' height='35' class='popup_icon' src='https://s3-eu-west-1.amazonaws.com/qliklivechat/images/SupportIcon.png'/>")),
                e.append($("<a href='https://qliksupport.force.com/QS_CoveoSearch#t=All&sort=relevancy' target='_blank' class='opensupport'/><br/>").text(i.config.inviteCopy.opensupport)),
                e.append($("<img width='35' height='35' class='popup_icon' src='https://s3-eu-west-1.amazonaws.com/qliklivechat/images/ProductIcon.png'/>")),
                e.append($("<a href='#' class='startchat'/>").text(i.config.inviteCopy.startchat)),
                e
        },

        openInvite: function () {
            i.log("{prompt} openInvite"),
            jQuery.fn.overlay && jQuery.fn.overlay.isopen || jQuery.fn.onPageVideo && jQuery.fn.onPageVideo.isopen
                    || i.config.isChatActive && (i.config.container.show(), c.setStatus({ prompted: !0 }))
        },

        closeInvite: function (e) {
            return e.data = $.extend({ track: !0 }, e.data),
                i.log("{prompt} closeInvite with status", e),
                !e.data.decline && i.config.isChatActive 
                    ? ( i.log("launching chat with button_id", 
                        i.config.button_id), 
                        window.liveagent.startChat(i.config.button_id),
                        e.data.track && i.trackEvent("Accept Invite")) 
                    : e.data.decline || i.config.isChatActive || i.log("{prompt} invite without chat"),
                      e.data.decline && e.data.track && i.trackEvent("Decline Invite"),
                      e.data.closewindow 
                                ? i.config.container.hide("fast", function () { c.destroyInvite() }) 
                                : i.log("ok", e),
                      c.setStatus({ prompted: !0, decline: e.data.decline, agent: i.config.isChatActive }), 
                      !1
        },

        destroyInvite: function () {
            null !== i.config.container && a && (i.config.container.remove(), a = !1)
        },

        setStatus: function () {
            var e = { prompted: !1 };
            return arguments[0] !== !0 && $.extend(e, c.getStatus(), arguments[0]),
                i.log("{prompt} storeStatus with", e),
                t.setItem(i.config.sessionCookieName, JSON.stringify(e), !1, "/", n()), 
                e
        },

        getStatus: function () {
            var e = JSON.parse(t.getItem(i.config.sessionCookieName));
            return (e === {} || null === e) && (e = c.setStatus(!0)), 
                    e
        },

        resetStatus: function () {
            t.removeItem(i.config.sessionCookieName), 
            c.setStatus(!0)
        }
    };

    i.inviteUser = c }(jQuery, window);
} catch (err) {
	console.log(err);
}

/**************************/
/*     END LIVE CHAT      */
/**************************/
try {	
	qvLiveAgent.init({ 
		environment: liveChatEnvironment, 
		canInviteUser: liveChatCanInviteUser, 
		cssPath: liveChatCSSPath 
	});
} catch (err) {
	console.log(err);
}
/*================================================================================
 END QA BLOCK
 ================================================================================*/

    })()
} else {
    (function () {

/*================================================================================
 BEGIN PROD BLOCK
 ================================================================================*/
        /*********************************************************************************
         Live chat settings section.
         Used in live chat implementation. OrgId refers to Salesforce OrgID;

         ***********************************************************************************/

        var ResourceBasePath = {
            QA: "https://s3-eu-west-1.amazonaws.com/qliklivechat/qa",
            Live: "https://s3-eu-west-1.amazonaws.com/qliklivechat/live"
        };

        var CSSPath = {
            QA: ResourceBasePath.QA + "/livechat.css",
            Live: ResourceBasePath.Live + "/livechat.css"
        };

        var SFOrgID = {
            QA: '00D250000008s0i',
            Live: '00D20000000IGPX'
        };

        var ButtonIDs = {
            QA: {
                ContactSales: '573D000000002AN',
                QlikSense: '573D000000002AO',
                QlikView: '573D000000002AQ',
                QlikSenseCloud: '573D000000002AP'
            },
            Live: {
                ContactSales: '573D000000002AN',
                QlikSense: '573D000000002AO',
                QlikView: '573D000000002AQ',
                QlikSenseCloud: '573D000000002AP'
            }
        };
        /********************************************************************************
         END Live chat settings section
         ***********************************************************************************/

        /*********************************************************************************
         Live chat and proactive chat
         ***********************************************************************************/

        /**************************/
        /*    BEGIN LIVE CHAT     */
        /**************************/

        var liveChatEnvironment;
        var liveChatCSSPath;
        var liveChatCanInviteUser = true;
        var orgId;
        var buttonIDSet;
        var chatCall;
        var resourceBasePath;

        if (window.location.hostname.indexOf("qlik.qa.") > -1) {
            liveChatEnvironment = 'dev_sales';
            liveChatCSSPath = CSSPath.QA;
            orgId = SFOrgID.QA;
            buttonIDSet = ButtonIDs.QA;
            resourceBasePath = ResourceBasePath.QA;
        }
        else {
            liveChatEnvironment = 'prod_sales';
            liveChatCSSPath = CSSPath.Live;
            orgId = SFOrgID.Live;
            buttonIDSet = ButtonIDs.Live;
            resourceBasePath = ResourceBasePath.Live;
        }

        try {
            !function ($, e) { "use strict";
                var t = {

                        getItem: function (e) { return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*"
                            + encodeURIComponent(e).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null
                        },

                        setItem: function (e, t, n, o, i, a) {
                            if (!e || /^(?:expires|max\-age|path|domain|secure)$/i.test(e)) return !1;
                            var c = ""; if (n) switch (n.constructor)
                            {
                                case Number: c = n === 1 / 0 ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + n;
                                    break; case String: c = "; expires=" + n; break; case Date: c = "; expires=" + n.toUTCString()
                            }
                            return document.cookie = encodeURIComponent(e) + "=" + encodeURIComponent(t) + c + (i ? "; domain=" + i : "") + (o ? "; path=" + o : "")
                                + (a ? "; secure" : ""), !0
                        },

                        removeItem: function (e, t, n) {
                            return e && this.hasItem(e) ? (document.cookie = encodeURIComponent(e)
                                + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (n ? "; domain=" + n : "") + (t ? "; path=" + t : ""), !0) : !1
                        },

                        hasItem: function (e) { return new RegExp("(?:^|;\\s*)"
                            + encodeURIComponent(e).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=").test(document.cookie)
                        },

                        keys: function () {
                            for (var e = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "")
                                .split(/\s*(?:\=[^;]*)?;\s*/), t = 0; t < e.length; t++) e[t] = decodeURIComponent(e[t]); return e
                        }
                    },

                    n = function () {
                        var e = window.location.hostname, t = e.split("."), n = t.length, o = 2; if (2 < t[n - 1].length) o = 2;
                        else { if (2 !== t[n - 1].length) return t.join("."); o = 3 } for (; t.length > o && 2 < t.length;) t.shift();
                        return t.join(".")
                    },

                    o = function () {
                        for (var e = document.getElementsByTagName("script"),
                                 t = /\/liveagent\.(min\.)?js/, n = /(https?:\/\/[^\/]+).*/, o = 0, i = e.length; i > o; o++) {
                            var a = e[o].getAttribute("src"); if (t.test(a)) { var c = n.exec(a, "$1"); return null !== c && c.length > 1 ? c[1] : ""
                            }
                        }
                        return ""
                    },

                    i = { version: "1.4.2",
                        config: {
                            environment: "",
                            environment_loaded: !1,
                            assetHost: o(),
                            cssPath: "/stylesheets/socialqv-liveagent.css",
                            baseJS: "https://d.la1-c1-lon.salesforceliveagent.com/content/g/js/42.0/deployment.js",
                            endpoint: "https://d.la1-c1-lon.salesforceliveagent.com/chat",
                            deployment_id: "",
                            org_id: orgId,
                            button_id: "",
                            buttonClass: "",
                            buttonText: "Need help?",
                            isChatActive: !1,
                            canInviteUser: !1,
                            sessionCookieName: "qvla_invite",
                            delayToInvite: 1e4,
                            inviteCopy: {
                                headline: "Need Help?",
                                subhead: "Connect with Qlik today",
                                startchat: "I am interested in Qlik products",
                                opensupport: "I am looking for Support"
                            },
                            debug: !1
                        },
                        environment: {
                            prod_sales: { deployment_id: "572D00000008Ohz", button_id: "573D0000000Cb3P" },
                            dev_sales: {
                                baseJS: "https://c.la1-c2cs-lon.salesforceliveagent.com/content/g/js/42.0/deployment.js",
                                endpoint: "https://c.la1-c2cs-lon.salesforceliveagent.com/chat", deployment_id: "572D00000008Ohz", org_id: orgId,
                                button_id: "573D0000000Cb3P"
                            }
                        },
                        button: null, extraButtons: [] };

                e.qvLiveAgent = i,
                    i.refreshStatus = function () {
                        setTimeout(i.refreshStatus, 5100);
                        var e = i.config.isChatActive;
                        i.config.isChatActive = i.button.is(":visible"), e !== i.config.isChatActive && i.refreshButtons()
                    },

                    i.setEnvironment = function (e, t) {
                        i.log("setEnvironment", e, t),
                        "undefined" != typeof i.environment[e] && $.extend(i.config, i.environment[e],
                            { environment_loaded: !0, environment: e }, t)
                    },

                    i.addEnvironment = function (e, t) {
                        i.log("addEnvironment", arguments), "object" == typeof t
                        && ("undefined" != typeof i.environment[e] ? $.extend(i.environment[e], t) : i.environment[e] = t)
                    },

                    i.init = function (e) {
                        i.log("init", e),
                        i.config.environment_loaded ||
                        ("undefined" != typeof e.environment ? i.setEnvironment(e.environment, e) : i.setEnvironment(i.environment.prod_sales, e)),
                            document.createStyleSheet ? document.createStyleSheet(i.config.assetHost + i.config.cssPath) : $("head").append('<link rel="stylesheet" href="'
                                + i.config.assetHost + i.config.cssPath + '" type="text/css" />'),
                            i.button = $('<div class="liveagent" style="display:none;"><p class="qvs_liveagent"></p></div>'), i.log("button created");
                            var t = $('<div id="liveagent-tab"/>');
                            t.append(i.button), $("body").append(t), i.button.bind("click", "rail", i.bindClick), i.log("button click bound"),
                                $.getScript(i.config.baseJS, function () { "undefined" != typeof window.liveagent
                                && (window.liveagent.init(i.config.endpoint, i.config.deployment_id, i.config.org_id), i.log("liveagent init complete"),
                                window._laq || (window._laq = []), window._laq.push(function () { window.liveagent.showWhenOnline(i.config.button_id,
                                    i.button[0]), i.refreshStatus(), i.config.canInviteUser && c.init(), i.log("liveagent setup hook complete") })) })
                    },

                    i.bindClick = function (e) {
                        if ($('#liveagent-inviteoverlay').css('display') == 'block') {              
                            $('.innercontent h2').addClass('highlight-head');
                            setTimeout(function unHighlightHead() {
                                $('.innercontent h2').removeClass('highlight-head');
                            }, 300);
                        } else {
                            i.config.isChatActive = i.button.is(":visible");
                            i.inviteUser.resetStatus();
                            i.inviteUser.buildControls();
                            i.inviteUser.openInvite();
                        }
                    },

                    i.registerButton = function (e) {
                        e = $(e), i.log("Adding button", e), e.each(function () { void 0 === i.extraButtons[this]
                        && (i.extraButtons.push(this), e.bind("click", i.bindClick, this.id)) }), i.refreshButtons()
                    },

                    i.refreshButtons = function () {
                        $.each(i.extraButtons, function () { i.log("refresh button status on", this), i.config.isChatActive ? $(this).show() : $(this).hide() })
                    },

                    i.trackEvent = function () {
                        "undefined" != typeof window.dataLayer ? window.dataLayer.push({ pageEventCategory: "Live Agent",
                                pageEventAction: arguments[0], pageEventLabel: void 0 !== arguments[1] ? arguments[1] : i.config.button_id, event: "pageEvent" }) :
                            "undefined" != typeof window._gaq && window._gaq.push(["_trackEvent", "Live Agent", arguments[0], void 0 !== arguments[1] ?
                            arguments[1] : i.config.button_id])
                    },

                    i.log = function () {
                        if ("undefined" != typeof window.console && i.config.debug) {
                            var e = [].slice.call(arguments, 0); e.unshift("[qvLiveAgent] "), window.console.log.apply(window.console, e)
                        }
                    };

                var a = !1,
                    c = {
                        init: function (e) { i.log("{prompt} init"), $.extend(i.config, e), c.getStatus().prompted
                        && i.config.canInviteUser && (i.log("{prompt} user already prompted"), i.config.canInviteUser = !1), !a
                        && i.config.canInviteUser && c.buildControls(), i.config.canInviteUser && (i.log("setting up initial invite"),
                            setTimeout(c.timerPoll, i.config.delayToInvite))
                        },
                        timerPoll: function () {
                            var e = c.getStatus();
                            return i.log("timerPoll hit", e), i.config.canInviteUser ? void (i.config.isChatActive && !e.prompted
                                ? (i.log("allowed to prompt"), c.openInvite()) : e.decline || (i.log("bad poll window"),
                                setTimeout(c.timerPoll, i.config.delayToInvite))) : void i.log("invalid poll window")
                        },

                        buildControls: function () {
                            i.log("{prompt} buildControls"),
                            a || (
                                i.config.container = $('<div id="liveagent-inviteoverlay"/>'),
                                    i.config.container.append('<div class="bgtop"><div class="bgbottom content"/><p class="close"><a href="#" class="closelink">Close</a></p></div>'),
                                    i.config.container.find(".content").append(c.generateContent()),
                                    i.config.container.hide(),
                                    $("body").append(i.config.container),
                                    i.config.container.find(".close").bind("click", { decline: !0, closewindow: !0 }, c.closeInvite),
                                    i.config.container.find(".opensupport").bind("click", { decline: !0 }),
                                    i.config.container.find(".startchat").bind("click", { decline: !1, closewindow: !1 }, c.closeInvite),
                                    a = !0)
                        },

                        generateContent: function () {
                            i.log("{prompt} generateContent");
                            var e = $("<div class='innercontent'/>");
                            return e.append($("<h2/>").text(i.config.inviteCopy.headline)),
                                e.append($("<h3/>").text(i.config.inviteCopy.subhead)),
                                e.append($("<img width='35' height='35' class='popup_icon' src='https://s3-eu-west-1.amazonaws.com/qliklivechat/images/SupportIcon.png'/>")),
                                e.append($("<a href='https://qliksupport.force.com/QS_CoveoSearch#t=All&sort=relevancy' target='_blank' class='opensupport'/><br/>").text(i.config.inviteCopy.opensupport)),
                                e.append($("<img width='35' height='35' class='popup_icon' src='https://s3-eu-west-1.amazonaws.com/qliklivechat/images/ProductIcon.png'/>")),
                                e.append($("<a href='#' class='startchat'/>").text(i.config.inviteCopy.startchat)),
                                e
                        },

                        openInvite: function () {
                            i.log("{prompt} openInvite"),
                            jQuery.fn.overlay && jQuery.fn.overlay.isopen || jQuery.fn.onPageVideo && jQuery.fn.onPageVideo.isopen
                            || i.config.isChatActive && (i.config.container.show(),
                                c.setStatus({ prompted: !0 }))
                        },

                        closeInvite: function (e) {
                            return e.data = $.extend({ track: !0 }, e.data),
                                i.log("{prompt} closeInvite with status", e),
                                !e.data.decline && i.config.isChatActive ? (i.log("launching chat with button_id", i.config.button_id),
                                    window.liveagent.startChat(i.config.button_id),
                                e.data.track && i.trackEvent("Accept Invite")) : e.data.decline || i.config.isChatActive || i.log("{prompt} invite without chat"),
                            e.data.decline && e.data.track && i.trackEvent("Decline Invite"),
                                e.data.closewindow ? i.config.container.hide("fast", function () { c.destroyInvite() }) : i.log("ok", e),
                                c.setStatus({ prompted: !0, decline: e.data.decline, agent: i.config.isChatActive }), !1
                        },

                        destroyInvite: function () {
                            null !== i.config.container && a && (i.config.container.remove(), a = !1)
                        },

                        setStatus: function () {
                            var e = { prompted: !1 };
                            return arguments[0] !== !0 && $.extend(e, c.getStatus(), arguments[0]),
                                i.log("{prompt} storeStatus with", e),
                                t.setItem(i.config.sessionCookieName, JSON.stringify(e), !1, "/", n()), e
                        },

                        getStatus: function () {
                            var e = JSON.parse(t.getItem(i.config.sessionCookieName));
                            return (e === {} || null === e) && (e = c.setStatus(!0)), e
                        },

                        resetStatus: function () {
                            t.removeItem(i.config.sessionCookieName), c.setStatus(!0)
                        }
                    };

                i.inviteUser = c }(jQuery, window);
        } catch (err) {
            console.log(err);
        }

        /**************************/
        /*     END LIVE CHAT      */
        /**************************/
        try {
            qvLiveAgent.init({
                environment: liveChatEnvironment,
                canInviteUser: liveChatCanInviteUser,
                cssPath: liveChatCSSPath
            });
        } catch (err) {
            console.log(err);
        }
/*================================================================================
 END PROD BLOCK
 ================================================================================*/

    })()
}
