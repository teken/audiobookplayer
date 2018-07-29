import React, {Component} from 'react';
import { withRouter } from 'react-router-dom'

import IconButton from './player/IconButton';
//import AboutModule from './modal/AboutModal';

const remote = window.require('electron').remote;

export default withRouter(class WindowControls extends Component {
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
			height:'1em',
			WebkitAppRegion:'no-drag',
			color:this.props.styling.activeText,
		};

		return (
			<div style={{cursor:'point', WebkitAppRegion:'drag', position:'fixed', top:0, width: '100%', display:'flex', justifyContent:'space-between', background: this.props.styling.windowBarBackground, height: '1em', alignItems:'baseline', padding:'.5em 0'}}>
				<div>
					<IconButton title="Library" icon="book-open" onClick={() => this.props.history.push(`/`)} hoverStyle={{backgroundColor:this.props.styling.iconButtonHoverBackground}} style={{...commonButtonStyling}} svgStyle={{transform: 'translateY(1.5px)'}}/>
					<IconButton title="Settings" icon="cog" onClick={() => this.props.history.push(`/settings`)} hoverStyle={{backgroundColor:this.props.styling.iconButtonHoverBackground}} style={{...commonButtonStyling}}/>
					<IconButton title="About" icon="question" onClick={() => this.props.history.push(`/about`)} hoverStyle={{backgroundColor:this.props.styling.iconButtonHoverBackground}} style={{...commonButtonStyling}}/>
				</div>
				<div>
					{/*<IconButton icon="minus" onClick={() => this.minimizeToTray()} style={{...commonButtonStyling, color:this.props.styling.activeColour}}/>*/}
					<IconButton title="Minimise" icon="minus" onClick={() => this.currentWindow.minimize()} hoverStyle={{backgroundColor:this.props.styling.iconButtonHoverBackground}} style={{...commonButtonStyling}}/>
					<IconButton title="Maximise" icon="square" onClick={() => this.maximize()} hoverStyle={{backgroundColor:this.props.styling.iconButtonHoverBackground}} style={{...commonButtonStyling, fontSize: '0.9em', padding: "0.6em 1em 0.4em",}} svgStyle={{transform: 'translateY(-1.5px)'}}/>
					<IconButton title="Close" icon="times" onClick={() => this.currentWindow.close()} hoverStyle={{backgroundColor:this.props.styling.warning}} style={{...commonButtonStyling}}/>
				</div>
				{/*<AboutModule show={this.state.showAbout} styling={this.props.styling} okOnClick={() => this.setState({showAbout: false})}/>*/}
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

})

