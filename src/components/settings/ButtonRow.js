import React, {Component} from 'react';

import withTheme from '../theme/withTheme';

export default withTheme(class ButtonRow extends Component {
	render() {
		let buttonStyling = {
			width: this.props.buttonWidth,
			padding:' .5em 1em',
			fontSize:' 1em',
			border: 'none',
			cursor: 'pointer',
			margin: '0 .5em',
			backgroundColor: this.props.theme.inputBackground,
			color: this.props.theme.activeText,
		};
		return (
			<div style={{display:'flex', justifyContent:'center'}}>
				{this.props.buttons.map(button => {
					return <input type="button" key={button.value} value={button.value} style={buttonStyling} onClick={button.onClick}/>;
				})}
			</div>
		);
	}
})

