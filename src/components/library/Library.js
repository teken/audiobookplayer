import React, {Component} from 'react';
import { withRouter } from 'react-router-dom'

import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import RightClickMenu from '../RightClickMenu';

import GridView from './GridView';
import AuthoredGridView from './AuthoredGridView';
import RowView from './RowView';
import AuthoredRowView from './AuthoredRowView';

import Fuse from 'fuse.js';

const {ipcRenderer, shell} = window.require('electron');
const path = window.require('path');


export default withRouter(class Library extends Component {
	constructor(props) {
		super(props);
		this._player = props.player;
		let libraryStyle = ipcRenderer.sendSync('settings.get', 'libraryStyle');
		let displayAuthors = ipcRenderer.sendSync('settings.get', 'libraryDisplayAuthors');
		this.state = {
			authors: [],
			works: [],
			states: [],
			flattenedWorks:[],
			searchTerm: "",
			//intervalId: null,
			libraryDisplayFormat: (displayAuthors ? 'authored' : '') + libraryStyle//'grid'
		};
		this.fuse = null;
		this.fuseOptions = {
			shouldSort: true,
			threshold: 0.6,
			tokenize: true,
			location: 0,
			distance: 1,
			maxPatternLength: 32,
			minMatchCharLength: 1,
			keys: [
				"name",
				"series.name",
				"author.name"
			]
		};
		this.onSearchBoxChange = this.onSearchBoxChange.bind(this);
		this.loadData = this.loadData.bind(this);
		this.clearTimingData = this.clearTimingData.bind(this);
		this.playFromStateTime = this.playFromStateTime.bind(this);
	}

	onSearchBoxChange(event) {
		this.search(event.target.value.trimLeft());
	}

	componentDidMount() {
		this.loadData();
		// const id = setInterval(() => {
		// 		this.loadData();
		// 		this.forceUpdate();
		// 	}, 1000);
		// this.setState({
		// 	intervalId: id
		// });
		window.addEventListener('keydown', this.listenKeyboard.bind(this), true);
	}

	componentWillUnmount() {
		window.removeEventListener('keydown', this.listenKeyboard.bind(this), true);
		//if (this.state.intervalId !== null) clearInterval(this.state.intervalId);
	}

	listenKeyboard(event) {
		if ((event.key === 'Escape' || event.keyCode === 27) && this.state.searchTerm.length > 0) this.search('');
	}

	loadData() {
		const {works, authors} = ipcRenderer.sendSync('library.getAll');
		const {times} = ipcRenderer.sendSync('timings.getAll');
		const flattenedWorks = works.map(work => {
			work.author = authors.find(x => x.$loki === work.author_id);
			if(work.type === 'SERIES') work.books = work.books.map(book => {
				book.series = work;
				book.author = work.author;
				return book;
			});
			//if(work.author_id === 1) console.log (work)
			return work;
		}).reduce((a,v) => a.concat(v.type === 'SERIES' ? v.books : v) ,[]).filter(item => item.type === 'BOOK');
		this.fuse = new Fuse(flattenedWorks, this.fuseOptions);
		this.setState({
			works: works,
			authors: authors,
			flattenedWorks: flattenedWorks,
			states: times
		});
	}

	render() {
		const isSearching = this.state.searchTerm.length > 0;
		const libraryWorks = isSearching ? this.state.results : this.state.flattenedWorks;
		const savedTimes = this.state.states.map(x => {
			const parts = x.key.split('-');
			x.author = parts[0];
			x.work = parts[1];
			if (parts.length === 3) x.bookName = parts[2];
			return x;
		});
		const savedTimeWorks = (libraryWorks ? libraryWorks : []).filter(book => savedTimes.some(value => (value.bookName ? value.bookName : value.work) === book.name && value.time));

		const displaySavedTimesSection = !isSearching && savedTimeWorks && savedTimeWorks.length > 0;
		const displayLibrary = libraryWorks && libraryWorks.length > 0;
		return (
			<div>
				<div style={{ margin: '1em', padding: '1em', color:this.props.styling.activeText, backgroundColor:this.props.styling.inputBackground }}>
					<input type="text" value={this.state.searchTerm} onChange={this.onSearchBoxChange} placeholder="Search"
						   style={{
							   width: '97%',
							   border:'none',
							   backgroundColor: 'transparent',
							   color: this.props.styling.activeText,
							   fontSize: '1em',
							   paddingLeft:'0.3em'
						   }}/>
					<Icon icon="search" style={{
						borderBottom:'1px solid '+this.props.styling.activeColour,
						fontSize: '1em',
						transform: 'translateY(4px)',
						paddingBottom: '2px',
						color: this.props.styling.inactiveText
					}}/>
				</div>
				{this.library(displaySavedTimesSection, displayLibrary, savedTimeWorks, savedTimes, libraryWorks)}
			</div>
		);
	}

	library(displaySavedTimesSection, displayLibrary, savedTimeWorks, savedTimes, libraryWorks) {
		const properties = {
			styling: this.props.styling,
			displaySavedTimesSection: displaySavedTimesSection,
			displayLibrary: displayLibrary,
			authors: this.state.authors,
			savedTimeWorks: savedTimeWorks,
			savedTimes: savedTimes,
			libraryWorks: libraryWorks,
			searchTerm: this.state.searchTerm.toLowerCase(),
			libraryBook: this.libraryBook.bind(this),
			savedBook: this.savedBook.bind(this),
			getStateKey: this.getStateKey.bind(this),
			itemClick: this.handleClick.bind(this),
		};
		switch(this.state.libraryDisplayFormat) {
			case 'grid':
			default:
				return <GridView {...properties} />;
			case 'authoredgrid':
				return <AuthoredGridView {...properties} />;
			case 'row':
				return <RowView {...properties} />;
			case 'authoredrow':
				return <AuthoredRowView {...properties} />;
		}
	}

	getStateKey(author, series, work) {
		return `${author.name}-${series ? `${series.name}-` : ''}${work.name}`;
	}

	book(renderFunction, author, series, work, stateKey, rightClickOptions) {
		return <RightClickMenu style={{
			backgroundColor: this.props.styling.inputBackground,
			color: this.props.styling.activeText,
			cursor:'pointer',
			border: this.isPlaying(author, series, work) ? `1px solid ${this.props.styling.activeText}` : ''
		}} styling={this.props.styling}
		   key={author.name + work.name} options={rightClickOptions}
		>
			{renderFunction(author, series, work)}
		</RightClickMenu>;
	}

	libraryBook(renderFunction, author, series, work, stateKey) {
		if (this.state.states.some(x => x.key === stateKey && x.time)) return this.savedBook(renderFunction, author, series, work, stateKey);
		let filePath = path.join(ipcRenderer.sendSync('settings.get', 'libraryPath'), author.name, series ? series.name : '', work.name);
		return this.book(renderFunction, author, series, work, stateKey, [
			{ name:'Play', onClick:() => this.play(author, series, work) },
			{ name:'Search for author', onClick:() => this.search(author.name)},
			series && { name:'Search for series', onClick:() => this.search(series.name)},
			{ name:'Open location', onClick:() => shell.openItem(filePath)}
		]);
	}

	savedBook(renderFunction, author, series, work, stateKey) {
		let filePath = path.join(ipcRenderer.sendSync('settings.get', 'libraryPath'), author.name, series ? series.name : '', work.name);
		const state = this.state.states.find(x => x.key === stateKey);
		return this.book(renderFunction, author, series, work, stateKey, [
			{ name:`Play from ${state.time ? this.formatTime(state.time) : 'saved time'}`, onClick:() => this.playFromStateTime(author, series, work, stateKey) },
			{ name:'Play from beginning', onClick:() => this.play(author, series, work) },
			{ name:'Search for author', onClick:() => this.search(author.name)},
			series && { name:'Search for series', onClick:() => this.search(series.name)},
			{ name:'Open location', onClick:() => shell.openItem(filePath)},
			{ name:'Clear saved time', onClick:() => this.clearTimingData(stateKey)}
		]);
	}

	isPlaying(author, series, work) {
		if (!this._player.isLoaded) return false;
		if (series) return this._player.work.$loki === series.$loki && this._player._bookNameIfSeries === work.name;
		else return this._player.work.$loki === work.$loki;
	}

	handleClick(author, series, work) {
		let id = series ? `${series.$loki}/${work.name}` : work.$loki;
		this.props.history.push(`/works/${id}`);
	}

	playFromStateTime(author, series, work, stateKey) {
		const state = ipcRenderer.sendSync('timings.get', { key: stateKey });
		const book = series ? series : work;
		const name = series ? work.name : null;
		this._player.open(book.$loki, name,() => {
			this._player.play();
			setTimeout(() => {
				this._player.currentTime = state.time;
			}, 500);
		})
	}

	play(author, series, work) {
		const book = series ? series : work;
		const name = series ? work.name : null;
		this._player.open(book.$loki, name, () => this._player.play());
	}

	search(text) {
		this.setState({
			searchTerm: text,
			results: this.fuse.search(text)
		})
	}

	clearTimingData(key) {
		ipcRenderer.send('timings.clear', {key:key});
		this.loadData();
		this.forceUpdate();
	}

	formatTime(time) {
		if (!time) time = 0;
		return new Date(1000 * time).toISOString().substr(11, 8);
	}
})

