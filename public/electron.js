const {app, BrowserWindow} = require('electron');

const url = require('url');
const path = require('path');

let mainWindow;
let splash;

const IPCService = require('../src/services/ipc');
const GlobalShortcutsService = require('../src/services/globalShortcuts');
const SettingsService = require('../src/services/settings');

let ipcService;
let globalShortcutService;
const settings = new SettingsService();
const development = process.env.NODE_ENV ? process.env.NODE_ENV.trim() === 'development' : false;

if (!development) {
	const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus()
		}
	});

	if (isSecondInstance) {
		app.quit()
	}
}

function createWindow() {
	const splashStartUrl = url.format({
		pathname: path.join(__dirname, `/../${development ? 'public' : 'build'}/splash.html`),
		protocol: 'file:',
		slashes: true
	});
	splash = new BrowserWindow({width: 300, height: 380, transparent: true, frame: false, alwaysOnTop: true, backgroundColor:'#1d1e26', icon:__dirname+`/../${development ? 'public' : 'build'}/icon.ico`});
	splash.loadURL(splashStartUrl);
	const preferences = {
		width: settings.get('windowState.width'),
		height: settings.get('windowState.height'),
		x: settings.get('windowState.x'),
		y: settings.get('windowState.y'),
		frame: false,
		icon:__dirname+`/../${development ? 'public' : 'build'}/icon.ico`,
		show: false,
		darkTheme: true,
		backgroundColor:'#1d1e26',
		overlayScrollbars: true
	};
	if (process.env.ELECTRON_START_URL) {
		preferences["webPreferences"] = {webSecurity: false};
	}

	mainWindow = new BrowserWindow(preferences);

	if (settings.get('windowState.maximised')) mainWindow.maximize();

	if (!globalShortcutService) globalShortcutService = new GlobalShortcutsService(mainWindow);
	if (!ipcService) ipcService = new IPCService(mainWindow);

	const startUrl = process.env.ELECTRON_START_URL || url.format({
		pathname: path.join(__dirname, `/../${development ? 'public' : 'build'}/index.html`),
		protocol: 'file:',
		slashes: true
	});
	mainWindow.loadURL(startUrl);

	mainWindow.on('closed', () => {
		mainWindow = null
	});

	mainWindow.on('ready-to-show', () => {
		splash.destroy();
		mainWindow.show();
		mainWindow.focus();
		if (development) mainWindow.webContents.openDevTools();
	});
	['resize', 'move', 'close' ].forEach((e) => {
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

function storeWindowState() {
	const bounds = mainWindow.getBounds();
	settings.set('windowState.width', bounds.width);
	settings.set('windowState.height', bounds.height);
	settings.set('windowState.x', bounds.x);
	settings.set('windowState.y', bounds.y);
	settings.set('windowState.maximised', mainWindow.isMaximized());
	//settings.save()
}