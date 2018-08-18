import React, {Component} from 'react';
import { withRouter } from 'react-router-dom'

import Timeline from './timeline/Timeline';
import Volume from './volume/Volume';
import IconButton from './IconButton';

import TimeCodePromptModal from '../modal/TimeCodePromptModal';

import withTheme from '../theme/withTheme';

const {ipcRenderer} = window.require('electron');

export default withRouter(withTheme(class Player extends Component {
	constructor(props) {
		super(props);
		this._player = props.player;
		this.state = {
			playButtonIcon: 'pause',
			volume: this._player.volume,
			volumeIcon: "volume-up",
			muted: false,
			intervalId : null,
			showTimePicker: false
		};

		this.update = this.update.bind(this);
		this.timePickerOk = this.timePickerOk.bind(this);
	}

	componentDidMount() {
		let id = setInterval(this.update, 500);
		this.setState({intervalId: id});
	}

	update() {
		const timingKey = this._player.timingKey;
		if (this._player.isPlaying && timingKey.length > 0) ipcRenderer.send('timings.set', {key: timingKey, time:this._player.currentTime});
		const progress = () => {
			try {
				return this._player.currentTime / this._player.duration;
			} catch(e) {
				return 0;
			}
		};
		ipcRenderer.send('window.progressbar.set', progress);
		ipcRenderer.send('settings.set', {
			name:'volume',
			value: this._player.volume
		});
		this.setState({
			progress: this._player.currentTime,
			duration: this._player.duration,
			volume: this._player.volume,
			playButtonIcon: this._player.isPlaying ? `pause` : `play`,
			volumeIcon: this.volumeIcon()
		});
	}

	componentWillUnmount() {
		if (this.state.intervalId !== null) clearInterval(this.state.intervalId);
	}

	playPause() {
		this._player.playPause();
		this.update();
	}

	volumeIcon() {
		let volume = this.state.volume;
		if (this.state.muted) return 'volume-off';//"volume-muted";
		else if (volume <= 0) return 'volume-off';
		else if (volume <= 50) return 'volume-down';
		else return 'volume-up';
	}

	mute() {
		if (this.state.muted) this._player.volume = this.state.volume;
		else this._player.volume = 0;
		this.setState({muted: !this.state.muted});
	}

	timePickerOk(time) {
		this._player.currentTime = time;
		this.setState({showTimePicker: false});
	}

	render() {
		let commonButtonStyling = {
			padding: "1em",
			cursor: "pointer",
		};
		return (
			<div className="player" style={{
				position: 'fixed',
				bottom: 0,
				width: '100%',
				backgroundColor: this.props.theme.playerBackground,
				textAlign: 'left',
				height: '3em'
			}}>
				<TimeCodePromptModal show={this.state.showTimePicker} okOnClick={this.timePickerOk} cancelOnClick={() => this.setState({showTimePicker: false})}/>
				<Timeline player={this._player} progress={this.state.progress} duration={this.state.duration}/>
				<div className="controls" style={{height:'1em'}}>

					<IconButton title="Previous Track" icon="backward" onClick={() => this._player.playPreviousTrack()} style={{...commonButtonStyling, color: this._player.hasPreviousTrack ? this.props.theme.activeText : this.props.theme.inactiveText}}/>
					<IconButton title="Pause/Play" icon={this.state.playButtonIcon} onClick={() => this.playPause()} style={{...commonButtonStyling, color: this._player.isLoaded ? this.props.theme.activeText : this.props.theme.inactiveText}}/>
					<IconButton title="Next Track" icon="forward" onClick={() => this._player.playNextTrack()} style={{...commonButtonStyling, color: this._player.hasNextTrack ? this.props.theme.activeText : this.props.theme.inactiveText}}/>
					<IconButton title="Stop" icon="stop" onClick={() => this._player.stop()} style={{...commonButtonStyling, color: this._player.isLoaded ? this.props.theme.activeText : this.props.theme.inactiveText}}/>
					<IconButton title="Skip to Point" icon="map-marker-alt" onClick={() => this._player.isLoaded && this.setState({showTimePicker: true})} style={{...commonButtonStyling, color: this._player.isLoaded ? this.props.theme.activeText : this.props.theme.inactiveText}}/>
					<span onMouseOver={() => this.displayVolume = true} onMouseOut={() => this.displayVolume = false}>
						<IconButton title="Volume/Mute" icon={this.state.volumeIcon} onClick={() => this.mute()} style={{...commonButtonStyling, color:this.state.muted ? this.props.theme.warning :this.props.theme.activeText}} svgStyle={{minWidth:'18px'}}/>
						<span style={{display: !this.state.muted && this.displayVolume ? 'inline-flex' : 'none'}}>
							<Volume player={this._player} progress={this.state.volume} duration={200}/>
						</span>
					</span>
					<span style={{color:this.props.theme.activeText, cursor: this._player.isLoaded ? 'pointer' : 'default', padding: "0 1em", fontSize: '0.9em'}} onClick={() => {
						if (this._player.isLoaded) return;
						const path = `${this._player.work.$loki}${this._player.work.type === 'SERIES' ? `/${this._player._bookNameIfSeries}`: ''}`;
						this.props.history.push(`/works/${path}`);
					}}>
						{this._player.isLoaded && this._player.book.name}
					</span>
					<span style={{color:this.props.theme.secondaryText, float:'right', padding: "0 1em", fontSize: '0.9em'}}>
						{this._player.isLoaded ? `${this.formatTime(this.state.progress)} / ${this.formatTime(this.state.duration)}` : `No Book Selected`}
					</span>
				</div>
			</div>
		);
	}

	formatTime(time) {
		if (!time) time = 0;
		return new Date(1000 * time).toISOString().substr(11, 8);
	}
}))
