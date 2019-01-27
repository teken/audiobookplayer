const electron = require('electron');
const path = require('path');
const Config = require('configstore');

const development = process.env.NODE_ENV ? process.env.NODE_ENV.trim() === 'development' : false;

module.exports = class SettingsService {
	constructor() {
		const fileName = development ? 'settings.development.json' : 'settings.json';

		const defaults = {
			firstRun: true,
			dataPath: userDataPath,
			libraryPath: '',
			libraryStyle: 'grid',
			libraryDisplayAuthors: false,
			importStyle: 'folders',
			volume: 100,
			windowState: {
				width: 1200,
				height: 800,
				x: null,
				y: null,
				maximised: false,
			}
		};
		this.config = new Config(fileName, defaults);
	}

	get(key) {
		return this.config.get(key);
	}

	set(key, value) {
		return this.config.set(key, value);
	}
};