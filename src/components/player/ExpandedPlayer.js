import React from "react";
import { withRouter } from "react-router-dom";

import Timeline from "./timeline/Timeline";
import Volume from "./volume/Volume";
import IconButton from "./IconButton";

import TimeCodePromptModal from "../modal/TimeCodePromptModal";
import { Player } from "./Player"
import withPlayer from "./withPlayer";

export default withRouter(withPlayer(class ExpandedPlayer extends Player {
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

	get hasArtwork() {
		return this.props.player.book && this.props.player.book.art.length > 0;
	}

	render() {
		const commonButtonStyling = {
			padding: "1em",
			cursor: "pointer",
		};
		return (
			<div className="player expanded" style={{
				backgroundColor: 'var(--player-background-colour)',
				textAlign: 'left',
				display: 'grid',
				gridTemplateColumns: '1fr 1fr',
				gridTemplateRows: '1fr 1fr 3em',
				gridTemplateAreas: "'image controls' 'timeline timeline' 'bottombar bottombar'",
				gap: '1em',
				placeItems: 'center'
			}}>
				<TimeCodePromptModal show={this.state.showTimePicker} okOnClick={this.timePickerOk} cancelOnClick={() => this.setState({ showTimePicker: false })} />
				<div style={{ gridArea: 'image', placeSelf: "center" }}>
					{this.hasArtwork && <img src={this.props.player.book.art[0].path} alt={this.cleanedName} style={{
					}} />}
				</div>
				<div style={{ gridArea: 'controls' }}>
					<IconButton title="Pause/Play" icon={this.state.playButtonIcon} onClick={() => this.playPause()} style={{ ...commonButtonStyling, color: this.props.player.isLoaded ? 'var(--active-text-colour)' : 'var(--inactive-text-colour)' }} />
					<br />
					<IconButton title="Previous" icon="backward" onClick={() => this.props.player.playPrevious()} style={{ ...commonButtonStyling, color: this.props.player.hasPrevious ? 'var(--active-text-colour)' : 'var(--inactive-text-colour)' }} />
					<IconButton title="Next" icon="forward" onClick={() => this.props.player.playNext()} style={{ ...commonButtonStyling, color: this.props.player.hasNext ? 'var(--active-text-colour)' : 'var(--inactive-text-colour)' }} />
					<IconButton title="Stop" icon="stop" onClick={() => this.props.player.stop()} style={{ ...commonButtonStyling, color: this.props.player.isLoaded ? 'var(--active-text-colour)' : 'var(--inactive-text-colour)' }} />
					<br />
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
				<div style={{ gridArea: 'timeline' }}>
					<Timeline progress={isNaN(this.state.progress) ? 0 : this.state.progress} duration={isNaN(this.state.duration) ? 0 : this.state.duration} chapters={this.state.chapters} />
					<IconButton title="Skip to Point" icon="map-marker-alt" onClick={() => this.props.player.isLoaded && this.setState({ showTimePicker: true })} style={{ ...commonButtonStyling, color: this.props.player.isLoaded ? 'var(--active-text-colour)' : 'var(--inactive-text-colour)' }} />
					<span onMouseOver={() => this.displayVolume = true} onMouseOut={() => this.displayVolume = false}>
						<IconButton title="Volume/Mute" icon={this.state.volumeIcon} onClick={() => this.mute()} style={{ ...commonButtonStyling, color: this.state.muted ? 'var(--warning-colour)' : 'var(--active-text-colour)' }} svgStyle={{ minWidth: '18px' }} />
						<span style={{ display: !this.state.muted && this.displayVolume ? 'inline-flex' : 'none' }}>
							<Volume progress={this.state.volume} duration={this.props.player.volumeRange} />
						</span>
					</span>
				</div>

				<div style={{ gridArea: 'bottombar', display: 'flex', placeSelf: 'end' }}>
					<IconButton title="Contract" icon="chevron-down" onClick={() => this.props.togglePlayerExpansion()} style={{ ...commonButtonStyling, color: this.props.player.isLoaded ? 'var(--active-text-colour)' : 'var(--inactive-text-colour)' }} />
				</div>
			</div>
		);
	}
}))
