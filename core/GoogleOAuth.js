/*
 * Google account authentfication library / module
 * based on Miroslav Magda
 * https://github.com/ejci/Google-Auth-for-Titanium
 *
 * Google authentification for Titanium
 * based on: https://developers.google.com/accounts/docs/OAuth2InstalledApp#formingtheurl
 * Check also https://code.google.com/apis/console/
 */

var Q = require('../3rdParty/Q'),
	lang = require('./lang'),
	xhr = require('./xhr'),
	properties = require('./_google/properties'),
	drive = require('./_google/drive');

//clear the properties :
//properties.set({});

function prepareUrl(options) {
	//Prepare url from options

	//encodeURIComponent(options.scope.join('+'))
	var scope = [],
		i,
		url;
	for (i = 0; i < options.scope.length; i++) {
		scope[i] = encodeURIComponent(options.scope[i]);
	}
	url = options.url
		+ '?approval_prompt=auto&scope=' + scope.join(' ')
		+ '&redirect_uri=urn:ietf:wg:oauth:2.0:oob'
		+ '&response_type=code'
		+ '&include_granted_scopes=true'
		+ '&client_id=' + options.clientId
		+ '&btmpl=mobile';
	if (options.loginHint) {
		url += '&login_hint=' + encodeURIComponent(options.loginHint);
	}
	console.debug(url);
	return url;
}
function getToken(options) {
	console.log('getToken', options);
	return xhr.post({
		url: 'https://accounts.google.com/o/oauth2/token',
		timeout: 5000, /* in milliseconds */
		handleAs: 'JSON',
		postContent: {
			code: options.code,
			client_id: options.clientId,
			redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
			grant_type: 'authorization_code'
		}
	});
}
function refreshToken(options) {
	console.log('refreshToken', options);
	return xhr.post({
		url: 'https://accounts.google.com/o/oauth2/token',
		timeout: 5000, /* in milliseconds */
		handleAs: 'JSON',
		postContent: {
			client_id : options.clientId,
			refresh_token : options.refreshToken,
			grant_type: 'refresh_token'
		}
	});
}
function isAuthorized(scope) {
	var props = properties.get();
	return props.scope === scope.join() && !!props.accessToken;
}
function createWindow(options) {
	var close = Titanium.UI.createButton({
		title : options.closeTitle
	}),
	win = Titanium.UI.createWindow({
		backgroundColor: 'white',
		barColor: options.winColor,
		modal: true,
		title: options.winTitle,
		rightNavButton: close
	}),
	spinner = Titanium.UI.createActivityIndicator({
		zIndex: 1,
		height: 50,
		width: 50,
		hide: true,
		style: Titanium.UI.ActivityIndicatorStyle.DARK
	}),
	webview = Titanium.UI.createWebView({
		width: '100%',
		height: '100%',
		url: options.url
	});

	close.addEventListener('click', function() {
		win.close();
	});
	webview.addEventListener('load', options.load);
	win.add(spinner);
	win.add(webview);

	return {
		loading: function(state) {
			if(state) {
				webview.hide();
				spinner.show();
			} else {
				webview.show();
				spinner.hide();
			}
		},
		evalJS: function(js) {
			return webview.evalJS(js);
		},
		close: function() {
			win.close();
		},
		open: function() {
			win.open();
		}
	};
}

