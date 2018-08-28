import React, {Component} from 'react';

import withTheme from '../theme/withTheme';

const {shell} = window.require('electron');
const {app, process} = window.require('electron').remote;

export default withTheme(class About extends Component {
	render() {
		return (
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
					<h2 style={{color:this.props.theme.primaryText}}>Support this software on:</h2>
					<p>
						<span style={{cursor:'pointer', textDecoration:'underline', marginBottom:'1em'}} onClick={() => shell.openExternal('https://audiobookplayer.app')}>
							AudioBookPlayer.app
						</span><br/>
						<span style={{cursor:'pointer', textDecoration:'underline'}} onClick={() => shell.openExternal('https://www.patreon.com/AudioBookPlayer')}>
							Patreon
						</span>
					</p>
				</div>
			</div>
		);
	}
})