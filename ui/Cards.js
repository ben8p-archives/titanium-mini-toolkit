var Events = require('../core/Events'),
	lang = require('../core/lang'),
	wrapItem = function(item, padding, shadowSize, shadowColor) {
		var size,
			ctrArgs,
			row = Titanium.UI.createTableViewRow({}),
			wrapper = Titanium.UI.createView({});

		wrapper.setBorderColor('transparent');
		wrapper.setBorderWidth(padding);
		wrapper.add(item);

		wrapper.setTop(0);
		wrapper.setLeft(0);
		wrapper.setRight(shadowSize);
		wrapper.setBottom(shadowSize);
		ctrArgs = {
			backgroundColor: shadowColor,
			borderColor: 'transparent',
			borderWidth: padding,
			left: shadowSize,
			top: shadowSize
		};
		if(wrapper.getWidth()) {
			ctrArgs.width = wrapper.getWidth();
		}
		if(wrapper.getHeight()) {
			ctrArgs.height = wrapper.getHeight();
		}
		row.add(Titanium.UI.createView(ctrArgs));
		row.add(wrapper);
		row.replaceItem = function(newItem) {
			row.remove(item);
			wrapper.add(newItem);
		};
		return row;
	},
	Cards = function(args) {
		// summary:
		//		A single column card view (like google now)
		// args: Object
		//		Constructor arguments:
		//	|	args = {
		//	|		container: UI.Window/Ui.View,
		//	|		backgroundColor: String (Optional, Color),
		//	|		shadowColor: String (Optional, Color),
		//	|		shadowSize: Size unit (Optional),
		//	|		padding: Size unit (Optional)
		//	|	}
		var view = Titanium.UI.createTableView({
				layout: 'vertical',
				separatorColor: 'transparent',
				zIndex: 1
			}),
			padding = args.padding || '20dp',
			shadowSize,
			shadowColor;
		// see the bottom for setters

		view.addEventListener('scroll', lang.hitch(this, function(e) {
			this.emit('scroll', e); //forward the scroll event
		}));

		args.container.add(view);

		this.empty = function() {
			// summary:
			//		destroy all cards
			view.setData([]);
		};

		this.removeItem = function (itemWrapper) {
			// summary:
			//		remove a cards
			// itemWrapper: Object
			//		represent the element returned by setItems
			view.deleteRow(itemWrapper);
		};

		this.setItems = function(items) {
			// summary:
			//		Create cards
			// items: Array
			//		An Array of Views. Each view represent a card
			items = items || [];

			var i,
				item,
				wrappers = [];

			this.empty();
			for(i = 0; i < items.length; i++) {
				item = items[i];
				if(item) {
					wrappers.push(wrapItem(item, padding, shadowSize, shadowColor));
				}
			}
			view.setData(wrappers);
			return wrappers;
		};
		this.setBackgroundColor = function(color) {
			// summary:
			//		Change the background color of the view
			// color: String
			//		The color in hexadecimal
			view.setBackgroundColor(color || '#FFFFFF');
		};
		this.setShadowColor = function(color) {
			// summary:
			//		Change the background color of the shadow
			// color: String
			//		The color in hexadecimal
			shadowColor = color || '#CCCCCC';
		};
		this.setShadowSize = function(size) {
			// summary:
			//		Change the size of the shadow
			// size: Size unit
			//		The new size
			shadowSize = size || '5dp';
		};

		//setters execution have to at the bottom
		this.setShadowColor(args.shadowColor);
		this.setShadowSize(args.shadowSize);
		this.setBackgroundColor(args.backgroundColor);
		this.setItems(args.items);
	};

lang.extend(Cards, Events());
module.exports = function(args) {
	return new Cards(args || {});
};
