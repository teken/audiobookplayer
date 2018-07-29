import React, {Component} from 'react';

export default class ProgressBarHandler extends Component {
	render() {
		return (
			<g
				visibility={this.props.visibility ? 'visible' : 'hidden'}
				transform={this.props.translate}
				onMouseDown={this.props.onMouseDown}
			>
				<rect x={0} y="0" width={this.props.width} height={this.props.height} fill={this.props.colour} />
				<rect x={this.props.width / 3} y={this.props.height / 3} width={this.props.width / 3} height={this.props.height / 3} fill={this.props.inactiveColour} />
			</g>
		);
	}
}