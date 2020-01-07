(function ($) {
  Drupal.behaviors.fancyFileDeleteViewRefresh = {
    attach: function() {
      // Refresh the view
      $('.ffd-refresh').click( function() {
        $('.view-id-fancy_file_list_unmanaged').trigger('RefreshView');
      });
    }
  }
})(jQuery);
;
/**
 * Either returns or acts on user browser language preference, depending on what
 * parameters are passed.
 *
 * @param mixed async
 *   If a callable is passed, the callable will be called when a browser's
 *   language preference is determined, with the language preference as its only
 *   argument. Nothing will be returned. If a boolean false is passed, the check
 *   for language preference will be performed synchronously and the result
 *   returned.
 * @return
 *   If called with async=false, the language preference will be returned.
 *   Otherwise,
 */
(function($) {
  Drupal.getLanguagePreference = function (async) {
    var preference = '',
        langPref = $.cookie('langPref');

    // Only perform the HTTP request if the value isn't already known.
    if (!langPref) {
      // Perform a request for parsed accept-language header data.
      var ajaxAsync = (typeof async === 'boolean') ? async : true;
      jQuery.ajax({
        url: Drupal.settings.getLanguagePreferencePath,
        async: ajaxAsync,
        success: function (data) {
          preference = data[1] || 'und';

          // Store the language preference in a cookie to minimize requests.
          $.cookie('langPref', preference, {path: '/'});

          // Call the callback with the language preference.
          if (typeof async === 'function') {
            async(preference);
          }
        }
      });
    }
    else {
      // If we already have the value, just call the callback.
      if (typeof async === 'function') {
        async(langPref);
      }
    }

    // Only return a value if this method was intended to be called synchronously.
    if (typeof async === 'boolean' && !async) {
      return preference || langPref;
    }
  };
})(jQuery);
;
/**
 * @file Eloqua API proxy endpoint querying and setting to localStorage.
 */

