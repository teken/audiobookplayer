import React, { Component } from "react";
import { HashRouter, Route, Switch } from "react-router-dom";

import Library from "../library/Library";
import Player from "../player/Player";
import ExpandedPlayer from "../player/ExpandedPlayer";
import Detail from "../detail/Detail";
import WindowControls from "../WindowControls";
import Settings from "../settings/Settings";
import About from "../about/About";
import Setup from "../setup/Setup";

import { library } from "@fortawesome/fontawesome-svg-core";

import {
	faBackward,
	faBookOpen,
	faCaretDown,
	faCheckSquare,
	faChevronLeft,
	faChevronRight,
	faChevronUp,
	faChevronDown,
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

const { ipcRenderer } = window.require('electron');

library.add(faPlay, faPause, faStop, faBackward, faForward, faVolumeUp, faVolumeDown, faVolumeOff, faMapMarkerAlt,
	faMinus, faSquare, faTimes, faBookOpen, faCog, faSearch, faFolderOpen, faChevronLeft, faChevronRight,
	faQuestion, faCaretDown, faCheckSquare, faChevronUp,
	faChevronDown
);

export default withPlayer(class App extends Component {
	constructor(props) {
		super(props);
		this.registerIPCListeners();
		this.state = {
			height: window.innerHeight - 1,
			windowControlHeight: 2,
			playerHeight: 3,
			expandedPlayer: false
		};
	}

	registerIPCListeners() {
		ipcRenderer.on('player.pauseplay', _ => this.props.player.playPause());
		ipcRenderer.on('player.previoustrack', _ => this.props.player.playPrevious());
		ipcRenderer.on('player.nexttrack', _ => this.props.player.playNext());
		ipcRenderer.on('player.stop', _ => this.props.player.stop());
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
		return (
			<HashRouter>
				<div style={{
					display: 'grid',
					gridTemplateRows: this.state.expandedPlayer ?
						`${this.state.windowControlHeight}em calc(100vh - ${this.state.windowControlHeight}em )` :
						`${this.state.windowControlHeight}em calc(100vh - ${this.state.windowControlHeight + this.state.playerHeight}em ) ${this.state.playerHeight}em`,
					overflow: 'hidden'
				}}>
					<WindowControls />
					{!this.state.expandedPlayer && <>
						<div style={{ overflowY: 'scroll', overflowX: 'hidden', marginRight: '0.1em' }}>
							<Switch>
								<Route exact path="/" component={Library} />
								<Route path="/works/:workId/:bookName" render={({ match }) => <Detail workId={match.params.workId} bookName={match.params.bookName} />} />
								<Route path="/works/:workId" render={({ match }) => <Detail workId={match.params.workId} />} />
								<Route path="/settings" component={Settings} />
								<Route path="/about" component={About} />
								<Route path="/setup" component={Setup} />
								<Route render={_ =>
									<div style={{ lineHeight: '1.5em' }}>
										<h1>Well this is quite a issue you found yourself in,<br /> try heading back to the library</h1>
									</div>
								} />
							</Switch>
						</div>
						<Player togglePlayerExpansion={() => this.setState({ expandedPlayer: true })} />
					</>}
					{this.state.expandedPlayer && <ExpandedPlayer togglePlayerExpansion={() => this.setState({ expandedPlayer: false })} />}
				</div>
			</HashRouter>
		);
	}
})
