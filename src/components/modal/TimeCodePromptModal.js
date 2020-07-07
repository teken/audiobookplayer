import React from "react";

import ButtonRow from "../settings/ButtonRow";
import Model from "./Modal";

import Loading from "../loading/Loading";

export default class TimeCodePromptModal extends Model {

	constructor(props) {
		super(props);
		this.state = {
			hidden: true,
			hours: 0,
			minutes: 0,
			seconds: 0,
			timeString: '',
			timeInput: ''
			// timeString: '123456'
		};
		this.changeHours = this.changeHours.bind(this);
		this.changeMinutes = this.changeMinutes.bind(this);
		this.changeSeconds = this.changeSeconds.bind(this);
		this.changeTimeString = this.changeTimeString.bind(this);
		this.timeStringBlur = this.timeStringBlur.bind(this);
		this.hours = React.createRef();
	}

	componentDidMount() {
		this.changeTimeString({
			target: { value: '0' }
		})
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.show !== prevProps.show) {
			if (this.props.show) this.show();
			else this.hide();
			this.hours.current && this.hours.current.focus(); //TODO : not working
		}
	}

	okClick() {
		let timeCode = this.state.seconds;
		timeCode += this.state.minutes * 60;
		timeCode += this.state.hours * 3600;
		this.setState({ loading: true });
		this.props.okOnClick && this.props.okOnClick(timeCode);
		this.hide();
	}

	show() {
		super.show();
		this.hours.current && this.hours.current.focus(); //TODO : not working
	}

	hide() {
		super.hide();
		this.setState({
			hours: 0,
			minutes: 0,
			seconds: 0,
			timeInput: ''
		}, x => this.changeTimeString({ target: { value: '' } }));
	}

	changeHours(event) {
		this.setState({
			hours: Number(event.target.value)
		});
	}

	changeMinutes(event) {
		let value = Number(event.target.value);
		if (value < 0) value = 0;
		if (value > 59) value = 59;
		this.setState({
			minutes: value
		});
	}

	changeSeconds(event) {
		let value = Number(event.target.value);
		if (value < 0) value = 0;
		if (value > 59) value = 59;
		this.setState({
			seconds: value
		});
	}

	changeTimeString(event) {
		if (isNaN(event.target.value)) return;
		let value = event.target.value.replace(/^[0]*/, '');
		if (value.length < 6)
			value = '0'.repeat(6 - value.length) + value;

		let hours = Number(value.slice(0, -4));
		let minutes = Number(value.slice(-4, -2));
		let seconds = Number(value.slice(-2));
		this.setState({
			timeInput: event.target.value.replace(/^[0]*/, ''),
			timeString: value,
			hours: hours,
			minutes: minutes,
			seconds: seconds
		})
	}

	bondCheck(value) {
		if (value < 0) value = 0;
		if (value > 59) value = 59;
		return value;
	}

	timeStringBlur(event) {
		const timeString = `${this.state.hours}${this.bondCheck(this.state.minutes)}${this.bondCheck(this.state.seconds)}`
		this.setState({
			minutes: this.bondCheck(this.state.minutes),
			seconds: this.bondCheck(this.state.seconds),
			timeInput: timeString,
		}, x => this.changeTimeString({ target: { value: timeString } }));
	}

	get title() {
		return <h1>Please Enter Desired Time</h1>
	}

	get body() {
		const zeroStyle = {
			color: 'var(--inactive-text-colour)',
		}

		const digitStyle = {
			color: 'var(--active-text-colour)',
		}

		const seperatorStyle = {
			color: 'var(--inactive-text-colour)',
			fontSize: '.5em',
			paddingLeft: '.1em',
			paddingRight: '.5em'
		};
		const digitFunc = x => <span style={x === '0' ? zeroStyle : digitStyle}>{x}</span>;
		return <div style={{ backgroundColor: 'var(--input-background-colour)' }}>
			<div style={{ cursor: 'text', padding: '.3em .1em .1em .5em' }} onClick={x => this.hours.current.focus()}>
				{this.hoursText.map(digitFunc)}
				<span style={seperatorStyle}>h</span>
				{this.minutesText.map(digitFunc)}
				<span style={seperatorStyle}>m</span>
				{this.secondsText.map(digitFunc)}
				<span style={{ borderLeft: '1px solid ' + (document.activeElement === this.hours.current ? 'var(--active-text-colour)' : 'transparent') }}></span>
				<span style={{
					...seperatorStyle,
					paddingLeft: 'calc(.1em - 1px)'
				}}>s</span>
			</div>
			<input ref={this.hours} value={this.state.timeInput} style={{ position: 'absolute', width: '0', top: '-50px' }} onChange={this.changeTimeString} onBlur={this.timeStringBlur} />
		</div>
	}

	get hoursText() {
		return this.state.timeString.slice(0, -4).split()
	}

	get minutesText() {
		return this.state.timeString.slice(-4, -2).split()
	}

	get secondsText() {
		return this.state.timeString.slice(-2).split()
	}

	get buttons() {
		if (this.state.loading) {
			return <Loading />
		} else {
			return <ButtonRow buttonWidth={100} buttons={[
				{ value: "OK", onClick: this.okClick },
				{ value: "Cancel", onClick: super.cancelClick.bind(this) },
			]} />
		}
	}
}