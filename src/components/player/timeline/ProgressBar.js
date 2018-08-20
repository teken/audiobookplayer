import React, {Component} from 'react';

export default class ProgressBar extends Component {
	render() {
		const diff = (this.props.height - this.props.barHeight) / 2;
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width={this.props.width}
				height={this.props.height}
				viewBox={`0 0 ${this.props.width} ${this.props.height}`}
				onMouseOver={this.props.onMouseOver}
				onMouseOut={this.props.onMouseOut}
			>
				<g onMouseDown={this.props.onMouseDown}>
					{/* A rect to expand the area of clicking */}
					<rect
						x={0}
						y={0}
						width={this.props.width}
						height={this.props.height}
						opacity="0"
					/>
					<rect
						x={0}
						y={diff}
						width={this.props.width}
						height={this.props.barHeight}
						fill={this.props.inactiveColour}
					/>
					<rect
						x={0}
						y={diff}
						width={this.props.translate}
						height={this.props.barHeight}
						fill={this.props.colour}
					/>
					{ (this.props.steps ? this.props.steps : []).map(step =>
						<rect
							x={step.time}
							y={diff}
							width={2}
							height={this.props.barHeight}
							fill='black'//{this.props.colour}
						>
							<title>
								{step.name}
							</title>
						</rect>
					)}
				</g>
				{ this.props.children }
			</svg>
		);
	}
}