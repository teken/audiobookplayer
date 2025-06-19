import React, {Component} from "react";
import ReactDOM from 'react-dom';

import idGenerator from "react-id-generator";

const portalRoot = document.getElementById('context-root');

export default class RightClickMenu extends Component {
	constructor(props) {
		super(props);
		this._onContextMenu = this._onContextMenu.bind(this);
		this._cancelContextMenu = this._cancelContextMenu.bind(this);
		this._click = this._click.bind(this);
		this.state = {
			show: false,
			x:0,
			y:0,
			width:10
		};
	}

	_onContextMenu(event) {
		if (this.state.show) {
			this.setState({
				show: false
			});
		} else {
			const maxWidth = window.innerWidth - (this.state.width * 16) - 20;
			const maxHeight = window.innerHeight - (this.state.width * 16);
			this.setState({
				show: true,
				x: event.clientX > maxWidth ? maxWidth : event.clientX,
				y: event.clientY > maxHeight ? maxHeight : event.clientY
			});
		}
	}

	_cancelContextMenu() {
		this.setState({
			show: false,
			x:0,
			y:0
		});
	}

	_click(callback) {
		this.setState({
			show: false
		});
		if (callback) callback();
	}

	renderContextPortal() {
		const options = this.props.options.filter(x => x);
		return ReactDOM.createPortal( <>
			<div onClick={this._cancelContextMenu} style={{
				display: this.state.show ? 'block' : 'none',
				position:'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				zIndex:'2000',
				cursor: 'default'
			}} />
			<div style={{
				display: this.state.show ? 'block' : 'none',
				position: 'absolute',
				top: this.state.y,
				left: this.state.x,
				zIndex:'2001',
				background: 'rgba(0,0,0,0.8)',
				padding: '0.3em',
				width: `${this.state.width}em`,
				textAlign: 'left',
				color: 'var(--active-text-colour)'
			}}>
				<div>
					{options.map((item, index) => {
						const notLast = options.length > index + 1;
						return <div key={idGenerator('right_click')} style={{
							padding: index === 0 ? '0 0 0.15em' : notLast ? '0.15em 0' : '0.15em 0 0',
							borderBottom: notLast ? `.1em solid var(--secondary-text-colour)` : '',
							cursor: 'pointer'
						}} onClick={() => this._click(item.onClick)}>
							{item.name}
						</div>
					})}
				</div>
			</div>
		</>, portalRoot)
	}

	render() {
		return (
			<>
				<div style={this.props.style} onContextMenu={this.state.show ? this._cancelContextMenu :this._onContextMenu}>
					{this.props.children}</div>
				{this.renderContextPortal()}
			</>
		);
	}
}