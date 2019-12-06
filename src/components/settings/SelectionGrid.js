import React, {Component} from "react";

export default class SelectionGrid extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedValue: props.selectedValue
		}
	}

	_onClick(value) {
		if (this.state.selectedValue === value) return;
		this.setState({
			selectedValue: value
		});
		this.props.onChange(value)
	}

	render() {
		return (
			<div style={{display:'grid', gridTemplateColumns: this.props.columnTemplate, padding: this.props.padding, ...this.props.style}}>
				{this.props.options.map(option =>
					<div
						onClick={() => this._onClick(option.value)}
						key={option.value}
						style={{cursor: 'pointer', boxShadow: this.state.selectedValue === option.value ? `${'var(--active-text-colour)'} 0 0 .1em 0` : 'none'}}
					>
						{option.cell}
					</div>
				)}
			</div>
		);
	}
}