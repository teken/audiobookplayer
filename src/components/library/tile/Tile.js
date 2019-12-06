import React from "react";
import LazyLoad from 'react-lazy-load';

import withTheme from "../../theme/withTheme";
import Item from "./Item";

export default withTheme(class Tile extends Item {

	get tilePicture() {
		if (this.hasArtWork) {
			const p = this.props.work.art[0].path;
			return <LazyLoad width={176} offset={500} debounce={false}
			><img src={p} alt={this.props.work.name} style={{
				minWidth: '11em',
				minHeight: '11em',
				maxWidth: '100%',
				maxHeight: '12.5em'
			}}/></LazyLoad>;
		}
		return '';
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
						<div style={{fontWeight:600, fontSize: '1.1em'}}>{this.cleanedName}</div>
						{this.props.series && <div style={{color:this.props.theme.secondaryText, fontSize:'.9em', padding:'0.1em 0 0'}}>({this.seriesName})</div>}
						<div style={{padding:'0.1em 0 0'}}>{this.props.author.name}</div>
					</div>
				</div>
			</div>
		);
	}
})

