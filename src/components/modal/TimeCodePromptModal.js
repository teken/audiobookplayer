import React, {Component} from 'react';

import ButtonRow from '../settings/ButtonRow';

export default class TimeCodePromptModal extends Component {

	constructor(props) {
		super(props);
		this.okClick = this.okClick.bind(this);
		this.cancelClick = this.cancelClick.bind(this);
		this.state = {
			hidden:true,
			hours: 0,
			minutes: 0,
			seconds: 0
		};
		this.changeHours = this.changeHours.bind(this);
		this.changeMinutes = this.changeMinutes.bind(this);
		this.changeSeconds = this.changeSeconds.bind(this);
		this.hours = React.createRef();
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
		this.props.okOnClick && this.props.okOnClick(timeCode);
		this.hide();
	}

	cancelClick() {
		this.props.cancelOnClick && this.props.cancelOnClick();
		this.hide();
	}

	show() {
		this.setState({
			hidden: false
		});
		window.addEventListener('keydown', this.listenKeyboard.bind(this), true);
	}

	hide() {
		this.setState({
			hidden: true,
			hours: 0,
			minutes: 0,
			seconds: 0
		});
		window.removeEventListener('keydown', this.listenKeyboard.bind(this), true);
	}

	listenKeyboard(event) {
		if (event.key === 'Escape' || event.keyCode === 27) this.cancelClick();
		if (event.key === 'Enter' || event.keyCode === 12) this.okClick();
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

	render() {
		let centreStyle = {
			display: this.state.hidden ? 'none' : 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		};
		let inputStyle = {
			width: '2em',
			border:'none',
			backgroundColor: 'transparent',
			color: this.props.styling.activeText,
			fontSize: '1em',
			textAlign: 'center'
		};
		return (
			<div style={{
				position:'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, .65)',
				...centreStyle,
				zIndex:'9000'
			}}>
				<div style={{
					display: this.state.hidden ? 'none' : 'grid',
					background: this.props.styling.background,
					gridTemplateRows: '1fr 1fr 1fr',
					width: '90%',
					height: '40%'
				}}>
					<div style={{padding:'0 1em', ...centreStyle}}><h1>Please Enter Desired Time</h1></div>
					<div style={{padding:'0 1em', color: this.props.styling.secondaryText, ...centreStyle}}>
						<div style={{backgroundColor: this.props.styling.inputBackground}}>
							<input ref={this.hours} className="spinnerless" type="number" style={inputStyle} placeholder="00" value={this.state.hours} onChange={this.changeHours}/>:
							<input className="spinnerless" type="number" style={inputStyle} placeholder="00" value={this.state.minutes} onChange={this.changeMinutes}/>:
							<input className="spinnerless" type="number" style={inputStyle} placeholder="00" value={this.state.seconds} onChange={this.changeSeconds}/>
						</div>
					</div>
					<div style={{padding:'0 1em', ...centreStyle}}>
						<ButtonRow styling={this.props.styling} buttonWidth={100} buttons={[
							{value:"OK", onClick:this.okClick},
							{value:"Cancel", onClick:this.cancelClick},
						]}/>
					</div>
				</div>
			</div>
		);
	}
}