import React, {Component} from 'react';

import withTheme from '../../theme/withTheme';

const fs = window.require('fs');

export default withTheme(class Tile extends Component {

	get hasArtWork() {
		return this.props.work.art && this.props.work.art.length > 0;
	}

	get tilePicture() {
		if (this.hasArtWork && fs.existsSync(this.props.work.art[0].path)) {
			const p = this.props.work.art[0].path;
			return <img src={p} alt={this.props.work.name} style={{
				minHeight: '11em',
				maxWidth: '100%',
				maxHeight: '12.5em'
			}}/>;
		}
	}

	get hasPicture() {
		return this.props.work && this.props.work.art && this.props.work.art.length > 0;
	}

	render() {
		let s = {};
		if (!this.hasArtWork) s = {...s, height: '100%', minHeight: '12.5em'}; //, margin:'4em 0'
		return (
			<div onClick={this.props.onClick} style={{cursor:'pointer', border: this.props.isPlaying ? `.1em solid ${this.props.theme.activeText}` : ''}}>
				<div>
					{this.tilePicture}
				</div>
				<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', ...s}}>
					<div style={{margin:'0.2em 0.1em 0.4em'}}>
						<div style={{fontWeight:600, fontSize: '1.1em'}}>{this.props.work.name}</div>
						{this.props.series && <div style={{color:this.props.theme.secondaryText, fontSize:'.9em', padding:'0.1em 0 0'}}>({this.props.series.name})</div>}
						<div style={{padding:'0.1em 0 0'}}>{this.props.author.name}</div>
					</div>
				</div>
			</div>
		);
	}
})

