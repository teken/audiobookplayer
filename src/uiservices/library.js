const {ipcRenderer} = window.require('electron');

export default class LibraryService {
	static getAll() {
		return ipcRenderer.sendSync('library.getAll');
	}

	static getAllCounts() {
		return ipcRenderer.sendSync('library.getAllCounts');
	}

	static getWork(key) {
		return ipcRenderer.sendSync('library.getWork', key);
	}

	static clearLibrary() {
		return new Promise((resolve => {
			ipcRenderer.once('library.clear.reply', (event, arg) => {
				resolve(arg);
			});
			ipcRenderer.send('library.clear');
		}));
	}

	static reimportLibrary() {
		return new Promise((resolve => {
			ipcRenderer.once('library.reimport.reply', (event, arg) => {
				resolve(arg);
			});
			ipcRenderer.send('library.reimport');
		}));
	}

	static importDifferencesToLibrary() {
		return new Promise((resolve => {
			ipcRenderer.once('library.importdelta.reply', (event, arg) => {
				resolve(arg);
			});
			ipcRenderer.send('library.importdelta');
		}));
	}
}