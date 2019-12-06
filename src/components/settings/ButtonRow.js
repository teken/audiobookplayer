import React, {Component} from "react";

export default class ButtonRow extends Component {
	render() {
		let buttonStyling = {
			width: this.props.buttonWidth,
			padding:' .5em 1em',
			fontSize:' 1em',
			border: 'none',
			cursor: 'pointer',
			margin: '0 .5em',
			backgroundColor: 'var(--input-background-colour)',
			color: 'var(--active-text-colour)',
		};
		return (
			<div style={{display:'flex', justifyContent:'center'}}>
				{this.props.buttons.map(button => {
					return <input type="button" key={button.value} value={button.value} style={buttonStyling} onClick={button.onClick}/>;
				})}
			</div>
		);
	}
}
