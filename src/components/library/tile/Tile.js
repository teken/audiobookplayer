import React, {Component} from "react";

import withTheme from "../../theme/withTheme";
import FileService from "../../../uiservices/file";

export default withTheme(class Tile extends Component {

	get hasArtWork() {
		return this.props.work.art && this.props.work.art.length > 0;
	}

	get tilePicture() {
		if (this.hasArtWork) {
			const p = FileService.lookupFilePath(this.props.work.art[0]);
			return <img src={p} alt={this.props.work.name} style={{
				minWidth: '11em',
				minHeight: '11em',
				maxWidth: '100%',
				maxHeight: '12.5em'
			}}/>;
		}
		return '';
	}

	get hasPicture() {
		return this.props.work && this.props.work.art && this.props.work.art.length > 0;
	}

	get cleanedName() {
		const number = this.props.work.name.split(' ', 1)[0];
		return this.props.work.hasOwnProperty('series') && !isNaN(number) ? this.props.work.name.slice(number.length+1) : this.props.work.name;
	}

	get seriesName() {
		const number = this.props.work.name.split(' ', 1)[0];
		return isNaN(number) ? this.props.work.series : `${this.props.work.series} #${number}`;
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
						{this.props.work.hasOwnProperty('series') && <div style={{color:this.props.theme.secondaryText, fontSize:'.9em', padding:'0.1em 0 0'}}>({this.seriesName})</div>}
						<div style={{padding:'0.1em 0 0'}}>{this.props.work.author}</div>
					</div>
				</div>
			</div>
		);
	}
})

