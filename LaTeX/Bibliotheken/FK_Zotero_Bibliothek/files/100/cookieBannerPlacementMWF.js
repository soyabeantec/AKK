/// <disable>JS2028,JS2023</disable>

(function ($) {
    'use strict';

    var nav = $(".navigation.navigation-fixed");
    var body = $("body");
    var banner = $(".cc-banner");
    var wrapper = $(".cookie-banner");

    function bannerPlacement() {
        var bannerHeight = banner.height();
        body.css("padding-top", "68px");
        if (banner.hasClass("active")) {
            nav.css("top", bannerHeight);
            body.css("padding-top", "+=" + bannerHeight);
            if (!wrapper.is(":visible")) {
                wrapper.show();
            }
        } else {
            nav.css("top", "0");
            $('body').unbind('mouseup', bannerPlacement);
            $('body').unbind('keyup', bannerPlacement);
            $('body').unbind('submit', bannerPlacement);
        }
    }

    $(window).on('load', bannerPlacement);
    $(document).ready(bannerPlacement);
    $(window).on("orientationchange", bannerPlacement);
    $(window).resize(bannerPlacement);
    $('body').on('mouseup', bannerPlacement);
    $('body').on('keyup', bannerPlacement);
    $('body').on('submit', bannerPlacement);
})(jQuery);