Drupal.behave('tableauEloqua').ready(function ($) {
  var behavior = this.behavior,
      settings = this.settings.tableauEloqua,
      ELOQUA_DETAILS = 'elqDetails',
      ELOQUA_FLOOD = 'elqRateLimit',
      DEFAULT_TTL = 86400 * 14 * 1000,
      elqDetailsTTL = settings.elqDetailsTTL || DEFAULT_TTL,
      elqDetailsStashed,
      downloads,
      stashProperties = [
        'industry',
        'department',
        'trial_start_date',
        'customer',
        'stage',
        'job_role',
        'lead_status',
        'online_trial_exp_date',
        'postalCode',
        'province',
        'city',
        'country',
        'lifecycle',
        // Eloqua detail retrieval related variables. See: automagic.js
        'eid',
        'domain',
        'hashedEmail'
      ];

  Tabia.debug('Eloqua contact details behavior ready', {
    type: 'eloquaClient',
    data: {settings: settings}
  });


  /**
   * Push details to dataLayer and trigger custom event, passing data.
   *
   * @param {object} data
   */
  behavior.pushDetails = function (data) {
    data = data || elqDetailsStashed;
    if (data) {
      $(document).trigger('elqDetails', [data]);
      dataLayer.push({userElq: data});
    }
  };


  /**
   * Load the stored details.
   */
  behavior.loadDetails = function () {
    elqDetailsStashed = groucho.storage.get(ELOQUA_DETAILS);

    // Ensure object is stored unserialized (backwards compatibility).
    // @todo Should be done via groucho.schema().
    if (typeof elqDetailsStashed === 'string') {
      elqDetailsStashed = JSON.parse(elqDetailsStashed);
      groucho.storage.set(ELOQUA_DETAILS, elqDetailsStashed, elqDetailsTTL);
    }

    // Check TTL on elqDetails. If zero, force a refetch.
    // Storage TTL data interface not available via groucho.
    if ($.jStorage.getTTL(ELOQUA_DETAILS) === null) {
      Tabia.debug('TTL expired in localStorage Eloqua details. Force fetch.', {type: 'eloquaClient'});
      elqDetailsStashed = null;
    }
    else {
      Tabia.debug('Loaded Eloqua details from localStorage', {
        type: 'eloquaClient',
        data: {elqDetails: elqDetailsStashed}
      });
    }

    // Put stashed goodies into the dataLayer for GTM.
    $(window).load(function onWindowLoad() {
      behavior.pushDetails();
    });
  };


  /**
   * Set a rate limiting cookie.
   *
   * @param {number} duration
   */
  behavior.setFloodCookie = function (duration) {
    var now = new Date().getTime(),
        expires;
    // Set 30 min expiration by default
    duration = duration || 30 * 60 * 1000;
    expires = new Date(now + duration);
    $.cookie(ELOQUA_FLOOD, '1', {expires: expires, path: Drupal.settings.basePath});
    Tabia.debug('Set rate limit cookie', {type: 'eloquaClient', data: {cookieExpires: expires}});
  };


  /**
   * Make Eloqua GUID function available and use the value for a callback.
   *
   * @param {Function} callback
   *   Takes the guid as it's argument via options object. Must have a fail() method.
   * @param {Function} failure
   *   Called if GUID generation fails, is passed through to success callback.
   */
  behavior.useGuid = function (callback, failure) {
    var failCallback = failure || function() {
          Tabia.debug('Getting GUID or using it failed');
        },
        localGuid = '';

    // Attempt to retrieve the GUID using Eloqua API's helper.
    Drupal.behaviors.eloquaApiTracking.getGuid(function guidRetrieved (guid) {
      localGuid = guid;
    });

    Tabia.util.waitFor(
      function testForGuid () {
        return localGuid.length > 0;
      },
      function gotGuid () {
        // Use the GUID in the argument function callback;
        callback({guid: localGuid}).fail(failCallback);
      },
      function didNotGetGuid () {
        failCallback();
      },
      {
        waitTimeout: 5000
      }
    );
  };


  /**
   * Get user info from Eloqua or Drupal user (authenticated).
   *
   * @param {object} options
   * @param {string} options.guid - Eloqua GUID
   * @param {(number|string)} options.eid - Eloqua Contact ID (pair with domain)
   * @param {string} options.domain - Eloqua contact domain (pair with eid)
   * @param {(number|string)} options.hashedEmail - Eloqua hashed email address (C_SHA256HashedEmailAddress) (can be used alone)
   * @param {boolean} [options.full] - Do full data retrieval
   *
   * @return {Promise}
   */
  behavior.getInfo = function (options) {
    var dataFound = $.Deferred(),
        apiUrl,
        jsonRequestParams;

    // Decide how to collect the data.
    options = options || {};
    // The "full" option is set when called from automagic.js
    apiUrl = options.full ? '/eloqua/getdetails' : '/eloqua/getinfo';

    if (options.hashedEmail) {
      jsonRequestParams = {hashedEmail: options.hashedEmail};
    }
    else if (options.eid && options.domain) {
      jsonRequestParams = {eid: options.eid, domain: options.domain};
    }
    else if (options.guid) {
      jsonRequestParams = {guid: options.guid};
    }

    Tabia.debug('Getting eloqua data via API: ' + apiUrl, {type: 'eloquaClient', data: jsonRequestParams});

    $.getJSON(apiUrl, jsonRequestParams)
      .done(function eloquaResponse(data) {
        var industryTid;

        Tabia.debug('Got Eloqua contact details', {type: 'eloquaClient', data: {elqDetails: data}});

        // If the result isn't just false, process and stash it in localStorage with a TTL.
        if (data.result !== false) {
          // Provide the request params in the data. This allows the request mechanism to be
          // persisted through localStorage.
          _.extend(data, jsonRequestParams);

          // Here we have a limited set of info, we can store that directly in various places
          // after running through some term mapping to transform values into taxonomy term ids.
          if (!options.full) {
            // Functional location.
            groucho.storage.set(ELOQUA_DETAILS, data, {TTL: elqDetailsTTL});
            // Find industry tid via mapping.
            if (_.has(Tabia, 'map') && _.has(Tabia.map, 'industryTid')) {
              industryTid = Tabia.map.industryTid(data.industry);
              data.industry = industryTid;
            }

            // Standardized user property management.
            groucho.userSet(data, false, elqDetailsTTL);
            Tabia.debug('User properties set by Eloqua', {data: data});
            // Get into the dataLayer.
            behavior.pushDetails(data);
            dataFound.resolve(data);
          }
          // A "full" contact record retrieval contains PII data, we will be careful and elect to
          // stash only a portion of it.
          else {
            // Stash limited user data from full contact record.
            groucho.userSet(_.pick(data, stashProperties), false, elqDetailsTTL);
          }
          // Promises promises.
          dataFound.resolve(data);
        }
        else {
          // Log the failure.
          Tabia.warning('Eloqua getinfo failure', {
            type: 'eloquaClient',
            data: {eloquaRequest: options}
          });
          // Over the limit.
          behavior.setFloodCookie();
          dataFound.reject();
        }
      })
      .fail(function eloquaAjaxFail() {
        Tabia.warning('Eloqua getinfo AJAX failure', {
          type: 'eloquaClient',
          data: {ajaxFail: arguments}
        });
        dataFound.reject();
      });

    return dataFound.promise();
  };


  // If behavior is switched on. Tools may be used for other features.
  if (settings.contactLocalstorage) {
    // Load details from localStorage and add to dataLayer.
    behavior.loadDetails();
    // If we don't see a value in localStorage yet, do some work to grab it.
    // Note: if the flood cookie is set, we'll skip this part.
    if (!elqDetailsStashed && !$.cookie(ELOQUA_FLOOD)) {
      // If the user is not logged in poll for the function GetElqCustomerGUID,
      // once a second, max of 5 tries. This should only need to happen once
      // then it's in localStorage, until it gets cleared somehow.
      if (!$('body.logged-in').length) {
        Tabia.debug('User is not logged in.', {type: 'eloquaClient'});
        // Load an array of downloaded products from localStorage.
        // Use trial downloads to limit Eloqua lookup volume.
        downloads = groucho.userGet('downloads');
        if (downloads && downloads.length) {
          // Only make the call to Eloqua if they have downloaded at least one trial.
          // Make GUID available, then make the Eloqua API call.
          behavior.useGuid(behavior.getInfo);
        }
      }
      // User is logged in, just hit the endpoint and it'll query with the email address.
      else {
        // Make the Eloqua API call.
        behavior.getInfo();
      }
    }
  }

});
;
/**
 * @file Automagic form UX.
 */

