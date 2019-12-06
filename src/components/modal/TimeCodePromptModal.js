import React from "react";

import ButtonRow from "../settings/ButtonRow";
import Model from "./Modal";

import Loading from "../loading/Loading";

export default class TimeCodePromptModal extends Model {

	constructor(props) {
		super(props);
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
			seconds: 0
		});
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

	get title() {
		return <h1>Please Enter Desired Time</h1>
	}

	get body() {
		const inputStyle = {
			width: '2em',
			border:'none',
			backgroundColor: 'transparent',
			color: 'var(--active-text-colour)',
			fontSize: '1em',
			textAlign: 'center'
		};
		return <div style={{backgroundColor: 'var(--input-background-colour)'}}>
			<input ref={this.hours} className="spinnerless" type="number" style={inputStyle} placeholder="00" value={this.state.hours} onChange={this.changeHours} onKeyPress={this.changeHours}/>:
			<input className="spinnerless" type="number" style={inputStyle} placeholder="00" value={this.state.minutes} onChange={this.changeMinutes} onKeyPress={this.changeMinutes}/>:
			<input className="spinnerless" type="number" style={inputStyle} placeholder="00" value={this.state.seconds} onChange={this.changeSeconds} onKeyPress={this.changeSeconds}/>
		</div>
	}

	get buttons() {
		if (this.state.loading) {
			return <Loading />
		} else {
			return <ButtonRow buttonWidth={100} buttons={[
				{value:"OK", onClick:this.okClick},
				{value:"Cancel", onClick:super.cancelClick},
			]}/>
		}
	}
}