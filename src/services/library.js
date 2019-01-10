const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');
const mp = require('msgpack-lite');

const audioFileExtensions = ["mp3", "m4b", "m4a"],
	imageFileExtensions = ["jpg", "jpeg", "png"],
	infoFileExtensions = ["cue", "m3u"];

module.exports = class LibraryService {


	static clearLibrary(localLibrary) {
		return new Promise((res, rej) => {
			localLibrary.removeCollection('authors');
			localLibrary.removeCollection('works');

			localLibrary.addCollection('authors', {autoupdate: true});
			localLibrary.addCollection('works', {indices: ['author_id'], autoupdate: true});

			localLibrary.saveDatabase((err) => !err ? res() : rej(err));
		});
	}

	/**
	 * @param {boolean} onlyLookForChanges
	 */
	static fileSystemToLibrary(onlyLookForChanges, remoteLibrary, localLibrary, settings) {
		return new Promise(async (res, rej) => {
			try {
				const pathFile = settings.get('libraryPath');

				let fileSystem = this.fileRecursiveStatLookup(pathFile);

				if (!onlyLookForChanges) {
					//clear all records
				}

				const remoteItems = [];
				const localItems = [];

				const addRemoteItem = (key, value) => remoteItems.push({type: 'put', key: key, value: mp.encode(value)});
				const addLocalItem = (key, value) => localItems.push({type: 'put', key: key, value: mp.encode(value)});
				const addLocalItems = (list) => {
					for (const [key, value] of Object.entries(list)) addLocalItem(key, value);
				};

				for (const file of fileSystem) {
					const author = file.name;

					if (file.isDirectory()) for (const work of file.children) {
						if (work.isFile()) break;

						if (work.children[0].isDirectory()) { //series
							for (const child of work.children.filter(i => i.isDirectory())) {
								console.log(`${author}/${work.name}/${child.name}`)
								const book = this.mapBookObject(`${author}/${work.name}/${child.name}`, child);
								if (book) {
									try {
										console.log(`track metadata`)
										await this.loadTrackMetadata(book);
									}catch(e) {
										console.error(e)
									}
									addLocalItems(book.local);
									addRemoteItem(`${author}/${work.name}/${child.name}`, book.remote)
								} else {
									console.error(`failed to import book: ${author}/${work.name}/${child.name}`);
								}
							}

						} else { //book
							console.log(`${author}/${work.name}`)
							const book = this.mapBookObject(`${author}/${work.name}/`, work);
							if (book) {
								try {
									console.log(`track metadata`)
									await this.loadTrackMetadata(book);
								}catch(e) {
									console.error(e)
								}
								addLocalItems(book.local);
								addRemoteItem(`${author}/${work.name}`, book.remote);
							} else {
								console.error(`failed to import book: ${author}/${work.name}`);
							}
						}
					}
				}

				console.info("Saving");

				await remoteLibrary.batch(remoteItems);
				await localLibrary.batch(localItems);

				console.info("Saved");
				res();
			} catch (e) {
				console.error(e)
				rej(e);
			}
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

	static async loadTrackMetadata(record) {
		for (const file of record.remote.tracks) {
			console.log(file.key);
			try {
				const metadata = await mm.parseFile(record.local[file.key], {duration: true, skipCovers: true});
				file.duration = metadata.format.duration;
			} catch (e) {
				console.error(e);
			}
		}
	}

	static mapBookObject(filePrefix, book) {
		let record = {
			remote: {art: [], tracks: [], info: []},
			local: []
		};

		for (const file of book.children.filter(x => x.isFile())) {
			const fileParts = file.name.split("."),
				fileExtension = fileParts[fileParts.length - 1].toLowerCase(),
				key = `${filePrefix}/${file.name}`;
			if (audioFileExtensions.indexOf(fileExtension) > -1) record.remote.tracks.push({
				key: key,
				size: file.size,
				duration: 0,
			});
			else if (imageFileExtensions.indexOf(fileExtension) > -1) record.remote.art.push(key);
			else if (infoFileExtensions.indexOf(fileExtension) > -1) record.remote.info.push(key);

			record.local[key] = file.path;
		}
		return record;
	}
};