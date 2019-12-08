import React, {Component} from "react";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";

const {dialog} = window.require('electron').remote;

export default class FolderSelector extends Component {
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
		const value = dialog.showOpenDialogSync({
			properties: ['openDirectory'],
			defaultPath: this.textInput.current.value,
		});
		if (value) {
			this.textInput.current.value = value[0];
			this.props.onChange({target: this.textInput.current});
			this.setState({value: value[0]});
		}
	}

	render() {
		return (
			<span style={{display:'flex', color: 'var(--active-text-colour)'}}>
				<Icon icon="folder-open" onClick={this.handleClick} style={{
					width:'10%',
					fontSize: '1.5em',
					padding: '.5em 0',
					backgroundColor: 'var(--input-background-colour)',
					cursor:'pointer'
				}} />
				<input type="text" readOnly={true} defaultValue={this.props.value} ref={this.textInput} onClick={this.handleClick}
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

