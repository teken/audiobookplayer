import { registerRoute } from 'workbox-routing';
const { ipcRenderer } = window.require('electron');

self.addEventListener('install', event => {
    console.log('Service worker installing…');
});

registerRoute('/tools/window/progressbar', async ({ url, request, event, params }) => {
    const response = await fetch(request);
    const responseBody = await response.text();

    ipcRenderer.send('window.progressbar.set', responseBody);
    return new Response();
}, 'PATCH');

registerRoute('/tools/window/progressbar', async ({ url, request, event, params }) => {
    const response = await fetch(request);
    const responseBody = await response.text();

    ipcRenderer.send('window.progressbar.set', responseBody);
    return new Response();
}, 'PATCH');