const {ipcRenderer} = window.require('electron');

export default class StateService {
	static getAll() {
		return ipcRenderer.sendSync('states.getAll');
	}

	static getState(key) {
		return ipcRenderer.sendSync('states.get', key);
	}

	static setState(key, value) {
		return ipcRenderer.sendSync('states.set', key, value);
	}

	static clearState(key) {
		return ipcRenderer.send('states.clear', key);
	}
}