/* jshint camelcase:false */

(function ($) {

  var behave = Drupal.behave('tableauEloquaAutomagic'),
      behavior = behave.behavior(),
      loadingMessage = Drupal.t('Looking up details, one moment...'),
      $form = $('[data-is-automagic="true"]'),
      persistentData,
      dataMapping;

  // Mapping table.
  dataMapping = [{
    source: 'firstName',
    input: 'profile_about_you[field_profile_first_name]'
  }, {
    source: 'lastName',
    input: 'profile_about_you[field_profile_last_name]'
  }, {
    source: 'emailAddress',
    input: 'profile_about_you[mail]'
  }, {
    source: 'emailAddress',
    input: 'profile_about_you[tab_mail_confirm]'
  }, {
    source: 'accountName',
    input: 'profile_about_you[field_profile_organization]'
  }, {
    source: 'industry',
    input: 'profile_about_you[taxonomy_vocabulary_4]'
  }, {
    source: 'department',
    input: 'profile_about_you[field_profile_department]'
  }, {
    source: 'job_role',
    input: 'profile_about_you[field_profile_job_role]'
  }, {
    source: 'businessPhone',
    input: 'profile_about_you[field_profile_phone]'
  }, [{
      group: 'address',
      source: 'country',
      input: 'profile_about_you[field_profile_address][und][0][country]'
    }, {
      group: 'address',
      source: 'province',
      input: 'profile_about_you[field_profile_address][und][0][administrative_area]'
    }, {
      group: 'address',
      source: 'postalCode',
      input: 'profile_about_you[field_profile_address][und][0][postal_code]'
    }]
  ];

  /**
   * Get persistent data from a given form.
   *
   * @param {Element} $form
   *  jQuery DOM form element.
   * @param {string} key
   *  The key which identifies the persistent data.
   *
   * @return {object}
   *  JSON object holding the persistent data.
   */
  behavior.getPersistentFormData = function ($form, key) {
    var persistentData = [];

    try {
      persistentData = JSON.parse($form.find('input[name="tableau_persist_data"]').val());

      if (_.has(persistentData, key)) {
        return persistentData[key];
      }

      return persistentData;
    }
    catch (e) {
      Tabia.warning('Unable to get persistent data from form: ' + e.message, {type: 'Automagigc'});
      return persistentData;
    }
  };

  /**
   * Set persistent data on a given form.
   *
   * @param {Element} $form
   *  jQuery DOM form element.
   * @param {string} key
   *  The key to store the persistent data as.
   * @param {object} value
   *  JSON object holding the persistent data.
   */
  behavior.setPersistentFormData = function ($form, key, value) {
    var persistentData = this.getPersistentFormData($form);

    // Append the new persistent values.
    persistentData[key] = value;

    $form.find('input[name="tableau_persist_data"]').val(JSON.stringify(persistentData));
  };

  /**
   * Add automagic toggle.
   *
   * When clicked clears and restores the form to the default state.
   *
   * @param {object} userInfo
   *  JSON object holding the user details.
   */
  behavior.showAutoMagicToggle = function (userInfo) {
    $('.form-item-profile-about-you-mail').append(
      $('<label>', {
        html: Drupal.t('This is not me.'), 'for': 'notMe',
        class: 'text--benton-book text--body-small'
      }).add($('<input>', {type: 'checkbox', id: 'notMe'}))
    );

    // Attach click handler.
    $('#notMe').click(function showFullForm (e) {

      // Unbind the change handler from the email field so they can edit the email without clearing the form.
      $('#edit-profile-about-you-mail').off('change.automagic');
      // Restore the form to its original state.
      behavior.restoreForm();

      // Log the user action.
      Tabia.warning('User chose: This is not me', {type: 'elqKnown', data: userInfo});

      // Prevent event bubbling because removed self.
      e.stopPropagation();
    });


    // Reveal/clear the full form if user changes the email field value.
    // Prevents forwarded automagic URLs from being re-used with the original
    // user's data, people don't always see (or use) the "It's Not Me" checkbox.
    $('#edit-profile-about-you-mail').on('change.automagic', function showFullForm () {

      //Grab the email address they entered so we can give it back to them after clearing the form.
      var $emailField = $('#edit-profile-about-you-mail'),
          newEmail = $emailField.val(),
          changeTxt = Drupal.t('This looks like a new email address, please tell us a bit about yourself.'),
          changeMsg = $('<span />').html(changeTxt);

      // Restore the form to its original state.
      behavior.restoreForm();

      // Fill the email field with whatever they had changed it to.
      $emailField.val(newEmail);
      $emailField.next('.form-field__description').html(changeMsg);

      // Unbind this change handler so they can edit the email without clearing the form again.
      $emailField.off('change.automagic');

      // Log the user action, log original user info so we can track who is forwarding links.
      Tabia.warning('User changed email address on autoMagic filled form', {
        type: 'automagic',
        data: {
          newEmail: newEmail || '',
          oldUser: userInfo
        }});
    });
  };

  /**
   * Use known user data to reduce the form UX.
   *
   * @param {object} userInfo
   *   User data retrieved from Eloqua.
   */
  behavior.autoMagic = function (userInfo) {
    var isTableauUser = /.+@tableau(software)?\.com/,
        missingGroupInfo = false,
        threshold = 0;

    // We know this person, autofill/hide all known user fields.
    if (userInfo.emailAddress && !isTableauUser.test(userInfo.emailAddress)) {
      Tabia.debug('Filling form via Eloqua API', {
        type: 'elqKnown',
        data: userInfo
      });

      // Iterate over all form inputs and perform automagic.
      _.each(dataMapping, function (mapping) {
        // Account for field groups, don't hide group inputs if any of its
        // children has missing values.
        if (_.isArray(mapping)) {
          // We store all children with missing user data in an array using the
          // _.reject function. If this array is empty, then we can safely hide
          // the entire group.
          missingGroupInfo = _.reject(
            _.pluck(mapping, 'source'), function (source) {
              return _.has(userInfo, source);
            }
          );

          // Special use case: international address formats.
          // We make the assumption that valid address data contains at least
          // two out of three required values.
          if (mapping[0]['group'] === 'address') {
            threshold = 1;
          }

          // Continue to perform automagic if children have enough data.
          if (missingGroupInfo.length <= threshold) {
            // Perform automagic on all children in the group.
            _.each(mapping, function (childMapping) {
               behavior.autoMagicFormInput(userInfo, childMapping);
            });
          }
        }
        else {
          behavior.autoMagicFormInput(userInfo, mapping);
        }
      });

      // Store automagic-enabled fields in our persistent form data in order
      // to bypass server-side validation.
      // @see tableau_eloqua_implementation_automagic_validate
      behavior.setPersistentFormData($form, 'tableau_automagic', persistentData);

      // Set automagic class on form.
      $form.addClass('is-automagic');

      // Show automagic checkbox.
      behavior.showAutoMagicToggle(userInfo);

      // Remove overlay.
      Components.loadingOverlay.hide($form);
    }
    else {
      // Turns out we don't know them, or lookup is prevented.
      behavior.restoreForm();
      // Log this.
      Tabia.warning('No Eloqua contact found.', {type: 'elqUnKnown', data: userInfo});
    }
  };

  /**
   * Perform automagic on a single form element.
   *  - Hide the form input.
   *  - Set the input value.
   *  - Store the input name in our persistent form data.
   *
   * @param {object} userInfo
   * @param {object} mapping
   */
  behavior.autoMagicFormInput = function (userInfo, mapping) {
    var $element = $form.find('[name^="' + mapping.input + '"]'),
        value = userInfo[mapping.source],
        hasAutomagicNoHide = Tabia.util.getUrlParameter('automagic-no-hide');

    // Break out early if no element or value is present.
    if (!$element.length || !value) {
      return;
    }

    // Handle field groups.
    if (_.has(mapping, 'group')) {
      // Store the group as a data attribute on the group element.
      $element.closest('.form-item').attr('data-group', mapping.group);

      // Hide geocomplete field when appropriate.
      if (mapping.group === 'address') {
        behavior.toggleGeocompleteInput();
      }
    }

    // Automagic per field type.
    switch (mapping.source) {
      case 'emailAddress':
        // Hide e-mail confirmation input.
        behavior.hideFormInput($form.find('[name="profile_about_you[tab_mail_confirm]"]'), hasAutomagicNoHide);

        // Set the form input value.
        behavior.setFormInput($element, value);
        break;
      default:
        // Hide the form input.
        behavior.hideFormInput($element, hasAutomagicNoHide);

        // Ensure this form input does not trigger server-side validation.
        persistentData.push(mapping.input);

        // Set the form input value.
        behavior.setFormInput($element, value);
        break;
    }
  };

  /**
   * Set form input with value.
   * Support the following form elements: textfield and select.
   *
   * @param {Element} $element
   * @param {string} value
   */
  behavior.setFormInput = function ($element, value) {
    var tagName = $element[0].tagName;

    switch (tagName) {
      case 'INPUT':
        $element.val(value);
        $element.trigger('change');
        break;
      case 'SELECT':
        if (Tabia.util.setMatchedSelect($element[0], value)) {
          $element.trigger('change');
        }
        break;
      default:
        Tabia.error('Input type not handled', {type: 'setFormInput', tag: tagName});
        break;
    }
  };

  /**
   * Hide form input.
   *
   * @param {Element} $element
   * @param {string} noHide
   *  Optional parameter passing in automagic-no-hide parameter from query.
   *  Default is false (automagic-no-hide is not present --> hide form inputs)
   */
  // @TODO Consider if it's better to hide it before hideFormInput or inside of it.
  behavior.hideFormInput = function ($element, noHide) {
      if (!$element.hasClass('automagic')) {
        $element.addClass('automagic');
          // Only run if the automagic-no-hide parameter is not present.
          if (!noHide){
            $element.closest('.form-item').hide();
          }
      }
  };

  /**
   * A wrapper function for special treatment around the geocomplete field because it is
   * provided by a 3rd party and subject to network race conditions.
   */
  behavior.toggleGeocompleteInput = function () {
    // Explicitly disable tableau_geocomplete unless the user makes changes that revokes
    // this assumption. see behavior.restoreForm()
    Drupal.settings.tableau_geocomplete.enabled = false;
    // Do we want automagic-no-hide to consider geocomplete fields?
    behavior.hideFormInput($form.find('#geocomplete'));
  };

  /**
   * Retrieve user information from Eloqua.
   *
   * @param {object} options
   *   Needs string guid (Eloqua unique id). See: behaviors.tableauEloqua.getInfo()
   */
  behavior.loadUserInfo = function (options) {
    var doneCallback = function () {
      Tabia.debug('Retrieved contact details', {type: 'elqKnown'});
    };

    var failCallback = function () {
      Tabia.debug('Failed to retrieve contact details', {type: 'elqKnown'});
    };

    if ($form.length) {
      doneCallback = behavior.autoMagic;
      failCallback = behavior.restoreForm;
    }

    options = $.extend(options, {full: true});

    return Drupal.behaviors.tableauEloqua.getInfo(options)
      .done(doneCallback)
      .fail(failCallback);
  };

  /**
   * Restore normal form UX.
   */
  behavior.restoreForm = function () {
    // Request params that trigger a full Eloqua contact record look up.
    var userEloquaInfoProperties = {
      eid: null,
      domain: null,
      hashedEmail: null
    };

    // Show all form inputs.
    // Keep addressfields hidden with geocomplete enabled.
    $form
      .removeClass('is-automagic')
      .find('.automagic').removeClass('automagic')
      .closest('.form-item').not('[data-group="address"]').show();

    // Enable geocomplete again and initalize the field behaviors. This is wrapped in a waitFor
    // to account for network race conditions.
    // see: tableau_geocomplete.js
    Tabia.util.waitFor(
      // waitFor tester.
      function waitForGoogleMapsScript() {
        return window.gmapsLoading === false;
      },
      // On success, re-enable geocomplete field behaviors.
      function googleMapsScriptLoadSuccess() {
        Drupal.settings.tableau_geocomplete.enabled = true;
        window.tableauGeocompleteInit();
      },
      // Time out actions and logging.
      function googleMapsScriptLoadTimeout() {
        Tabia.warning('Google Maps script load timeout on automagic restoreForm', {type: 'automagic'});
      },
      // Timing settings
      {
        'waitTimeout': 3000
      }
    );

    // Remove automagic toggle (label and then checkbox).
    $('#notMe').prev('label').addBack().remove();

    // Remove stored details from localStorage via groucho. This will prevent further /eloqua/getdetails
    // look ups until the user manages to come through another link with the identifying params.
    groucho.userSet(userEloquaInfoProperties, false);

    // Reset form validation.
    // @see custom validation function in
    // $.fn.clearValidation in tableau_user_registration_tweaks/js/validate.js
    $form.clearValidation();

    // Clear the form values.
    $form[0].reset();

    // Remove overlay.
    Components.loadingOverlay.hide($form);
  };

  /**
   * Perform required functionality that prepares the form when we determine the automagic
   * behavior should definitely happen.
   */
  behavior.preprocessAutomagicForm = function () {
    // Retrieve our persistent form data.
    persistentData = behavior.getPersistentFormData($form, 'tableau_automagic');

    // Show an overlay while we are loading the contact details.
    $form.addClass('relative');
    Components.loadingOverlay.show($form, loadingMessage);
  };

  /**
   * Document ready.
   */
  behave.ready(function init() {
    var userProperties = groucho.userGet(),
        contactId = Tabia.util.getUrlParameter('eid') || userProperties.eid,
        hashedEmail = Tabia.util.getUrlParameter('hashedEmail'),
        emailDomain = Tabia.util.getUrlParameter('domain') || userProperties.domain,
        hasIdentity = (contactId && emailDomain || hashedEmail),
        hasGrouchoStorage = (userProperties.eid && userProperties.domain) || userProperties.hashedEmail,
        hasMagicParam = Tabia.util.getUrlParameter('automagic');
        // @todo It is possible to enable a GUID look up to persist automagic behavior here. Currently
        // we only trigger it if the "automagic=xxxxx" URL parameter is present.


    // If there is no form and no details exist in groucho yet, still attempt a look up, but exit
    // right afterwards.
    if (!$form.length) {
      if (!hasGrouchoStorage && hasIdentity) {
        // @todo replace this if/else with the if branch only, after eid/domain lookups are fully deprecated (for security). Talk to Joel.
        if (hashedEmail) {
          behavior.loadUserInfo({hashedEmail: hashedEmail});
        }
        else {
          behavior.loadUserInfo({
            eid: contactId,
            domain: emailDomain
          });
        }
      }
      return;
    }

    Tabia.debug('Automagic form fill active', {type: 'elqKnown'});

    // Initialize a full detail look up using the known values we have stashed from the Eloqua
    // email url params.
    if (hasIdentity) {
      behavior.preprocessAutomagicForm();

      // @todo replace this if/else with the if branch only, after eid/domain lookups are fully deprecated (for security). Talk to Joel.
      if (hashedEmail) {
        behavior.loadUserInfo({hashedEmail: hashedEmail});
      }
      else {
        // Use eid and domain query params.
        behavior.loadUserInfo({
          eid: contactId,
          domain: emailDomain
        });
      }
    }
    // Otherwise, trigger an Eloqua GUID based look up since the "automagic=value" param is present.
    // @see contact-details.js
    else {
      if (hasMagicParam) {
        behavior.preprocessAutomagicForm();

        Drupal.behaviors.tableauEloqua.useGuid(behavior.loadUserInfo, behavior.restoreForm);
      }
    }
  });
})(jQuery);
;
/**
 * @file
 * Find the user agent and send that information to new relic
 */

