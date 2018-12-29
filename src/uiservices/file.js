const {ipcRenderer} = window.require('electron');

export default class FileService {
	static lookupFilePath(key) {
		return ipcRenderer.sendSync('file.path.lookup', key);
	}
}