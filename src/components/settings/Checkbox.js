import React, {Component} from "react";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";


export default class Checkbox extends Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.textInput = React.createRef();

		this.state = {
			value: Boolean(this.props.value)
		};
	}
	componentDidUpdate(oldProps) {
		if (oldProps.value !== this.props.value)
			this.setState({
				value: Boolean(this.props.value)
			});
	}

	handleChange(event) {
		this.setState({value: event.target.value});
	}

	handleClick(event) {
		event.preventDefault();
		this.setState({
			value: !this.state.value
		});
		this.props.onChange({target:{value:!this.state.value}})
	}

	render() {
		return (
			<span style={{display:'flex', color: 'var(--active-text-colour)'}}>
				<Icon icon={this.state.value ? "check-square" : 'square' } onClick={this.handleClick} style={{
					width:'10%',
					fontSize: '1.5em',
					padding: '.5em 0',
					backgroundColor: 'var(--input-background-colour)',
					cursor:'pointer'
				}} />
				<input type="text" readOnly={true} value={this.state.value ? "Yes" : "No"} ref={this.textInput} onClick={this.handleClick}
				 	style={{
						padding: '0.6em',
						width:'90%',
						borderColor: 'transparent',
						color: 'var(--active-text-colour)',
						backgroundColor: 'var(--input-background-colour)',
						cursor:'pointer'
					}}/>
			</span>
		);
	}
}
