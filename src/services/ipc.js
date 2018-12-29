const {ipcMain} = require('electron');
const LibraryService = require('./library');

module.exports = class IPCService {

	constructor(window, remoteLibrary, localLibrary, states, settings) {
		this.window = window;
		this.remoteLibrary = remoteLibrary;
		this.localLibrary = localLibrary;
		this.states = states;
		this.settings = settings;
		this.init();
	}

	init() {
		this.calls.forEach(item => ipcMain.on(item.name, item.action));
	}

	get calls() {
		return [
			...this.libraryCalls,
			...this.fileCalls,
			...this.settingsCalls,
			...this.stateCalls,
			...this.windowCalls,
		];
	}

	get libraryCalls() {
		return  [
			{
				name: "library.getAll",
				action: async (event) => {
					const results = await this.remoteLibrary.list();
					event.returnValue = this.remoteLibrary.cleanUpResults(results);
				}
			},
			{
				name: "library.getAllCounts",
				action: async (event) => {
					const results = (await this.remoteLibrary.list()).map(x => x[0].key);
					const slashCounts = results.map(x => (x.match(/\//g) || []).length);
					const authors = new Set(results.map(x => x.slice(0,x.indexOf('/'))));
					const series = new Set(results.filter(x => (x.match(/\//g) || []).length === 2)
						.map(x => x.slice(x.indexOf('/'),x.lastIndexOf('/'))));
					event.returnValue = {
						authors: authors.size,
						series: series.size,
						books: slashCounts.length, //filter(x => x===2)
						singleBooks: slashCounts.filter(x => x===1).length
					}
				}
			},
			{
				name: "library.getWork",
				action: async (event, key) => {
					if (!key) throw Error(`Key '${key}' is invalid`);
					const results = await this.remoteLibrary.get(String(key));
					const i = this.remoteLibrary.cleanUpResults(results);
					event.returnValue = i[0];
				}
			},
			{
				name: "library.importdelta",
				action: (event) => {
					LibraryService.fileSystemToLibrary(true, this.remoteLibrary, this.localLibrary, this.settings).then(result => {
						event.sender.send('library.importdelta.reply', result)
					}).catch(err => {
						event.sender.send('library.importdelta.reply', err)
					});
				}
			},
			{
				name: "library.reimport",
				action: (event) => {
					LibraryService.fileSystemToLibrary(false, this.remoteLibrary, this.localLibrary, this.settings).then(result => {
						event.sender.send('library.reimport.reply', result)
					}).catch(err => {
						event.sender.send('library.reimport.reply', err)
					});
				}
			},
			{
				name: "library.clear",
				action: (event) => {
					LibraryService.clearLibrary(this.remoteLibrary, this.localLibrary).then(result => {
						event.sender.send('library.clear.reply', result)
					}).catch(err => {
						event.sender.send('library.clear.reply', err)
					});
				}
			}
		];
	}

	get fileCalls() {
		return [
			{
				name: "file.path.lookup",
				action: async (event, key) => {
					if (!key) throw Error(`Key '${key}' is invalid`);
					const results = await this.localLibrary.get(String(key));
					const t = this.remoteLibrary.cleanUpResults(results);
					event.returnValue = t.length > 0 ? t[0] : '';
				}
			},
		];
	}

	get settingsCalls() {
		return [
			{
				name: "settings.get",
				action: (event, key) => {
					if (!key) throw Error(`Key '${key}' is invalid`);
					event.returnValue = this.settings.get(String(key));
				}
			},
			{
				name: "settings.gets",
				action: (event, keys) => {
					if (!keys) throw Error(`Keys '${keys}' is invalid`);
					let data = keys.reduce((acc, val) => {
						const name = String(val);
						acc[(name)] = this.settings.get(name);
						return acc;
					}, {});
					event.returnValue = JSON.stringify(data)
				}
			},
			{
				name: "settings.set",
				action: async (event, key, value) => {
					if (!key) throw Error(`Key '${key}' is invalid`);
					this.settings.set(String(key), String(value));
					await this.settings.save();
				}
			},
			{
				name: "settings.sets",
				action: async (event, keys) => {
					if (!keys) throw Error(`Keys '${keys}' is invalid`);
					for (const setting of keys) {
						this.settings.set(String(setting.name), String(setting.value));
					}
					await this.settings.save();
				}
			}
		]
	}

	get stateCalls() {
		return [
			{
				name: "states.getAll",
				action: async (event) => {
					const results = await this.states.list();
					event.returnValue = this.remoteLibrary.cleanUpResults(results);
				}
			},
			{
				name: "states.get",
				action: async (event, key) => {
					if (!key) throw Error(`Key '${key}' is invalid`);
					const results = await this.states.get(String(key));
					const clean = this.remoteLibrary.cleanUpResults(results);
					event.returnValue = clean.length > 0 ? clean[0] : {};
				}
			},
			{
				name: "states.set",
				action: async (event, key, value) => {
					if (!key) throw Error(`Key '${key}' is invalid`);
					const results = await this.states.put(String(key), value);
					event.returnValue = this.remoteLibrary.cleanUpResults(results);
				}
			},
			{
				name: "states.clear",
				action: () => {
					throw Error('Not Implemented')
				}
			}
		];
	}

	get windowCalls() {
		return [
			{
				name: "window.title.set",
				action: (event, title) => this.window.setTitle(String(title))
			},
			{
				name: "window.flashframe.start",
				action: () => this.window.flashFrame(true)
			},
			{
				name: "window.flashframe.stop",
				action: () => this.window.flashFrame(false)
			},
			{
				name: "window.progressbar.set",
				action: (event, value) => this.window.setProgressBar(Number(value))
			}
		];
	}
};