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


import withTheme from '../theme/withTheme';

//import { faSquare } from '@fontawesome/free-regular-svg-icons';
//import { } from '@fontawesome/free-brands-svg-icons';

const {ipcRenderer, shell} = window.require('electron');
const {app, process} = window.require('electron').remote;

library.add(faPlay, faPause, faStop, faBackward, faForward, faVolumeUp, faVolumeDown, faVolumeOff, faMapMarkerAlt,
			faMinus, faSquare, faTimes, faBookOpen, faCog, faSearch, faFolderOpen, faChevronLeft, faChevronRight,
			faQuestion, faCaretDown, faCheckSquare
);

export default withTheme(class App extends Component {
	constructor(props) {
		super(props);
		this._player = new BookPlayer(ipcRenderer.sendSync('settings.get', 'volume'));
		this.registerIPCListeners();
		this.state = {
			height: window.innerHeight,
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
			<div style={{
				textAlign: 'center',
				paddingTop: `${top}em`,
				paddingBottom: `${bottom}em`,
				backgroundImage: this.props.theme.background,
				color: this.props.theme.primaryText,
				WebkitFontSmoothing: 'antialiased',
				fontFamily: 'Archivo, Open Sans, "Helvetica Neue", Helvetica, Arial, sans-serif',
				lineHeight: '1em',
				letterSpacing: '0.03em'
			}}>
				<WindowControls/>
				<div style={{height: `calc(${this.state.height}px - ${top + bottom}em)`, overflowY:'scroll', overflowX:'hidden', marginRight:'0.1em'}}>
					<Switch>
						<Route exact path="/" render={() => (
							<Library player={this._player}/>
						)}/>
						<Route path="/works/:workId/:bookName" render={({match}) => (
							<Detail player={this._player} workId={match.params.workId} bookName={match.params.bookName}/>
						)}/>
						<Route path="/works/:workId" render={({match}) => (
							<Detail player={this._player} workId={match.params.workId}/>
						)}/>
						<Route path="/settings" render={() => (
							<Settings />
						)}/>
						<Route path="/about" render={() => (
							<div>
								<h1>About</h1>
								<div style={{color: this.props.theme.secondaryText, lineHeight: '1.2em'}}>
									<p>
										Audio Book Player: v{app.getVersion()}<br/>
										Created By Duncan Haig<br/>
										Copywrite 2018 Duncan Haig<br/>
									</p>
									<p>
										Electron: v{process.versions.electron}<br/>
										Node: v{process.versions.node}<br/>
										Chrome: v{process.versions.chrome}<br/>
									</p>
									<p>
										<h2 style={{color:this.props.theme.primaryText}}>Support this software on:</h2>
										<span style={{cursor:'pointer', textDecoration:'underline', marginBottom:'1em'}} onClick={() => shell.openExternal('https://audiobookplayer.app')}>
											AudioBookPlayer.app
										</span><br/>
										<span style={{cursor:'pointer', textDecoration:'underline'}} onClick={() => shell.openExternal('https://www.patreon.com/AudioBookPlayer')}>
											Patreon
										</span>
									</p>
								</div>
							</div>
						)}/>
						<Route render={({location}) => (
							<div>
								<h1>Well this is quite a issue you found yourself in,<br/> try heading back to the library</h1>
							</div>
						)}/>
					</Switch>
				</div>
				<Player player={this._player}/>
				<style dangerouslySetInnerHTML={{__html: `
				
					@font-face {
					  font-family: 'Archivo';
					  font-style: normal;
					  font-weight: normal;
					  src: url('fonts/Archivo/OpenSans-Regular.ttf') format('truetype');
					}

					@font-face {
					  font-family: 'Archivo';
					  font-style: italic;
					  font-weight: normal;
					  src: url('fonts/Archivo/OpenSans-Italic.ttf') format('truetype');
					}

					@font-face {
					  font-family: 'Archivo';
					  font-style: normal;
					  font-weight: 600;
					  src: url('fonts/Archivo/OpenSans-SemiBold.ttf') format('truetype');
					}

					@font-face {
					  font-family: 'Archivo';
					  font-style: italic;
					  font-weight: 600;
					  src: url('fonts/Archivo/OpenSans-SemiBoldItalic.ttf') format('truetype');
					}

					@font-face {
					  font-family: 'Archivo';
					  font-style: normal;
					  font-weight: 700;
					  src: url('fonts/Archivo/OpenSans-Bold.ttf') format('truetype');
					}

					@font-face {
					  font-family: 'Archivo';
					  font-style: italic;
					  font-weight: 700;
					  src: url('fonts/Archivo/OpenSans-BoldItalic.ttf') format('truetype');
					}

					@font-face {
					  font-family: 'Open Sans';
					  font-style: normal;
					  font-weight: 300;
					  src: url('fonts/Open Sans/OpenSans-Light.ttf') format('truetype');
					}

					@font-face {
					  font-family: 'Open Sans';
					  font-style: italic;
					  font-weight: 300;
					  src: url('fonts/Open Sans/OpenSans-LightItalic.ttf') format('truetype');
					}

					@font-face {
					  font-family: 'Open Sans';
					  font-style: normal;
					  font-weight: normal;
					  src: url('fonts/Open Sans/OpenSans-Regular.ttf') format('truetype');
					}

					@font-face {
					  font-family: 'Open Sans';
					  font-style: italic;
					  font-weight: normal;
					  src: url('fonts/Open Sans/OpenSans-Italic.ttf') format('truetype');
					}

					@font-face {
					  font-family: 'Open Sans';
					  font-style: normal;
					  font-weight: 600;
					  src: url('fonts/Open Sans/OpenSans-SemiBold.ttf') format('truetype');
					}

					@font-face {
					  font-family: 'Open Sans';
					  font-style: italic;
					  font-weight: 600;
					  src: url('fonts/Open Sans/OpenSans-SemiBoldItalic.ttf') format('truetype');
					}

					@font-face {
					  font-family: 'Open Sans';
					  font-style: normal;
					  font-weight: 700;
					  src: url('fonts/Open Sans/OpenSans-Bold.ttf') format('truetype');
					}

					@font-face {
					  font-family: 'Open Sans';
					  font-style: italic;
					  font-weight: 700;
					  src: url('fonts/Open Sans/OpenSans-BoldItalic.ttf') format('truetype');
					}

					@font-face {
					  font-family: 'Open Sans';
					  font-style: normal;
					  font-weight: 800;
					  src: url('fonts/Open Sans/OpenSans-ExtraBold.ttf') format('truetype');
					}

					@font-face {
					  font-family: 'Open Sans';
					  font-style: italic;
					  font-weight: 800;
					  src: url('fonts/Open Sans/OpenSans-ExtraBoldItalic.ttf') format('truetype');
					}

					body {
						-webkit-user-select:none;
						cursor:default;
					}

					.rt-expander::after {
						border-top-color: ${this.props.theme.activeText} !important;
					}

					::-webkit-input-placeholder {
						color: ${this.props.theme.inactiveText};
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
						background: ${this.props.theme.inactiveText};
						-webkit-border-radius: 100px;
					}

					::-webkit-scrollbar-thumb:vertical:active {
						background: ${this.props.theme.activeText};
						-webkit-border-radius: 100px;
					}

					::-webkit-scrollbar-track {
						background-color: ${this.props.theme.scrollBarTrack};
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
})
