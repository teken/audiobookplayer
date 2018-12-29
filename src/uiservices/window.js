const {ipcRenderer} = window.require('electron');

export default class WindowService {
	static setProgressBar(value) {
		return ipcRenderer.send('window.progressbar.set', value);
	}
}