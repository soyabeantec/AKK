(function () {
  if ('Discourse' in window && typeof Discourse._registerPluginCode === 'function') {
    var __theme_name__ = "Elastic";
    var settings = Discourse.__container__.lookup("service:theme-settings").getObjectForTheme(2);
    var themePrefix = function themePrefix(key) {
      return 'theme_translations.2.' + key;
    };

    Discourse._registerPluginCode('0.8', function (api) {
      try {

        // reverts the solved icon to the old solid icon
        api.replaceIcon('check-square-o', 'check-square');
      } catch (err) {
        var rescue = require("discourse/lib/utilities").rescueThemeError;
        rescue(__theme_name__, err, api);
      }
    });
  }
})();(function () {
  if ('Discourse' in window && typeof Discourse._registerPluginCode === 'function') {
    var __theme_name__ = "Elastic";
    var settings = Discourse.__container__.lookup("service:theme-settings").getObjectForTheme(2);
    var themePrefix = function themePrefix(key) {
      return 'theme_translations.2.' + key;
    };

    Discourse._registerPluginCode('0.8.27', function (api) {
      try {

        // add Kibana language to HighlightJS
        // Must build highlight.js with "node tools/build.js -t cdn"
        // and take the function from the minified language file (kibana.min.js in this case)
        var kibanaLang = function kibanaLang(e) {
          return { aliases: ["es", "elasticsearch", "elastic"], cI: !1, c: [{ bK: "GET HEAD PUT POST DELETE PATCH", e: "$", c: [{ cN: "title", b: "/?.+" }] }, { b: "^{$", e: "^}$", sL: "json" }] };
        };
        api.registerHighlightJSLanguage("kibana", kibanaLang);
      } catch (err) {
        var rescue = require("discourse/lib/utilities").rescueThemeError;
        rescue(__theme_name__, err, api);
      }
    });
  }
})();