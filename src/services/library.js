const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');

const DatabaseService = require('./database');
const SettingsService = require('./settings');

module.exports = class LibraryService {

	static clearLibrary() {
		return new Promise((res, rej) => {
			let localLibrary = DatabaseService.localLibrary;
			localLibrary.getCollection('authors').clear();
			localLibrary.getCollection('works').clear();

			localLibrary.addCollection('authors', {autoupdate: true});
			localLibrary.addCollection('works', {indices: ['author_id'], autoupdate: true});

			localLibrary.saveDatabase((err) => !err ? res() : rej(err));
		});
	}

	/**
	 * @param {boolean} onlyLookForChanges
	 */
	static fileSystemToLibrary(onlyLookForChanges) {
		return new Promise((res, rej) => {
			const pathFile = new SettingsService().get('libraryPath');

			let fileSystem = this.fileRecursiveStatLookup(pathFile),
				localLibrary = DatabaseService.localLibrary,
				authors = localLibrary.getCollection('authors'),
				works = localLibrary.getCollection('works');

			if (!authors) authors = localLibrary.addCollection('authors', {autoupdate: true});
			if (!works) works = localLibrary.addCollection('works', {indices: ['author_id'], autoupdate: true});

			if (!onlyLookForChanges) {
				authors.clear();
				works.clear();
			}

			fileSystem.forEach(file => {
				let author = null;
				if (onlyLookForChanges) author = authors.findOne({'name':file.name});
				if (author === null) author = authors.insert({name:file.name});

				if (file.isDirectory()) file.children.forEach( work => {
					if (work.isFile()) return;
					let record = null;
					if (onlyLookForChanges) record = works.findOne({'name':file.name});
					if (record === null) record = {name: work.name, author_id: author.$loki};

					if (work.children[0].isDirectory()) { //series
						record.type = 'SERIES';
						record.books = work.children.map( child => this.mapBookObject(child, author.$loki)).filter(x => x !== undefined);
					} else { //file
						record = Object.assign(record, this.mapBookObject(work, author.$loki));
					}

					if (record.$loki) works.update(record);
					else works.insert(record);
				});
			});

			localLibrary.saveDatabase((err) => {
				console.log(new Date().toISOString()+": "+(err ? "error : " + err : "database saved."));
				!err ? res() : rej(err);
			});
		});
	}

	static fileRecursiveStatLookup(pathURL) {
		return fs.readdirSync(pathURL).map(file => {
			let subPath = path.join(pathURL, file),
				stats = fs.statSync(subPath);
			stats.name = file;
			stats.path = subPath;
			if (stats.isDirectory()) stats.children = this.fileRecursiveStatLookup(subPath);
			return stats;
		});
	}

	static mapBookObject(book, authorId) {
		if (book.isFile()) return;
		const audioFileExtensions = ["mp3", "m4b", "m4a"],
			imageFileExtensions = ["jpg", "jpeg", "png"],
			infoFileExtensions = ["cue", "m3u"];
		let record = {type : 'BOOK', name:book.name, author_id:authorId, art:[], tracks:[], info:[]};
		book.children.forEach(file => {
			const fileParts = file.name.split("."),
				fileExtension = fileParts[fileParts.length - 1].toLowerCase();
			if (audioFileExtensions.indexOf(fileExtension) > -1) record.tracks.push(file);
			else if (imageFileExtensions.indexOf(fileExtension) > -1) record.art.push(file);
			else if (infoFileExtensions.indexOf(fileExtension) > -1) record.info.push(file);
		});
		return record;
	};

	static getTrackMetaData(filePath) {
		return mm.parseFile(filePath);
	}

	static mapTrackLengths(authorsCollection, worksCollection) {
		let works = worksCollection.chain().data();
		works.forEach(work => {
			const author = authorsCollection.get(work.author_id);
			if (work.type === 'SERIES') {
				work.books.filter(x => x !== undefined).forEach(book => {
					book.tracks.forEach(track => {
						this.getTrackMetaData(track.path).then( metadata => {
							console.log(track.path, metadata)
							track.meta = metadata;
							worksCollection.update(work);
						});

					});
				});
			} else {
				work.tracks.forEach(track => {
					this.getTrackMetaData(track.path).then( metadata => {
						console.log(track.path, metadata)
						track.meta = metadata;
						worksCollection.update(work);
					});

				})
			}
		});
	}
};