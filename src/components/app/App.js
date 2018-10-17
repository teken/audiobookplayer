import React, {Component} from "react";
import {HashRouter, Route, Switch} from "react-router-dom";

import Library from "../library/Library";
import Player from "../player/Player";
import Detail from "../detail/Detail";
import WindowControls from "../WindowControls";
import Settings from "../settings/Settings";
import About from "../about/About";
import Setup from "../setup/Setup";

import {library} from "@fortawesome/fontawesome-svg-core";

import {
	faBackward,
	faBookOpen,
	faCaretDown,
	faCheckSquare,
	faChevronLeft,
	faChevronRight,
	faCog,
	faFolderOpen,
	faForward,
	faMapMarkerAlt,
	faMinus,
	faPause,
	faPlay,
	faQuestion,
	faSearch,
	faSquare,
	faStop,
	faTimes,
	faVolumeDown,
	faVolumeOff,
	faVolumeUp
} from "@fortawesome/free-solid-svg-icons";

import withTheme from "../theme/withTheme";
import withPlayer from "../player/withPlayer";

//import { faSquare } from '@fontawesome/free-regular-svg-icons';
//import { } from '@fontawesome/free-brands-svg-icons';

const {ipcRenderer} = window.require('electron');

library.add(faPlay, faPause, faStop, faBackward, faForward, faVolumeUp, faVolumeDown, faVolumeOff, faMapMarkerAlt,
			faMinus, faSquare, faTimes, faBookOpen, faCog, faSearch, faFolderOpen, faChevronLeft, faChevronRight,
			faQuestion, faCaretDown, faCheckSquare
);

export default withTheme(withPlayer(class App extends Component {
	constructor(props) {
		super(props);
		this.registerIPCListeners();
		this.state = {
			height: window.innerHeight,
		};
	}

	registerIPCListeners() {
		ipcRenderer.on('player.pauseplay', (event, arg) => {
			this.props.player.playPause();
		});
		ipcRenderer.on('player.previoustrack', (event, arg) => {
			this.props.player.playPrevious()
		});
		ipcRenderer.on('player.nexttrack', (event, arg) => {
			this.props.player.playNext()
		});
		ipcRenderer.on('player.stop', (event, arg) => {
			this.props.player.stop();
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
			<HashRouter>
				<div style={{
					textAlign: 'center',
					paddingTop: `${top}em`,
					paddingBottom: `${bottom}em`,
					background: this.props.theme.background,
					color: this.props.theme.primaryText,
					WebkitFontSmoothing: 'antialiased',
					fontFamily: 'Archivo, Open Sans, "Helvetica Neue", Helvetica, Arial, sans-serif',
					lineHeight: '1em',
					letterSpacing: '0.03em'
				}}>
					<WindowControls/>
					<div style={{height: `calc(${this.state.height}px - ${top + bottom}em)`, overflowY:'scroll', overflowX:'hidden', marginRight:'0.1em'}}>
						<Switch>
							<Route exact path="/" component={Library}/>
							<Route path="/works/:workId/:bookName" render={({match}) => (
								<Detail workId={match.params.workId} bookName={match.params.bookName}/>
							)}/>
							<Route path="/works/:workId" render={({match}) => (
								<Detail workId={match.params.workId}/>
							)}/>
							<Route path="/settings" component={Settings}/>
							<Route path="/about" component={About}/>
							<Route path="/setup" component={Setup}/>
							<Route render={({location}) => (
								<div style={{lineHeight: '1.5em'}}>
									<h1>Well this is quite a issue you found yourself in,<br/> try heading back to the library</h1>
								</div>
							)}/>
						</Switch>
					</div>
					<Player />
					<style dangerouslySetInnerHTML={{__html: `

						@font-face {
						  font-family: 'Archivo';
						  font-style: normal;
						  font-weight: normal;
						  src: url('fonts/Archivo/Archivo-Regular.ttf') format('truetype');
						}

						@font-face {
						  font-family: 'Archivo';
						  font-style: italic;
						  font-weight: normal;
						  src: url('fonts/Archivo/Archivo-Italic.ttf') format('truetype');
						}

						@font-face {
						  font-family: 'Archivo';
						  font-style: normal;
						  font-weight: 600;
						  src: url('fonts/Archivo/Archivo-SemiBold.ttf') format('truetype');
						}

						@font-face {
						  font-family: 'Archivo';
						  font-style: italic;
						  font-weight: 600;
						  src: url('fonts/Archivo/Archivo-SemiBoldItalic.ttf') format('truetype');
						}

						@font-face {
						  font-family: 'Archivo';
						  font-style: normal;
						  font-weight: 700;
						  src: url('fonts/Archivo/Archivo-Bold.ttf') format('truetype');
						}

						@font-face {
						  font-family: 'Archivo';
						  font-style: italic;
						  font-weight: 700;
						  src: url('fonts/Archivo/Archivo-BoldItalic.ttf') format('truetype');
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
							margin: 0;
  							padding: 0;
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

						h1, h2, h3, h4, h5, h6 {
							line-height:1em;
							margin: .5em 0;
						}
					`}} />
				</div>
			</HashRouter>
		);
	}
}))
