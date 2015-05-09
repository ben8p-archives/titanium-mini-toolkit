var Events = function() {
	// summary:
	//		A class that provide event handling for non evented object

	var _events = {};

	this.emit = function(listenerName) {
		// summary:
		//		Emit an event -> fire all listeners attached to that event
		// listenerName: String
		//		The name of the event
		// args: ?
		//		Arguments passed to the listeners
		var i,
			listener = _events[listenerName] || [],
			args = [].slice.call(arguments, 1),
			len = listener.length;
		// console.warn('emit ', listenerName, ' there is ', len, ' listeners');
		for(i = 0; i < len; i++) {
			if(typeof listener[i] === 'function') {
				// console.warn('run listener number ', i, ' on: ', listenerName);
				listener[i].apply(null, args);
			}
		}
	};
	this.addEventListener = function(listenerName, listenerFunction) {
		// summary:
		//		Attach an listener to an event
		// listenerName: String
		//		The name of the event
		// listenerFunction: Function
		//		The function to execute when the event is fired

		_events[listenerName] = _events[listenerName] || [];
		_events[listenerName].push(listenerFunction);
		// console.log('addEventListener on ', listenerName, ' it is the number ', _events[listenerName].length);
	};
	this.removeEventListener = function(listenerName, listenerFunction) {
		// summary:
		//		Detach an listener of an event
		// listenerName: String
		//		The name of the event
		// listenerFunction: Function
		//		The function which was attached to the event
		var i,
			listener = _events[listenerName] || [];
		for(i = 0; i < listener.length; i++) {
			if(listener[i] === listenerFunction) {
				delete listener[i];
			}
		}
	};
};
module.exports = function() {
	return new Events();
};
