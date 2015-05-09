var extensionRegExp = /(?:\.([^.]+))?$/;
function getExtension(fn) {
	return extensionRegExp.exec(fn)[1] || '';
};

module.exports = {
	createImageView: function(data, cache){
		data = data || {};
		cache = cache || false;
		var md5,
			needsToSave = false,
			savedFile,
			saveImageHandler,
			image;
		if(data.image && data.image.indexOf('http://') === 0) {
			md5 = Titanium.Utils.md5HexDigest(data.image) + getExtension(data.image);
			savedFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, md5);
			if(savedFile.exists()){
				data.image = savedFile;
			} else {
				needsToSave = cache;
			}
		}
		image = Titanium.UI.createImageView(data);
		if(needsToSave === true){
			saveImageHandler = function(e) {
				image.removeEventListener('load', saveImageHandler);
				savedFile.write(Titanium.UI.createImageView({image:image.image, width:'auto', height:'auto'}).toImage());
			};
			image.addEventListener('load', saveImageHandler);
		}
		return image;
	}
};