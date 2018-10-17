import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import ReactTable from "react-table";

import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import Loading from "../loading/Loading";

import "react-table/react-table.css";

import withTheme from "../theme/withTheme";
import withPlayer from "../player/withPlayer";
import ChapterService from "../../uiservices/chapters";

const mm = window.require('music-metadata');
const {ipcRenderer} = window.require('electron');

export default withRouter(withTheme(withPlayer(class Detail extends Component {
	constructor(props) {
		super(props);
		this._tracks = [];
		this.state = {
			author: null,
			work: null,
			loading: true,
			book: null,
			saveTime: null
		};
	}

	componentDidMount() {
		let work = ipcRenderer.sendSync('library.getWork', this.props.workId);
		let author = ipcRenderer.sendSync('library.getAuthor', work.author_id);
		let book = work.type === 'BOOK' ? work : work.books.find(x=> x.name === this.props.bookName);
		const key = [
			author.name,
			work.type === 'SERIES' ? work.name : '',
			book.name,
		].filter(x => x.length > 0).join('##');
		let time = ipcRenderer.sendSync('timings.get', {key:key});
		this.setState({
			author: author,
			work: work,
			loading: false,
			book: book,
			saveTime: time.success ? time.time : null
		});
		this.loadTrackLengthData(book);

		this.chapterService = new ChapterService(book);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.workId !== this.props.workId || prevProps.bookName !== this.props.bookName) {
			let book = this.state.work.type === 'BOOK' ? this.state.work : this.state.work.books.find(x=> x.name === this.props.bookName);
			const key = [
				this.state.author.name,
				this.state.work.type === 'SERIES' ? this.state.work.name : '',
				book.name,
			].filter(x => x.length > 0).join('##');
			let time = ipcRenderer.sendSync('timings.get', {key:key});
			this.setState({
				book: book,
				saveTime: time.success ? time.time : null
			});
			this.loadTrackLengthData(book);
		}
	}

	loadTrackLengthData(book) {
		this._tracks = book.tracks;
		if (!this.item.trackMetaData) book.tracks.forEach(track => {
			mm.parseFile(track.path).then(metadata => {
				if (!this._tracks.find(t => t.path === track.path)) return;
				this._tracks.find(t => t.path === track.path).meta = metadata;
				this.item.trackMetaData = true;
				this.forceUpdate()
			}).catch(error => {
				console.error(error)
			})
		})
	}

	get item() {
		if (this.state.work) return this.state.work.type === 'BOOK' ? this.state.work : this.state.work.books.find(x => x.name === this.props.bookName);
		return false;
	}

	get isSeries() {
		return this.state.work !== null && this.state.work.type === 'SERIES';
	}

	get bookIndex() {
		return this.state.work.books.findIndex(x=> x.name === this.props.bookName);
	}

	get hasNextBook() {
		if (!this.isSeries) return false;
		const index = this.bookIndex;
		return index >= 0 && (index + 1) < this.state.work.books.length
	}

	get hasPreviousBook() {
		if (!this.isSeries) return false;
		const index = this.bookIndex;
		return index > 0 && index - 1 <= this.state.work.books.length
	}

	get nextBook() {
		if (!this.isSeries || !this.hasNextBook) return false;
		const index = this.bookIndex;
		return this.state.work.books[index+1]
	}

	get previousBook() {
		if (!this.isSeries || !this.hasPreviousBook) return false;
		const index = this.bookIndex;
		return this.state.work.books[index-1]
	}

	get title() {
		if (this.isSeries) return `${this.state.book.name} (${this.state.work.name})`;
		else return this.state.book.name;
	}

	get cleanedName() {
		const number = this.state.book.name.slice(0, 3).trim();
		return this.isSeries && !isNaN(number) ? this.state.book.name.slice(3) : this.state.book.name;
	}

	get seriesName() {
		const number = this.state.book.name.slice(0, 3).trim();
		return isNaN(number) ? this.state.work.name : `${this.state.work.name} #${number}`;
	}
	get hasArtwork() {
		return this.state.book && this.state.book.art.length > 0;
	}

	render() {
		const tracks =  (this.state.book ? this.state.book.tracks : []);
		const data = tracks.reduce((a,v,i) => {
			if (i === 0) v.startTime = 0;
			else v.startTime = tracks.slice(0, i).reduce((a, v) => a + (v.meta ? v.meta.format.duration : 0), 0);
			v.endTime = v.startTime + (v.meta ? v.meta.format.duration : 0);
			return a.concat(v);
		},[]);

		const totalSize = data.map( track => track.size).reduce((a,v) => a + v, 0);
		const totalLength = data.map( track => track.meta ? track.meta.format.duration : 0).reduce((a,v) => a + v, 0);

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
									{this.isSeries && this.hasPreviousBook && (
										<span style={{cursor:'pointer', color: this.props.theme.activeText, display: 'flex', justifyContent: 'flex-start'}} onClick={() => this.props.history.push(`/works/${this.props.workId}/${this.previousBook.name}`)}>
											<Icon style={{padding:'0 .5em'}} icon="chevron-left"/>
											{this.previousBook.name}
										</span>
									)}
								</div>
								{this.hasArtwork && <div style={{width:widths, alignSelf: 'center'}}>
									<img src={this.state.book.art[0].path} alt={this.cleanedName} style={{
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
										{this.isSeries && <h3 style={{color:this.props.theme.secondaryText}}>({this.seriesName})</h3>}
										<h2 style={{fontWeight:400, color:this.props.theme.primaryText}}>By {this.state.author.name}</h2>
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
													this.props.player.open(this.state.work.$loki, this.props.bookName,() => {
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
									{this.isSeries && this.hasNextBook && (
										<span style={{cursor:'pointer', color: this.props.theme.activeText, display: 'flex', justifyContent: 'flex-end'}} onClick={() => this.props.history.push(`/works/${this.props.workId}/${this.nextBook.name}`)}>
											{this.nextBook.name}
											<Icon style={{padding:'0 .5em'}} icon="chevron-right"/>
										</span>
									)}
								</div>
							</div>
							<div>
								<ReactTable
									className="-striped -highlight"
									data={data}
									noDataText="No tracks found"
									columns={[
										{Header: 'Name', accessor: 'name'},
										{Header: 'Length', maxWidth: 100, accessor: 'meta.format.duration', Cell: props => this.formatTime(props.value)},
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
												if (this.state.work.type === "SERIES")
													this.props.player.openFromSpecificTrack(this.state.work.$loki, this.props.bookName, rowInfo.row.name, () => { this.props.player.play()});
												else this.props.player.openFromSpecificTrack(this.state.work.$loki, null, rowInfo.row.name, () => { this.props.player.play()});

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
													<div>Length: {this.formatTime(track.meta ? track.meta.format.duration : 0)}</div>
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
																	if (this.state.work.type === "SERIES")
																		this.props.player.open(this.state.work.$loki, this.props.bookName, () => {
																			this.props.player.play();
																			this.props.player.currentTime = rowInfo.row.time;
																		});
																	else this.props.player.open(this.state.work.$loki, null, () => {
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

