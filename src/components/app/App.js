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
import withPlayer from "../player/withPlayer";

//import { faSquare } from '@fontawesome/free-regular-svg-icons';
//import { } from '@fontawesome/free-brands-svg-icons';

const {ipcRenderer} = window.require('electron');

library.add(faPlay, faPause, faStop, faBackward, faForward, faVolumeUp, faVolumeDown, faVolumeOff, faMapMarkerAlt,
			faMinus, faSquare, faTimes, faBookOpen, faCog, faSearch, faFolderOpen, faChevronLeft, faChevronRight,
			faQuestion, faCaretDown, faCheckSquare
);

export default withPlayer(class App extends Component {
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
					background: 'var(--background-colour)',
					color: 'var(--primary-text-colour)',
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
				</div>
			</HashRouter>
		);
	}
})
