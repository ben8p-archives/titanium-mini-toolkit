var KEY = 'GoogleOAuth',
	ret ={
		KEY: KEY,
		get: function() {
			var expiresIn = Titanium.App.Properties.getString(KEY + '.expiresIn') || 0;
			if (expiresIn < (new Date()).getTime()) {
				console.info('GoogleAuth: Access code invalid');
				ret.set({
					accessToken: '',
					refreshToken: '',
					tokenType: '',
					expiresIn: 0,
					scope: ''
				});
			}

			return {
				accessToken: Titanium.App.Properties.getString(KEY + '.accessToken', ''),
				refreshToken: Titanium.App.Properties.getString(KEY + '.refreshToken', ''),
				tokenType: Titanium.App.Properties.getString(KEY + '.tokenType', ''),
				expiresIn: Titanium.App.Properties.getString(KEY + '.expiresIn', 0),
				scope: Titanium.App.Properties.getString(KEY + '.scope', '')
			};
		},
		set: function(values) {
			Titanium.App.Properties.setString(KEY + '.accessToken', values.accessToken || '');
			Titanium.App.Properties.setString(KEY + '.refreshToken', values.refreshToken || '');
			Titanium.App.Properties.setString(KEY + '.tokenType', values.tokenType || '');
			Titanium.App.Properties.setString(KEY + '.expiresIn', values.expiresIn || 0);
			Titanium.App.Properties.setString(KEY + '.scope', values.scope || '');
		}
	};
module.exports = ret;