const loki = require('lokijs');
const path = require('path');
const SettingsService = require('./settings');

module.exports = class DatabaseService {

	static get localLibrary() {
		return this.getDB('locallibrary');
	}

	static get bookTimes() {
		return this.getDB('booktimes');
	}

	static getDB(name) {
		console.log("Loading DB from "+path.join(new SettingsService().get('dataPath'), name))
		return this.loadDatabase(path.join(new SettingsService().get('dataPath'), name));
	}

	static loadDatabase(path) {
		return new loki(path, {
			autoload: true,
			autosave: true,
			autosaveInterval: 4000
		});
	}
};