/**
  * Klep LightBox
  *
  * @version	: 	0.0.1 - Beta
  * @copyright	:	Muhammad Zulki Akbari (Zatle Production)
  * @website	:	https://zatle.tech
  * @requires	:	jQuery v2.1 or later
  
  * Released under the MIT license
*/
(function ($){
  klepOptions = {
    withGallery: true,
    withCarousel: true,
    isAjax: false,
    isRotate: false,
    openOriginalImage: false,
    jsonData: {
      'title': undefined,
      'images': [],
    },
  };

  klepObjects = []; // array for containing all initialized object
  klepEnable = false;
  klepIsActive = false;
  klepWithSlideShow = undefined;
  klepMobileDetect = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  klepCurrentObject = false;
  klepCurrentOptions = false;
  klepCurrentVariables = false;
  klepDeeplinkTrack = false;
  klepHashlessUrl = false;
  klepHashUrl = '';

  function imageElement(){
    return $('.klep__lightbox__show__image').find('img');
  }
  
  function imageSource(){
    return imageElement().attr('src');
  }

  function klepLightboxTemplate(data){
    var imageThumbOnFooter = '';
    var galleryContainer = '';
    var centerContentImage = 'style="overflow-x: scroll;"';
    if(data.jsonData.images.length < 16){
      centerContentImage = 'style="justify-content: center;"';
    }

    data.jsonData.images.forEach((element, index) => {
      var isActive = '';
      if(index == 0){
        isActive = 'active';
      }

      imageThumbOnFooter += `
      <img class="klep__lightbox__gallery__list__thumb ${ isActive }" src="${ element }"></img>
      `;
    });

    if(data.withGallery){
      galleryContainer = `
      <div class="klep__lightbox__gallery">
          <div class="klep__lightbox__gallery__list" ${ centerContentImage }>${ imageThumbOnFooter }</div>
      </div>
      `;
    }

    return `
    <div class="klep__lightbox__modal">
      <div class="klep__lightbox__content">
        <div class="klep__lightbox__header">
          <div class="klep__lightbox__title">${ data.jsonData.title }</div>
          <div class="klep__lightbox__body__button klep__lightbox__action"></div>
          <div class="klep__lightbox__action">
            <div class="klep__lightbox__close__button">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
        <div class="klep__lightbox__body">
          <div class="klep__lightbox__show__image">
            <img src="${ data.jsonData.images[0] }"></img>
          </div>
        </div>
        <div class="klep__lightbox__footer">${ galleryContainer }</div>
      </div>
    </div>
    `;
  }

  function showCurrentImage(){
    $('.klep__lightbox__gallery__list__thumb').each(function(){
      $(this).on('click', function(){
        $('.klep__lightbox__gallery__list__thumb').removeClass('active');
        imageElement().removeAttr('src');
        imageElement().attr('src', $(this).attr('src'));
        $(this).addClass('active');
      });
    });
  }

  function zoomInImage(){
    imageElement().each(function(){
      $(this).on('click', function(){
        $(this).toggleClass('zoomed');
      });
    });
  }

  function klepLoading(size){
    return `
    <div class="klep__loading">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; display: block; shape-rendering: auto;" width="${ size }px" height="${ size }px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <circle cx="50" cy="50" fill="none" stroke="#ffffff" stroke-width="4" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">
          <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
        </circle>
      </svg>
    </div>
    `;
  }

  function detectImageOrientation(){
    imageElement().one('load', function(){
      var width = $(this).width();
      var height = $(this).height();
      if(height > width){
        $('.klep__lightbox__show__image').addClass('klep__lightbox__image__potrait');
      } else {
        $('.klep__lightbox__show__image').addClass('klep__lightbox__image__landscape');
      }
      $('.klep__lightbox__show__image').find('img').toggleClass('klep__display__none');
      $('.klep__lightbox__show__image').find('.klep__loading').remove();
    }).each(function(){
      $('.klep__lightbox__show__image').find('img').toggleClass('klep__display__none');
      $('.klep__lightbox__show__image').prepend(klepLoading(100));
    });
  }

  function galleryListLoad(){
    $('.klep__lightbox__gallery__list__thumb').each(function(){
      $(this).one('load', function(){
        $(this).toggleClass('klep__display__none');
        $(this).parent().find('.klep__loading').remove();
      }).each(function(){
        $(this).toggleClass('klep__display__none');
        $(this).parent().append(klepLoading(50));
      });
    });
  }

  function klepLightboxCreate(elem){
    if($(elem).find('.klep__lightbox__modal').length == 0){
      $(elem).prepend(klepLightboxTemplate(klepOptions));
      showCurrentImage();
      klepLightboxDestroy();
      klepLightboxDestroyFromOutside();
      zoomInImage();
      detectImageOrientation();
      galleryListLoad();
      $('body').css('overflow', 'hidden');
    }
  }

  function klepLightboxDestroy(){
    $('.klep__lightbox__close__button').on('click', function(){
      $('.klep__lightbox__modal').fadeOut().remove();
      $('body').css('overflow', 'auto');
    });
  }

  function klepLightboxDestroyFromOutside(){
    $('.klep__lightbox__modal').on('click', function(e){
      e.preventDefault();
      if($(e.target).attr('class') == 'zoomed' || $(e.target).attr('class') == 'klep__lightbox__title' || $(e.target).attr('src') !== undefined || $(e.target).parent().parent().hasClass('klep__lightbox__body__button') || $(e.target).parent().parent().hasClass('klep__lightbox__content') || $(e.target).hasClass('w-6 h-6')){
        //
      } else {
        $('.klep__lightbox__modal').fadeOut().remove();
        $('body').css('overflow', 'auto');
      }
    });
  }

  function klepLightboxRotateTemplate(){
    var template = `
    <div class="klep__lightbox__button">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 klep__lightbox__counter__clockwise__rotate">
        <path fill-rule="evenodd" d="M9.53 2.47a.75.75 0 010 1.06L4.81 8.25H15a6.75 6.75 0 010 13.5h-3a.75.75 0 010-1.5h3a5.25 5.25 0 100-10.5H4.81l4.72 4.72a.75.75 0 11-1.06 1.06l-6-6a.75.75 0 010-1.06l6-6a.75.75 0 011.06 0z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="klep__lightbox__button">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 klep__lightbox__clockwise__rotate">
        <path fill-rule="evenodd" d="M14.47 2.47a.75.75 0 011.06 0l6 6a.75.75 0 010 1.06l-6 6a.75.75 0 11-1.06-1.06l4.72-4.72H9a5.25 5.25 0 100 10.5h3a.75.75 0 010 1.5H9a6.75 6.75 0 010-13.5h10.19l-4.72-4.72a.75.75 0 010-1.06z" clip-rule="evenodd" />
      </svg>
    </div>
    `;

    $('.klep__lightbox__body__button').append(template);
    imageElement().attr('rotate', 0);

    $('.klep__lightbox__clockwise__rotate').on('click', function(){
      var rotateValue = parseInt(imageElement().attr('rotate')) + 90;
      imageElement().removeAttr('rotate').attr('rotate', rotateValue);
      imageElement().css('rotate', rotateValue + 'deg');
    });

    $('.klep__lightbox__counter__clockwise__rotate').on('click', function(){
      var rotateValue = parseInt(imageElement().attr('rotate')) - 90;
      imageElement().removeAttr('rotate').attr('rotate', rotateValue);
      imageElement().css('rotate', rotateValue + 'deg');
    });
  }

  function klepLightboxOpenOriginalImageTemplate(){
    var template = `
    <div class="klep__lightbox__original__image klep__lightbox__button">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
        <path fill-rule="evenodd" d="M15 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.56l-3.97 3.97a.75.75 0 11-1.06-1.06l3.97-3.97h-2.69a.75.75 0 01-.75-.75zm-12 0A.75.75 0 013.75 3h4.5a.75.75 0 010 1.5H5.56l3.97 3.97a.75.75 0 01-1.06 1.06L4.5 5.56v2.69a.75.75 0 01-1.5 0v-4.5zm11.47 11.78a.75.75 0 111.06-1.06l3.97 3.97v-2.69a.75.75 0 011.5 0v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 010-1.5h2.69l-3.97-3.97zm-4.94-1.06a.75.75 0 010 1.06L5.56 19.5h2.69a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 011.5 0v2.69l3.97-3.97a.75.75 0 011.06 0z" clip-rule="evenodd" />
      </svg>
    </div>
    `;

    $('.klep__lightbox__body__button').append(template);

    $('.klep__lightbox__original__image').on('click', function(){
      window.open(imageSource(), '_blank');
    });
  }

  /* Initialize */
  $.klepLightbox = function(options) {
    var options = $.extend(klepOptions, options);
    klepLightboxCreate('body');

    if(klepOptions.isRotate){
      klepLightboxRotateTemplate();
    }

    if(klepOptions.openOriginalImage){
      klepLightboxOpenOriginalImageTemplate();
    }
  }

  $.fn.klepLightbox = function(object, options) {
    var options = $.extend(klepOptions, options);
    console.log($(this));
  }

})(jQuery);