const { ipcMain } = require('electron');

const LibraryService = require('./library');
const SettingService = require('./settings');

const j = o => JSON.stringify(o);

module.exports = class IPCService {

	constructor(window, localLibrary, bookTimes, settings) {
		this.window = window;
		this.localLibrary = localLibrary;
		this.bookTimings = bookTimes;
		this.settings = settings;
		this.init();
	}

	init() {
		this.calls.forEach(item => ipcMain.on(item.name, item.action));
	}

	get calls() {
		return [
			...this.libraryCalls,
			...this.settingsCalls,
			...this.timingsCalls,
			...this.windowCalls,
		];
	}

	get libraryCalls() {
		return [
			{
				name: "library.getAll",
				action: (event, args) => {
					const authors = this.localLibrary.getCollection('authors');
					const works = this.localLibrary.getCollection('works');
					event.returnValue = {
						authors: authors ? authors.chain().data() : [],
						works: works ? works.chain().data() : []
					};
				}
			},
			{
				name: "library.getAllCounts",
				action: (event, args) => {
					const authors = this.localLibrary.getCollection('authors');
					const works = this.localLibrary.getCollection('works');
					const fetchWorks = (mapFunction) => works ? works.mapReduce(mapFunction, x => x.reduce((a, v) => a + v, 0)) : 0;
					event.returnValue = {
						authors: authors ? authors.count() : 0,
						series: fetchWorks(x => x.type === 'SERIES' ? 1 : 0),
						books: fetchWorks(x => x.type === 'SERIES' ? x.books.length : 1),
						singleBooks: fetchWorks(x => x.type === 'BOOK' ? 1 : 0)
					}
				}
			},
			{
				name: "library.getAuthor",
				action: (event, args) => {
					event.returnValue = this.localLibrary.getCollection('authors').get(Number(args));
				}
			},
			{
				name: "library.getWork",
				action: (event, args) => {
					event.returnValue = this.localLibrary.getCollection('works').get(Number(args));
				}
			},
			{
				name: "library.getAuthorAndWork",
				action: (event, args) => {
					event.returnValue = {
						author: this.localLibrary.getCollection('authors').get(Number(args.author)),
						work: this.localLibrary.getCollection('works').get(Number(args.work))
					};
				}
			},
			{
				name: "library.importdelta",
				action: (event, args) => {
					LibraryService.fileSystemToLibrary(true, this.localLibrary, this.settings).then(result => {
						console.log("fin")
						event.sender.send('library.importdelta.reply', result)
					}).catch(x => {
						console.error(x)
						event.sender.send('library.importdelta.reply', x)
					});
				}
			},
			{
				name: "library.reimport",
				action: (event, args) => {
					LibraryService.fileSystemToLibrary(false, this.localLibrary, this.settings).then(result => {
						console.log("fin")
						event.sender.send('library.reimport.reply', result)
					}).catch(x => {
						console.error(x)
						event.sender.send('library.reimport.reply', x)
					});
				}
			},
			{
				name: "library.clear",
				action: (event, args) => {
					LibraryService.clearLibrary(this.localLibrary).then(result => {
						console.log("fin")
						event.sender.send('library.clear.reply', result)
					}).catch(x => {
						console.error(x)
						event.sender.send('library.clear.reply', x)
					});
				}
			}
		];
	}

	get settingsCalls() {
		return [
			{
				name: "settings.get",
				action: (event, args) => {
					const result = this.settings.get(String(args));
					event.returnValue = result;
					//event.sender.send('settings.get.reply', result);
				}
			},
			{
				name: "settings.gets",
				action: (event, args) => {
					let data = args.reduce((acc, val) => {
						const name = String(val);
						acc[(name)] = this.settings.get(name);
						return acc;
					}, {});
					event.returnValue = JSON.stringify(data)
					//event.sender.send('settings.gets.reply', results);
				}
			},
			{
				name: "settings.set",
				action: (event, args) => {
					this.settings.set(String(args.name), String(args.value));
					// this.settings.save()
					// 	.then(() => event.sender.send('settings.set.reply', {success: true}))
					// 	.catch(err => event.sender.send('settings.set.reply', {success: false, error: err}));
				}
			},
			{
				name: "settings.sets",
				action: (event, args) => {
					args.forEach(setting => {
						this.settings.set(String(setting.name), String(setting.value));
					});
					// this.settings.save()
					// 	.then(() => event.sender.send('settings.sets.reply', {success: true}))
					// 	.catch(err => event.sender.send('settings.sets.reply', {success: false, error: err}));
				}
			}
		]
	}

	get timingsCalls() {
		return [
			{
				name: "timings.getAll",
				action: (event, args) => {
					let timings = this.bookTimings.getCollection('timings');
					if (timings === null) {
						this.bookTimings.addCollection('timings', { indices: ['key'], autoupdate: true });
						timings = this.bookTimings.getCollection('timings');
					}
					let items = timings.chain().data();
					if (items === null) {
						event.returnValue = { success: false, error: 'No items found' };
					} else {
						event.returnValue = { success: true, times: items };
					}
				}
			},
			{
				name: "timings.get",
				action: (event, args) => {
					if (!args.key || args.key.length <= 0) event.returnValue = { success: false, error: 'Key length to short' };
					let timings = this.bookTimings.getCollection('timings');
					if (timings === null) {
						this.bookTimings.addCollection('timings', { indices: ['key'], autoupdate: true });
						timings = this.bookTimings.getCollection('timings');
					}
					let item = timings.findOne({ key: args.key });
					if (item === null) {
						event.returnValue = { success: false, error: 'No item found' };
					} else {
						event.returnValue = { success: true, time: item.time };
					}
				}
			},
			{
				name: "timings.set",
				action: (event, args) => {
					if (!args.key || args.key.length <= 0) return;
					let timings = this.bookTimings.getCollection('timings');
					if (timings === null) {
						this.bookTimings.addCollection('timings', { indices: ['key'], autoupdate: true });
						timings = this.bookTimings.getCollection('timings');
					}

					let item = timings.findOne({ key: args.key });
					if (item === null) {
						timings.insert({ key: args.key, time: args.time });
					} else {
						item.time = args.time;
						timings.update(item);
					}
				}
			},
			{
				name: "timings.clear",
				action: (event, args) => {
					try {
						if (!args.key || args.key.length <= 0) event.returnValue = { success: false, error: 'Key length to short' };
						let timings = this.bookTimings.getCollection('timings');
						if (timings === null) {
							this.bookTimings.addCollection('timings', { indices: ['key'], autoupdate: true });
							timings = this.bookTimings.getCollection('timings');
						}
						let items = timings.find({ key: args.key });
						if (items.length > 1) {
							items.slice(1).map(x => timings.remove(x));
						}
						let item = items.length > 0 ? items[0] : null;
						if (item !== null) {
							delete item.time;
							timings.update(item);
							event.returnValue = { success: true };
						} else {
							event.returnValue = { success: false, error: 'Failed to find time for provided key' };
						}
					} catch (e) {
						event.returnValue = { success: false, error: 'Exception in clear: ' + e };
					}
				}
			}
		];
	}

	get windowCalls() {
		return [
			{
				name: "window.title.set",
				action: (event, args) => this.window.setTitle(String(args))
			},
			{
				name: "window.flashframe.start",
				action: (event, args) => this.window.flashFrame(true)
			},
			{
				name: "window.flashframe.stop",
				action: (event, args) => this.window.flashFrame(false)
			},
			{
				name: "window.progressbar.set",
				action: (event, args) => this.window.setProgressBar(Number(args))
			}
		];
	}
};