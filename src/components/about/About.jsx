import React, {Component} from "react";

export default class About extends Component {
	constructor(props) {
		super(props);
		this.state = {
			stats: {}
		}
	}

	componentDidMount() {
		const stats = window.electron.sendSync('library.getAllCounts');
		this.setState({
			stats: stats
		});
	}

	stat(displayName, valueName) {
		const value = valueName in this.state.stats ? this.state.stats[valueName] : 0;
		return <div><span>{displayName}: </span><span>{value}</span></div>
	}

	dateRange() {
		const startDate = 2018;
		const endDate = (new Date()).getFullYear();
		if (startDate === endDate) {
			return startDate;
		} else {
			return `${startDate}-${endDate}`;
		}
	}

	render() {
		return (
			<div>
				<h1>About</h1>
				<div style={{color: 'var(--secondary-text-colour)', lineHeight: '1.2em'}}>
					<p>
						Audio Book Player: v{app.getVersion()}<br/>
						Created By {pkg.author}<br/>
						&copy; {this.dateRange()} {pkg.author} All Rights Reserved<br/>
					</p>
					<h2 style={{color:'var(--primary-text-colour)'}}>Support this software on:</h2>
					<p>
						<span style={{cursor:'pointer', textDecoration:'underline', marginBottom:'1em'}} onClick={() => shell.openExternal('https://audiobookplayer.app')}>
							AudioBookPlayer.app
						</span><br/>
						<span style={{cursor:'pointer', textDecoration:'underline'}} onClick={() => shell.openExternal('https://www.patreon.com/AudioBookPlayer')}>
							Patreon
						</span>
					</p>
					<h2 style={{color:'var(--primary-text-colour)'}}>Stats about your library:</h2>
					{this.stat('Number of Authors', 'authors')}
					{this.stat('Number of Series', 'series')}
					{this.stat('Number of Books', 'books')}
					{this.stat('Number of Books Not in a Series', 'singleBooks')}
				</div>
			</div>
		);
	}
}