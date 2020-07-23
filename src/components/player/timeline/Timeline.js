import React, { Component } from "react";

import ProgressBar from "./ProgressBar";
import ProgressBarHandler from "./ProgressBarHandler";
import withPlayer from "../withPlayer";

export default withPlayer(class Timeline extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showHandler: false,
			barWidth: window.innerWidth,
			translate: 0,
			steps: []
		};
		this.holding = false;
		this.shouldTogglePlayPause = this.props.player.isPlaying;
		this.changeTranslate = this.changeTranslate.bind(this);
		this._onMouseDownProgressBar = this._onMouseDownProgressBar.bind(this);
		this._onMouseOverProgressBar = this._onMouseOverProgressBar.bind(this);
		this._onMouseOutProgressBar = this._onMouseOutProgressBar.bind(this);
		this._onMouseDownProgressBarHandler = this._onMouseDownProgressBarHandler.bind(this);
		this._onMouseUp = this._onMouseUp.bind(this);

		this.onMouseMoveFunctionRef = null;
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (nextProps.duration && nextProps.duration !== 0 && !this.holding) {
			const lengthPerSecond = nextProps.duration === 0 ? 0 : this.state.barWidth / nextProps.duration;
			const length = nextProps.progress * lengthPerSecond;
			this.changeTranslate(length);
			this.shouldTogglePlayPause = nextProps.playing;

		}
		if (nextProps.chapters && nextProps.chapters.length > 0) {
			const lengthPerSecond = nextProps.duration === 0 ? 0 : this.state.barWidth / nextProps.duration;
			this.changeSteps(nextProps.chapters, lengthPerSecond);
		}
	}

	_onMouseOverProgressBar() {
		this.setState({ showHandler: true });
	}

	_onMouseOutProgressBar() {
		this.setState({ showHandler: false });
	}

	_onMouseDownProgressBar(e) {
		e.stopPropagation();
		if (!this.props.player.isLoaded) return;
		// console.log('Timeline: _onMouseDownProgressBar');
		if (this.shouldTogglePlayPause) { this.togglePlayPause(); }
		const timelineDisToLeft = e.target.parentNode.getBoundingClientRect().left;
		const newTranslate = e.pageX - timelineDisToLeft;
		this.changeTranslate(newTranslate);
		this.holding = true;
		this.onMouseMoveFunctionRef = this._onMouseMove(e.pageX, newTranslate);
		document.addEventListener('mousemove', this.onMouseMoveFunctionRef);
		document.addEventListener('mouseup', this._onMouseUp);
	}

	_onMouseDownProgressBarHandler(e) {
		e.stopPropagation();
		if (!this.props.player.isLoaded) return;
		this.holding = true;
		// console.log('Timeline: _onMouseDownProgressBarHandler');
		if (this.shouldTogglePlayPause) { this.togglePlayPause(); }
		this.onMouseMoveFunctionRef = this._onMouseMove(e.pageX, this.state.translate);
		document.addEventListener('mousemove', this.onMouseMoveFunctionRef);
		document.addEventListener('mouseup', this._onMouseUp);
	}

	_onMouseMove(mouseDownX, startTranslate) {
		return (event) => {
			if (this.holding) {
				const translate = (event.pageX - mouseDownX) + startTranslate;
				this.changeTranslate(translate);
				this.updateProgressTime((this.state.translate / this.state.barWidth) * this.duration);
			}
		};
	}

	_onMouseUp() {
		// console.log('Timeline: _onMouseUp()');
		/* When the _onMouseUp() event happen really quick after the _onMouseDownProgressBar(),
		 i.e. React hasn't called setState, enqueue a togglePlayPause() to the loop. */
		if (this.shouldTogglePlayPause && this.props.player.isPlaying) setTimeout(() => this.props.player.playPause(), 0);
		// Normally, when this.shouldTogglePlayPause is true, this.props.playing should be false, except the case above.
		if (this.shouldTogglePlayPause && !this.props.player.isPlaying) this.props.player.playPause();

		this.holding = false;
		this.setProgress((this.state.translate / this.state.barWidth) * this.duration);

		document.removeEventListener('mousemove', this.onMouseMoveFunctionRef);
		document.removeEventListener('mouseup', this._onMouseUp);
	}

	changeTranslate(newTranslate) {
		let translate = newTranslate;
		const max = this.state.barWidth;
		if (translate < 0) { translate = 0; }
		if (translate > max) { translate = max; }
		this.setState({ translate });
	}

	changeSteps(chapters, lengthPerSecond) {
		const flatternChapters = chapters.reduce((acc, val) => acc.concat(val.data), []).map(x => {
			x.time *= lengthPerSecond;
			return x;
		});
		this.setState({
			steps: flatternChapters
		});
	}

	setProgress(value) {
		this.props.player.currentTime = value;
	}

	updateProgressTime(value) {
		this.props.player.currentTime = value;
	}

	togglePlayPause() {
		this.props.player.playPause();
	}

	get current() {
		if (this.props.progress) return this.props.progress;
		else return 0;
	}

	get duration() {
		if (this.props.duration) return this.props.duration;
		else return 0;
	}

	componentDidMount() {
		this.updateDimensions();
		window.addEventListener("resize", this.updateDimensions.bind(this));
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions.bind(this));
	}

	updateDimensions() {
		this.setState({ barWidth: window.innerWidth });
		const lengthPerSecond = this.duration === 0 ? 0 : this.state.barWidth / this.duration;
		const length = this.current * lengthPerSecond;
		this.changeTranslate(length);
		this.shouldTogglePlayPause = this.props.player.isPlaying;
	}

	render() {
		const handlerWidth = 12;
		const handlerHeight = 12;
		const barHeight = 4;

		return (
			<div className="timeline" style={{ width: "100vw", transform: 'translateY(-0.5em)' }}>
				<ProgressBar
					width={this.state.barWidth}
					height={handlerHeight}
					barHeight={barHeight}
					handlerWidth={handlerWidth}
					translate={this.state.translate}
					duration={isNaN(this.duration) ? 0 : this.duration}
					onMouseDown={this._onMouseDownProgressBar}
					onMouseOver={this._onMouseOverProgressBar}
					onMouseOut={this._onMouseOutProgressBar}
					colour={'var(--active-text-colour)'}
					inactiveColour={'var(--inactive-text-colour)'}
					chapterColour={'var(--input-background-colour)'}
					steps={this.state.steps}
				>
					<ProgressBarHandler
						width={handlerWidth}
						height={handlerHeight}
						visibility={this.props.player.isLoaded && !isNaN(this.props.player.duration) && (this.state.showHandler || this.holding)}
						translate={`translate(${this.state.translate - (handlerWidth / 2)})`}
						onMouseDown={this._onMouseDownProgressBarHandler}
						colour={'var(--active-text-colour)'}
						inactiveColour={'var(--inactive-text-colour)'}
					/>
				</ProgressBar>
			</div>
		);
	}
})