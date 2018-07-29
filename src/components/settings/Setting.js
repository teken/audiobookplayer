import React, {Component} from 'react';

export default class Setting extends Component {
	render() {
		return (
			<div style={{...this.props.style, marginBottom:'1em'}}>
				<div style={{marginBottom:'0.2em'}}
				>{this.props.label}</div>
				{this.props.children}
			</div>
		);
	}
}

