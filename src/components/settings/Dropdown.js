import React, {Component} from "react";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";

import withTheme from "../theme/withTheme";

export default withTheme(class Dropdown extends Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.textInput = React.createRef();
	}

	handleChange(event) {
		//this.setState({value: event.target.value});
		this.props.onChange({target: this.textInput.current});
	}

	handleClick(event) {
		this.textInput.current.click();

	}

	render() {
		return (
			<span style={{display:'flex', color: this.props.theme.activeText}}>
				<Icon icon="caret-down" onClick={this.handleClick} style={{
					width:'10%',
					fontSize: '1.5em',
					padding: '.5em 0',
					backgroundColor: this.props.theme.inputBackground,
					cursor:'pointer'
				}} />
				<select type="text" readOnly='false' value={this.props.value} ref={this.textInput} onChange={this.handleChange}
				 	style={{
						padding: '0.6em',
						width:'90%',
						borderColor: 'transparent',
						color: this.props.theme.activeText,
						backgroundColor: this.props.theme.inputBackground,
						cursor:'pointer'
					}}>
					{this.props.options.map(option => <option key={option.value} value={option.value}>{option.name}</option>)}
				</select>
			</span>
		);
	}
})

