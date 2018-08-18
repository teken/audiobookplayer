import React, {Component} from 'react';

import ButtonRow from '../settings/ButtonRow';

import withTheme from '../theme/withTheme';

export default class Modal extends Component {

	constructor(props) {
		super(props);
		this.okClick = this.okClick.bind(this);
		this.cancelClick = this.cancelClick.bind(this);
		this.state = {
			hidden:true
		}
	}
	componentDidUpdate(prevProps, prevState) {
		if (this.props.show !== prevProps.show) {
			if (this.props.show) this.show();
			else this.hide();
		}
	}

	okClick() {
		this.props.okOnClick && this.props.okOnClick();
		this.hide();
	}

	cancelClick() {
		this.props.cancelOnClick && this.props.cancelOnClick();
		this.hide();
	}

	show() {
		this.setState({
			hidden: false
		});
		window.addEventListener('keydown', this.listenKeyboard.bind(this), true);
	}

	hide() {
		this.setState({
			hidden: true
		});
		window.removeEventListener('keydown', this.listenKeyboard.bind(this), true);
	}

	listenKeyboard(event) {
		if (event.key === 'Escape' || event.keyCode === 27) this.cancelClick();
	}

	render() {
		let centreStyle = {
			display: this.state.hidden ? 'none' : 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		};
		return (
			<div style={{
				position:'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, .65)',
				...centreStyle,
				zIndex:'9000'
			}}>
				<div style={{
					display: this.state.hidden ? 'none' : 'grid',
					background: this.props.theme.background,
					gridTemplateRows: '1fr 1fr 1fr',
					width: '90%',
					height: '40%'
				}}>
					<div style={{padding:'0 1em', ...centreStyle}}><h1>{this.props.heading}</h1></div>
					<div style={{padding:'0 1em', color: this.props.theme.secondaryText, ...centreStyle}}>{this.props.body}</div>
					<div style={{padding:'0 1em', ...centreStyle}}>
						<ButtonRow buttonWidth={100} buttons={[
							{value:"OK", onClick:this.okClick},
							{value:"Cancel", onClick:this.cancelClick},
						]}/>
					</div>
				</div>
			</div>
		);
	}
}