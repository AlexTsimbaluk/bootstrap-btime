;(function($) {
  
    var defaults = {};

    function Btime (element, options) {
        console.log('constructor:begin');
        this.config = $.extend({}, defaults, options);
        this.$element = $(element);

        var _this = this;

        /*this.$element.mask("29:59", { completed: function() {
            return this.init;
        }});*/
        // this.$element.mask("29:59");
        this.$element.on('change', function(e) {
            console.log(this);
            console.log(_this);
            _this.checkBtime()
        });
        this.init();

        console.log('constructor:end');
    }

    // Инициализация плагина, создание массива с возможными датами для селекта
    Btime.prototype.init = function() {
        console.log('init:begin');

        // Сохраняем контекст
        var _this = this;

        // Получаем текущую дату, время округлено до шага step в меньшую сторону
        var now = new Date();
        now.setSeconds( 0 );
        now.setMinutes( now.getMinutes() - now.getMinutes() % _this.config.step );

        // Получаем дату, на сутки большую текущей (now)
        var tomorrow = new Date( now.getTime() + 3600 * 24 * 1000 );

        // Получаем первую возможную дату, которую можно установить (на 15 минут больше now)
        var first = new Date( now.getTime() + _this.config.min * 60 * 1000 );
        first.setMinutes( first.getMinutes() - first.getMinutes() % _this.config.step );

        // Получаем последнюю возможную дату, которую можно установить (на месяц больше now)
        var end  = new Date( first.getTime() + (_this.config.max - _this.config.min) * 60 * 1000 );

        var dates = [];
        // Получаем количество милисекунд первой и последней возможной даты (first и end)
        var ts = first.getTime();
        var te = end.getTime();

        // Получаем шаг между возможными датами (равен одним суткам, 86400000ms)
        var tstep = 3600 * 24 * 1000;

        // Получаем массив возможных дат
        for (; ts < te; ts += tstep) {
            dates.push(new Date( ts ));
        }

        // Если последняя дата в массиве не равна последней возможной дате (end),
        // то заносим end в массив
        if (_this.rfc_date(dates[ dates.length - 1 ]) != _this.rfc_date( end )) {
            dates.push( end );
        }

        // WTF ??????????????????
        while(true) {
            var of = $('#' + _this.config.dateSelector).find('option:first');
            if (!of.length) {
                break;
                console.log('!of.length');
            }
            if (of.val() >= _this.rfc_date(dates[0])) {
                break;
                console.log('of.val() >= _this.rfc_date(dates[0])');
            }
            of.remove();
        }

        // Заполняем селект выбора даты опциями с датами из массива
        for (var i = 0; i < dates.length; i++) {
            var v = _this.rfc_date( dates[ i ] );
            var ld = $('#' + _this.config.dateSelector).find('option:last');
            if (ld.length === 0 || ld.val() < v) {
                var ol = $('<option></option>');
                ol.val( v );
                ol.text( dates[ i ].toLocaleDateString() );
                $('#' + _this.config.dateSelector).append( ol );
            }
        }

        // Пройдемся по всем опциям в селекте, и:
        // если это сегодня, то добавим в ее текст слово "Сегодня" и удалим класс .future
        // если это завтра, то добавим в ее текст слово "Завтра" и добавим класс .future
        // иначе добавим класс .future
        $.each($('#' + _this.config.dateSelector).find('option'), function(i, o) {
            // Сохранение объекта JQuery (который содержит опцию селекта) в переменную для удобства
            var $o = $(o);

            switch ($o.val()) {
            case _this.rfc_date( now ):
                $o.text(
                    now.toLocaleDateString() + ' (' + _this.config.today + ')'
                );
                $o.removeClass('future');
                break;
            case _this.rfc_date( tomorrow ):
                $o.text(
                    tomorrow.toLocaleDateString() + ' (' + _this.config.tomorrow + ')'
                );
                $o.addClass('future');
                break;
            default:
                $o.addClass('future');
                break;
            }
        });

        // Если установленная опция равна сегодняшней дате,
        // удалим у селекта класс .future, иначе добавим его
        if ($('#' + _this.config.dateSelector).val() == _this.rfc_date( now )) {
            $('#' + _this.config.dateSelector).removeClass('future');
        }
        else {
            $('#' + _this.config.dateSelector).addClass('future');
        }


        // _this.checkBtime();

        console.log('init:end');

    }

    Btime.prototype.rfc_date = function(dt) {
        var res = dt.getFullYear();

        res += '-';
        if (dt.getMonth() < 9)
            res += '0';
        res += dt.getMonth() + 1;


        res += '-';
        if (dt.getDate() < 10)
            res += '0';
        res += dt.getDate();
        return res;
    }

    Btime.prototype.user_time = function(dt) {
        var res = '';
        if (dt.getHours() < 10)
            res += '0';
        res += dt.getHours();

        res += ':';
        if (dt.getMinutes() < 10)
            res += '0';
        res += dt.getMinutes();
        return res;
    }

    Btime.prototype.rfc_zone = function(dt) {
        var res = '';
        var z = dt.getTimezoneOffset();
        if (z <= 0) {
            res += '+';
            z = -z;
        } else {
            res += '-';
        }

        var m = z % 60;
        z -= m;
        z /= 60;

        if (z < 10)
            res += '0';
        res += z;
        if (m < 10)
            res += '0';
        res += m;
        return res;
    }

    Btime.prototype.rfc_time = function(dt) {
        var res = this.user_time( dt );
        res += ':';
        if (dt.getSeconds() < 10)
            res += '0';
        res += dt.getSeconds();

        res += ' ';
        res += this.rfc_zone( dt );
        return res;
    }

    Btime.prototype.rfc_datetime = function(dt) {
        var res = this.rfc_date( dt );
        res += ' ';
        res += this.rfc_time( dt );
        return res;
    }

    Btime.prototype.checkBtime = function() {
        console.log('checkBtime:begin');
        //var $this    = $(this);
        
        var _this = this,
            bres = $('#' + this.config.target)
            ;


        var now = new Date();
        now.setSeconds( 0 );
        now.setMinutes( now.getMinutes() - now.getMinutes() % this.config.step );

        var first = new Date( now.getTime() + this.config.min * 60 * 1000 );
        first.setMinutes( first.getMinutes() - first.getMinutes() % this.config.step );

        var end  = new Date( first.getTime() + (this.config.max - this.config.min) * 60 * 1000 );

        if (!this.$element.val().match(/^\d{2}:\d{2}/)) {
            bres.val('');
            return;
        }

        var hours = parseInt((this.$element.val().split(':'))[0].replace(/^0/, ''), 10);
        var minute = parseInt((this.$element.val().split(':'))[1].replace(/^0/, ''), 10);

        if (hours > 23) {
            this.$element.val( '23:' + (this.$element.val().split(':'))[1] );
            return this.checkBtime();
        }

        if (minute > 59) {
            this.$element.val( (this.$element.val().split(':'))[0] + ':59' );
            return this.checkBtime();
        }

        var res_date = $('#' + this.config.dateSelector).val() + ' ' + this.$element.val() + ':00 ' + this.rfc_zone( now );
        if (res_date > this.rfc_datetime( end )) {
            this.$element.val(user_time( end ));
        } else if (res_date < this.rfc_datetime( first )) {
            this.$element.val(this.user_time( first ));
        }

        res_date = $('#' + this.config.dateSelector).val() + ' ' + this.$element.val() + ':00 ' + this.rfc_zone( now );

        bres.val(res_date);

        console.log('checkBtime:end');
    }

    // Выщитывает когда будет переход на следующий день и запускает таймер
    // чтобы речекнуть время когда это произойдет
    /*$.check_btime_auto = function(min, max, step, dsel, tsel, tres) {
        $.check_btime(min, max, step, dsel, tsel, tres);

        // текущее время, округленное до шага step в меньшую сторону 
        var tomorrow = new Date( new Date().getTime() + 24 * 60 * 60 * 1000 );
        tomorrow.setSeconds( 0 );
        tomorrow.setMinutes( 0 );
        tomorrow.setHours( 0 );

        var now = new Date();

        var delta = tomorrow.getTime() - now.getTime() + 1000;

        setTimeout(function(){
            $.check_btime_auto(min, max, step, dsel, tsel, tres);
        }, delta);
    };*/

    $.fn.btime = function() {

        return this.each(function () {
            var $this   = $(this),
                data    = $this.data('btime');

            if (!data) {
                var options  = {
                        target       : $this.attr('data-target'),
                        dateSelector : $this.attr('data-date-selector'),
                        min          : $this.attr('data-btime-min'),
                        max          : $this.attr('data-btime-max'),
                        step         : $this.attr('data-btime-step'),
                        today        : $this.attr('data-btime-today'),
                        tomorrow     : $this.attr('data-btime-tomorrow')
                };

                $this.data('btime', (data = new Btime(this, options)));
            }
        });

        /*new Btime(this, options);
        return this;*/
    };
  
})(jQuery);


$(document).ready(function() {

    $('[data-toggle="btime"]').btime();

});