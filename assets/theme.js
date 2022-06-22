/* ================ SLATE ================ */
window.theme = window.theme || {};

theme.Sections = function Sections() {
  this.constructors = {};
  this.instances = [];

  $(document)
    .on('shopify:section:load', this._onSectionLoad.bind(this))
    .on('shopify:section:unload', this._onSectionUnload.bind(this))
    .on('shopify:section:select', this._onSelect.bind(this))
    .on('shopify:section:deselect', this._onDeselect.bind(this))
    .on('shopify:block:select', this._onBlockSelect.bind(this))
    .on('shopify:block:deselect', this._onBlockDeselect.bind(this));

  // Global sections event listeners
  // Section select
  $(document).on('shopify:section:select', function(evt) {
    if (evt.detail.sectionId !== 'sidebar-menu') {
      theme.LeftDrawer.close();
    }
  });
};

theme.Sections.prototype = _.assignIn({}, theme.Sections.prototype, {
  _createInstance: function(container, constructor) {
    var $container = $(container);
    var id = $container.attr('data-section-id');
    var type = $container.attr('data-section-type');

    constructor = constructor || this.constructors[type];

    if (_.isUndefined(constructor)) return;

    var instance = _.assignIn(new constructor(container), {
      id: id,
      type: type,
      container: container
    });

    this.instances.push(instance);
  },

  _onSectionLoad: function(evt) {
    var container = $('[data-section-id]', evt.target)[0];
    if (container) {
      this._createInstance(container);
    }
  },

  _onSectionUnload: function(evt) {
    this.instances = _.filter(this.instances, function(instance) {
      var isEventInstance = instance.id === evt.detail.sectionId;

      if (isEventInstance) {
        if (_.isFunction(instance.onUnload)) {
          instance.onUnload(evt);
        }
      }

      return !isEventInstance;
    });
  },

  _onSelect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onSelect)) {
      instance.onSelect(evt);
    }
  },

  _onDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onDeselect)) {
      instance.onDeselect(evt);
    }
  },

  _onBlockSelect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockSelect)) {
      instance.onBlockSelect(evt);
    }
  },

  _onBlockDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockDeselect)) {
      instance.onBlockDeselect(evt);
    }
  },

  register: function(type, constructor) {
    this.constructors[type] = constructor;

    $('[data-section-type=' + type + ']').each(
      function(index, container) {
        this._createInstance(container, constructor);
      }.bind(this)
    );
  }
});


/**
 * Currency Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help with currency formatting
 *
 * Current contents
 * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
 *
 * Alternatives
 * - Accounting.js - http://openexchangerates.github.io/accounting.js/
 *
 */

 theme.Currency = (function() {
  var moneyFormat = '$';

  function formatMoney(cents, format) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || moneyFormat);

    function formatWithDelimiters(number, precision, thousands, decimal) {
      thousands = thousands || ',';
      decimal = decimal || '.';

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var centsAmount = parts[1] ? (decimal + parts[1]) : '';

      return dollarsAmount + centsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  }

  return {
    formatMoney: formatMoney
  }
})();

/* ================ MODULES ================ */
window.a11y = window.a11y || {};

a11y.trapFocus = function($container, eventNamespace) {
  var eventName = eventNamespace ? 'focusin.' + eventNamespace : 'focusin';

  $container.attr('tabindex', '-1').focus();

  $(document).on(eventName, function(evt) {
    if ($container[0] !== evt.target && !$container.has(evt.target).length) {
      $container.focus();
    }
  });
};

a11y.removeTrapFocus = function($container, eventNamespace) {
  var eventName = eventNamespace ? 'focusin.' + eventNamespace : 'focusin';

  $container.removeAttr('tabindex');
  $(document).off(eventName);
};

