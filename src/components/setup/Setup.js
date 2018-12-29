import React, {Component} from "react";

import FolderSelector from "../settings/FolderSelector";
import SelectionGrid from "../settings/SelectionGrid";

import AuthoredView from "../library/AuthoredView";
import View from "../library/View";
import Tile from "../library/tile/Tile";
import Row from "../library/tile/Row";

import ReactTable from "react-table";

import withTheme from "../theme/withTheme";
import {withRouter} from "react-router-dom";
import SettingsService from "../../uiservices/settings";

export default withRouter(withTheme(class About extends Component {
	constructor(props) {
		super(props);
		const settings = SettingsService.getSettings('libraryPath', 'importStyle', 'libraryDisplayAuthors', 'libraryStyle');
		this.state = {
			libraryDataFolder: settings.libraryPath,
			importStyle: settings.importStyle,
			libraryStyle: (settings.libraryDisplayAuthors?'authored':'')+settings.libraryStyle,
			currentStep:0,
			maxSteps:3,
		};
		this._onClick = this._onClick.bind(this);
		this._onClickPrevious = this._onClickPrevious.bind(this);
	}

	instruction(number, text) {
		return (<p><span style={{color:this.props.theme.primaryText}}>{number}.</span> {text}</p>);
	}

	_onClickPrevious() {
		if (this.state.currentStep > 0) {
			this.setState({
				currentStep: this.state.currentStep - 1
			})
		}
	}

	_onClick() {
		if (this.state.currentStep < this.state.maxSteps) {
			this.setState({
				currentStep: this.state.currentStep + 1
			});
			return;
		}
		const libraryDisplayAuthors = this.state.libraryStyle.includes('authored');
		const libraryStyle = this.state.libraryStyle.replace('authored', '');
		SettingsService.setSetting('libraryDisplayAuthors', libraryDisplayAuthors);
		SettingsService.setSetting('libraryStyle', libraryStyle);
		SettingsService.setSetting('libraryPath', this.state.libraryDataFolder);
		SettingsService.setSetting('importStyle', this.state.importStyle);
		SettingsService.setSetting('firstRun', false);
		this.props.history.push('/');

	}

	_folderStructureCell() {
		const dlStyle = {textAlign:'left', padding: '0 0 0 5em', margin: '0'};
		return <div>
			<h2 style={{fontWeight:400}}>Folder Structure</h2>
			<dl style={dlStyle}>
				<dt>
					Charlie Smith
					<dl style={dlStyle}>
						<dt>
							Adventure Book
							<dl style={dlStyle}>
								<dt>Track 1</dt>
								<dt>Track 2</dt>
								<dt>Track 3</dt>
								<dt>Track 4</dt>
								<dt>Track 5</dt>
							</dl>
						</dt>
						<dt>
							Adventure Series
							<dl style={dlStyle}>
								<dt>01 First Book</dt>
								<dt>02 Second Book</dt>
								<dt>03 Third Book</dt>
							</dl>
						</dt>
					</dl>
				</dt>
			</dl>
		</div>;
	}

	_metaDataCell() {
		return <div>
			<h2 style={{fontWeight:400}}>Track Metadata</h2>
			<ReactTable
				columns={[
					{Header: 'Title', accessor: 'title'},
					{Header: 'Album', accessor: 'album'},
					{Header: 'Author', accessor: 'author'},
				]}
				data={[
					{title:'Track 1', album:'Adventure Book', author:'Charlie Smith'},
					{title:'Track 2', album:'Adventure Book', author:'Charlie Smith'},
					{title:'Track 3', album:'Adventure Book', author:'Charlie Smith'},
					{title:'Track 4', album:'Adventure Book', author:'Charlie Smith'},
					{title:'Track 5', album:'Adventure Book', author:'Charlie Smith'},
					{title:'Track 6', album:'Adventure Book', author:'Charlie Smith'},
				]}
				defaultPageSize={6}
				showPagination={false}
		/>
		</div>;
	}

	get _libraryProperties() {
		const works = [
			{name:'Adventure Book', art:[{path:'/assets/cover.png'}], tracks:[], info:[], author:'Charlie Smith'},
			{name:'01 First Book', art:[{path:'/assets/cover.png'}], tracks:[], info:[], author:'Charlie Smith', series: 'Adventure Series'},
			{name:'02 Second Book', art:[{path:'/assets/cover.png'}], tracks:[], info:[], author:'Charlie Smith', series: 'Adventure Series'},
			{name:'03 Third Book', art:[{path:'/assets/cover.png'}], tracks:[], info:[], author:'Charlie Smith', series: 'Adventure Series'},
		];
		return {
			libraryTitle: '',
			savedTimesTitle: '',
			noBooksFound: '',
			displaySavedTimesSection: false,
			displayLibrary: true,
			savedTimeWorks: [],
			savedTimes: [],
			libraryWorks: works,
			libraryBook: (rt, a, s, b, k) => rt(a,s,b,k),
			savedBook: null,
			itemClick: () => {},
		};
	}

	_tilesCell() {
		return <div>
			<h2 style={{fontWeight:400}}>Tiles</h2>
			<View itemComponent={Tile} cellWidthDivider={200} {...this._libraryProperties} />
		</div>
	}

	_tilesAuthoredCell() {
		return <div>
			<h2 style={{fontWeight:400}}>Authored Tiles</h2>
			<AuthoredView itemComponent={Tile} cellWidthDivider={200} {...this._libraryProperties} />
		</div>
	}

	_rowsCell() {
		return <div>
			<h2 style={{fontWeight:400}}>Rows</h2>
			<View itemComponent={Row} cellWidthDivider={300} {...this._libraryProperties} />
		</div>
	}

	_rowsAuthoredCell() {
		return <div>
			<h2 style={{fontWeight:400}}>Authored Rows</h2>
			<AuthoredView itemComponent={Row} cellWidthDivider={300} {...this._libraryProperties} />
		</div>
	}

	render() {
		const hasPrevious = this.state.currentStep > 0;
		const hasNext = this.state.currentStep < this.state.maxSteps;
		return (
			<div>
				<div style={{color: this.props.theme.secondaryText, lineHeight: '1.2em'}}>
					<div style={{display: this.state.currentStep === 0 ? 'block' : 'none'}}>
						<h1 style={{color: this.props.theme.primaryText}}>Welcome to Audio Book Player</h1>
						<p>
							This wizard is going to help you get setup. Click the 'Next' Button when your ready to proceed.<br/>
							<span style={{fontSize:'.9em'}}>(Remember all selections can be changed within the a setting menu)</span>
						</p>
					</div>

					<div style={{display: this.state.currentStep === 1 ? 'block' : 'none'}}>
						<h1 style={{color: this.props.theme.primaryText}}>Library Location</h1>
						{this.instruction(1, 'First off start by selecting the location of your audio book library')}
						<FolderSelector value={this.state.libraryDataFolder} onChange={(event) => this.setState({libraryDataFolder: event.target.value})} />
					</div>

					<div style={{display: this.state.currentStep === 2 ? 'block' : 'none'}}>
						<h1 style={{color: this.props.theme.primaryText}}>Understanding Your Library</h1>
						{this.instruction(2, 'Select how you\'d like us to understand your library')}
						<SelectionGrid selectedValue={this.state.importStyle} columnTemplate='1fr 1fr' padding='0 20vw' options={[
							{cell: this._folderStructureCell(), value:'folders'},
							{cell: this._metaDataCell(), value:'metadata'},
						]} onChange={(value) => this.setState({importStyle: value})} style={{
							fontSize:'.7em'
						}} />
					</div>

					<div style={{display: this.state.currentStep === 3 ? 'block' : 'none'}}>
						<h1 style={{color: this.props.theme.primaryText}}>Displaying Your Library</h1>
						{this.instruction(3, 'Finally select how you\'d like your library to display')}
						<SelectionGrid selectedValue={this.state.libraryStyle} columnTemplate='1fr 1fr' padding='0 5vw' options={[
							{cell: this._tilesCell(), value:'grid'},
							{cell: this._rowsCell(), value:'row'},
							{cell: this._tilesAuthoredCell(), value:'authoredgrid'},
							{cell: this._rowsAuthoredCell(), value:'authoredrow'},
						]} onChange={(value) => this.setState({libraryStyle: value})} style={{
							fontSize:'.7em'
						}} />
					</div>

					<div style={{display:'flex', justifyContent:'center', margin: '2em'}}>
						<input type="button" value="Previous" style={{
							padding:' 1em 4em',
							fontSize:' 1.5em',
							border: 'none',
							cursor: hasPrevious ? 'pointer' : 'default',
							backgroundColor: this.props.theme.inputBackground,
							color: hasPrevious ? this.props.theme.activeText : this.props.theme.inactiveText,
						}} onClick={this._onClickPrevious} />
						<div style={{width:'2em'}} />
						<input type="button" value={hasNext ? 'Next' : 'Save'} style={{
							padding:' 1em 4em',
							fontSize:' 1.5em',
							border: 'none',
							cursor: 'pointer',
							backgroundColor: this.props.theme.inputBackground,
							color: this.props.theme.activeText,
						}} onClick={this._onClick} />
					</div>
				</div>
			</div>
		);
	}
}))