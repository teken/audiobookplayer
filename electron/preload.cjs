const { contextBridge, ipcRenderer, shell } = require('electron');
const path = require('path');
const mm = require('music-metadata');
const fs = require('fs');
const pkg = require('../package.json');

contextBridge.exposeInMainWorld('electron', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    sendSync: (channel, data) => ipcRenderer.sendSync(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    remote: {
        getCurrentWindow: () => ipcRenderer.sendSync('remote.getCurrentWindow'),
    },
    showOpenDialogSync: (options) => ipcRenderer.sendSync('dialog.showOpenDialogSync', options),
    once: (channel, func) => ipcRenderer.once(channel, (event, ...args) => func(...args)),
    path: {
        join: (...args) => path.join(...args),
    },
    mm: {
        parseFile: (path) => mm.parseFile(path),
    },
    fs: {
        readFile: (path) => fs.readFile(path),
        readFileSync: (path) => fs.readFileSync(path),
    },
    pkg: {
        author: pkg.author,
        version: pkg.version,
    },
    shell: {
        openExternal: (url) => shell.openExternal(url),
    },
});