window.Modals = (function() {
  var Modal = function(id, name, options) {
    var defaults = {
      close: '.js-modal-close',
      open: '.js-modal-open-' + name,
      openClass: 'modal--is-active'
    };

    this.$modal = $('#' + id);

    if (!this.$modal.length) {
      return false;
    }

    this.nodes = {
      $parent: $('body, html')
    };
    this.config = $.extend(defaults, options);
    this.modalIsOpen = false;
    this.$focusOnOpen = this.config.$focusOnOpen
      ? $(this.config.$focusOnOpen)
      : this.$modal;
    this.init();
  };

  Modal.prototype.init = function() {
    var $openBtn = $(this.config.open);

    // Add aria controls
    $openBtn.attr('aria-expanded', 'false');

    $(this.config.open).on('click', $.proxy(this.open, this));
    this.$modal.find(this.config.close).on('click', $.proxy(this.close, this));
  };

  Modal.prototype.open = function(evt) {
    // Keep track if modal was opened from a click, or called by another function
    var externalCall = false;

    // don't open an opened modal
    if (this.modalIsOpen) return;

    // Prevent following href if link is clicked
    if (evt) {
      evt.preventDefault();
    } else {
      externalCall = true;
    }

    // Without this, the modal opens, the click event bubbles up to $nodes.page
    // which closes the modal.
    if (evt && evt.stopPropagation) {
      evt.stopPropagation();
      // save the source of the click, we'll focus to this on close
      this.$activeSource = $(evt.currentTarget);
    }

    if (this.modalIsOpen && !externalCall) {
      return this.close();
    }

    this.$modal.prepareTransition().addClass(this.config.openClass);
    this.nodes.$parent.addClass(this.config.openClass);

    this.modalIsOpen = true;

    // Set focus on modal
    a11y.trapFocus(this.$focusOnOpen, 'modal_focus');

    if (this.$activeSource && this.$activeSource.attr('aria-expanded')) {
      this.$activeSource.attr('aria-expanded', 'true');
    }

    this.bindEvents();
  };

  Modal.prototype.close = function() {
    // don't close a closed modal
    if (!this.modalIsOpen) return;

    // deselect any focused form elements
    $(document.activeElement).trigger('blur');

    this.$modal.prepareTransition().removeClass(this.config.openClass);
    this.nodes.$parent.removeClass(this.config.openClass);

    this.modalIsOpen = false;

    // Remove focus on modal
    a11y.removeTrapFocus(this.$focusOnOpen, 'modal_focus');

    if (this.$activeSource && this.$activeSource.attr('aria-expanded')) {
      this.$activeSource.attr('aria-expanded', 'false');
    }

    this.unbindEvents();
  };

  Modal.prototype.bindEvents = function() {
    // Pressing escape closes modal
    this.nodes.$parent.on(
      'keyup.modal',
      $.proxy(function(evt) {
        if (evt.keyCode === 27) {
          this.close();
        }
      }, this)
    );
  };

  Modal.prototype.unbindEvents = function() {
    this.nodes.$parent.off('.modal');
  };

  return Modal;
})();

/**
 *  Vendor
 *
 *  Small minified vendor scripts can be placed at the top of this file to
 *  reduce network requests.
 *
 */

/**
 *
 *  ShopifyCanvas JS
 *  - Base Canvas functions and utilities.
 *
 */

window.ShopifyCanvas = window.ShopifyCanvas || {};

/**
 *
 *  Initialize function for all ShopifyCanvas JS.
 *  - call any functions required on page load here.
 *
 */
ShopifyCanvas.init = function() {
  ShopifyCanvas.cacheSelectors();
  ShopifyCanvas.checkUrlHash();
  ShopifyCanvas.initEventListeners();
  ShopifyCanvas.resetPasswordSuccess();
  ShopifyCanvas.customerAddressForm();
};

/**
 *
 *  Cache any jQuery objects.
 *
 */
ShopifyCanvas.cacheSelectors = function() {
  ShopifyCanvas.cache = {
    $html: $('html'),
    $body: $('body')
  };
};

