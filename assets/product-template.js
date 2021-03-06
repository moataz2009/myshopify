window.themeAPI = window.themeAPI || {};

themeAPI.cacheSelectors = function () {
  themeAPI.cache = {
    // General
    $w: $(window),
    $body: $('body'),

    // Product page
    $productImage: $('#ProductPhotoImg'),
    $productImageGallery: $('.gallery__item'),

    // Add to cart - Ajax
    $cartBuggle: $('.cart-link__bubble'),
    $addToCartBtn: $('form[action^="/cart/add"] :submit'),
  }
};

timber.cacheVariables = function () {
  timber.vars = {
    isTouch: timber.cache.$html.hasClass('supports-touch')
  }
};

themeAPI.init = function () {
  themeAPI.cacheSelectors();
  timber.cacheVariables();
  themeAPI.productImageGallery();
  themeAPI.enableAjax();
};

themeAPI.productImageGallery = function() {
  if (!themeAPI.cache.$productImageGallery.length) {
    return;
  };

  themeAPI.cache.$productImage.on('click', function() {
    var imageId = $(this).attr('data-image-id');
    // console.log(imageId)
    themeAPI.cache.$productImageGallery.filter('[data-image-id="' + imageId + '"]').trigger('click');
  });

  themeAPI.cache.$productImageGallery.magnificPopup({
    type: 'image',
    mainClass: 'mfp-fade',
    closeOnBgClick: true,
    closeBtnInside: false,
    closeOnContentClick: true,
    tClose: 'translation missing: en.products.zoom.close',
    removalDelay: 500,
    callbacks: {
      open: function(){
        $('html').css('overflow-y','hidden');
      },
      close: function(){
        $('html').css('overflow-y','');
      }
    },
    gallery: {
      enabled: true,
      navigateByImgClick: false,
      arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"><span class="mfp-chevron mfp-chevron-%dir%"></span></button>',
      tPrev: 'translation missing: en.products.zoom.prev',
      tNext: 'translation missing: en.products.zoom.next'
    }
  });
};

themeAPI.backButton = function () {
  var referrerDomain = urlDomain(document.referrer);
  var shopDomain = urlDomain(document.url);

  if (shopDomain === referrerDomain) {
    history.back();
    return false;
  }

  function urlDomain(url) {
    var    a      = document.createElement('a');
           a.href = url;
    return a.hostname;
  }
};

themeAPI.addToCartflip = function ($addToCartBtn) {
  // console.log($addToCartBtn)

  // Get label of add to cart button
  var addToCartText = $addToCartBtn.attr('data-add-to-cart') || "Add to cart";

  // Make a copy of the add to cart button should we flip it
  $addToCartBtn
    .clone(true)
    .prop('disabled', false)
    .removeClass('disabled')
    .addClass('btn--unflipped')
    .find('span')
    .text(addToCartText)
    .attr('text',addToCartText)
    .end()
    .hide()
    .insertAfter($addToCartBtn);
  
  const continueShoppingBtn = `<div class="continue-shopping mt-4 py-2 px-6 bg-white">
    <a class="block w-full text-center text-base uppercase text-black" href="javascript:;" text="Continue Shopping">Continue Shopping</a>
  </div>`;

  $addToCartBtn
    .unbind('click')
    .removeClass('disabled')
    .find('span')
    .text("View Cart")
    .attr('text',"View Cart")
    .end()
    .bind('click', function(e) {
      e.preventDefault();
      window.location.href = '/cart';
    })
    .prop('disabled', false)
    .addClass('btn--flipped')
    .after(continueShoppingBtn);

  $('.continue-shopping a').bind('click', function(){
    if ($(".swatch").length > 0) {
      $(".swatch-element :radio:checked").click();
    }else{
      $('.continue-shopping').remove();
    }
  });

  // Unflip button if another variant is selected
  $('.swatch-element, .single-option-selector, [name="quantity"]').bind('click', function() {
    $(this).closest('form').find('.btn--flipped, .continue-shopping, .note').remove();
    $(this).closest('form').find('.btn--unflipped').removeClass('.btn--unflipped').show();
  });
};

themeAPI.enableAjax = function () {
  themeAPI.cache.$addToCartBtn.bind('click', function(e) {
    e.preventDefault();
    $('.note.errors').remove();
    var $addToCartBtn = $(this),
        $addToCartForm = $(this).closest('form'),
        $addToCartBtnText = $(this).find('span');
    if ($addToCartForm.length) {
      $addToCartBtn
        .attr('data-add-to-cart', $addToCartBtnText.text())
        .prop('disabled', true)
        .addClass('disabled')
        .addClass('btn--loading');
      console.log($addToCartForm.serialize());
      $.ajax({
        url: '/cart/add.js',
        dataType: 'json',
        type: 'post',
        data: $addToCartForm.serialize(),
        success: function(lineItem) {
          $.getJSON('/cart.js', function(cart) {
            themeAPI.cache.$cartBuggle.addClass("cart-link__bubble--visible");
            themeAPI.cache.$cartBuggle.text(cart.item_count);
            $('.hidden-count').removeClass('hidden-count');
          });
          $addToCartBtn.removeClass('btn--loading');
          themeAPI.addToCartflip($addToCartBtn);
          $addToCartForm.data('submitSuccess',true);
        },
        error: function(XMLHttpRequest, textStatus) {
          var data = eval('(' + XMLHttpRequest.responseText + ')');
          var response = data.description;
          var status = XMLHttpRequest.status;
          $addToCartBtn.removeClass('btn--loading');
          if (status === 422 && $('#productSelect option').length === 1) {
            $addToCartBtnText.text("Sold out");
          }
          else {
            $addToCartBtn.prop('disabled', false).removeClass('disabled');
            $addToCartBtnText.text($addToCartBtn.attr('data-add-to-cart'));
          }
          $addToCartBtn.after('<p class="note errors text-xs">' + response + '</p>');
        }
      });
    }
  });
};

// Initialize theme's JS on docready

$(themeAPI.init)

