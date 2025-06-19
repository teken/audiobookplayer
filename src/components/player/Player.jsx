import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import Timeline from "./timeline/Timeline";
import Volume from "./volume/Volume";
import IconButton from "./IconButton";

import TimeCodePromptModal from "../modal/TimeCodePromptModal";
import withPlayer from "./withPlayer";

export default withRouter(withPlayer(class Player extends Component {
	constructor(props) {
		super(props);
		this.state = {
			playButtonIcon: 'pause',
			volume: this.props.player.volume,
			volumeIcon: "volume-up",
			muted: false,
			intervalId: null,
			showTimePicker: false,
			chapters: []
		};

		this.update = this.update.bind(this);
		this.timePickerOk = this.timePickerOk.bind(this);
	}

	componentDidMount() {
		let id = setInterval(this.update, 500);
		this.setState({ intervalId: id });
	}

	update() {
		const timingKey = this.props.player.timingKey;
		if (this.props.player.isPlaying && timingKey.length > 0) window.electron.send('timings.set', { key: timingKey, time: this.props.player.currentTime });
		window.electron.send('window.progressbar.set', this.props.player.progress);
		window.electron.send('settings.set', {
			name: 'volume',
			value: this.props.player.volume
		});
		this.setState({
			progress: this.props.player.currentTime,
			duration: this.props.player.duration,
			volume: this.props.player.volume,
			chapters: this.props.player.chapters,
			playButtonIcon: this.props.player.isPlaying ? `pause` : `play`,
			volumeIcon: this.volumeIcon()
		});
	}

	componentWillUnmount() {
		if (this.state.intervalId !== null) clearInterval(this.state.intervalId);
	}

	playPause() {
		this.props.player.playPause();
		this.update();
	}

	volumeIcon() {
		let volume = this.state.volume;
		if (this.state.muted) return 'volume-off';//"volume-muted";
		else if (volume <= this.props.player.minVolume) return 'volume-off';
		else if (volume <= this.props.player.maxVolume / 2) return 'volume-down';
		else return 'volume-up';
	}

	mute() {
		if (this.state.muted) this.props.player.volume = this.state.volume;
		else this.props.player.volume = 0;
		this.setState({ muted: !this.state.muted });
	}

	timePickerOk(time) {
		this.props.player.currentTime = time;
		this.setState({ showTimePicker: false });
	}

	get cleanedName() {
		const number = this.props.player.book.name.split(' ', 1)[0];
		return this.props.player.work && !isNaN(number) ? this.props.player.book.name.slice(number.length + 1) : this.props.player.book.name;
	}


	get seriesName() {
		const number = this.props.player.book.name.split(' ', 1)[0];
		return isNaN(number) ? this.props.player.work.name : `${this.props.player.work.name} #${number}`;
	}

	displayName() {
		return <span style={{ fontWeight: 600, fontSize: '1.1em' }}>
			{this.cleanedName} {this.props.player.work.type === 'SERIES' && <span style={{ color: 'var(--secondary-text-colour)', fontSize: '.9em' }}>({this.seriesName})</span>}
		</span>
	}

	render() {
		const commonButtonStyling = {
			padding: "1em",
			cursor: "pointer",
		};
		return (
			<div className="player" style={{
				width: '100vw',
				backgroundColor: 'var(--player-background-colour)',
				textAlign: 'left',
				height: '3em'
			}}>
				<TimeCodePromptModal show={this.state.showTimePicker} okOnClick={this.timePickerOk} cancelOnClick={() => this.setState({ showTimePicker: false })} />
				<Timeline progress={isNaN(this.state.progress) ? 0 : this.state.progress} duration={isNaN(this.state.duration) ? 0 : this.state.duration} chapters={this.state.chapters} />
				<div className="controls" style={{ height: '1em' }}>
					<IconButton title="Previous" icon="backward" onClick={() => this.props.player.playPrevious()} style={{ ...commonButtonStyling, color: this.props.player.hasPrevious ? 'var(--active-text-colour)' : 'var(--inactive-text-colour)' }} />
					<IconButton title="Pause/Play" icon={this.state.playButtonIcon} onClick={() => this.playPause()} style={{ ...commonButtonStyling, color: this.props.player.isLoaded ? 'var(--active-text-colour)' : 'var(--inactive-text-colour)' }} />
					<IconButton title="Next" icon="forward" onClick={() => this.props.player.playNext()} style={{ ...commonButtonStyling, color: this.props.player.hasNext ? 'var(--active-text-colour)' : 'var(--inactive-text-colour)' }} />
					<IconButton title="Stop" icon="stop" onClick={() => this.props.player.stop()} style={{ ...commonButtonStyling, color: this.props.player.isLoaded ? 'var(--active-text-colour)' : 'var(--inactive-text-colour)' }} />
					<IconButton title="Skip to Point" icon="map-marker-alt" onClick={() => this.props.player.isLoaded && this.setState({ showTimePicker: true })} style={{ ...commonButtonStyling, color: this.props.player.isLoaded ? 'var(--active-text-colour)' : 'var(--inactive-text-colour)' }} />
					<span onMouseOver={() => this.displayVolume = true} onMouseOut={() => this.displayVolume = false}>
						<IconButton title="Volume/Mute" icon={this.state.volumeIcon} onClick={() => this.mute()} style={{ ...commonButtonStyling, color: this.state.muted ? 'var(--warning-colour)' : 'var(--active-text-colour)' }} svgStyle={{ minWidth: '18px' }} />
						<span style={{ display: !this.state.muted && this.displayVolume ? 'inline-flex' : 'none' }}>
							<Volume progress={this.state.volume} duration={this.props.player.volumeRange} />
						</span>
					</span>
					<span style={{ color: 'var(--active-text-colour)', cursor: this.props.player.isLoaded ? 'pointer' : 'default', padding: "0 1em", fontSize: '0.9em' }} onClick={() => {
						if (this.props.player.isLoaded) return;
						const path = `${this.props.player.work.$loki}${this.props.player.work.type === 'SERIES' ? `/${this.props.player._bookNameIfSeries}` : ''}`;
						this.props.history.push(`/works/${path}`);
					}}>
						{this.props.player.isLoaded && this.displayName()}
					</span>
					<span style={{ color: 'var(--secondary-text-colour)', float: 'right', padding: "0 1em", fontSize: '0.9em' }}>
						{this.props.player.isLoaded ? `${this.props.player.formatTime(this.state.progress)} / ${this.props.player.formatTime(this.state.duration)}` : `No Book Selected`}
					</span>
				</div>
			</div>
		);
	}
}))