ShopifyCanvas.initEventListeners = function() {
  //Show reset password form
  $('#RecoverPassword').on('click', function(evt) {
    evt.preventDefault();
    ShopifyCanvas.toggleRecoverPasswordForm();
  });

  //Hide reset password form
  $('#HideRecoverPasswordLink').on('click', function(evt) {
    evt.preventDefault();
    ShopifyCanvas.toggleRecoverPasswordForm();
  });
};

/**
 *
 *  Show/Hide recover password form
 *
 */
ShopifyCanvas.toggleRecoverPasswordForm = function() {
  $('#RecoverPasswordForm').toggleClass('hide');
  $('#CustomerLoginForm').toggleClass('hide');
};

/**
 *
 *  Show reset password success message
 *
 */
ShopifyCanvas.resetPasswordSuccess = function() {
  var $formState = $('.reset-password-success');

  //check if reset password form was successfully submited.
  if (!$formState.length) return;

  // show success message
  $('#ResetSuccess').removeClass('hide');
};

/**
 *
 *  Show/hide customer address forms
 *
 */
ShopifyCanvas.customerAddressForm = function() {
  var $newAddressForm = $('#AddressNewForm');

  if (!$newAddressForm.length) return;

  // Initialize observers on address selectors, defined in shopify_common.js
  new Shopify.CountryProvinceSelector(
    'AddressCountryNew',
    'AddressProvinceNew',
    {
      hideElement: 'AddressProvinceContainerNew'
    }
  );

  // Initialize each edit form's country/province selector
  $('.address-country-option').each(function() {
    var formId = $(this).data('form-id');
    var countrySelector = 'AddressCountry_' + formId;
    var provinceSelector = 'AddressProvince_' + formId;
    var containerSelector = 'AddressProvinceContainer_' + formId;

    new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
      hideElement: containerSelector
    });
  });

  // Toggle new/edit address forms
  $('.address-new-toggle').on('click', function() {
    $newAddressForm.toggleClass('hide');
  });

  $('.address-edit-toggle').on('click', function() {
    var formId = $(this).data('form-id');
    $('#EditAddress_' + formId).toggleClass('hide');
  });

  $('.address-delete').on('click', function() {
    var $el = $(this);
    var formId = $el.data('form-id');
    var confirmMessage = $el.data('confirm-message');
    if (
      confirm(confirmMessage || 'Are you sure you wish to delete this address?')
    ) {
      Shopify.postLink('/account/addresses/' + formId, {
        parameters: { _method: 'delete' }
      });
    }
  });
};

/**
 *
 *  Check URL for reset password hash
 *
 */
ShopifyCanvas.checkUrlHash = function() {
  var hash = ShopifyCanvas.getHash();

  // Allow deep linking to recover password form
  if (hash === '#recover') {
    ShopifyCanvas.toggleRecoverPasswordForm();
  }
};

/**
 *
 *  Get the hash from the URL
 *
 */
ShopifyCanvas.getHash = function() {
  return window.location.hash;
};

// Initialize ShopifyCanvas's JS on docready
$(ShopifyCanvas.init);

/*
 * Returns a function which adds a vendor prefix to any CSS property name
 * Source https://github.com/markdalgleish/stellar.js/blob/master/src/jquery.stellar.js
 */

var vendorPrefix = (function() {
  var prefixes = /^(Moz|Webkit|O|ms)(?=[A-Z])/,
    style = $('script')[0].style,
    prefix = '',
    prop;

  for (prop in style) {
    if (prefixes.test(prop)) {
      prefix = prop.match(prefixes)[0];
      break;
    }
  }

  if ('WebkitOpacity' in style) {
    prefix = 'Webkit';
  }
  if ('KhtmlOpacity' in style) {
    prefix = 'Khtml';
  }

  return function(property) {
    return (
      prefix +
      (prefix.length > 0
        ? property.charAt(0).toUpperCase() + property.slice(1)
        : property)
    );
  };
})();

