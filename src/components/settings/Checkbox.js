import React, {Component} from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';

export default class Checkbox extends Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.textInput = React.createRef();
		this.state = {
			value: this.props.value
		}
	}

	handleChange(event) {
		this.setState({value: event.target.value});
	}

	handleClick(event) {
		event.preventDefault();
		this.setState({
			value: !this.state.value
		})
		this.props.onChange({target:{value:this.state.value}})
	}

	render() {
		return (
			<span style={{display:'flex', color: this.props.styling.activeText}}>
				<Icon icon={this.state.value ? "check-square" : 'square' } onClick={this.handleClick} style={{
					width:'10%',
					fontSize: '1.5em',
					padding: '.5em 0',
					backgroundColor: this.props.styling.inputBackground,
					cursor:'pointer'
				}} />
				<input type="text" readOnly='false' value={this.state.value} ref={this.textInput} onClick={this.handleClick}
				 	style={{
						padding: '0.6em',
						width:'90%',
						borderColor: 'transparent',
						color: this.props.styling.activeText,
						backgroundColor: this.props.styling.inputBackground,
						cursor:'pointer'
					}}/>
			</span>
		);
	}
}

