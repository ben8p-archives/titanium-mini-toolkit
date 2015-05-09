var DatabaseObject = function(dbName) {
	// summary:
	//		A database class
	// dbName: String
	//		The name of the database
	var _database = dbName;

	this.setDatabase = function(dbName) {
		// summary:
		//		Set the database to use
		// dbName: String
		//		The name of the database
		_database = dbName;
	};
	this.execute = function() {
		// summary:
		//		execute an SQL query, do not provide any return
		var db = Titanium.Database.open(_database);
		db.execute.apply(db, arguments);
		db.close();
	};
	this.get = function() {
		// summary:
		//		execute an SQL query and return an array of object
		//		Each object represent a row
		var db = Titanium.Database.open(_database),
			recordSet = db.execute.apply(db, arguments),
			result = [],
			item,
			i;

		while(recordSet.isValidRow()) {
			item = {};
			for(i = 0; i < recordSet.fieldCount; i++) {
				item[recordSet.fieldName(i)] = recordSet.field(i);
			}
			result.push(item);
			recordSet.next();
		}

		recordSet.close();
		db.close();

		return result;
	};

	this.getFile = function() {
		// summary:
		//		return the database file
		return Titanium.Filesystem.getFile(Titanium.Platform.osname === 'android'
				? 'file:///data/data/' + Titanium.App.getID() + '/databases/' + _database
				: Titanium.Filesystem.getApplicationSupportDirectory() + '/database/' + _database + '.sql');
	};

	this.backup = function(directory, filename) {
		// summary:
		//		backup the database in the specified folder
		// directory: String
		//		Folder name (on sdcard) where to save the database. Default is ApplicationName
		// filename: String
		//		Name of the backup. Default ApplicationName + timestamp
		directory = directory || Titanium.App.name;
		filename = filename ||  Titanium.App.name + (new Date().getTime());
		if(!Titanium.Filesystem.isExternalStoragePresent()) {
			return false;
		}

		var db = this.getFile(),
			myAppDir = Titanium.Filesystem.getFile(Titanium.Filesystem.getExternalStorageDirectory()),
			sdcardDir = myAppDir.getParent(),
			backupDir = Titanium.Filesystem.getFile(sdcardDir.getNativePath(), directory),
			canContinue = true,
			backupFile;
			if(!backupDir.exists()) {
				canContinue = backupDir.createDirectory();
			}
			if(!canContinue) {
				return false;
			}
			backupFile = Titanium.Filesystem.getFile(backupDir.getNativePath(), filename);
			backupFile.write(db.read());
			return true;
	};
};

module.exports = function(name) {
	return new DatabaseObject(name || '');
};