/*============================================================================
  Drawer modules
==============================================================================*/
theme.Drawers = (function() {
  var Drawer = function(id, position, options) {
    var defaults = {
      close: '.js-drawer-close',
      open: '.js-drawer-open-' + position,
      openClass: 'js-drawer-open',
      dirOpenClass: 'js-drawer-open-' + position
    };

    this.nodes = {
      $parent: $('body, html'),
      $page: $('#PageContainer')
    };

    this.config = $.extend(defaults, options);
    this.position = position;

    this.$drawer = $('#' + id);

    if (!this.$drawer.length) {
      return false;
    }

    this.drawerIsOpen = false;
    this.init();
  };

  Drawer.prototype.init = function() {
    $(this.config.open).on('click', $.proxy(this.open, this));
    this.$drawer.on('click', this.config.close, $.proxy(this.close, this));
    var $mainContent = this.nodes.$page.find('.main-content');
    var position = this.position;
    $(this.config.open).mouseenter(function(){
        $mainContent.addClass(`hover-${position}`);
    }).mouseleave(function(){
      $mainContent.removeClass(`hover-${position}`);
    })
  };

  Drawer.prototype.open = function(evt) {
    // Keep track if drawer was opened from a click, or called by another function
    var externalCall = false;

    // Prevent following href if link is clicked
    if (evt) {
      evt.preventDefault();
    } else {
      externalCall = true;
    }

    // Without this, the drawer opens, the click event bubbles up to $nodes.page
    // which closes the drawer.
    if (evt && evt.stopPropagation) {
      evt.stopPropagation();
      // save the source of the click, we'll focus to this on close
      this.$activeSource = $(evt.currentTarget);
    }

    if (this.drawerIsOpen && !externalCall) {
      return this.close();
    }

    // Add is-transitioning class to moved elements on open so drawer can have
    // transition for close animation
    this.$drawer.prepareTransition();

    this.nodes.$parent.addClass(
      this.config.openClass + ' ' + this.config.dirOpenClass
    );
    this.drawerIsOpen = true;

    // Set focus on drawer
    this.trapFocus({
      $container: this.$drawer,
      $elementToFocus: this.$drawer.find('.drawer__close-button'),
      namespace: 'drawer_focus'
    });

    // Run function when draw opens if set
    if (
      this.config.onDrawerOpen &&
      typeof this.config.onDrawerOpen === 'function'
    ) {
      if (!externalCall) {
        this.config.onDrawerOpen();
      }
    }

    if (this.$activeSource && this.$activeSource.attr('aria-expanded')) {
      this.$activeSource.attr('aria-expanded', 'true');
    }

    this.nodes.$parent.on(
      'keyup.drawer',
      $.proxy(function(evt) {
        // close on 'esc' keypress
        if (evt.keyCode !== 27) return;

        this.close();
      }, this)
    );

    // Lock scrolling on mobile
    this.nodes.$page.on('touchmove.drawer', function() {
      return false;
    });

    this.nodes.$page.on(
      'click.drawer',
      $.proxy(function() {
        this.close();
        return false;
      }, this)
    );
  };

  Drawer.prototype.close = function() {
    if (!this.drawerIsOpen) return;

    // deselect any focused form elements
    $(document.activeElement).trigger('blur');

    // Ensure closing transition is applied to moved elements, like the nav
    this.$drawer.prepareTransition();

    this.nodes.$parent.removeClass(
      this.config.dirOpenClass + ' ' + this.config.openClass
    );

    this.drawerIsOpen = false;

    // Remove focus on drawer
    this.removeTrapFocus({
      $container: this.$drawer,
      namespace: 'drawer_focus'
    });

    this.nodes.$page.off('.drawer');
    this.nodes.$parent.off('.drawer');
  };

  /**
  * Traps the focus in a particular container
  *
  * @param {object} options - Options to be used
  * @param {jQuery} options.$container - Container to trap focus within
  * @param {jQuery} options.$elementToFocus - Element to be focused when focus leaves container
  * @param {string} options.namespace - Namespace used for new focus event handler
  */
  Drawer.prototype.trapFocus = function(options) {
    var eventName = options.namespace
      ? 'focusin.' + options.namespace
      : 'focusin';

    if (!options.$elementToFocus) {
      options.$elementToFocus = options.$container;
    }

    options.$container.attr('tabindex', '-1');
    options.$elementToFocus.focus();

    $(document).on(eventName, function(evt) {
      if (
        options.$container[0] !== evt.target &&
        !options.$container.has(evt.target).length
      ) {
        options.$container.focus();
      }
    });
  };

  /**
   * Removes the trap of focus in a particular container
   *
   * @param {object} options - Options to be used
   * @param {jQuery} options.$container - Container to trap focus within
   * @param {string} options.namespace - Namespace used for new focus event handler
   */
  Drawer.prototype.removeTrapFocus = function(options) {
    var eventName = options.namespace
      ? 'focusin.' + options.namespace
      : 'focusin';

    if (options.$container && options.$container.length) {
      options.$container.removeAttr('tabindex');
    }

    $(document).off(eventName);
  };

  return Drawer;
})();

