import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import ReactTable from "react-table";

import Loading from "../loading/Loading";

import "react-table/react-table.css";

import withTheme from "../theme/withTheme";
import withPlayer from "../player/withPlayer";
import ChapterService from "../../uiservices/chapters";
import FileService from "../../uiservices/file";
import StateService from "../../uiservices/state";
import LibraryService from "../../uiservices/library";

export default withRouter(withTheme(withPlayer(class Detail extends Component {
	constructor(props) {
		super(props);
		this._tracks = [];
		this.state = {
			work: null,
			loading: true,
			saveTime: null
		};
	}

	componentDidMount() {
		const {
			author,
			series,
			book
		} = this.props.match.params;
		const key = series ? `${author}/${series}/${book}` : `${author}/${book}`;
		const work = LibraryService.getWork(key);
		this.setState({
			state: StateService.getState(key),
			work: work,
			loading: false
		});

		this.chapterService = new ChapterService(work);
	}

	get cleanedName() {
		const number = this.state.work.name.slice(0, 3).trim();
		return this.state.work.hasOwnProperty("series") && !isNaN(number) ? this.state.work.name.slice(3) : this.state.work.name;
	}

	get seriesName() {
		const number = this.state.work.name.slice(0, 3).trim();
		return isNaN(number) ? this.state.work.series : `${this.state.work.series} #${number}`;
	}
	get hasArtwork() {
		return this.state.work && this.state.work.art.length > 0;
	}

	render() {
		const tracks = this.state.work ? this.state.work.tracks : [];
		const data = tracks.reduce((a,v,i) => {
			if (i === 0) v.startTime = 0;
			else v.startTime = tracks.slice(0, i).reduce((a, v) => a + v.duration, 0);
			v.endTime = v.startTime + v.duration;
			return a.concat(v);
		},[]);

		const totalSize = data.map( track => track.size).reduce((a,v) => a + v, 0);
		const totalLength = data.map( track => track.duration).reduce((a,v) => a + v, 0);

		const chapters = this.chapterService ? this.chapterService.chapters : [];

		const widths = this.hasArtwork ? '25%' : '33%';

		return (
			<div className="detail">
				{this.state.loading ? (
					<Loading />
				) : (
					<div>
						<div style={{color: this.props.theme.secondaryText}}>
							<div style={{display:'flex', justifyContent: 'space-between', color: this.props.theme.secondaryText, alignItems: 'flex-end'}}>
								<div style={{width:widths}}>

								</div>
								{this.hasArtwork && <div style={{width:widths, alignSelf: 'center'}}>
									<img src={FileService.lookupFilePath(this.state.work.art[0])} alt={this.cleanedName} style={{
										minWidth: '11em',
										minHeight: '11em',
										maxWidth: '100%',
										maxHeight: '12.5em',
										float: 'right',
										paddingRight: '.5em',
									}}/>
								</div>}
								<div style={{width:widths}}>
									<div style={this.hasArtwork ? {float:'left', textAlign:'left', paddingLeft:'.5em'} : {}}>
										<h1 style={{color:this.props.theme.primaryText}}>{this.cleanedName}</h1>
										{this.state.work.hasOwnProperty("series") && <h3 style={{color:this.props.theme.secondaryText}}>({this.seriesName})</h3>}
										<h2 style={{fontWeight:400, color:this.props.theme.primaryText}}>By {this.state.work.author}</h2>
										<div>
											Total Length: {this.formatTime(totalLength)}
										</div>
										<div>
											Total Size: {this.formatBytes(totalSize)}
										</div>
										<br/>
										{
											this.state.saveTime !== null && (
												<div style={{cursor:'pointer', color:this.props.theme.activeText}} onClick={() =>
													this.props.player.open(this.state.work.key, () => {
														this.props.player.play();
														this.props.player.currentTime = this.state.saveTime;
														})
													}
												>
													Saved Time: {this.formatTime(this.state.saveTime)}
												</div>
											)
										}
									</div>
								</div>
								<div style={{width:widths}}>

								</div>
							</div>
							<div>
								<ReactTable
									className="-striped -highlight"
									data={data}
									noDataText="No tracks found"
									columns={[
										{Header: 'Name', accessor: 'key', Cell: props => {
											const i = props.value.lastIndexOf('/');
											return i > 0 ? props.value.slice(i + 1) : props.value;
											}},
										{Header: 'Length', maxWidth: 100, accessor: 'duration', Cell: props => this.formatTime(props.value)},
										// {Header: 'Start Time', maxWidth: 100, accessor: 'startTime', Cell: props => this.formatTime(props.value)},
										// {Header: 'End Time', maxWidth: 100, accessor: 'endTime', Cell: props => this.formatTime(props.value)},
										// {Header: 'Size', maxWidth: 100, accessor: 'size', Cell: props => this.formatBytes(props.value)},
									]}
									minRows={0}
									defaultPageSize={data.length}
									showPagination={false}
									sortable={false}
									getTdProps={(state, rowInfo) => {
										return {
											style:{ cursor: 'pointer', color: this.props.theme.activeText},
											onDoubleClick: (e, handleOriginal) => {
												this.props.player.openFromSpecificTrack(this.state.work.key, rowInfo.row.name, () => { this.props.player.play()});
												if (handleOriginal) handleOriginal();
											}
										};
									}}
									SubComponent={row => {
										const rows = chapters.find(x => x.name === row.row.name);
										const track = row.original;
										return (
											<div style={{padding:'1em'}}>
												<div style={{
													display: 'flex',
													justifyContent: 'space-between'
												}}>
													<div>Length: {this.formatTime(track.duration)}</div>
													<div>Start Time: {this.formatTime(track.startTime)}</div>
													<div>End Time: {this.formatTime(track.endTime)}</div>
													<div>Size: {this.formatBytes(track.size)}</div>
													<div>Chapters: {rows ? rows.data.length : 1}</div>
												</div>

												{rows && (
													<ReactTable
														className="-striped -highlight"
														data={rows.data}
														noDataText="No chapters found"
														columns={[
															{Header: 'Chapter Name', accessor: 'name'},
															{Header: 'Time Code', maxWidth: 200, accessor: 'time', Cell: props => this.formatTime(props.value)},
														]}
														minRows={0}
														defaultPageSize={rows.data.length}
														showPagination={false}
														sortable={false}
														getTdProps={(state, rowInfo) => {
															return {
																style:{ cursor: 'pointer', color: this.props.theme.activeText},
																onDoubleClick: (e, handleOriginal) => {
																	this.props.player.open(this.state.work.key, () => {
																		this.props.player.play();
																		this.props.player.currentTime = rowInfo.row.time;
																	});
																	if (handleOriginal) handleOriginal();
																}
															};
														}}
													/>
												)}
											</div>
										);
									}}
								/>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}

	formatBytes(bytes,decimals) {
		if(bytes === 0) return '0 Bytes';
		const k = 1024,
			dm = decimals || 2,
			sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
			i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}

	formatTime(time) {
		if (!time) time = 0;
		return new Date(1000 * time).toISOString().substr(11, 8);
	}
})))

