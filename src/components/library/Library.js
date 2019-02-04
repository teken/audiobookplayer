import React, {Component} from "react";
import {withRouter} from "react-router-dom";

import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import RightClickMenu from "../RightClickMenu";

import AuthoredView from "./AuthoredView";
import View from "./View";
import Tile from "./tile/Tile";
import Row from "./tile/Row";

import Fuse from "fuse.js";

import Loading from "../loading/Loading";

import withTheme from "../theme/withTheme";
import withPlayer from "../player/withPlayer";
import SettingsService from "../../uiservices/settings";
import LibraryService from "../../uiservices/library";
import StateService from "../../uiservices/state";

const {shell} = window.require('electron');
const path = window.require('path');


export default withRouter(withTheme(withPlayer(class Library extends Component {
	constructor(props) {
		super(props);
		const settings = SettingsService.getSettings('libraryStyle', 'libraryDisplayAuthors');
		this.state = {
			states: [],
			flattenedWorks:[],
			searchTerm: "",
			libraryDisplayAuthors: settings.libraryDisplayAuthors,
			libraryStyle: settings.libraryStyle,
			loading: true
		};
		this.fuse = null;
		this.fuseOptions = {
			shouldSort: true,
			threshold: 0.6,
			location: 0,
			distance: 10,
			maxPatternLength: 32,
			minMatchCharLength: 3,
			keys: [
				"name",
				"series",
				"author"
			]
		};
		this.onSearchBoxChange = this.onSearchBoxChange.bind(this);
		this.loadData = this.loadData.bind(this);
		this.clearTimingData = this.clearTimingData.bind(this);
		this.playFromStateTime = this.playFromStateTime.bind(this);
		this.play = this.play.bind(this);
	}

	onSearchBoxChange(event) {
		this.search(event.target.value.trimLeft());
	}

	componentDidMount() {
		const firstRun = SettingsService.getSetting('firstRun');
		if (firstRun) {
			this.props.history.push("/setup");
			return;
		}
		this.loadData();
		this.setState({
			loading:false
		});
		window.addEventListener('keydown', this.listenKeyboard.bind(this), true);
	}

	componentWillUnmount() {
		window.removeEventListener('keydown', this.listenKeyboard.bind(this), true);
	}

	listenKeyboard(event) {
		if ((event.key === 'Escape' || event.keyCode === 27) && this.state.searchTerm.length > 0) this.search('');
	}

	loadData() {
		const states = StateService.getAll();
		const flattenedWorks = LibraryService.getAll().sort((a,b) => a.key < b.key ? -1 : a.key > b.key? 1 : 0);

		this.fuse = new Fuse(flattenedWorks, this.fuseOptions);
		const settings = SettingsService.getSettings('libraryStyle', 'libraryDisplayAuthors');
		console.log(flattenedWorks, settings)
		this.setState({
			flattenedWorks: flattenedWorks,
			states: states || [],
			libraryDisplayAuthors: settings.libraryDisplayAuthors === 'true',
			libraryStyle: settings.libraryStyle,
		});
	}

	get isSearching() {
		return this.state.searchTerm.length > 0;
	}

	render() {
		const libraryWorks = this.isSearching ? this.state.results : this.state.flattenedWorks;
		const savedTimes = this.state.states;
		const savedTimeWorks = (libraryWorks ? libraryWorks : [])
			.filter(book => savedTimes.some(value => value.key === book.key && value.savedTime));

		const displaySavedTimesSection = !this.isSearching && savedTimeWorks && savedTimeWorks.length > 0;
		const displayLibrary = libraryWorks && libraryWorks.length > 0;
		const searchIcon = this.isSearching ? 'times' : 'search';
		return (
			<div>
				<div style={{ margin: '1em', padding: '1em', color:this.props.theme.activeText, backgroundColor:this.props.theme.inputBackground }}>
					<input type="text" value={this.state.searchTerm} onChange={this.onSearchBoxChange} placeholder="Search" style={{
					   width: '97%',
					   border:'none',
					   backgroundColor: 'transparent',
					   color: this.props.theme.activeText,
					   fontSize: '1em',
					   paddingLeft:'0.3em'
					}} />
					<Icon icon={searchIcon} style={{
						borderBottom:`'1em solid ${this.props.theme.activeColour}`,
						fontSize: '1em',
						transform: 'translateY(.1em)',
						paddingBottom: '0.1em',
						color: this.props.theme.inactiveText,
						cursor: 'pointer'
					}} onClick={() => this.isSearching ? this.search('') : null} />
				</div>
				{
					this.state.loading ?
						<div style={{display:'flex', justifyContent:'center', alignItems: 'center', height: `calc(${window.innerHeight}px - 12.5em)`}}><Loading/></div>
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
		return <div style={{display:'flex', justifyContent:'center', alignItems: 'center'}}>
			<div style={{lineHeight:'1.8em'}}>
				<h1>no books to be found,<br />maybe try importing some...</h1>
				<div style={{color:this.props.theme.secondaryText}}>
					Head to the settings page using the cog icon on the menu bar
				</div>
			</div>
		</div>;
	}

	book(renderFunction, work, rightClickOptions) {
		return <RightClickMenu style={{
			backgroundColor: this.props.theme.inputBackground,
			color: this.props.theme.activeText,
			cursor:'pointer',
			boxShadow: this.isPlaying(work) ? `${this.props.theme.activeText} 0 0 .1em 0` : ''
		}}
		   key={work.key} options={rightClickOptions}
		>
			{renderFunction(work)}
		</RightClickMenu>;
	}

	libraryBook(renderFunction, work) {
		if (this.state.states.some(x => x.key === work.key && x.time)) return this.savedBook(renderFunction, work);
		let filePath = path.join(SettingsService.getSetting('libraryPath'), work.key);
		return this.book(renderFunction, work, [
			{ name:'Play', onClick:() => this.play(work) },
			{ name:'Search for author', onClick:() => this.search(work.author)},
			work.hasOwnProperty("series") && { name:'Search for series', onClick:() => this.search(work.series)},
			{ name:'Open', onClick:() => this.handleClick(work)},
			{ name:'Open file location', onClick:() => shell.openItem(filePath)}
		]);
	}

	savedBook(renderFunction, work) {
		let filePath = path.join(SettingsService.getSetting('libraryPath'), work.key);
		const state = this.state.states.find(x => x.key === work.key);
		return this.book(renderFunction, work, [
			{ name:`Play from ${state.savedTime ? this.formatTime(state.savedTime) : 'saved time'}`, onClick:() => this.playFromStateTime(work) },
			{ name:'Play from beginning', onClick:() => this.play(work) },
			{ name:'Search for author', onClick:() => this.search(work.author)},
			work.hasOwnProperty("series") && { name:'Search for series', onClick:() => this.search(work.series)},
			{ name:'Open', onClick:() => this.handleClick(work)},
			{ name:'Open file location', onClick:() => shell.openItem(filePath)},
			{ name:'Clear saved time', onClick:() => this.clearTimingData(work.key)}
		]);
	}

	isPlaying(work) {
		if (!this.props.player.isLoaded) return false;
		return this.props.player.work.key === work.key;
		// if (series) return this.props.player.work.$loki === series.$loki && this.props.player._bookNameIfSeries === work.name;
		//
		// else return
	}

	handleClick(work) {
		this.props.history.push(`/works/${work.key}`);
	}

	playFromStateTime(work) {
		const state = StateService.getState(work.key);
		this.props.player.open(work.key, () => {
			this.props.player.play();
			setTimeout(() => {
				this.props.player.currentTime = state.savedTime;
			}, 500);
		})
	}

	play(work) {
		this.props.player.open(work.key, () => {
			this.props.player.play();
		});
		// this.loadData();
		// this.forceUpdate();
	}

	search(text) {
		this.setState({
			searchTerm: text,
			results: this.fuse.search(text)
		})
	}

	clearTimingData(key) {
		const result = StateService.clearState(key);
		if (result && result.success) {
			this.loadData();
			this.forceUpdate();
		} else {
			console.error(result)
		}
	}

	formatTime(time) {
		if (!time) time = 0;
		return new Date(1000 * time).toISOString().substr(11, 8);
	}
})))