/*================ SECTIONS ================*/

theme.SidebarMenuSection = (function() {
  function SidebarMenuSection() {
    if(window.innerWidth >= 1280){
      $('.drawer-nav__toggle').on('mouseenter', function() {
        $(this)
          .parent()
          .addClass('drawer-nav--expanded');
        
        $(this).parents('.drawer-nav__item').siblings().find('.drawer-nav__has-sublist')
          .removeClass('drawer-nav--expanded');
  
        let hasRightSide = $(this).parent().next('.drawer-nav__sublist').hasClass('has-right__side');
        if($(this).parent().hasClass('drawer-nav--expanded') && hasRightSide){
          $('.sublinks-container').show();
          $('.pictures-container').show();
        }else{
          $('.sublinks-container').hide();
          $('.pictures-container').hide();
        }
  
        if (
          $(this)
            .parent()
            .hasClass('drawer-nav--expanded')
        ) {
          $(this)
            .children('.drawer-nav__toggle-button')
            .attr('aria-expanded', true);
        } else {
          $(this)
            .children('.drawer-nav__toggle-button')
            .attr('aria-expanded', false);
        }
      });

      $('.drawer-nav__sublist.has-right__side').on('mouseenter','.drawer-nav__link', function() {
        $('.drawer-nav__sublist.has-right__side').find('.drawer-nav__link').removeClass('active');
        $(this).addClass('active');
        $('.sublinks-container').addClass('active');
        $('.sublinks-container').find(">.drawer-nav__item").hide();
        let link = $(this).text().trim().replace('.','').replace('for ','').replace('!','').replace('& ','').replace(' ','-').toLowerCase();
        if($('.sublinks-container').find(">.drawer-nav__item[name='"+ link +"']").length > 0){
          $('.sublinks-container').find(">.drawer-nav__item[name='"+ link +"']:not(.sm-show)").show();
        }else{
          $('.sublinks-container').css('height',0);
        }
        $('.pictures-container').find(".sublink-picture[name='"+ link +"']").addClass('active').siblings().removeClass('active');
        let pLinkID = $(this).closest('.drawer-nav__sublist.has-right__side').attr('id');
        if (pLinkID == 'Submenu-1') {
          if(link == 'pitaka-cases'){
            flow(0,2);
          }else{
            flow(0,1)
          }
        }else{
          flow(0,0)
        }
      });

    }else{
      let toggleBtn = `<button type="button" class="drawer-nav__toggle-button">
            <span class="icon"></span>
          </button>`;

      $('.sublinks-container').find('.drawer-nav__has-sublist').removeClass('drawer-nav--expanded');
      $('.sublinks-container').find('.drawer-nav__toggle').append(toggleBtn);

      $('.drawer-nav__toggle').on('click', function() {
        $(this)
          .parent()
          .toggleClass('drawer-nav--expanded');
        
        $(this).parents('.drawer-nav__item').siblings().find('.drawer-nav__has-sublist')
          .removeClass('drawer-nav--expanded');
  
        if (
          $(this)
            .parent()
            .hasClass('drawer-nav--expanded')
        ) {
          $(this)
            .children('.drawer-nav__toggle-button')
            .attr('aria-expanded', true);
        } else {
          $(this)
            .children('.drawer-nav__toggle-button')
            .attr('aria-expanded', false);
        }

        if (
          $(this)
            .parents('.drawer-nav__sublist')
            .hasClass('has-right__side')
        ) {
          $('.sublinks-container').addClass('active');
          $('.sublinks-container').find(">.drawer-nav__item").hide();

          
          let link = $(this).find('.drawer-nav__link').text().trim().replace('.','').replace('for ','').replace('!','').replace('& ','').replace(' ','-').toLowerCase();
          if($('.sublinks-container').find(">.drawer-nav__item[name='"+ link +"']").length > 0){
            $('.sublinks-container').find(">.drawer-nav__item[name='"+ link +"']").show();
          }else{
            $('.sublinks-container').css('height',0);
          }
        }

        $('.back-btn').on('click', function(){
          $('.sublinks-container').removeClass('active');
        })

      });
    }

    $('.drawer-nav__link.last').click(function(){
      theme.LeftDrawer.close();
    })
    
  }

  return SidebarMenuSection;
})();

