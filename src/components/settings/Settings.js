import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import equal from "deep-equal";

import Setting from "./Setting";
import FolderSelector from "./FolderSelector";
import ButtonRow from "./ButtonRow";
import Dropdown from "./Dropdown";
import Checkbox from "./Checkbox";

import ConfirmModal from "../modal/ConfirmModal";

import withTheme from "../theme/withTheme";
import SettingsService from "../../uiservices/settings";
import LibraryService from "../../uiservices/library";

export default withRouter(withTheme(class Settings extends Component {
	constructor(props) {
		super(props);

		this.settingsObjects = [
			{name:'libraryDataFolder', dataName:'libraryPath'},
			{name:'dataDataFolder', dataName:'dataPath'},
			{name:'libraryStyle', dataName:'libraryStyle'},
			{name:'libraryDisplayAuthors', dataName:'libraryDisplayAuthors', type:'boolean'},
			{name:'libraryImportStyle', dataName:'importStyle'},
			//{name:'displayFirstRunWizard', dataName:'firstRun', type:'boolean'},
		];
		this.state = {
			oldSettings:{},
			settings:{}
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.clearLibrary = this.clearLibrary.bind(this);
		this.reimportLibrary = this.reimportLibrary.bind(this);
		this.addDeltasToLibrary = this.addDeltasToLibrary.bind(this);
		this.getSettings = this.getSettings.bind(this);
	}

	getSettings() {
		const oldSettings = {};
		// const settings = this.settingsObjects.reduce((a, v) => {
		// 	a.push(v.dataName);
		// 	return a;
		// },[]);
		const dbkeys = SettingsService.dbKeys();
		const fetch = (name) => SettingsService.getSetting(name);
		this.settingsObjects.forEach(item => {
			switch (item.type) {
				default:
				case 'string':
					oldSettings[item.name] = fetch(item.dataName);
					break;
				case 'boolean':
					oldSettings[item.name] = Boolean(fetch(item.dataName));
					break;
				case 'number':
					oldSettings[item.name] = Number(fetch(item.dataName));
					break;
			}
		});
		console.log(dbkeys)
		this.setState({
			settings: Object.assign({}, oldSettings),
			oldSettings: oldSettings,
			dbKeys: dbkeys
		});
	}

	componentDidMount() {
		this.getSettings();
	}

	handleChange(event, name) {
		let settings = this.state.settings;
		settings[name] = event.target.value;
		this.setState({settings:settings});
	}

	handleSubmit(event) {
		event.preventDefault();
		this.settingsObjects.forEach(item => {
			if (this.state.oldSettings[item.name] !== this.state.settings[item.name])
				SettingsService.setSetting(item.dataName, this.state.settings[item.name]);
		});
		this.props.history.push('/');
	}

	get isDirty() {
		return !equal(this.state.oldSettings, this.state.settings);
	}

	clearLibrary() {
		LibraryService.clearLibrary().then((arg) => {
			console.log('Database cleared', arg);
			this.setState({
				showClear: true
			});
		});
	}

	reimportLibrary() {
		LibraryService.reimportLibrary().then((arg) => {
			console.log('Database Re-Imported finished with', arg);
			this.setState({
				showReimport: false
			});
		});
	}

	addDeltasToLibrary() {
		LibraryService.importDifferencesToLibrary().then((arg) => {
			console.log('Database Deltas Imported', arg);
		});
	}

	buttons = [
		{value:"Show Setup Wizard", onClick:() => this.props.history.push('/setup')},
		// {value:"Clear Library", onClick:() => this.setState({showClear: true})},
		{value:"Re-Import Library", onClick:() => this.setState({showReimport: true})},
		// {value:"Scan for changes in Library", onClick:this.addDeltasToLibrary},
	];

	render() {
		return (
			<div style={{margin:'1em'}}>
				<ConfirmModal show={this.state.showClear}
							  heading="Are you sure?"
							  body="This will clear the library completely. Are you sure you want to do this?"
							  okOnClick={this.clearLibrary}
							  cancelOnClick={() => this.setState({showClear: false})} />
				<ConfirmModal show={this.state.showReimport}
							  heading="Are you sure?"
							  body="This will clear the library completely and then import everything from fresh. Are you sure you want to do this?"
							  okOnClick={this.reimportLibrary}
							  cancelOnClick={() => this.setState({showReimport: false})} />
				<h1>Settings</h1>
				<form onSubmit={this.handleSubmit} style={{color:this.props.theme.secondaryText}}>
					<Setting label="Actions">
						<ButtonRow buttons={this.buttons}/>
					</Setting>
					<Setting label="Library Folder Path">
						<FolderSelector value={this.state.settings.libraryDataFolder} onChange={(event) => this.handleChange(event, "libraryDataFolder")} />
					</Setting>
					<Setting label="Data Folder Path">
						<FolderSelector value={this.state.settings.dataDataFolder} onChange={(event) => this.handleChange(event, "dataDataFolder")} />
					</Setting>
					<Setting label="Library Style">
						<Dropdown value={this.state.settings.libraryStyle} options={[
							{name:'Grid', value:'grid'},
							{name:'Rows', value:'row'}
						]} onChange={(event) => this.handleChange(event, "libraryStyle")} />
					</Setting>
					<Setting label="Display Authors in Library">
						<Checkbox value={this.state.settings.libraryDisplayAuthors} onChange={(event) => this.handleChange(event, "libraryDisplayAuthors")} />
					</Setting>
					<Setting label="Library Import Style">
						<Dropdown value={this.state.settings.libraryImportStyle} options={[
							{name:'Folder Structure', value:'folder'},
							{name:'File Metadata', value:'metadata'}
						]} onChange={(event) => this.handleChange(event, "libraryImportStyle")} />
					</Setting>
					<Setting>
						<input type="submit" value="Save" disabled={!this.isDirty} style={{
							padding:' 1em 4em',
							fontSize:' 1.5em',
							border: 'none',
							cursor: this.isDirty ? 'pointer' : 'default',
							backgroundColor: this.props.theme.inputBackground,
							color: this.isDirty ? this.props.theme.activeText : this.props.theme.inactiveText,
						}}/>
					</Setting>
				</form>
			</div>
		);
	}
}))

