const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');

module.exports = class LibraryService {

  static clearLibrary(localLibrary) {
    localLibrary.removeCollection('authors');
    localLibrary.removeCollection('works');

    localLibrary.addCollection('authors', {autoupdate: true});
    localLibrary.addCollection('works', {indices: ['author_id'], autoupdate: true});

    return this.saveDatabase(localLibrary);
  }

  /**
   * @param {boolean} onlyLookForChanges
   */
  static async fileSystemToLibrary(onlyLookForChanges, localLibrary, settings) {

    const pathFile = settings.get('libraryPath');
    const libraryStyle = settings.get('importStyle');

    if (!fs.existsSync(pathFile)) throw new Error('No library path');

    let fileSystem = this.fileRecursiveStatLookup(pathFile);
    const authors = localLibrary.getCollection('authors') || localLibrary.addCollection('authors', {autoupdate: true});
    const works = localLibrary.getCollection('works') || localLibrary.addCollection('works', {indices: ['author_id'], autoupdate: true});

    if (!onlyLookForChanges) {
      authors.clear();
      works.clear();
    }

    if (libraryStyle === 'folders' || libraryStyle === 'folder') {
      for (const file of fileSystem) {
        let author = null;
        if (onlyLookForChanges) author = authors.findOne({'name': file.name});
        if (author === null) author = authors.insert({name: file.name});

        try {
          if (file.isDirectory()) file.children.forEach(work => {
            if (work.isFile()) return;
            let record = null;
            if (onlyLookForChanges) record = works.findOne({'name': file.name});
            if (record === null) record = {name: work.name, author_id: author.$loki};

            if (work.children[0].isDirectory()) { //series
              record.type = 'SERIES';
              record.books = work.children.map(child => this.mapBookObject(child, author.$loki)).filter(x => x !== undefined);
            } else { //file
              record = Object.assign(record, this.mapBookObject(work, author.$loki));
            }

            if (record.$loki) works.update(record);
            else works.insert(record);
          });
        } catch (e) {
          console.log(new Date().toISOString() + `: error : ${e}`);
        }
      }
    } else if (libraryStyle === 'metadata') {
      const audioFileExtensions = ["mp3", "m4b", "m4a"];

      fileSystem = fileSystem.map(x => x.children)
        .reduce((a, b) => a.concat(b), [])
        .reduce((a, b) => {
          if (b.isDirectory()) {
            let i = a.concat(b.children);
            delete b.children;
            return i;
          } else return a.concat(b);
        }, [])
        .reduce((a, b) => {
          if (b.isDirectory()) {
            let i = a.concat(b.children);
            delete b.children;
            return i;
          } else return a.concat(b);
        }, []);

      let files = fileSystem
        .filter(x => x.isFile())
        .filter(file => {
          const fileParts = file.name.split("."),
            fileExtension = fileParts[fileParts.length - 1].toLowerCase();
          return audioFileExtensions.indexOf(fileExtension) > -1;
        }).map(x => {
          return {path: x.path, name: x.name}
        });
      console.log("loading metadata");
      for (const item of files) {
        console.log(item.name);
        item.metadata = (await mm.parseFile(item.path)).common;
      }
      console.log("loaded metadata");
      for (const file of files) {
        let author = authors.findOne({'name': file.metadata.artist});
        if (author === null) author = authors.insert({name: file.metadata.artist});

        let record = works.findOne({'name': file.metadata.album});
        if (record === null) record = {
          name: file.metadata.album,
          author_id: author.$loki,
          type: 'BOOK',
          art: [],
          tracks: [],
          info: []
        };

        record.tracks.push(file);

        if (record.$loki) works.update(record);
        else works.insert(record);
      }
    } else {
      throw new Error(`Unknown Library Style '${libraryStyle}'`);
    }

    await this.saveDatabase(localLibrary);
  }

  static saveDatabase(localLibrary) {
  	return new Promise((resolve, reject) => {
			localLibrary.saveDatabase(err => {
				console.log(new Date().toISOString() + ": " + (err ? "error : " + err : "database saved."));
				!err ? resolve() : reject(err);
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
    let record = {type: 'BOOK', name: book.name, author_id: authorId, art: [], tracks: [], info: []};
    book.children.forEach(file => {
      const fileParts = file.name.split("."),
        fileExtension = fileParts[fileParts.length - 1].toLowerCase();
      if (audioFileExtensions.indexOf(fileExtension) > -1) record.tracks.push(file);
      else if (imageFileExtensions.indexOf(fileExtension) > -1) record.art.push(file);
      else if (infoFileExtensions.indexOf(fileExtension) > -1) record.info.push(file);
    });
    return record;
  };

  //
  // static mapTrackLengths(authorsCollection, worksCollection) {
  // 	let works = worksCollection.chain().data();
  // 	works.forEach(work => {
  // 		//const author = authorsCollection.get(work.author_id);
  // 		if (work.type === 'SERIES') {
  // 			work.books.filter(x => x !== undefined).forEach(book => {
  // 				book.tracks.forEach(track => {
  // 					this.getTrackMetaData(track.path).then( metadata => {
  // 						console.log(track.path, metadata);
  // 						track.meta = metadata;
  // 						worksCollection.update(work);
  // 					});
  //
  // 				});
  // 			});
  // 		} else {
  // 			work.tracks.forEach(track => {
  // 				this.getTrackMetaData(track.path).then( metadata => {
  // 					console.log(track.path, metadata);
  // 					track.meta = metadata;
  // 					worksCollection.update(work);
  // 				});
  //
  // 			})
  // 		}
  // 	});
  // }
};