theme.SidebarMenuSection.prototype = _.assignIn(
  {},
  theme.SidebarMenuSection.prototype,
  {
    onSelect: function() {
      theme.RightDrawer.close();
      theme.SearchDrawer.close();
      theme.LeftDrawer.open();
    },

    onDeselect: function() {
      theme.LeftDrawer.close();
    }
  }
);

theme.HeaderSection = (function() {
  function HeaderSection() {
    theme.drawersInit();
  }

  return HeaderSection;
})();

theme.HeaderSection.prototype = _.assignIn({}, theme.HeaderSection.prototype, {
  onSelect: function() {
    theme.LeftDrawer.close();
  }
});

/**
 *
 *  Boundless Theme JS
 *
 *
 */
theme.init = function () {
  theme.cacheSelectors();
  theme.stringOverrides();
  theme.drawersInit();
  theme.rteImages();
  theme.searchSubmit();
  theme.socialSharing();
  theme.checkIfIOS();
};

/**
 *
 *  Cache any jQuery objects.
 *
 */
theme.cacheSelectors = function () {
  theme.cache = {
    $window: $(window),
    $html: $('html'),
    $body: $('body'),

    // Drawer elements
    $drawerRight: $('.drawer--right'),
    $drawerProduct: $('.drawer--product'),

    // Share buttons
    $shareButtons: $('.social-sharing'),

    // Article images
    $indentedRteImages: $('.rte--indented-images'),

    // Site Header
    $siteHeaderWrapper: $('.site-header-wrapper'),
    $siteHeader: $('.site-header-container'),
    $searchInput: $('.search-bar__input'),
    $searchSubmit: $('.search-bar__submit'),
  }

  theme.variables = {
    // Footer
    footerTop: 0,

    // track window width to solve iOS scroll triggering resize event
    windowWidth: theme.cache.$window.width()
  };
};

theme.stringOverrides = function () {
  // Override defaults in theme.strings with potential
  // template overrides
  window.productStrings = window.productStrings || {};
  $.extend(theme.strings, window.productStrings);
};

theme.cookiesEnabled = function() {
  var cookieEnabled = navigator.cookieEnabled;

  if (!cookieEnabled){
    document.cookie = 'testcookie';
    cookieEnabled = (document.cookie.indexOf('testcookie') !== -1);
  }
  return cookieEnabled;
};


theme.drawersInit = function () {
  // Add required classes to HTML
  $('#PageContainer').addClass('drawer-page-content');
  $('.js-drawer-open-right').attr('aria-controls', 'CartDrawer').attr('aria-expanded', 'false');
  $('.js-drawer-open-left').attr('aria-controls', 'NavDrawer').attr('aria-expanded', 'false');
  $('.js-drawer-open-top').attr('aria-controls', 'SearchDrawer').attr('aria-expanded', 'false');

  theme.LeftDrawer = new theme.Drawers('NavDrawer', 'left');
  theme.RightDrawer = new theme.Drawers('CartDrawer', 'right');
  theme.SearchDrawer = new theme.Drawers('SearchDrawer', 'top', {'onDrawerOpen': theme.searchFocus});
};

