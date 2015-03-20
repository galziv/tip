(function (window) {

	var tooltips = [];
	
    var defaults = {
        border: {
            color: 'rgba(255, 153, 51, 0.8)',
            width: '2px',
            style: 'solid'
        },
        heartbeat: {
            active: true,
            radius: '50',
            color: 'orange',
            duration: 1000
        },
        tooltip: {
            border: 'solid 5px orange',
            orientation: 'bottom',
			'background-color': 'gray',
			color: 'orange'
        }
    };

    var backupStyle = function(element){
		
		var border = window.getComputedStyle(element).border;
		var boxShadow = window.getComputedStyle(element).boxShadow;
		var transition = window.getComputedStyle(element).transition;
		var cursor = window.getComputedStyle(element).cursor;

		element.tipBackup = { 
			border: border, 
			boxShadow: boxShadow, 
			transition: transition, 
			cursor: cursor
		};
    }

    var restoreBackup = function($element){
		
		var element = $element.get(0);

		$element.css({ 
			border: element.tipBackup.border,
			'box-shadow': element.tipBackup.boxShadow, 
			transition: element.tipBackup.transition, 
			cursor: element.tipBackup.cursor
		});
    }

    var getOption = function (options, property, subProperty) {

        var prop = options ? options[property] : defaults[property];

        if (subProperty) {
            return prop[subProperty];
        } else {
            return prop;
        }
    };

    var generateGuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    var generateTooltipByOrientation = function($element, orientation, guid, backgroundColor){

		var html = '<div id="' + guid + '" style="position: absolute;display: none;">';
		var triangle = '<div style="width:0px; margin:0 auto;border-' + orientation + ': solid 5px ' + backgroundColor + ';border-left: solid 5px transparent;border-right: solid 5px transparent;"></div>'
		var content = '<div style="border: solid 1px  ' + backgroundColor + ';background-color: ' + backgroundColor + '; border-radius: 4px;padding: 4px;">' + $element.attr('tip-content') + '</div>';

		if(orientation == 'bottom'){
			html+= triangle + content;
		} else if(orientation == 'top'){
			html+= content + triangle;
		}
            
            
        html += '</div>';

        return html;

    }

    var createTooltip = function ($element, boxShadow, backgroundColor, color, orientation) {

        var guid = generateGuid();
		var elementTipOrientation = $element.attr('tip-orientation');
		orientation = elementTipOrientation || orientation;

        var html = generateTooltipByOrientation($element, orientation, guid, backgroundColor);

        $(document.body).append(html);
        var $tooltip = $("#" + guid);

        switch(orientation){
			case "bottom":
				$tooltip.position({ my: 'center top', at: 'center bottom', of: $element });
				break;
			case "top":
				$tooltip.position({ my: 'center bottom', at: 'center top', of: $element });
				break;
		}
		
		// this is done here since position() overwrites style
		$tooltip.css('color', color);

        $element.attr('tip-guid', guid);

        $element.mouseover(function () {
            $("#" + guid).show();
            $(this).attr('tip-mouseover','');
        });

        $element.mouseout(function () {
            $("#" + guid).hide();
            $(this).removeAttr('tip-mouseover');
        });

        tooltips.push(guid);
    };

    var setHeartbeat = function ($element, boxShadow, duration) {

        var hasHeartbeat = true;

        $element.css({
            'transition': 'box-shadow ' + duration + 'ms cubic-bezier(0,0,0.58,1)',
            'box-shadow': boxShadow
        });

        var intervalId = setInterval(function () {

			var splitted = boxShadow.split(' ');
			var boxShadowEnd = splitted[0] + ' ' + splitted[1] + ' 5px ' + splitted[3];

            if (hasHeartbeat || $element.attr('tip-mouseover') != undefined) {
                $element.css('box-shadow', boxShadowEnd);
            } else {
                $element.css('box-shadow', boxShadow);
            }

            hasHeartbeat = !hasHeartbeat;

        }, duration);

        $element.attr('tip-interval', intervalId);
    };

    var tippify = function (options) {

        var $tipped = $("[tip]");

        var borderColor = getOption(options, 'border', 'color');
        var borderWidth = getOption(options, 'border', 'width');
        var borderStyle = getOption(options, 'border', 'style');
        var heartbeatActive = getOption(options, 'heartbeat', 'active');
        var heartbeatColor = getOption(options, 'heartbeat', 'color');
        var heartbeatRadius = getOption(options, 'heartbeat', 'radius');
        var heartbeatDuration = getOption(options, 'heartbeat', 'duration');
		var tooltipBackgroundColor = getOption(options, 'tooltip', 'background-color');
		var tooltipColor = getOption(options, 'tooltip', 'color');
		var tooltipOrientation = getOption(options, 'tooltip', 'orientation');
		

        var boxShadow = '0px 0px ' + heartbeatRadius + 'px ' + heartbeatColor;

        $tipped.each(function () {

            var $self = $(this);

            backupStyle($self.get(0));

            $self.css({ border: borderStyle + " " + borderWidth + " " + borderColor });

            if (heartbeatActive) {
                setHeartbeat($self, boxShadow, heartbeatDuration);
            }
			
			if($self.attr('tip-content')){
				$self.css('cursor', 'help');
            	createTooltip($self, boxShadow, tooltipBackgroundColor, tooltipColor, tooltipOrientation);
            }
        });

        $(document.body).css('cursor', 'help');
    };

    var untippify = function () {
        var $tipped = $("[tip]");

        $tipped.each(function () {

            var $self = $(this);
            var interval = $self.attr('tip-interval');

            if (interval) {
                clearInterval(interval);
            }

            restoreBackup($self);

            tooltips.forEach(function(d) { 
            	$("#" + d).hide();
             })

            $tipped.unbind('mouseover').unbind('mouseout');
        });

        $(document.body).css('cursor', '');
    };

    window.tip = {
        tippify: tippify,
        untippify: untippify
    };

})(window);