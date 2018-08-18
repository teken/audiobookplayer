import React, {Component} from 'react';

import ProgressBar from '../timeline/ProgressBar';
import ProgressBarHandler from '../timeline/ProgressBarHandler';

import withTheme from '../../theme/withTheme';

export default withTheme(class Volume extends Component {
	constructor(props) {
		super(props);
		this._player = props.player;

		this.state = {
			showHandler: false,
			barWidth: 100,
			translate: 0
		};
		this.holding = false;
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
			const lengthPerUnit = this.state.barWidth / nextProps.duration;
			const length = nextProps.progress * lengthPerUnit;
			this.changeTranslate(length);
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
		this.holding = true;
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
		this._player.volume = value;
	}

	updateProgressTime(value) {
		this._player.volume = value;
	}

	get current() {
		if (this.props.progress) return this.props.progress;
		else return 0;
	}

	get duration() {
		if (this.props.duration) return this.props.duration;
		else return 0;
	}

	render() {
		const handlerWidth = 12;
		const handlerHeight = 12;
		const containerWidth = this.state.barWidth;
		const barHeight = 4;

		return (
			<span>
				<ProgressBar
					width={containerWidth}
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
						visibility={this.state.showHandler || this.holding}
						translate={`translate(${this.state.translate - (handlerWidth / 2)})`}
						onMouseDown={this._onMouseDownProgressBarHandler}
						colour={this.props.theme.activeText}
						inactiveColour={this.props.theme.inactiveText}
					/>
				</ProgressBar>
			</span>
		);
	}
})