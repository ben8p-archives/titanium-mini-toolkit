var Events = require('../core/Events'),
	lang = require('../core/lang'),
	SHADOW_OPACITY = 0.4,
	Drawer = function(args) {
		// summary:
		//		A simple "slide from ..." drawer class
		// args: Object
		//		Constructor arguments:
		//	|	args = {
		//	|		container: UI.Window/Ui.View,
		//	|		view: UI.View,
		//	|		duration: Number (Optional),
		//	|		size: Number/String (Optional),
		//	|		opacity: Number (Optional),
		//	|		slideFrom: String (Optional, can be left, right, top, bottom)
		//	|		enabled: Boolean (Optional)
		//	|	}

		var drawerOpen = false,
			duration,
			enabled,
			view = args.view,
			slideFrom = args.slideFrom || 'left',
			directions = {
				//direction: [swipe to open, swipe to close, sizeFunction, positionFunction, property to animate]
				left: ['right', 'left', 'setWidth', 'setLeft', 'left'],
				right: ['left', 'right', 'setWidth', 'setRight', 'right'],
				top: ['bottom', 'top', 'setHeight', 'setTop', 'top'],
				bottom: ['top', 'bottom', 'setHeight', 'setBottom', 'bottom']
			},
			shadowView = Titanium.UI.createView({
				backgroundColor: '#000000',
				opacity: 0,
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				visible: false
			}),
			/*start = {
				x: -1,
				y: -1
			},
			swipeDelta = 30,*/
			onSwipe = lang.hitch(this, function(swipeDirection) {
				if((swipeDirection !== directions[slideFrom][0] && swipeDirection !== directions[slideFrom][1])
					|| (this.isOpen() && swipeDirection === directions[slideFrom][0])
					|| (!this.isOpen() && swipeDirection === directions[slideFrom][1])) {
					return;
				}
				this.toggle();
			});

		// see the bottom for setters

		args.container.add(shadowView);
		args.container.add(view);
		shadowView.setZIndex(Infinity);
		view.setZIndex(Infinity); //second infinity will be higher than first one
		/*if(args.container instanceof Titanium.UI.ScrollView) {
			alert('not tested: drawer on Titanium.UI.ScrollView');
			args.container.addEventListener('touchstart', function(e) {
				start.x = e.x;
				start.y = e.y;
			});
			args.container.addEventListener('touchend', function(e) {
				//if difference exceeds threshold (in this case 30 pixels), it's a swipe.
				var dir = null;
				if (start.x > 0 && e.x - start.x > swipeDelta) {
					dir = 'right';
				} else if (start.x > 0 && e.x < start.x - swipeDelta) {
					dir = 'left';
				} else if (start.y > 0 && e.y - start.y > swipeDelta) {
					dir = 'bottom';
				} else if (start.y > 0 && e.y < start.y - swipeDelta) {
					dir = 'top';
				}
				if(dir) {
					onSwipe(dir);
				}

				start.x = start.y = -1;
			 });

		} else {*/
		args.container.addEventListener('swipe', function(e) {
			onSwipe(e.direction);
		});
		/*}*/


		this.setDuration = function(value) {
			// summary:
			//		Change the animation duration
			// value: Number
			//		Duration time in ms
			duration = value || 250;
		};
		this.setEnabled = function(value) {
			// summary:
			//		enable or disable the drawer
			// value: Boolean
			//		New state
			enabled = value === true;
		};
		this.setSize = function(value) {
			// summary:
			//		Change the space the drawer will occupy when opened
			// value: Number/String
			//		the size in OS unit
			value = value || '250dp';

			view[directions[slideFrom][2]](value || '250dp');
			view[directions[slideFrom][3]]('-' + value);
		};
		this.setOpacity = function(value) {
			// summary:
			//		Change the drawer panel opacity
			// value: Number
			//		From 0 (transparent) to 1 (opaque)
			value = value || 1;
			view.setOpacity(value || 1);
		};
		this.toggle = function(state){
			// summary:
			//		Display/hide the drawer
			// state: Boolean (Optional)
			//		true for open / false for close
			if(!enabled) { return; }
			var properties = {
					curve: Titanium.UI.ANIMATION_CURVE_LINEAR,
					duration: duration
				},
				shadowProperties = {
					curve: Titanium.UI.ANIMATION_CURVE_LINEAR,
					duration: duration
				};

			if(state === undefined) {
				state = !drawerOpen;
			}
			if((state && drawerOpen) || (!state && !drawerOpen)) {
				return;
			}
			drawerOpen = state;

			if(!state) {
				properties[directions[slideFrom][4]] = '-' + view.width;
				shadowProperties.opacity = 0;
				this.emit('close');
			} else {
				properties[directions[slideFrom][4]] = 0;
				shadowProperties.opacity = SHADOW_OPACITY;
				this.emit('open');
			}

			shadowView.show();
			shadowView.animate(shadowProperties, lang.hitch(this, function(isOpened) {
				if(!isOpened) {
					shadowView.hide();
				}
			}, state));
			view.animate(properties);
		};
		this.isOpen = function() {
			// summary:
			//		return true if the drawer is currently open
			return drawerOpen;
		};

		//setters execution have to at the bottom
		this.setEnabled(args.enabled === undefined || args.enabled);
		this.setDuration(args.duration);
		this.setSize(args.size);
		this.setOpacity(args.opacity);
	};

lang.extend(Drawer, Events());
module.exports = function(args) {
	return new Drawer(args || {});
};