theme.searchFocus = function () {
  theme.cache.$searchInput.focus();
  // set selection range hack for iOS
  theme.cache.$searchInput[0].setSelectionRange(0, theme.cache.$searchInput[0].value.length);
};

theme.searchSubmit = function () {
  theme.cache.$searchSubmit.on('click', function(evt) {
    if (theme.cache.$searchInput.val().length == 0) {
      evt.preventDefault();
      theme.cache.$searchInput.focus();
    }
  });
};

theme.socialSharing = function () {
  // Stop initializing if settings are disabled
  
    return;
  

  // General selectors
  var $buttons = theme.cache.$shareButtons;
  var $shareLinks = $buttons.find('a');
  var permalink = $buttons.attr('data-permalink');

  // Share popups
  $shareLinks.on('click', function(e) {
    e.preventDefault();
    var $el = $(this);
    var popup = $el.attr('class').replace('-','_');
    var link = $el.attr('href');
    var w = 700;
    var h = 400;

    // Set popup sizes
    switch (popup) {
      case 'share-twitter':
        h = 300;
        break;
      case 'share-fancy':
        w = 480;
        h = 720;
        break;
      case 'share-google':
        w = 500;
        break;
    }

    window.open(link, popup, 'width=' + w + ', height=' + h);
  });
}

theme.rteImages = function () {
  if (!theme.cache.$indentedRteImages.length) return;


  var $images = theme.cache.$indentedRteImages.find('img');
  var $rteImages = imagesLoaded($images);

  $rteImages.on('always', function (instance, image) {
    $images.each(function() {
      var $el = $(this);
      var imageWidth = $el.width();
      var attr = $el.attr('style');

      // Check if undefined or float: none
      if (!attr || attr == 'float: none;') {
        // Remove grid-breaking styles if image isn't wider than parent + 20%
        // negative margins set in CSS
        if (imageWidth < theme.cache.$indentedRteImages.width() * 1.4) {
          $el.addClass('rte__no-indent');
        }
      }
    });
  });
};

theme.checkIfIOS = function() {
  var ua = navigator.userAgent.toLowerCase();
  var isIOS = /ipad|iphone|ipod/.test(ua) && !window.MSStream;

  if (isIOS) {
    $('html')
      .addClass('is-ios');
  }
};

theme.productCardImageLoadingAnimation = function() {
  var selectors = {
    image: '[data-image]',
    imageWithPlaceholder: '[data-image-placeholder]',
    imageWithPlaceholderWrapper: '[data-image-with-placeholder-wrapper]'
  };

  var classes = {
    loadingAnimation: 'product-item__image-container--loading',
    lazyloaded: '.lazyloaded'
  };

  $(document).on('lazyloaded', function(e) {
    var $target = $(e.target);

    if (!$target.is(selectors.image)) {
      return;
    }

    $target
      .closest(selectors.imageWithPlaceholderWrapper)
      .removeClass(classes.loadingAnimation)
      .find(selectors.imageWithPlaceholder)
      .hide();
  });

  // When the theme loads, lazysizes might load images before the "lazyloaded"
  // event listener has been attached. When this happens, the following function
  // hides the loading placeholders.
  $(selectors.image + classes.lazyloaded)
    .closest(selectors.imageWithPlaceholderWrapper)
    .removeClass(classes.loadingAnimation)
    .find(selectors.imageWithPlaceholder)
    .hide();
};

$(document).ready(function() {
  theme.init();

  var sections = new theme.Sections();

  sections.register('sidebar-menu-section', theme.SidebarMenuSection);
  sections.register('header-section', theme.HeaderSection);
});
