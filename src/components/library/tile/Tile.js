import React, {Component} from 'react';

const fs = window.require('fs');

export default class Tile extends Component {

	get hasArtWork() {
		return this.props.work.art && this.props.work.art.length > 0;
	}

	get tilePicture() {
		if (this.hasArtWork && fs.existsSync(this.props.work.art[0].path)) {
			const p = this.props.work.art[0].path;
			return <img src={p} alt={this.props.work.name} style={{
				minHeight: '178px',
				maxWidth: '100%',
				maxHeight: '200px'
			}}/>;
		}
	}

	get hasPicture() {
		return this.props.work && this.props.work.art && this.props.work.art.length > 0;
	}

	render() {
		let s = {};
		if (!this.hasArtWork) s = {...s, height: '100%', minHeight: '200px'}; //, margin:'4em 0'
		return (
			<div onClick={this.props.onClick} style={{cursor:'pointer', border: this.props.isPlaying ? `1px solid ${this.props.styling.activeText}` : ''}}>
				<div>
					{this.tilePicture}
				</div>
				<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', ...s}}>
					<div style={{margin:'0 0.1em 0.1em'}}>
						{this.props.work.name}<br />
						{this.props.series && this.props.series.name}
						{this.props.series && (<br/>)}
						{this.props.author.name}
					</div>
				</div>
			</div>
		);
	}
}

