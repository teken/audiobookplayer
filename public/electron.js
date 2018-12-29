const {app, BrowserWindow, Menu, contentTracing} = require('electron');

const url = require('url');

const { autoUpdater } = require("electron-updater");

let mainWindow;
let splash;

const DatabaseService = require('../src/services/database');
const remoteLibrary = DatabaseService.library;
const localLibrary = DatabaseService.local;
const states = DatabaseService.states;

const LibraryService = require('../src/services/library');
const IPCService = require('../src/services/ipc');
const GlobalShortcutsService = require('../src/services/globalShortcuts');
const UpdatePreStartService = require('../src/services/updatePreStart');

const SettingsService = require('../src/services/settings');
let ipcService;
let globalShortcutService;
const settings = new SettingsService();

const development = process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'development';

autoUpdater.checkForUpdatesAndNotify();

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

function start() {
	console.info("App Ready, Starting")
	// const options = {
	// 	categoryFilter: '*',
	// 	traceOptions: 'record-until-full,enable-sampling'
	// }
	//
	// contentTracing.startRecording(options, () => {
	// 	console.log('Tracing started')
	//
	// 	setTimeout(() => {
	// 		contentTracing.stopRecording('', (path) => {
	// 			console.log('Tracing data recorded to ' + path)
	// 		})
	// 	}, 60000)
	// })
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
		backgroundColor:'#1d1e26',
		icon: getIconPath()
	});
	splash.loadURL(splashStartUrl);

	console.info("Splash Launched");

	const splashMessage = (message) => {
		splash.webContents.send("message", message);
		console.info("Sent to Splash: "+message)
	};

	splashMessage("Checking For Migrations");

	if (UpdatePreStartService.checkForMigration()) {
		splashMessage("Migration Found; Running Migration");
		UpdatePreStartService.runMigration();
		splashMessage("Migration Complete");
	}

	splashMessage("Starting App");

	const preferences = {
		width: settings.get('windowState.width'),
		height: settings.get('windowState.height'),
		x: settings.get('windowState.x'),
		y: settings.get('windowState.y'),
		frame: development,
		icon: getIconPath(),
		show: false,
		darkTheme: true,
		backgroundColor:'#1d1e26',
		overlayScrollbars: true
	};

	if (process.env.ELECTRON_START_URL) {
		preferences["webPreferences"] = {webSecurity: false};
	}

	console.info("Main Launching")

	mainWindow = new BrowserWindow(preferences);

	if (development) Menu.setApplicationMenu(Menu.buildFromTemplate(devMenuTemplate));

	if (settings.get('windowState.maximised')) mainWindow.maximize();

	if (!globalShortcutService) globalShortcutService = new GlobalShortcutsService(mainWindow);
	if (!ipcService) ipcService = new IPCService(mainWindow, remoteLibrary, localLibrary, states, settings);

	const startUrl = process.env.ELECTRON_START_URL || url.format({
		pathname: `${getMainPath()}/index.html`,
		protocol: 'file:',
		slashes: true
	});
	mainWindow.loadURL(startUrl);

	console.info("Main URL Loaded")

	mainWindow.on('app-command', (e,cmd) => {
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
	['resize', 'move', 'close' ].forEach((e) => {
		mainWindow.on(e, () => storeWindowState());
	});
	console.info("App Ready, Started")
}

app.on('ready', start);

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
		start()
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

function getIconPath() {
	switch(process.platform){
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

const devMenuTemplate = [{
	label: "Library",
	submenu:[
		{
			label: "Load Library From Folders",
			click() {
				LibraryService.fileSystemToLibrary(false, remoteLibrary, localLibrary, settings)
			}
		},
		{
			label: "Load Changes Library From Folders",
			click() {
				LibraryService.fileSystemToLibrary(true, remoteLibrary, localLibrary, settings)
			}
		},
		{
			label: "Load Library From MetaData",
			click() {
				console.log("Not Implemented")
			}
		},
		{
			label: "Test",
			async click() {
				const results = await remoteLibrary.list('Brent Weeks/Night Angel/01 Way of Shadows');
				const clean = remoteLibrary.cleanUpResults(results);
				console.log(clean)
			}
		}
	]
}, {
	role: 'reload'
}];