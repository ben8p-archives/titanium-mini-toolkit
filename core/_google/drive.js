var xhr = require('../xhr'),
	properties = require('./properties');

module.exports = {
	APPFOLDER: 'appfolder',
	upload: function(file, folder, fileId) {
		// summary:
		//		send a file to the 'appfolder' of google drive
		// file: Titanium.Filesystem.File
		if(folder) {
			folder = [
				{
					id: folder
				}
			];
		}
		var blob = file.read(),
			base64Content = Titanium.Utils.base64encode(blob).text,
			boundary = '-------314159265358979323846',
			delimiter = "\r\n--" + boundary + "\r\n",
			closeDelimiter = "\r\n--" + boundary + "--",
			contentType = blob.getMimeType(),
			metadata = JSON.stringify({
				title: file.name,
				mimeType: contentType,
				parents: folder
			}),
			method = fileId ? 'put' : 'post',
			url = 'https://www.googleapis.com/upload/drive/v2/files';

		if(fileId) {
			url += '/' + fileId;
		}
		return xhr[method]({
			url: url,
			handleAs: 'JSON',
			content: {
				uploadType: 'multipart'
			},
			headers: {
				'Content-Type': 'multipart/mixed; boundary="' + boundary + '"',
				'Authorization': 'Bearer ' + properties.get().accessToken
			},
			postContent: delimiter + 'Content-Type: application/json\r\n\r\n' +
					metadata + delimiter + 'Content-Type: ' + contentType + '\r\n' +
					'Content-Transfer-Encoding: base64\r\n\r\n' + base64Content + closeDelimiter
		});
	},
	del: function(id) {
		return xhr.get({
			url: 'https://www.googleapis.com/drive/v2/files/' + id,
			handleAs: 'JSON',
			headers: {
				'Authorization': 'Bearer ' + properties.get().accessToken
			}
		});
	},
	list: function(queryString) {
		return xhr.get({
			url: 'https://www.googleapis.com/drive/v2/files',
			handleAs: 'JSON',
			headers: {
				'Authorization': 'Bearer ' + properties.get().accessToken
			},
			content: {
				q: queryString
			}
		});
	},
	download: function(url) {
		return xhr.get({
			url: url,
			handleAs: 'BINARY',
			headers: {
				'Authorization': 'Bearer ' + properties.get().accessToken
			}
		});
	}
};