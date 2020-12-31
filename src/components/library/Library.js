import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import RightClickMenu from "../RightClickMenu";

import AuthoredView from "./AuthoredView";
import View from "./View";
import Tile from "./tile/Tile";
import Row from "./tile/Row";

import Fuse from "fuse.js";

import Loading from "../loading/Loading";
import withPlayer from "../player/withPlayer";

const { ipcRenderer, shell } = window.require('electron');
const path = window.require('path');


export default withRouter(withPlayer(class Library extends Component {
	constructor(props) {
		super(props);
		const settings = JSON.parse(ipcRenderer.sendSync('settings.gets', ['libraryStyle', 'libraryDisplayAuthors']));
		this.state = {
			authors: [],
			works: [],
			states: [],
			flattenedWorks: [],
			searchTerm: "",
			searchTimeoutId: null,
			libraryDisplayAuthors: settings.libraryDisplayAuthors,
			libraryStyle: settings.libraryStyle,
			initLoading: true,
			searchLoading: false,
		};
		this.fuse = null;
		this.fuseOptions = {
			shouldSort: true,
			isCaseSensitive: false,
			threshold: 0.6,
			tokenize: true,
			location: 0,
			distance: 1,
			maxPatternLength: 32,
			minMatchCharLength: 2,
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
		this.play = this.play.bind(this);
	}

	onSearchBoxChange(event) {
		if (this.state.searchTimeoutId != null) clearTimeout(this.state.searchTimeoutId)
		const searchString = event.target.value.trimLeft();
		const searchTimeoutId = setTimeout(_ => this.search(searchString), 500);
		this.setState({
			searchTimeoutId,
			searchTerm: searchString,
		});
	}

	componentDidMount() {
		const firstRun = JSON.parse(ipcRenderer.sendSync('settings.get', 'firstRun'));
		if (firstRun) {
			this.props.history.push("/setup");
			return;
		}

		this.loadData();
		this.setState({
			initLoading: false
		});
		window.addEventListener('keydown', this.listenKeyboard.bind(this), true);
	}

	componentWillUnmount() {
		window.removeEventListener('keydown', this.listenKeyboard.bind(this), true);
	}

	listenKeyboard(event) {
		if ((event.key === 'Escape' || event.keyCode === 27) && this.state.searchTerm.length > 0) this.setState({
			searchTerm: ''
		}, this.search(''));
	}

	loadData() {
		const { works, authors } = ipcRenderer.sendSync('library.getAll');
		const { times } = ipcRenderer.sendSync('timings.getAll');
		const flattenedWorks = works.map(work => {
			work.author = authors.find(x => x.$loki === work.author_id);
			if (work.type === 'SERIES') work.books = work.books.map(book => {
				book.series = work;
				book.author = work.author;
				return book;
			});
			return work;
		}).reduce((a, v) => a.concat(v.type === 'SERIES' ? v.books : v), []).filter(item => item.type === 'BOOK');
		this.fuse = new Fuse(flattenedWorks, this.fuseOptions);
		const settings = JSON.parse(ipcRenderer.sendSync('settings.gets', ['libraryStyle', 'libraryDisplayAuthors']));
		this.setState({
			works: works,
			authors: authors,
			flattenedWorks: flattenedWorks,
			states: times,
			libraryDisplayAuthors: Boolean(settings.libraryDisplayAuthors),
			libraryStyle: settings.libraryStyle,
		});
	}

	get isSearching() {
		return this.state.searchTerm.length > 0;
	}

	render() {
		const libraryWorks = this.isSearching ? this.state.results : this.state.flattenedWorks;
		const savedTimes = this.state.states.map(x => {
			const parts = x.key.split('##');
			x.author = parts[0];
			x.work = parts[1];
			if (parts.length === 3) x.bookName = parts[2];
			return x;
		});
		const savedTimeWorks = (libraryWorks ? libraryWorks : []).filter(book => savedTimes.some(value => (value.bookName ? value.bookName : value.work) === book.name && value.time));

		const displaySavedTimesSection = !this.isSearching && savedTimeWorks && savedTimeWorks.length > 0;
		const displayLibrary = libraryWorks && libraryWorks.length > 0;
		const searchIcon = this.isSearching ? 'times' : 'search';
		return (
			<div>
				<div style={{ display: 'flex', margin: '1em', padding: '1em', color: 'var(--active-text-colour)', backgroundColor: 'var(--input-background-colour)' }}>
					<input type="text" value={this.state.searchTerm} onChange={this.onSearchBoxChange} placeholder="Search" style={{
						width: '97%',
						border: 'none',
						backgroundColor: 'transparent',
						color: 'var(--active-text-colour)',
						fontSize: '1em',
						paddingLeft: '0.3em'
					}} />
					{this.state.searchLoading ? <Loading /> :
						<Icon icon={searchIcon} style={{
							// borderBottom:`'1em solid ${this.props.theme.activeColour}`,
							fontSize: '1em',
							transform: 'translateY(.1em)',
							paddingBottom: '0.1em',
							color: 'var(--inactive-text-colour)',
							cursor: 'pointer'
						}} onClick={() => this.isSearching ? this.search('') : null} />}
				</div>
				{
					this.state.initLoading ?
						<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: `calc(${window.innerHeight}px - 12.5em)` }}><Loading /></div>
						:
						this.library(displaySavedTimesSection, displayLibrary, savedTimeWorks, savedTimes, libraryWorks)
				}
			</div>
		);
	}

	library(displaySavedTimesSection, displayLibrary, savedTimeWorks, savedTimes, libraryWorks) {
		const properties = {
			libraryTitle: 'Library',
			savedTimesTitle: 'Saved Times',
			noBooksFound: this.noBooksFound.bind(this),
			displaySavedTimesSection: displaySavedTimesSection,
			displayLibrary: displayLibrary,
			savedTimeWorks: savedTimeWorks,
			savedTimes: savedTimes,
			libraryWorks: libraryWorks,
			libraryBook: this.libraryBook.bind(this),
			savedBook: this.savedBook.bind(this),
			getStateKey: (author, series, work) => `${author.name}##${series ? `${series.name}##` : ''}${work.name}`,
			itemClick: this.handleClick.bind(this),
		};

		let itemComponent;
		let cellWidth;
		switch (this.state.libraryDisplayFormat) {
			default:
			case 'grid':
				itemComponent = Tile;
				cellWidth = 200;
				break;
			case 'row':
				itemComponent = Row;
				cellWidth = 300;
				break;
		}

		if (this.state.libraryDisplayAuthors) {
			return <AuthoredView itemComponent={itemComponent} cellWidthDivider={cellWidth} {...properties} />;
		} else {
			return <View itemComponent={itemComponent} cellWidthDivider={cellWidth} {...properties} />;
		}
	}

	noBooksFound() {
		return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
			<div style={{ lineHeight: '1.8em' }}>
				<h1>no books to be found,<br />maybe try importing some...</h1>
				<div style={{ color: 'var(--secondary-text-colour)' }}>
					Head to the settings page using the cog icon on the menu bar
				</div>
			</div>
		</div>;
	}

	book(renderFunction, author, series, work, stateKey, rightClickOptions) {
		return <RightClickMenu style={{
			backgroundColor: 'var(--input-background-colour)',
			color: 'var(--active-text-colour)',
			cursor: 'pointer',
			//border: this.isPlaying(author, series, work) ? `1px solid ${'var(--active-text-colour)'}` : ''
			boxShadow: this.isPlaying(author, series, work) ? `${'var(--active-text-colour)'} 0 0 .1em 0` : ''
		}}
			key={author.name + work.name} options={rightClickOptions}
		>
			{renderFunction(author, series, work, stateKey)}
		</RightClickMenu>;
	}

	libraryBook(renderFunction, author, series, work, stateKey) {
		if (this.state.states.some(x => x.key === stateKey && x.time)) return this.savedBook(renderFunction, author, series, work, stateKey);
		if (typeof (author.name) === 'undefined' || typeof (series ? series.name : '') === 'undefined') return;
		let filePath = path.join(ipcRenderer.sendSync('settings.get', 'libraryPath'), author.name, series ? series.name : '', work.name);
		return this.book(renderFunction, author, series, work, stateKey, [
			{ name: 'Play', onClick: () => this.play(author, series, work) },
			{ name: 'Search for author', onClick: () => this.search(author.name) },
			series && { name: 'Search for series', onClick: () => this.search(series.name) },
			{ name: 'Open', onClick: () => this.handleClick(author, series, work) },
			{ name: 'Open file location', onClick: () => shell.openItem(filePath) }
		]);
	}

	savedBook(renderFunction, author, series, work, stateKey) {
		let filePath = path.join(ipcRenderer.sendSync('settings.get', 'libraryPath'), author.name, series ? series.name : '', work.name);
		const state = this.state.states.find(x => x.key === stateKey);
		return this.book(renderFunction, author, series, work, stateKey, [
			{ name: `Play from ${state?.time ? this.props.player.formatTime(state.time) : 'saved time'}`, onClick: () => this.playFromStateTime(author, series, work, stateKey) },
			{ name: 'Play from beginning', onClick: () => this.play(author, series, work) },
			{ name: 'Search for author', onClick: () => this.search(author.name) },
			series && { name: 'Search for series', onClick: () => this.search(series.name) },
			{ name: 'Open', onClick: () => this.handleClick(author, series, work) },
			{ name: 'Open file location', onClick: () => shell.openItem(filePath) },
			{ name: 'Clear saved time', onClick: () => this.clearTimingData(stateKey) }
		]);
	}

	isPlaying(author, series, work) {
		if (!this.props.player.isLoaded) return false;
		if (series) return this.props.player.work.$loki === series.$loki && this.props.player._bookNameIfSeries === work.name;
		else return this.props.player.work.$loki === work.$loki;
	}

	handleClick(author, series, work) {
		let id = series ? `${series.$loki}/${work.name}` : work.$loki;
		this.props.history.push(`/works/${id}`);
	}

	playFromStateTime(author, series, work, stateKey) {
		const state = ipcRenderer.sendSync('timings.get', { key: stateKey });
		const book = series ? series : work;
		const name = series ? work.name : null;
		this.props.player.open(book.$loki, name, () => {
			this.props.player.play();
			setTimeout(() => {
				this.props.player.currentTime = state.time;
			}, 500);
		})
	}

	play(author, series, work) {
		const book = series ? series : work;
		const name = series ? work.name : null;
		this.props.player.open(book.$loki, name, () => {
			this.props.player.play();
		});
		// this.loadData();
		// this.forceUpdate();
	}

	search(text) {
		this.setState({
			searchLoading: true
		}, _ => this.setState(
			text.length > 0 ?
				{
					searchTimeoutId: null,
					results: this.fuse.search(text),
					searchLoading: false
				} : {
					searchTimeoutId: null,
					searchLoading: false
				}))
	}

	clearTimingData(key) {
		let result = ipcRenderer.sendSync('timings.clear', { key: key });
		if (result && result.success) {
			this.loadData();
			this.forceUpdate();
		} else {
			console.error(result)
		}
	}
}))

