const {globalShortcut} = require('electron');
//const globalShortcut = require('global-shortcut');


module.exports = class GlobalShortcutsService {

	constructor(window) {
		this.init();
		this.window = window;
	}

	init() {
		this.shortcuts.forEach(item => {
			/*let registered = */globalShortcut.register(item.name, item.action);
			//console.log(`${item.name} registration ${registered ? 'bound!' : 'failed'}`);
		});
	}

	deinit() {
		globalShortcut.unregisterAll();
	}

	messageWindow(channel, message) {
		this.window.webContents.send(channel, message);
	}

	get shortcuts() {
		return  [
			{
				name: 'MediaPlayPause',
				action: () => this.messageWindow('player.pauseplay')
			},
			{
				name: 'MediaNextTrack',
				action: () => this.messageWindow('player.nexttrack')
			},
			{
				name: 'MediaPreviousTrack',
				action: () => this.messageWindow('player.previoustrack')
			},
			{
				name: 'MediaStop',
				action: () => this.messageWindow('player.stop')
			},
			{
				name: 'CommandOrControl+Shift+I',
				action: () => this.window.isFocused() && this.window.webContents.toggleDevTools()
			},
		];
	}
};