(function () {
    var userAgent = navigator.userAgent;
    // if we had a way to reliably collect IP addresses, would also do that here

    // add user agent to new relic
    if (typeof newrelic == 'object') {
      newrelic.setCustomAttribute('userAgent' , userAgent);
    }
})();

;
/**
 * Map raw values into content specific tids, machine names, etc.
 *
 * Used with geolocation data and Eloqua for user details and personalization.
 *
 * @see personal.sources.js, contact-details.js
 */

/* jshint camelcase:false */

var Tabia = window.Tabia || {};

(function ($, groucho, module) {

  /**
   * Get region term id from country.
   *
   * Note: sets user property. Assumes all countries have a region.
   *
   * @param {string} country
   *   Two character code.
   *
   * @return {number|boolean}
   */
  module.regionTid = function (country) {
    var countries = Drupal.settings.tableauSite.mapping.countries,
        regions = Drupal.settings.tableauSite.mapping.regionsGeneralized,
        stashTtl = Drupal.settings.tableauRecommended.stashTtl,
        tid;

    // Sanity check for known raw data.
    if (!country || !_.has(countries, country)) {
      return false;
    }
    // Check for region term.
    tid = Number(_.findKey(regions, function regionFromCountry (termData) {
      return _.indexOf(termData.subRegions, countries[country].region) !== -1;
    }));
    if (tid) {
      // Overwrite the matched term ID in the user stash.
      groucho.userSet({region: tid}, false, stashTtl);
      Tabia.debug('User property set while computing value', {data: {region: tid}});
      // Region tid found.
      return tid;
    }
    else {
      // No matching region found.
      Tabia.notice('Country code not mapped to any region', {
        type: 'tabPersonal', data: {country: country}
      });
      return false;
    }
  };


  /**
   * Get industry term id from raw value. Note: sets user property.
   *
   * @param {string} indStr
   *   Raw industry value (text).
   *
   * @return {number|boolean}
   */
  module.industryTid = function (indStr) {
    var industriesMapping = Drupal.settings.tableauSite.mapping.industries,
        stashTtl = Drupal.settings.tableauRecommended.stashTtl,
        tid;
    // Can use synonyms with raw data.
    tid = Number(_.findKey(industriesMapping, function allowSynonym (termData) {
      // Accept name or synonym.
      return (termData.name === indStr || _.indexOf(termData.synonyms, indStr) !== -1);
    }));
    if (tid) {
      // Overwrite the matched term ID in the user stash.
      groucho.userSet({industry: tid}, false, stashTtl);
      Tabia.debug('User property set while computing value', {data: {industry: tid}});
      return tid;
    }
    return false;
  };


  /**
   * Get org-size term id from employee count value. Note: sets user property.
   *
   * @param {number} employees
   *
   * @return {number|boolean}
   */
  module.orgTid = function (employees) {
    var stashTtl = Drupal.settings.tableauRecommended.stashTtl,
        tid;
    // Find smallest matching.
    tid = Number(_.findKey(Drupal.settings.tableauSite.mapping.orgSize, function (termData) {
      return (employees <= termData.count);
    }));
    if (tid) {
      // Overwrite the matched term ID in the user stash.
      groucho.userSet({'org_size': tid}, false, stashTtl);
      Tabia.debug('User property set while computing value', {data: {'org_size': tid}});
      return tid;
    }
    return false;
  };

})(jQuery, groucho, Tabia.map = Tabia.map || {});
;
/**
 * @file Tableau Geolocation Drupal behavior
 *
 * Example usage - fetch geolocation data:
 *
 * if (Drupal.behaviors.tableauGeolocation) {
 *   Drupal.behaviors.tableauGeolocation.fetchData().done(function (data) {
 *     // Use data as needed, e.g. data.country, data.zip, etc.
 *   }).fail(function (e) {
 *     // Handle an error if necessary.
 *   });
 * }
 */

