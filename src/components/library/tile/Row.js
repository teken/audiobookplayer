import React from "react";

import withTheme from "../../theme/withTheme";
import Item from "./Item";

export default withTheme(class Row extends Item {

	get tilePicture() {
		if (this.hasArtWork) {
			const p = this.props.work.art[0].path;
			return <img src={p} alt={this.props.work.name} style={{
				minWidth: '5em',
				minHeight: '5em',
				maxWidth: '100%',
				maxHeight: '6.75em'
			}}/>;
		}
		return '';
	}

	render() {
		let s = {};
		if (!this.hasArtWork) s = {...s, height: '100%', minHeight: '6.75em'}; //, margin:'4em 0'
		return (
			<div onClick={this.props.onClick} style={{
				cursor: 'pointer',
				border: this.props.isPlaying ? `.1em solid ${this.props.theme.activeText}` : '',
				display: 'flex'
			}}>

				<div>
					{this.tilePicture}
				</div>
				<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width:'100%', ...s}}>
					<div style={{margin:'0.2em 0.1em 0.4em'}}>
						<div style={{fontWeight:600}}>{this.cleanedName}</div>
						{this.props.series && <div style={{color:this.props.theme.secondaryText, fontSize:'.9em', padding:'0.1em 0 0'}}>({this.seriesName})</div>}
						<div style={{padding:'0.1em 0 0'}}>{this.props.author.name}</div>
					</div>
				</div>
			</div>
		);
	}
})

