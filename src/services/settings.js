const electron = require('electron');
const path = require('path');
const nconf = require('nconf');

const development = process.env.NODE_ENV ? process.env.NODE_ENV.trim() === 'development' : false;

module.exports = class SettingsService {
	constructor() {
		const userDataPath = (electron.app || electron.remote.app).getPath('userData');
		const fileName = development ? 'settings.development.json' : 'settings.json';
		const filePath = path.join(userDataPath, fileName);

		nconf.argv().env()
			.file({ file: filePath })
			.defaults({
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
			});
	}

	get(key) {
		return nconf.get(key);
	}

	set(key, value) {
		return nconf.set(key, value);
	}

	save() {
		return new Promise(res => {
			nconf.save((err) => {
				if (err) throw err;
				else res();
			});
		})
	}
};