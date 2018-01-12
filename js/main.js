// https://css-tricks.com/snippets/jquery/serialize-form-to-json/
$.fn.serializeObject = function()
{
   var o = {};
   var a = this.serializeArray();

   $.each(a, function() {
       if (o[this.name]) {
           if (!o[this.name].push) {
               o[this.name] = [o[this.name]];
           }
           o[this.name].push(this.value || '');
       } else {
           o[this.name] = this.value || '';
       }
   });

   return o;
};

(function () {
    "use strict";

    var openCloseModal = function (id, push = true) {
        var $elm;

        if (typeof id === 'string') {
            $elm = $('#' + id);
        } else {
            $elm = id;
            id = $elm.attr('id');
        }

        if ($elm.length < 1) {
            return;
        }

        var toggle = $elm.find('.work-toggle'),
            item = $elm.find('.work-item'),
            imgs = item.find('img[data-src]');

        if (item.css('display') === 'none') {
            $('.work-item').slideUp('fast');
            $('.work-toggle').removeClass('active');

            item.slideDown('fast');
            toggle.addClass('active');

            imgs.each(function () {
                var $this = $(this);

                $this.attr('src', $this.data('src'));

                $this.on('load', function () {
                    $this.removeAttr('data-src');
                });
            });

            setTimeout(function () {
                var dist = 210 - 59,
                    px = $elm.offset().top;

                if ($(window).width() < 700) {
                    dist = 28;
                }

                px = px - dist;

                $('html, body').animate({
                    scrollTop: px
                }, 200);
            }, 215);

            if (push) {
                var state = {'id': id};
                window.history.pushState(state, '', window.location.pathname + '#!/' + id);
            }
        } else {
            item.slideUp('fast');
            toggle.removeClass('active');

            if (push) {
                var state = {'id': null};
                window.history.pushState(state, '', window.location.pathname);
            }
        }
    };

    $(document).ready(function () {
        var hash = window.location.hash;

        if (hash.length > 0) {
            hash = hash.replace('#!/', '');
            openCloseModal(hash, false);
        }
    });

    window.onpopstate = function(event) {
        if (event.state === null || event.state.id === null) {
            $('.work-item').slideUp('fast');
            $('.work-toggle').removeClass('active');
        } else {
            openCloseModal(event.state.id, false);
        }
    };

    $('.work-toggle').click(function (e) {
        var $this = $(this),
            id = $this.data('id');

        openCloseModal(id);

        e.preventDefault();
        return false;
    });

    $('.work-close').click(function (e) {
        var $this = $(this),
            parent = $this.parents('.work-container');

        openCloseModal(parent);

        e.preventDefault();
        return false;
    });

    $('.know-more-link').click(function (e) {
        $('.know-more').slideToggle('fast');

        e.preventDefault();
        return false;
    });

    $('.contact-form button').click(function (e) {
        var $this = $(this);

        $this.find('.form-send').hide();
        $this.find('.form-sending').show();
        $this.attr('disabled', 'disabled');

        $('.contact-form').submit();
    });

    $('.contact-form').submit(function (e) {
        var $this = $(this),
            target = $this.attr('action'),
            data = $this.serializeObject();

        $.post(target, data, function (d) {
            $this.hide();
            $('.form-success').show();
        }, 'json');

        e.preventDefault();
        return false;
    });
})();
