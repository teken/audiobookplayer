import React, {Component} from 'react';
import { withRouter } from 'react-router-dom'
import ReactTable from 'react-table';

import {FontAwesomeIcon as Icon} from '@fortawesome/react-fontawesome'

import 'react-table/react-table.css'

import withTheme from '../theme/withTheme';

const fs = window.require('fs');
const mm = window.require('music-metadata');
const {ipcRenderer} = window.require('electron');

export default withRouter(withTheme(class Detail extends Component {
	constructor(props) {
		super(props);
		this._player = props.player;
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
		].filter(x => x.length > 0).join('-');
		let time = ipcRenderer.sendSync('timings.get', {key:key});
		this.setState({
			author: author,
			work: work,
			loading: false,
			book: book,
			saveTime: time.success ? time.time : null
		});
		this.loadTrackLengthData(book);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.workId !== this.props.workId || prevProps.bookName !== this.props.bookName) {
			let book = this.state.work.type === 'BOOK' ? this.state.work : this.state.work.books.find(x=> x.name === this.props.bookName);
			const key = [
				this.state.author.name,
				this.state.work.type === 'SERIES' ? this.state.work.name : '',
				book.name,
			].filter(x => x.length > 0).join('-');
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
		if (this.state.work) return this.state.work.type === 'BOOK' ? this.state.work : this.state.work.books.find(x=> x.name === this.props.bookName);
		return false;
	}

	get isSeries() {
		return this.state.work !== null && this.state.work.type === 'SERIES';
	}

	get hasNextBook() {
		if (!this.isSeries) return false;
		let index = this.state.work.books.findIndex(x=> x.name === this.props.bookName);
		return index >= 0 && (index + 1) < this.state.work.books.length
	}

	get hasPreviousBook() {
		if (!this.isSeries) return false;
		let index = this.state.work.books.findIndex(x=> x.name === this.props.bookName);
		return index > 0 && index - 1 <= this.state.work.books.length
	}

	get nextBook() {
		if (!this.isSeries || !this.hasNextBook) return false;
		let index = this.state.work.books.findIndex(x=> x.name === this.props.bookName);
		return this.state.work.books[index+1]
	}

	get previousBook() {
		if (!this.isSeries || !this.hasPreviousBook) return false;
		let index = this.state.work.books.findIndex(x=> x.name === this.props.bookName);
		return this.state.work.books[index-1]
	}

	get title() {
		if (this.isSeries) return `${this.state.book.name} (${this.state.work.name})`;
		else return this.state.book.name;
	}

	loadCUEFileData(path) {
		if (path === null) return [];
		const buffer = fs.readFileSync(path);
		const lines = buffer.toString('utf8').split('\n').map(line => line.trim()).filter(line => line.length > 0);
		const name = lines.slice(0,1)[0].slice(6, -5);
		const content = lines.slice(1);
		let data = [];
		for(let i = 0; i <= content.length; i+=3) {
			let name = String(content[i+1]).slice(7,-1);
			let timeCode = String(content[i+2]).slice(9);
			data.push({name:name, time:timeCode})
		}
		return {name:name,data:data.slice(0,-1)};
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

		const infos = this.state.book ? this.state.book.info.map(file => file.path) : [];
		const chapters = infos.map(path => this.loadCUEFileData(path));

		return (
			<div className="detail">
				{this.state.loading ? (
					<h1>Loading...</h1>
				) : (
					<div>
						<h1>{this.title}</h1>
						<h2>By {this.state.author.name}</h2>
						<div  style={{color: this.props.theme.secondaryText}}>
							<div style={{display:'flex', justifyContent: 'space-between', color: this.props.theme.secondaryText, alignItems: 'flex-end'}}>
								<div style={{width:'30%'}}>
									{this.isSeries && this.hasPreviousBook && (
										<span style={{cursor:'pointer', color: this.props.theme.activeText, display: 'flex', justifyContent: 'flex-start'}} onClick={() => this.props.history.push(`/works/${this.props.workId}/${this.previousBook.name}`)}>
											<Icon style={{padding:'0 .5em'}} icon="chevron-left"/>
											{this.previousBook.name}
										</span>
									)}
								</div>
								<div style={{width:'30%'}}>
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
												this._player.open(this.state.work.$loki, this.props.bookName,() => {
													this._player.play();
													this._player.currentTime = this.state.saveTime;
													})
												}
											>
												Saved Time: {this.formatTime(this.state.saveTime)}
											</div>
										)
									}
								</div>
								<div style={{width:'30%'}}>
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
													this._player.openFromSpecificTrack(this.state.work.$loki, this.props.bookName, rowInfo.row.name, () => { this._player.play()});
												else this._player.openFromSpecificTrack(this.state.work.$loki, null, rowInfo.row.name, () => { this._player.play()});

												if (handleOriginal) handleOriginal();
											}
										};
									}}
									SubComponent={row => {
										const data = chapters.find(x => x.name === row.row.name);
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
												</div>

												{data && (
													<ReactTable
														className="-striped -highlight"
														data={data.data}
														noDataText="No chapters found"
														columns={[
															{Header: 'Chapter Name', accessor: 'name'},
															{Header: 'Time Code', maxWidth: 200, accessor: 'time', Cell: props => this.formatCUETime(props.value)},
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
																		this._player.open(this.state.work.$loki, this.props.bookName, () => {
																			this._player.play();
																			this._player.currentTime = this.formatCUETimeAsSecond(rowInfo.row.time);
																		});
																	else this._player.open(this.state.work.$loki, null, () => {
																		this._player.play();
																		this._player.currentTime = this.formatCUETimeAsSecond(rowInfo.row.time);
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

	formatCUETime(time) {
		if (!time) time = '0:0:00';
		const parts = time.split(':');
		let date = new Date(null);
		date.setMinutes(Number(parts[0]));
		date.setSeconds(Number(parts[1]));
		date.setMilliseconds(Number(parts[2])*10);
		return date.toISOString().substr(11, 8);
	}

	formatCUETimeAsSecond(time) {
		if (!time) time = '0:0:00';
		const parts = time.split(':');
		let date = new Date(null);
		date.setMinutes(Number(parts[0]));
		date.setSeconds(Number(parts[1]));
		date.setMilliseconds(Number(parts[2])*10);
		return date.getTime()/1000;
	}
}))

