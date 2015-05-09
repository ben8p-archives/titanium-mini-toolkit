function _mixin(dest, source, copyFunc){
	// summary:
	//		Copies/adds all properties of source to dest; returns dest.
	// dest: Object
	//		The object to which to copy/add all properties contained in source.
	// source: Object
	//		The object from which to draw all properties to copy into dest.
	// copyFunc: Function?
	//		The process used to copy/add a property in source; defaults to the Javascript assignment operator.
	// returns:
	//		dest, as modified
	// description:
	//		All properties, including functions (sometimes termed "methods"), excluding any non-standard extensions
	//		found in Object.prototype, are copied/added to dest. Copying/adding each particular property is
	//		delegated to copyFunc (if any); copyFunc defaults to the Javascript assignment operator if not provided.
	//		Notice that by default, _mixin executes a so-called "shallow copy" and aggregate types are copied/added by reference.
	var name, s, i, empty = {};
	for(name in source){
		// the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
		// inherited from Object.prototype.	 For example, if dest has a custom toString() method,
		// don't overwrite it with the toString() method that source inherited from Object.prototype
		s = source[name];
		if(!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))){
			dest[name] = copyFunc ? copyFunc(s) : s;
		}
	}

	return dest; // Object
}
function _hitchArgs(scope, method){
	var pre = Array.prototype.slice.call(arguments, 2);
	return function(){
		// arrayify arguments
		var args = Array.prototype.slice.call(arguments);
		// invoke with collected args
		return method && method.apply(scope || null, pre.concat(args)); // mixed
	}; // Function
};
module.exports = {
	extend: function(ctor, props){
		// summary:
		//		Adds all properties and methods of props to constructor's
		//		prototype, making them available to all instances created with
		//		constructor.
		// ctor: Object
		//		Target constructor to extend.
		// props: Object
		//		One or more objects to mix into ctor.prototype
		for(var i=1, l=arguments.length; i<l; i++){
			_mixin(ctor.prototype, arguments[i]);
		}
		return ctor; // Object
	},
	mixin: function(dest, sources){
		// summary:
		//		Copies/adds all properties of one or more sources to dest; returns dest.
		// dest: Object
		//		The object to which to copy/add all properties contained in source. If dest is falsy, then
		//		a new object is manufactured before copying/adding properties begins.
		// sources: Object...
		//		One of more objects from which to draw all properties to copy into dest. sources are processed
		//		left-to-right and if more than one of these objects contain the same property name, the right-most
		//		value "wins".
		// returns: Object
		//		dest, as modified
		// description:
		//		All properties, including functions (sometimes termed "methods"), excluding any non-standard extensions
		//		found in Object.prototype, are copied/added from sources to dest. sources are processed left to right.
		//		The Javascript assignment operator is used to copy/add each property; therefore, by default, mixin
		//		executes a so-called "shallow copy" and aggregate types are copied/added by reference.
		// example:
		//		make a shallow copy of an object
		//	|	var copy = lang.mixin({}, source);
		// example:
		//		many class constructors often take an object which specifies
		//		values to be configured on the object. In this case, it is
		//		often simplest to call `lang.mixin` on the `this` object:
		//	|	declare("acme.Base", null, {
		//	|		constructor: function(properties){
		//	|			// property configuration:
		//	|			lang.mixin(this, properties);
		//	|
		//	|			console.log(this.quip);
		//	|			//	...
		//	|		},
		//	|		quip: "I wasn't born yesterday, you know - I've seen movies.",
		//	|		// ...
		//	|	});
		//	|
		//	|	// create an instance of the class and configure it
		//	|	var b = new acme.Base({quip: "That's what it does!" });
		// example:
		//		copy in properties from multiple objects
		//	|	var flattened = lang.mixin(
		//	|		{
		//	|			name: "Frylock",
		//	|			braces: true
		//	|		},
		//	|		{
		//	|			name: "Carl Brutanananadilewski"
		//	|		}
		//	|	);
		//	|
		//	|	// will print "Carl Brutanananadilewski"
		//	|	console.log(flattened.name);
		//	|	// will print "true"
		//	|	console.log(flattened.braces);

		if(!dest){ dest = {}; }
		for(var i = 1, l = arguments.length; i < l; i++){
			_mixin(dest, arguments[i]);
		}
		return dest; // Object
	},
	hitch: function(scope, method){
		// summary:
		//		Returns a function that will only ever execute in the given scope.
		//		This allows for easy use of object member functions
		//		in callbacks and other places in which the "this" keyword may
		//		otherwise not reference the expected scope.
		//		Any number of default positional arguments may be passed as parameters
		//		beyond "method".
		//		Each of these values will be used to "placehold" (similar to curry)
		//		for the hitched function.
		// scope: Object
		//		The scope to use when method executes. If method is a string,
		//		scope is also the object containing method.
		// method: Function|String...
		//		A function to be hitched to scope, or the name of the method in
		//		scope to be hitched.
		// example:
		//	|	lang.hitch(foo, "bar")();
		//		runs foo.bar() in the scope of foo
		// example:
		//	|	lang.hitch(foo, myFunction);
		//		returns a function that runs myFunction in the scope of foo
		// example:
		//		Expansion on the default positional arguments passed along from
		//		hitch. Passed args are mixed first, additional args after.
		//	|	var foo = { bar: function(a, b, c){ console.log(a, b, c); } };
		//	|	var fn = lang.hitch(foo, "bar", 1, 2);
		//	|	fn(3); // logs "1, 2, 3"
		// example:
		//	|	var foo = { bar: 2 };
		//	|	lang.hitch(foo, function(){ this.bar = 10; })();
		//		execute an anonymous function in scope of foo
		if(arguments.length > 2){
			return _hitchArgs.apply(null, arguments); // Function
		}
		if(!method){
			method = scope;
			scope = null;
		}
		return !scope ? method : function(){ return method.apply(scope, arguments || []); }; // Function
	}
};