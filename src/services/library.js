const fs = require('fs-extra');
const path = require('path');
const mm = require('music-metadata');
const { app } = require('electron');
const uuid = require('uuid');

const audioFileExtensions = ['aac', 'flac', 'm2a', 'm4a', 'm4b', 'mka', 'mp3', 'oga', 'ogg', 'opus', 'spx', 'wma', 'wav'];

module.exports = class LibraryService {

  static clearLibrary(localLibrary) {
    localLibrary.removeCollection('authors');
    localLibrary.removeCollection('works');

    localLibrary.addCollection('authors', { autoupdate: true });
    localLibrary.addCollection('works', { indices: ['author_id'], autoupdate: true });

    return this.saveDatabase(localLibrary);
  }

  /**
   * @param {boolean} onlyLookForChanges
   */
  static async fileSystemToLibrary(onlyLookForChanges, localLibrary, settings) {

    const pathFile = settings.get('libraryPath');
    const libraryStyle = settings.get('importStyle');

    if (!fs.existsSync(pathFile)) throw new Error('No library path');

    const appData = app.getPath('userData');
    const pathCoverCache = path.join(appData, 'covers');
    if (await fs.pathExists(pathCoverCache)) {
      console.log(`Clear cached cover-art files in ${pathCoverCache}`);
      for (const cover of await fs.readdir(pathCoverCache)) {
        const coverPath = path.join(pathCoverCache, cover);
        await fs.remove(coverPath);
      }
    } else {
      console.log(`Creating cover-art cache folder: ${pathCoverCache}`);
      await fs.mkdirp(pathCoverCache);
    }

    let fileSystem = this.fileRecursiveStatLookup(pathFile);
    const authors = localLibrary.getCollection('authors') || localLibrary.addCollection('authors', { autoupdate: true });
    const works = localLibrary.getCollection('works') || localLibrary.addCollection('works', {
      indices: ['author_id'],
      autoupdate: true
    });

    if (!onlyLookForChanges) {
      authors.clear();
      works.clear();
    }

    if (libraryStyle === 'folders' || libraryStyle === 'folder') {
      for (const file of fileSystem) {
        let author = null;
        if (onlyLookForChanges) author = authors.findOne({ 'name': file.name });
        if (author === null) author = authors.insert({ name: file.name });

        try {
          if (file.isDirectory()) file.children.forEach(work => {
            if (work.isFile()) return;
            let record = null;
            if (onlyLookForChanges) record = works.findOne({ 'name': file.name });
            if (record === null) record = { name: work.name, author_id: author.$loki };

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

      fileSystem = fileSystem.map(x => x.children)
        .reduce((a, b) => a.concat(b), [])
        .reduce((a, b) => {
          if (b.isDirectory()) {
            const i = a.concat(b.children);
            delete b.children;
            return i;
          } else return a.concat(b);
        }, [])
        .reduce((a, b) => {
          if (b.isDirectory()) {
            const i = a.concat(b.children);
            delete b.children;
            return i;
          } else return a.concat(b);
        }, []);

      const files = fileSystem
        .filter(x => x.isFile())
        .filter(file => {
          const fileParts = file.name.split("."),
            fileExtension = fileParts[fileParts.length - 1].toLowerCase();
          return audioFileExtensions.indexOf(fileExtension) > -1;
        }).map(x => {
          return { path: x.path, name: x.name }
        });
      console.log(`loading metadata for ${files.length} files`);
      const start = Date.now();
      for (const file of files) {
        console.log(file.name);
        file.metadata = (await mm.parseFile(file.path)).common;
      }
      const end = Date.now();
      console.log(`loaded metadata in ${end - start}`);

      const chunkSize = 500;
      console.log(`Saving in chunks of ${chunkSize}`);
      let chunkedFiles = files.reduce((all, one, i) => {
        const ch = Math.floor(i / chunkSize);
        all[ch] = [].concat((all[ch] || []), one);
        return all
      }, []);
      for (const files of chunkedFiles) {
        for (const file of files) {
          let author = authors.findOne({ 'name': file.metadata.artist });
          if (author === null) author = authors.insert({ name: file.metadata.artist });

          let record = works.findOne({ 'name': file.metadata.album });
          if (record === null) record = {
            name: file.metadata.album,
            author_id: author.$loki,
            type: 'BOOK',
            art: [],
            tracks: [],
            info: []
          };

          // Cache cover art
          if (record.track.length === 0 && file.metadata.picture) {
            for (const picture of file.metadata.picture) {
              const name = uuid.v4() + '.' + this.toExtension(picture.format);
              const pathCover = path.join(pathCoverCache, name);
              await fs.writeFile(pathCover, picture.data);
              record.art.push({ path: pathCover, format: picture.format, type: picture.type });
            }
          }

          record.tracks.push(file);

          if (record.$loki) works.update(record);
          else works.insert(record);
        }
        await this.saveDatabase(localLibrary);
      }
    } else {
      throw new Error(`Unknown Library Style '${libraryStyle}'`);
    }

    await this.saveDatabase(localLibrary);
  }

  static toExtension(mime) {
    switch (mime) {
      case 'image/jpeg':
      case 'image/jpg':
        return 'jpg';
      case 'image/gif':
        return 'gif';
      case 'image/png':
        return 'png';
      case 'image/x-ms-bmp':
        return 'bmp';
      case 'image/svg+xml ':
        return 'svg';
    }
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
      const subPath = path.join(pathURL, file),
        stats = fs.statSync(subPath);
      stats.name = file;
      stats.path = subPath;
      if (stats.isDirectory()) stats.children = this.fileRecursiveStatLookup(subPath);
      return stats;
    });
  }

  static mapBookObject(book, authorId) {
    if (book.isFile()) return;
    const imageFileExtensions = ["jpg", "jpeg", "png"];
    const infoFileExtensions = ["cue", "m3u"];
    const record = { type: 'BOOK', name: book.name, author_id: authorId, art: [], tracks: [], info: [] };
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