(function () {
  // Declare our behavior namespace.
  Drupal.behaviors.tableauGeolocation = {};

  // Save a shorthand reference to our new behavior.
  var tableauGeolocation = Drupal.behaviors.tableauGeolocation;

  /**
   * Drupal behavior attach callback. Initializes the behavior on DOM-ready.
   *
   * @param {object} context
   * @param {object} settings
   */
  tableauGeolocation.attach = function (context, settings) {
    // Only run in the document context (DOM-ready).
    if (context !== document) {
      return;
    }

    // Use a shorthand reference to our settings.
    settings = settings.tableauSite;

    // Ensure all settings are available or log an error.
    if (!settings.geolocationDataUrl ||
      !settings.geolocationDataTimeout ||
      !settings.geolocationDataMaxAge) {
      Tabia.error('Missing expected geolocation settings', {type: 'tableauGeolocation'});
      return;
    }

    // Finally, fetch the geolocation data. Any subsequent calls, e.g. by other scripts,
    // would return the first Promise created.
    tableauGeolocation.fetchData();
  };

  /**
   * Fetch geolocation data from external API. (IPStack)
   * Uses _.once to cache the return value since we wouldn't want to repeat the API call.
   *
   * @returns {Promise} Promise of Geolocation data object
   */
  tableauGeolocation.fetchData = _.once(function () {
    // Try getting data from user stash.
    var cachedData = groucho.userGet('geolocationCachedData');
    // Save a shorthand settings reference.
    var settings = Drupal.settings.tableauSite;
    // Use jQuery Deferred for async callbacks.
    var result = $.Deferred();
    // Allow for url modifications before fetching.
    var ipOverride = Tabia.util.getUrlParameter('p_ip');
    var url = settings.geolocationDataUrl;

    // Allow IP override for manual QA and debugging.
    if (ipOverride) {
      Tabia.debug('Geolocation using overridden IP address from query param', {type: 'tableauGeolocation', data: {ip: ipOverride}});
      // IPStack endpoint uses `check` to default the IP to the current user.
      // We'll modify the URL before requesting to use the provided IP instead.
      url = url.replace('/check', '/' + encodeURIComponent(ipOverride));
    }
    // Return cached copy if available.
    else if (!_.isEmpty(cachedData)) {
      Tabia.debug('Geolocation data loaded from cache', {type: 'tableauGeolocation', data: cachedData});
      return result.resolve(cachedData);
    }

    // Fetch JSON data from our geolocation API.
    $.ajax({
      url: url,
      dataType: 'json',
      timeout: settings.geolocationDataTimeout,
      // Prevent the default timestamp cache busting query param from being added.
      cache: true
    })
    // Then map the values to the names we use.
    .then(function successFilter(data) {
      /* jshint camelcase: false */
      return {
        state: data.region_code,
        postalcode: data.zip,
        country: data.country_code,
        latitude: data.latitude,
        longitude: data.longitude,
        is_eu: data.location.is_eu
      };
    })
    // Done callback works with the successfully fetched and filtered data.
    .done(function (data) {
      Tabia.debug('Geolocation data fetched from remote API', {type: 'tableauGeolocation', data: data});

      // Save the last successful data for caching purposes with TTL (max age).
      groucho.userSet({geolocationCachedData: data}, false, settings.geolocationDataMaxAge);

      // Save geolocation data to the user stash, but keep existing data.
      groucho.userSet(data, true);
    })
    // On success, resolve our custom deferred result.
    .done(result.resolve)
    .fail(function () {
      result.reject(new Error('Geolocation data lookup failed'));
      Tabia.warning('Geolocation data lookup failed', {type: 'tableauGeolocation'});
    });

    return result.promise();
  });

})();
;
