import React from "react";
import ReactDOM from "react-dom";
import registerServiceWorker from "./registerServiceWorker";

import App from "./components/app/App";
import BookPlayer from "./uiservices/bookplayer";

import {PlayerContext} from "./components/player/withPlayer";

const {ipcRenderer} = window.require('electron');

const player = new BookPlayer(ipcRenderer.sendSync('settings.get', 'volume'));

ReactDOM.render(
	<PlayerContext.Provider value={player}>
		<App/>
	</PlayerContext.Provider>,
	document.getElementById('root')
);
registerServiceWorker();
