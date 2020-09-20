const { app, BrowserWindow } = require('electron');

const url = require('url');
const path = require('path');

const { autoUpdater } = require("electron-updater");

let mainWindow;
let splash;

const DatabaseService = require('../src/services/database');
const localLibrary = DatabaseService.localLibrary;
const bookTimes = DatabaseService.bookTimes;

const IPCService = require('../src/services/ipc');
const GlobalShortcutsService = require('../src/services/globalShortcuts');

const SettingsService = require('../src/services/settings');
let ipcService;
let globalShortcutService;
const settings = new SettingsService();

const development = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase().trim() === 'development' : false;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.checkForUpdatesAndNotify();

if (!development) {
	app.requestSingleInstanceLock();
	app.on('second-instance', () => app.quit())
}

function createWindow() {
	const splashStartUrl = url.format({
		pathname: `${getMainPath()}/splash.html`,
		protocol: 'file:',
		slashes: true
	});
	splash = new BrowserWindow({
		width: 300,
		height: 380,
		transparent: true,
		frame: false,
		alwaysOnTop: true,
		backgroundColor: '#1d1e26',
		icon: getIconPath()
	});
	splash.loadURL(splashStartUrl);
	const preferences = {
		width: settings.get('windowState.width'),
		height: settings.get('windowState.height'),
		x: settings.get('windowState.x'),
		y: settings.get('windowState.y'),
		frame: false,
		icon: getIconPath(),
		show: false,
		darkTheme: true,
		backgroundColor: '#1d1e26',
		overlayScrollbars: true,
	};
	preferences["webPreferences"] = {
		nodeIntegration: true
	};

	if (process.env.ELECTRON_START_URL) {
		preferences["webPreferences"].webSecurity = false;
	}

	mainWindow = new BrowserWindow(preferences);

	if (settings.get('windowState.maximised')) mainWindow.maximize();

	if (!globalShortcutService) globalShortcutService = new GlobalShortcutsService(mainWindow);
	if (!ipcService) ipcService = new IPCService(mainWindow, localLibrary, bookTimes, settings);

	const startUrl = process.env.ELECTRON_START_URL || url.format({
		pathname: `${getMainPath()}/index.html`,
		protocol: 'file:',
		slashes: true
	});
	mainWindow.loadURL(startUrl);

	mainWindow.on('app-command', (e, cmd) => {
		if (cmd === 'browser-backward' && mainWindow.webContents.canGoBack()) mainWindow.webContents.goBack();
		else if (cmd === 'browser-forward' && mainWindow.webContents.canGoForward()) mainWindow.webContents.goForward();
	});

	mainWindow.on('closed', () => {
		mainWindow = null
	});

	mainWindow.on('ready-to-show', () => {
		splash.destroy();
		mainWindow.show();
		mainWindow.focus();
		if (development) mainWindow.webContents.openDevTools();
	});
	['resize', 'move', 'close'].forEach((e) => {
		mainWindow.on(e, () => storeWindowState());
	});
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
});

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow()
	}
});

app.on('will-quit', () => {
	globalShortcutService.deinit();
});

autoUpdater.on('update-downloaded', (ev, info) => {
	setTimeout(() => {
		autoUpdater.quitAndInstall();
	}, 5000)
})

function storeWindowState() {
	const bounds = mainWindow.getBounds();
	settings.set('windowState.width', bounds.width);
	settings.set('windowState.height', bounds.height);
	settings.set('windowState.x', bounds.x);
	settings.set('windowState.y', bounds.y);
	settings.set('windowState.maximised', mainWindow.isMaximized());
	//settings.save()
}

function getIconPath() {
	switch (process.platform) {
		case 'darwin':
			return `${getMainPath()}/icon.icns`;
		case 'win32':
			return `${getMainPath()}/icon.ico`;
		default:
			return `${getMainPath()}/icon.png`;
	}
}

function getMainPath() {
	return `${__dirname}/../${development ? 'public' : 'build'}`;
}