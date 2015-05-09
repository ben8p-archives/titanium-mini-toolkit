var Q = require('../3rdParty/Q');

function objectToQuery(/*Object*/ map){
	// summary:
	//		takes a name/value mapping object and returns a string representing
	//		a URL-encoded version of that object.
	// example:
	//		this object:
	//
	//	|	{
	//	|		blah: "blah",
	//	|		multi: [
	//	|			"thud",
	//	|			"thonk"
	//	|		]
	//	|	};
	//
	//		yields the following query string:
	//
	//	|	"blah=blah&multi=thud&multi=thonk"

	// FIXME: need to implement encodeAscii!!
	var enc = encodeURIComponent,
		pairs = [],
		name,
		i,
		l,
		value,
		assign;
	for(name in map){
		if(map.hasOwnProperty(i)) {
			value = map[name];
			assign = enc(name) + "=";
			if(value instanceof Array){
				l = value.length;
				for(i = 0; i < l; ++i){
					pairs.push(assign + enc(value[i]));
				}
			} else {
				pairs.push(assign + enc(value));
			}
		}
	}
	return pairs.join("&"); // String
}

function xhr(method, ioArgs) {
	var deferred = Q.defer(),
		header,
		request = Titanium.Network.createHTTPClient(),
		onload = function(e) {
			if(request.status === 200) {
				var data = request.responseText;
				if(ioArgs.handleAs) {
					switch(ioArgs.handleAs.toUpperCase()) {
					case 'JSON':
						data = JSON.parse(data);
						break;
					case 'BINARY':
						data = request.responseData;
						break;
					}
				}
				//console.debug(data);
				deferred.resolve(data);
			} else {
				deferred.reject(e);
			}
		},
		onerror = function(e) {
			deferred.reject(e);
		},
		url = ioArgs.url,
		separator = ~url.indexOf('?') ? '&' : '?';
	if(ioArgs.content) {
		url += separator + objectToQuery(ioArgs.content);
	}
	request.open(method, url, true);
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
	request.setRequestHeader('X-HTTP-Method-Override', method);
	request.setRequestHeader('enctype', 'text/html');
	if(ioArgs.headers) {
		for(header in ioArgs.headers) {
			if(ioArgs.headers.hasOwnProperty(header)) {
				request.setRequestHeader(header, ioArgs.headers[header]);
			}
		}
	}
	request.enableKeepAlive = false;
	request.onload = onload;
	request.onerror = onerror;
	if(ioArgs.timeout) {
		request.timeout = ioArgs.timeout;
	}
	if(ioArgs.postContent) {
		request.send(ioArgs.postContent);
	} else {
		request.send();
	}
	return deferred.promise;
}

module.exports= {
	post: function(ioArgs) {
		// summary;
		//		Send a POST xhr request
		//	ioArgs: Object
		//		The parameters of the request
		//	|	{
		//	|		handleAs: String (Optional, can be 'JSON')
		//	|		url: String (the url to query)
		//	|		postContent: String (the query to append to the url)
		//	|	}
		console.debug('POST:', ioArgs);
		return xhr('POST', ioArgs);
	},
	get: function(ioArgs) {
		// summary;
		//		Send a GET xhr request
		//	ioArgs: Object
		//		The parameters of the request
		//	|	{
		//	|		handleAs: String (Optional, can be 'JSON')
		//	|		url: String (the url to query)
		//	|		content: String (the query to append to the url)
		//	|	}
		return xhr('GET', ioArgs);
	},
	put: function(ioArgs) {
		// summary;
		//		Send a PUT xhr request
		//	ioArgs: Object
		//		The parameters of the request
		//	|	{
		//	|		handleAs: String (Optional, can be 'JSON')
		//	|		url: String (the url to query)
		//	|		content: String (the query to append to the url)
		//	|	}
		return xhr('PUT', ioArgs);
	}
};