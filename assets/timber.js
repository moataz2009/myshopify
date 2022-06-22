// Helper functions
function replaceUrlParam(url, paramName, paramValue) {
  var pattern = new RegExp('('+paramName+'=).*?(&|$)'),
      newUrl = url.replace(pattern,'$1' + paramValue + '$2');
  if ( newUrl == url ) {
    newUrl = newUrl + (newUrl.indexOf('?')>0 ? '&' : '?') + paramName + '=' + paramValue;
  }
  return newUrl;
}

// Timber functions
window.timber = window.timber || {};//conflict with master slider link

timber.cacheSelectors = function () {
  timber.cache = {
    // General
    $html: $('html'),
    $body: $('body'),

    // Product Page
    $productImageWrap: $('#ProductPhoto'),
    $productImage: $('#ProductPhotoImg'),
    $thumbImages: $('#ProductThumbs').find('.product-single__thumbnail')
  }
};

timber.init = function () {
  // FastClick.attach(document.body);
  timber.cacheSelectors();
  timber.productImageSwitch();
  timber.autoResponsiveElements();
  timber.productImageZoom();
};

timber.productPage = function (options) {
  // console.log(options);
  var moneyFormat = options.money_format,
      variant = options.variant,
      selector = options.selector,
      vip_tag = options.vip_tag,
      translations = options.translations;
  // console.log(variant.inventory_quantity)
  // Selectors
  var $productImage = $('#ProductPhotoImg'),
      $addToCart = $('#AddToCartForm .AddToCart:visible').not('.noClick'),
      $variantTitle = $('#variantTitle'),
      $productPrice = $('#ProductPrice'),
      $comparePrice = $('#ComparePrice'),
      // $quantityElements = $('.quantity-selector, label + .js-qty'),
      $quantityElements = $('.product-single__quantity').find("input[name='quantity']"),
      
      $addToCartText = $addToCart.find('.AddToCartText');
  
  var addToCartDisabled = $addToCart.hasClass('disabled');

  if(vip_tag && $addToCart.next('.link_to_vip')){
    $addToCart.next('.link_to_vip').show();
  }

  if (variant) {
    $variantTitle.text(variant.title);

    // Update variant image, if one is set
    if (variant.featured_image) {
      var newImg = variant.featured_image,
          el = $productImage[0];
      Shopify.Image.switchImage(newImg, el, timber.switchImage);
    }

    // Select a valid variant if available
    if (variant.available) {
      // console.log(translations.add_to_cart)
      // Available, enable the submit button, change text, show quantity elements
      if($addToCartText.data("type")){
        const translations_type =  $addToCartText.data("type");
        $addToCartText.html(translations[translations_type]);
        $addToCartText.attr('text', translations[translations_type]);
        
        $addToCart.prop('disabled', addToCartDisabled);
        // $quantityElements.show();
        $quantityElements.prop('disabled', addToCartDisabled);
      }else{
        $addToCartText.html(translations.add_to_cart);
        $addToCartText.attr('text', translations.add_to_cart);
        $addToCart.removeClass('disabled').prop('disabled', false);
      }
      
    } else {
      $addToCart.siblings('.link_to_vip').hide();
      // Sold out, disable the submit button, change text, hide quantity elements
      // console.log(translations.sold_out)
      $addToCartText.html(translations.sold_out);
      $addToCartText.attr('text', translations.sold_out);
      $addToCart.addClass('disabled').prop('disabled', true);
      $addToCartText.attr('type', 'submit');
      // $quantityElements.hide();
      $quantityElements.prop('disabled', true);
    }

    // Regardless of stock, update the product price
    $productPrice.html( Shopify.formatMoney(variant.price, moneyFormat));

    // Also update and show the product's compare price if necessary
    if (variant.compare_at_price > variant.price) {
      $comparePrice
      .html(Shopify.formatMoney(variant.compare_at_price, moneyFormat))
      .show();
    } else {
      $comparePrice.hide();
    }

  } else {
    // The variant doesn't exist, disable submit button.
    // This may be an error or notice that a specific variant is not available.
    // To only show available variants, implement linked product options:
    //   - http://docs.shopify.com/manual/configuration/store-customization/advanced-navigation/linked-product-options
    $addToCart.addClass('disabled').prop('disabled', true);
    $addToCartText.html(translations.unavailable);
    $addToCartText.attr('text', translations.unavailable);
    // $quantityElements.hide();
    $quantityElements.prop('disabled', true)
  }
  
};

timber.productImageSwitch = function () {
  if (timber.cache.$thumbImages.length) {
    // Switch the main image with one of the thumbnails
    // Note: this does not change the variant selected, just the image
    timber.cache.$thumbImages.on('click', function(evt) {
      evt.preventDefault();
      var newImage = $(this).attr('data-image');
      var newImageId = $(this).attr('data-image-id');
      timber.switchImage(newImage, { id: newImageId }, timber.cache.$productImage);
    });
  }
};

timber.switchImage = function (src, imgObject, el) {
  // Make sure element is a jquery object
  var $el = $(el);
  $el.attr('data-src', src);
  $el.attr('data-image-id', imgObject.id);

  
};

timber.autoResponsiveElements = function () {
  var $iframeVideo = $('iframe[src*="youtube.com/embed"], iframe[src*="player.vimeo"]');
  var $iframeReset = $iframeVideo.add('iframe#admin_bar_iframe');

  $('table').wrap('<div class="table-wrapper"></div>');

  $iframeVideo.each(function () {
    // Add wrapper to make video responsive
    if (!$(this).parents('.video-wrapper').length) {
      $(this).wrap('<div class="video-wrapper"></div>');
    }
  });

  $iframeReset.each(function () {
    // Re-set the src attribute on each iframe after page load
    // for Chrome's "incorrect iFrame content on 'back'" bug.
    // https://code.google.com/p/chromium/issues/detail?id=395791
    // Need to specifically target video and admin bar
    this.src = this.src;
  });
};


timber.productImageZoom = function () {
  
    return;
  

  if (!timber.cache.$productImageWrap.length || timber.cache.$html.hasClass('supports-touch')) {
    return;
  };

  // Destroy zoom (in case it was already set), then set it up again
  timber.cache.$productImageWrap.trigger('zoom.destroy');

  timber.cache.$productImageWrap.addClass('image-zoom').zoom({
    url: timber.cache.$productImage.attr('data-zoom')
  });
};

// Initialize Timber's JS on docready
$(timber.init)
