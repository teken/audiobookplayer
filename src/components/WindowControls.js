import React, {Component} from "react";
import {withRouter} from "react-router-dom";

import IconButton from "./player/IconButton";
import withTheme from "./theme/withTheme";
//import AboutModule from './modal/AboutModal';

const remote = window.require('electron').remote;

export default withRouter(withTheme(class WindowControls extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showAbout: false
		}
	}

	render() {
		let commonButtonStyling = {
			padding: "0.5em 1em 0.4em",
			cursor: "pointer",
			height: '1em',
			WebkitAppRegion: 'no-drag',
			color: this.props.theme.activeText,
		};

		return (
			<div style={{cursor:'point', WebkitAppRegion:'drag', position:'fixed', top:0, width: '100%', display:'flex', justifyContent:'space-between', background: this.props.theme.windowBarBackground, height: '1em', alignItems:'baseline', padding:'.5em 0'}}>
				<div>
					<IconButton title="Library" icon="book-open" onClick={() => this.props.history.push(`/`)} hoverStyle={{backgroundColor:this.props.theme.iconButtonHoverBackground}} style={{...commonButtonStyling}} svgStyle={{transform: 'translateY(1.5px)'}}/>
					<IconButton title="Downloads" icon="cloud-download-alt" onClick={() => this.props.history.push(`/downloads`)} hoverStyle={{backgroundColor:this.props.theme.iconButtonHoverBackground}} style={{...commonButtonStyling}} svgStyle={{transform: 'translateY(1.5px)'}}/>
					<IconButton title="Settings" icon="cog" onClick={() => this.props.history.push(`/settings`)} hoverStyle={{backgroundColor:this.props.theme.iconButtonHoverBackground}} style={{...commonButtonStyling}}/>
					<IconButton title="About" icon="question" onClick={() => this.props.history.push(`/about`)} hoverStyle={{backgroundColor:this.props.theme.iconButtonHoverBackground}} style={{...commonButtonStyling}}/>
				</div>
				<div>
					{/*<IconButton icon="minus" onClick={() => this.minimizeToTray()} style={{...commonButtonStyling, color:this.props.theme.activeColour}}/>*/}
					<IconButton title="Minimise" icon="minus" onClick={() => this.currentWindow.minimize()} hoverStyle={{backgroundColor:this.props.theme.iconButtonHoverBackground}} style={{...commonButtonStyling}}/>
					<IconButton title="Maximise" icon="square" onClick={() => this.maximize()} hoverStyle={{backgroundColor:this.props.theme.iconButtonHoverBackground}} style={{...commonButtonStyling, fontSize: '0.9em', padding: "0.6em 1em 0.4em",}} svgStyle={{transform: 'translateY(-1.5px)'}}/>
					<IconButton title="Close" icon="times" onClick={() => this.currentWindow.close()} hoverStyle={{backgroundColor:this.props.theme.warning}} style={{...commonButtonStyling}}/>
				</div>
				{/*<AboutModule show={this.state.showAbout} okOnClick={() => this.setState({showAbout: false})}/>*/}
			</div>
		);
	}

	minimizeToTray() {
		console.log("minimizeToTray")
	}

	maximize() {
		if (this.currentWindow.isMaximized()) this.currentWindow.unmaximize();
		else this.currentWindow.maximize();
	}

	get currentWindow() {
		return remote.getCurrentWindow();
	}

}))

