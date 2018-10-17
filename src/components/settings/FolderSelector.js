import React, {Component} from "react";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";

import withTheme from "../theme/withTheme";

const {dialog} = window.require('electron').remote;

export default withTheme(class FolderSelector extends Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.textInput = React.createRef();
	}

	handleChange(event) {
		this.setState({value: event.target.value});
	}

	handleClick(event) {
		event.preventDefault();
		const value = dialog.showOpenDialog({
			properties: ['openDirectory'],
			defaultPath: this.textInput.current.value,
		});
		if (value) {
			this.textInput.current.value = value[0];
			this.props.onChange({target: this.textInput.current});
		}
	}

	render() {
		return (
			<span style={{display:'flex', color: this.props.theme.activeText}}>
				<Icon icon="folder-open" onClick={this.handleClick} style={{
					width:'10%',
					fontSize: '1.5em',
					padding: '.5em 0',
					backgroundColor: this.props.theme.inputBackground,
					cursor:'pointer'
				}} />
				<input type="text" readOnly='false' value={this.props.value} ref={this.textInput} onClick={this.handleClick} onChange={this.props.onChange}
				 	style={{
						padding: '0.6em',
						width:'90%',
						borderColor: 'transparent',
						color: this.props.theme.activeText,
						backgroundColor: this.props.theme.inputBackground,
						cursor:'pointer'
					}}/>
			</span>
		);
	}
})

