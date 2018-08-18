import React, {Component} from 'react';

import ProgressBar from './ProgressBar';
import ProgressBarHandler from './ProgressBarHandler';

import withTheme from '../../theme/withTheme';

export default withTheme(class Timeline extends Component {
	constructor(props) {
		super(props);
		this._player = props.player;

		this.state = {
			showHandler: false,
			barWidth: window.innerWidth,
			translate: 0
		};
		this.holding = false;
		this.shouldTogglePlayPause = this._player.isPlaying;
		this.changeTranslate = this.changeTranslate.bind(this);
		this._onMouseDownProgressBar = this._onMouseDownProgressBar.bind(this);
		this._onMouseOverProgressBar = this._onMouseOverProgressBar.bind(this);
		this._onMouseOutProgressBar = this._onMouseOutProgressBar.bind(this);
		this._onMouseDownProgressBarHandler = this._onMouseDownProgressBarHandler.bind(this);
		this._onMouseUp = this._onMouseUp.bind(this);

		this.onMouseMoveFunctionRef = null;
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.duration && nextProps.duration !== 0 && !this.holding) {
			const lengthPerSecond = nextProps.duration === 0 ? 0 : this.state.barWidth / nextProps.duration;
			const length = nextProps.progress * lengthPerSecond;
			this.changeTranslate(length);
			this.shouldTogglePlayPause = nextProps.playing;
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
		if (!this._player.isLoaded) return;
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
		if (!this._player.isLoaded) return;
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
		if (this.shouldTogglePlayPause && this._player.isPlaying) setTimeout(() => this._player.playPause(), 0);
		// Normally, when this.shouldTogglePlayPause is true, this.props.playing should be false, except the case above.
		if (this.shouldTogglePlayPause && !this._player.isPlaying) this._player.playPause();

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

	setProgress(value) {
		this._player.currentTime = value;
	}

	updateProgressTime(value) {
		this._player.currentTime = value;
	}

	togglePlayPause() {
		this._player.playPause();
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
		this.shouldTogglePlayPause = this._player.isPlaying;
	}

	render() {
		const handlerWidth = 12;
		const handlerHeight = 12;
		const barHeight = 4;

		return (
			<div className="timeline" style={{ width: "100%", transform: 'translateY(-0.5em)' }}>
				<ProgressBar
					width={this.state.barWidth}
					height={handlerHeight}
					barHeight={barHeight}
					handlerWidth={handlerWidth}
					translate={this.state.translate}
					duration={this.duration}
					onMouseDown={this._onMouseDownProgressBar}
					onMouseOver={this._onMouseOverProgressBar}
					onMouseOut={this._onMouseOutProgressBar}
					colour={this.props.theme.activeText}
					inactiveColour={this.props.theme.inactiveText}
				>
					<ProgressBarHandler
						width={handlerWidth}
						height={handlerHeight}
						visibility={this._player.isLoaded && (this.state.showHandler || this.holding)}
						translate={`translate(${this.state.translate - (handlerWidth / 2)})`}
						onMouseDown={this._onMouseDownProgressBarHandler}
						colour={this.props.theme.activeText}
						inactiveColour={this.props.theme.inactiveText}
					/>
				</ProgressBar>
			</div>
		);
	}
})