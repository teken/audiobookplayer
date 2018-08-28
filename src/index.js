import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app/App';
import registerServiceWorker from './registerServiceWorker';

import BookPlayer from './services/bookplayer';

import { ThemeContext } from './components/theme/withTheme';
import { PlayerContext } from './components/player/withPlayer';

const {ipcRenderer} = window.require('electron');


//  rainbowBackground: 'linear-gradient(to right, #B294FF, #57E6E6, #FEFFB8, #57E6E6, #B294FF, #57E6E6)',
// 	rainbowBackgroundSize: '500% auto',
// 	rainbowAnimation: 'gradient 3s linear infinite',

// const theme = { //light
// 	background: '#fff',
// 	windowBarBackground: '#E0E0E0',
// 	playerBackground: '#E0E0E0',
// 	scrollBarTrack: '#fff',
// 	primaryText:'#42A5F5',
// 	secondaryText: '#68ade8',
// 	activeText: '#42A5F5',
// 	inactiveText: '#99c4e8',
// 	inputBackground: '#E0E0E0',
// 	iconButtonHoverBackground: '#b2b2b2',
// 	warning: '#e81123'
// };

const theme = { //dark
	background: 'radial-gradient(circle at 0% 0%, #373b52, #252736 51%, #1d1e26)',
	windowBarBackground: 'transparent',
	playerBackground: 'transparent',
	scrollBarTrack: 'rgba(256, 256, 256, 0.1)',
	primaryText:'#f5f6ff',
	secondaryText: 'rgba(202, 205, 239, 0.8)',
	activeText: '#BFD2FF',
	inactiveText: '#7881A1',
	inputBackground: 'rgba(57, 63, 84, 0.8)',
	iconButtonHoverBackground: 'rgba(256,256,256,0.1)',
	warning: '#e81123'
};

const player = new BookPlayer(ipcRenderer.sendSync('settings.get', 'volume'));

ReactDOM.render(
	<ThemeContext.Provider value={theme}>
		<PlayerContext.Provider value={player}>
			<App/>
		</PlayerContext.Provider>
	</ThemeContext.Provider>,
	document.getElementById('root')
);
registerServiceWorker();
