import React, {Component} from "react";

export default class ColourSelector extends Component {
	constructor(props) {
		super(props);
		this.input = React.createRef();
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(event) {
		event.preventDefault();
		this.input.current.click();
	}

	render() {
		return (
			<span style={{display:'flex'}}>
				<input type="color" value={this.props.value} ref={this.input} onChange={this.props.onChange} style={{display:'none'}}/>
				<input type="text" readOnly={false} value={this.props.value} onClick={this.handleClick} onChange={this.props.onChange}
					   style={{
						   padding: '0.6em',
						   width:'100%',
						   backgroundColor: this.props.value,
						   borderColor: 'transparent'
					   }}/>
			</span>
		);
	}
}

