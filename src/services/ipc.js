const {ipcMain} = require('electron');

const DatabaseService = require('./database');
const LibraryService = require('./library');
const SettingsService = require('./settings');

module.exports = class IPCService {

	constructor(window) {
		this.window = window;
		this.localLibrary = DatabaseService.localLibrary;
		this.bookTimings = DatabaseService.bookTimes;
		this.settings = new SettingsService();
		this.init();
	}

	init() {
		this.calls.forEach(item => ipcMain.on(item.name, item.action));
	}

	get calls() {
		return  [
			//Library calls
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
					event.returnValue = {
						authors: authors ? authors.count() : 0,
						works: works ? works.count() : 0
					};
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
					LibraryService.fileSystemToLibrary(true).then(result => {
						event.sender.send('library.importdelta.reply', result)
					});
				}
			},
			{
				name: "library.reimport",
				action: (event, args) => {
					LibraryService.fileSystemToLibrary(false).then(result => {
						event.sender.send('library.reimport.reply', result)
					});
				}
			},
			{
				name: "library.clear",
				action: (event, args) => {
					LibraryService.clearLibrary().then(result => {
						event.sender.send('library.clear.reply', result)
					});
				}
			},
			//settings calls
			{
				name: "settings.get",
				action: (event, args) => event.returnValue = this.settings.get(String(args))
			},
			{
				name: "settings.set",
				action: (event, args) => {
					this.settings.set(String(args.name), String(args.value));
					this.settings.save()
						.then(() => event.sender.send('settings.set.reply', {success:true}))
						.catch(err => event.sender.send('settings.set.reply', {success:true, error:err}));
				}
			},
			//timing calls
			{
				name: "timings.getAll",
				action: (event, args) => {
					let timings = this.bookTimings.getCollection('timings');
					if (timings === null) {
						this.bookTimings.addCollection('timings', {indices: ['key'], autoupdate: true});
						timings = this.bookTimings.getCollection('timings');
					}
					let items = timings.chain().data();
					if (items === null) {
						event.returnValue = {success: false, error:'No items found'};
					} else {
						event.returnValue = {success: true, times:items};
					}
				}
			},
			{
				name: "timings.get",
				action: (event, args) => {
					if (!args.key || args.key.length <= 0) event.returnValue = {success: false, error:'Key length to short'};
					let timings = this.bookTimings.getCollection('timings');
					if (timings === null) {
						this.bookTimings.addCollection('timings', {indices: ['key'], autoupdate: true});
						timings = this.bookTimings.getCollection('timings');
					}
					let item = timings.findOne({key:args.key});
					if (item === null) {
						event.returnValue = {success: false, error:'No item found'};
					} else {
						event.returnValue = {success: true, time:item.time};
					}
				}
			},
			{
				name: "timings.set",
				action: (event, args) => {
					if (!args.key || args.key.length <= 0) return;
					let timings = this.bookTimings.getCollection('timings');
					if (timings === null) {
						this.bookTimings.addCollection('timings', {indices: ['key'], autoupdate: true});
						timings = this.bookTimings.getCollection('timings');
					}

					let item = timings.findOne({key:args.key});
					if (item === null) {
						timings.insert({key:args.key, time: args.time});
					} else {
						item.time = args.time;
						timings.update(item);
					}
				}
			},
			{
				name: "timings.clear",
				action: (event, args) => {
					if (!args.key || args.key.length <= 0) event.returnValue = {success: false, error:'Key length to short'};
					let timings = this.bookTimings.getCollection('timings');
					if (timings === null) {
						this.bookTimings.addCollection('timings', {indices: ['key'], autoupdate: true});
						timings = this.bookTimings.getCollection('timings');
					}
					let item = timings.findOne({key:args.key});
					if (item !== null) {
						delete item.time;
						timings.update(item);
					}
				}
			},
			// window calls
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
			},
		];
	}
};