module.exports = function(kwArgs) {
	kwArgs = kwArgs || {};
	var options = lang.mixin({
			clientId: null,
			propertyName: 'googleToken',
			url: 'https://accounts.google.com/o/oauth2/auth',
			scope: ['https://www.googleapis.com/auth/plus.login'],
			closeTitle: 'Close',
			winTitle: 'Google Account',
			errorText: 'Can not authorize user!',
			winColor: '#000',
			quiet: true,
			loginHint: '' //ends up as username in google login form
		}, kwArgs),
		refresh = function() {
			var deferred = Q.defer();
			console.info('GoogleAuth: Refreshing...');
			refreshToken({
				clientId: options.clientId,
				refreshToken: properties.get().refreshToken
			}).then(
				function(data) {
					//console.info("Received text: " + this.responseText);
					properties.set({
						accessToken: data.access_token,
						refreshToken: properties.get().refreshToken,
						tokenType: data.token_type,
						expiresIn: parseFloat(data.expires_in, 10) * 1000 + (new Date()).getTime(),
						scope: options.scope.join()
					});
					console.debug('resolve refresh');
					deferred.resolve();
				},
				function(e) {
					console.info(e.error);
					console.info(e.responseText);
					//ERROR
					Titanium.UI.createAlertDialog({
						title : 'Error',
						message : options.errorText
					});
					console.debug('reject refresh');
					deferred.reject();
				}
			);

			return deferred.promise;
		};
	return {
		module: {
			drive: drive
		},
		isAuthorized: function() {
			return isAuthorized(options.scope);
		},
		authorize: function() {
			var deferred = Q.defer(),
				redirectLoop = 0,
				winObj;

			if(!isAuthorized(options.scope)) {
				winObj = createWindow({
					closeTitle: options.closeTitle,
					winColor: options.winColor,
					winTitle: options.winTitle,
					url: prepareUrl(options),
					load: function() {
						redirectLoop++;
						var accessDenied = winObj.evalJS('document.getElementById("access_denied").value;'),
							code = winObj.evalJS('document.getElementById("code").value;');
						if(accessDenied !== '') {
							console.debug('GoogleAuth: Access denied!');
							properties.set({
								accessToken: '',
								refreshToken: '',
								tokenType: '',
								expiresIn: 0,
								scope: options.scope.join()
							});
							winObj.close();
							deferred.reject();
						}
						if(code !== '') {
							console.debug('GoogleAuth: Access granted!');
							winObj.loading(true);
							//console.info('Code: ' + code);
							getToken({
								code: code,
								clientId: options.clientId,
							}).then(
								function(data) {
									//console.info("Received text: " + this.responseText);
									console.info(data.expires_in);
									properties.set({
										accessToken: data.access_token,
										refreshToken: data.refresh_token,
										tokenType: data.token_type,
										expiresIn: parseFloat(data.expires_in, 10) * 1000 + (new Date()).getTime(),
										scope: options.scope.join()
									});
									winObj.close();
									deferred.resolve();
								},
								function() {
									//console.info(e.error);
									//console.info(e.responseText);
									//TODO: show some error message
									Titanium.UI.createAlertDialog({
										title : 'Error',
										message : options.errorText
									});
									winObj.close();
									deferred.reject();
								}
							);
						}
						if (redirectLoop > 10) {
							//some error (to many requests :) )
							console.debug('GoogleAuth: To many redirects...');
							winObj.close();
							deferred.reject();
						}
					}
				});
				winObj.open();
			} else {
				refresh().then(
					function() {
						console.debug('resolve autorize refresh');
						deferred.resolve();
					},
					function() {
						console.debug('reject autorize refresh');
						deferred.reject();
					}
				);
			}
			return deferred.promise;
		},
		logout: function() {
			var deferred = Q.defer(),
				winObj;
			console.debug('GoogleAuth: User logging out...');
			if(isAuthorized(options.scope)) {
				winObj = createWindow({
					closeTitle: options.closeTitle,
					winColor: options.winColor,
					winTitle: options.winTitle,
					url: 'https://accounts.google.com/Logout',
					load: function() {
						var t = setTimeout(function() {
							winObj.close();
							deferred.resolve();
							//w.remove(webview);
						}, 500);

						properties.set({
							accessToken: '',
							refreshToken: '',
							tokenType: '',
							expiresIn: 0,
							scope: options.scope.join()
						});
					}
				});
				winObj.open();
			} else {
				deferred.resolve();
			}
			return deferred.promise;
		}
	};

};