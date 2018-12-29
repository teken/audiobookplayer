const {ipcRenderer} = window.require('electron');

export default class SettingsService {
	static getSetting(key) {
		const result = ipcRenderer.sendSync('settings.get', key);
		if (!isNaN(result)) return Number(result);
		if (result === 'true' || result === 'false') return Number(result);
		if (result.startsWith('{') || result.startsWith('[')) return JSON.parse(result);
		return result;
	}

	static getSettings(...keys) {
		return JSON.parse(ipcRenderer.sendSync('settings.gets', keys));
	}

	static setSetting(key, value) {
		return ipcRenderer.send('settings.set', key);
	}

	static setSettings(keys) {
		return ipcRenderer.send('settings.sets', keys);
	}
}