import React, {Component} from 'react';
import {HashRouter as Router, Route, Switch} from 'react-router-dom';

import Library from '../library/Library';
import Player from '../player/Player';
import Detail from '../detail/Detail';
import WindowControls from "../WindowControls";
import Settings from '../settings/Settings';

import BookPlayer from '../../services/bookplayer';

import { library } from '@fortawesome/fontawesome-svg-core';

import { faPlay, faPause, faStop, faBackward, faForward, faVolumeOff, faVolumeDown, faVolumeUp, faMapMarkerAlt,
		faMinus, faSquare, faTimes, faBookOpen, faCog, faSearch, faFolderOpen, faChevronLeft, faChevronRight,
		faQuestion, faCaretDown, faCheckSquare
} from '@fortawesome/free-solid-svg-icons';

//import { faSquare } from '@fontawesome/free-regular-svg-icons';
//import { } from '@fontawesome/free-brands-svg-icons';

const {ipcRenderer} = window.require('electron');
const {app, process} = window.require('electron').remote;

library.add(faPlay, faPause, faStop, faBackward, faForward, faVolumeUp, faVolumeDown, faVolumeOff, faMapMarkerAlt,
			faMinus, faSquare, faTimes, faBookOpen, faCog, faSearch, faFolderOpen, faChevronLeft, faChevronRight,
			faQuestion, faCaretDown, faCheckSquare
);

export default class App extends Component {
	constructor(props) {
		super(props);
		this._player = new BookPlayer();
		this.registerIPCListeners();
		this.state = {
			height: window.innerHeight,
		};
		this._styling = { //light
		 	activeColour: "#42A5F5",
		 	inactiveColour: "#E0E0E0"
		};
		this._styling = { //dark
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
			rainbowBackground: 'linear-gradient(to right, #B294FF, #57E6E6, #FEFFB8, #57E6E6, #B294FF, #57E6E6)',
			rainbowBackgroundSize: '500% auto',
			rainbowAnimation: 'gradient 3s linear infinite',
			warning: '#b10808'
		};
	}

	registerIPCListeners() {
		ipcRenderer.on('player.pauseplay', (event, arg) => {
			this._player.playPause();
		});
		ipcRenderer.on('player.previoustrack', (event, arg) => {
			this._player.playPreviousTrack()
		});
		ipcRenderer.on('player.nexttrack', (event, arg) => {
			this._player.playNextTrack()
		});
		ipcRenderer.on('player.stop', (event, arg) => {
			this._player.stop();
		});
	}

	componentDidMount() {
		this.updateDimensions();
		window.addEventListener("resize", this.updateDimensions.bind(this));
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions.bind(this));
	}

	updateDimensions() {
		this.setState({ height: window.innerHeight });
	}

	render() {
		const top = 2, bottom = 3;
		return (
		<Router>
			<div style={{textAlign: 'center', paddingTop: `${top}em`, paddingBottom: `${bottom}em`,
				backgroundImage: this._styling.background,
				color: this._styling.primaryText,
				WebkitFontSmoothing: 'antialiased',
				fontFamily: 'Helvetica Neue",Helvetica,Arial,sans-serif'
			}}>
				<WindowControls styling={this._styling}/>
				<div style={{height: `calc(${this.state.height}px - ${top + bottom}em)`, overflowY:'scroll', overflowX:'hidden', marginRight:'0.1em'}}>
					<Switch>
						<Route exact path="/" render={() => (
							<Library styling={this._styling} player={this._player}/>
						)}/>
						<Route path="/works/:workId/:bookName" render={({match}) => (
							<Detail styling={this._styling} player={this._player} workId={match.params.workId} bookName={match.params.bookName}/>
						)}/>
						<Route path="/works/:workId" render={({match}) => (
							<Detail styling={this._styling} player={this._player} workId={match.params.workId}/>
						)}/>
						<Route path="/settings" render={() => (
							<Settings styling={this._styling} />
						)}/>
						<Route path="/about" render={() => (
							<div>
								<h1>About</h1>
								<div style={{color: this._styling.secondaryText}}>
									Audio Book Player: v{app.getVersion()}<br/>
									Created By Duncan Haig<br/>
									Copywrite 2018 Duncan Haig<br/>
									<br/>
									Electron: v{process.versions.electron}<br/>
									Node: v{process.versions.node}<br/>
									Chrome: v{process.versions.chrome}<br/>
								</div>
							</div>
						)}/>
						<Route render={({location}) => (
							<div>
								<h1>Failed to find page</h1>
							</div>
						)}/>
					</Switch>
				</div>
				<Player styling={this._styling} player={this._player}/>
				<style dangerouslySetInnerHTML={{__html: `

					body {
						-webkit-user-select:none;
						cursor:default;
					}

					.rt-expander::after {
						border-top-color: ${this._styling.activeText} !important;
					}

					::-webkit-input-placeholder {
						color: ${this._styling.inactiveText};
					}

					input:focus,
					select:focus {
						outline-color: transparent;
					}

					::-webkit-scrollbar {
						width: 8px;
						-webkit-border-radius: 100px;
					}

					::-webkit-scrollbar-thumb:vertical {
						background: ${this._styling.inactiveText};
						-webkit-border-radius: 100px;
					}

					::-webkit-scrollbar-thumb:vertical:active {
						background: ${this._styling.activeText};
						-webkit-border-radius: 100px;
					}

					::-webkit-scrollbar-track {
						background-color: ${this._styling.scrollBarTrack};
						-webkit-border-radius: 100px;
						margin-bottom: 0.2em
					}

					.spinnerless::-webkit-outer-spin-button,
					.spinnerless::-webkit-inner-spin-button {
    					-webkit-appearance: none;
    					margin: 0;
					}

					select {
						-webkit-appearance: none;
					}
    			`}} />
			</div>
		</Router>

		);
	}
}
