import React, {Component} from 'react';

import ButtonRow from '../settings/ButtonRow';

const {app/*, process*/} = window.require('electron').remote;

export default class AboutModal extends Component {

	constructor(props) {
		super(props);
		this.okClick = this.okClick.bind(this);
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
		if (event.key === 'Escape' || event.keyCode === 27) this.okClick();
		if (event.key === 'Enter' || event.keyCode === 12) this.okClick();
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
					background: this.props.styling.background,
					gridTemplateRows: '1fr auto 1fr',
					width: '90%',
				}}>
					<div style={{padding:'0 1em', ...centreStyle}}><h1>About</h1></div>
					<div style={{padding:'0 1em', color: this.props.styling.secondaryText, ...centreStyle}}>
						Audio Book Player: v{app.getVersion()}<br/>
						Created By Duncan Haig<br/>
						Copywrite 2018 Duncan Haig<br/>
						{/*<br/>*/}
						{/*Electron: v{process.versions.electron}<br/>*/}
						{/*Node: v{process.versions.node}<br/>*/}
						{/*Chrome: v{process.versions.chrome}<br/>*/}
						<br/>
					</div>
					<div style={{padding:'0 1em', ...centreStyle}}>
						<ButtonRow styling={this.props.styling} buttonWidth={100} buttons={[
							{value:"OK", onClick:this.okClick},
						]}/>
					</div>
				</div>
			</div>
		);
	}
}