import React, {Component} from "react";

import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";

export default class IconButton extends Component {
	constructor(props) {
		super(props);
		this.state = {
			hover: false
		}
		this._onMouseOut = this._onMouseOut.bind(this);
		this._onMouseOver = this._onMouseOver.bind(this);
	}

	_onMouseOut() {
		this.setState({
			hover: false
		});
	}

	_onMouseOver() {
		this.setState({
			hover: true
		});
	}

	render() {
		return (
			<span style={{...this.props.style, ...(this.state.hover ? this.props.hoverStyle : {})}}
			   onClick={this.props.onClick}
			   title={this.props.title}
			   onMouseOver={this._onMouseOver}
			   onMouseOut={this._onMouseOut}
			>
				<Icon icon={this.props.icon} style={this.props.svgStyle}/>
			</span>
		);
	}
}