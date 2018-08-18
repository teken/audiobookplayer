import React, {Component} from 'react';
import { withRouter } from 'react-router-dom'
import equal from 'deep-equal';

import Setting from './Setting';
import FolderSelector from './FolderSelector';
import ButtonRow from './ButtonRow';
import Dropdown from './Dropdown';
import Checkbox from './Checkbox';

import ConfirmModal from '../modal/ConfirmModal';

const {ipcRenderer} = window.require('electron');

export default withRouter(class Settings extends Component {
	constructor(props) {
		super(props);

		this.settingsObjects = [
			{name:'libraryDataFolder', dataName:'libraryPath'},
			{name:'dataDataFolder', dataName:'dataPath'},
			{name:'libraryStyle', dataName:'libraryStyle'},
			{name:'libraryDisplayAuthors', dataName:'libraryDisplayAuthors', type:'boolean'},
		];

		this.oldSettings = {};
		this.settingsObjects.forEach(item => {
			switch (item.type) {
				default:
				case 'string':
					this.oldSettings[item.name] = ipcRenderer.sendSync('settings.get', item.dataName);
					break;
				case 'boolean':
					this.oldSettings[item.name] = ipcRenderer.sendSync('settings.get', item.dataName) === 'true';
					break;
				case 'number':
					this.oldSettings[item.name] = Number(ipcRenderer.sendSync('settings.get', item.dataName));
					break;
			}
		});

		this.state = {
			settings: Object.assign({}, this.oldSettings)
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.clearLibrary = this.clearLibrary.bind(this);
		this.reimportLibrary = this.reimportLibrary.bind(this);
		this.addDeltasToLibrary = this.addDeltasToLibrary.bind(this);
	}

	handleChange(event, name) {
		let settings = this.state.settings;
		settings[name] = event.target.value;
		this.setState({settings:settings});
	}

	handleSubmit(event) {
		event.preventDefault();
		this.settingsObjects.forEach(item => {
			if (this.oldSettings[item.name] !== this.state.settings[item.name])
				ipcRenderer.send('settings.set', {name: item.dataName, value: this.state.settings[item.name]});
		});
		this.props.history.push('/');
	}

	get isDirty() {
		return !equal(this.oldSettings, this.state.settings);
	}

	clearLibrary() {
		this.setState({
			showClear: true
		});
		ipcRenderer.once('library.clear.reply', (event, arg) => {
			console.log('Database cleared', arg);
		});
		ipcRenderer.send('library.clear');

	}

	reimportLibrary() {
		this.setState({
			showReimport: true
		});
		ipcRenderer.once('library.reimport.reply', (event, arg) => {
			console.log('Database Re-Imported', arg);
		});
		ipcRenderer.send('library.reimport');
	}

	addDeltasToLibrary() {
		ipcRenderer.once('library.importdelta.reply', (event, arg) => {
			console.log('Database Deltas Imported', arg);
		});
		ipcRenderer.send('library.importdelta');
	}

	buttons = [
		{value:"Clear Library", onClick:() => this.setState({showClear: true})},
		{value:"Re-Import Library", onClick:() => this.setState({showReimport: true})},
		{value:"Scan for changes in Library", onClick:this.addDeltasToLibrary},
	];

	render() {
		return (
			<div style={{margin:'1em'}}>
				<ConfirmModal show={this.state.showClear} styling={this.props.styling}
							  heading="Are you sure?"
							  body="This will clear the library completely. Are you sure you want to do this?"
							  okOnClick={this.clearLibrary} cancelOnClick={() => this.setState({showClear: false})} />
				<ConfirmModal show={this.state.showReimport} styling={this.props.styling}
							  heading="Are you sure?"
							  body="This will clear the library completely and then import everything from fresh. Are you sure you want to do this?"
							  okOnClick={this.reimportLibrary} cancelOnClick={() => this.setState({showReimport: false})} />
				<h1>Settings</h1>
				<form onSubmit={this.handleSubmit} style={{color:this.props.styling.secondaryText}}>
					<Setting label="Library Actions">
						<ButtonRow styling={this.props.styling} buttons={this.buttons}/>
					</Setting>
					<Setting label="Library Folder Path">
						<FolderSelector styling={this.props.styling} value={this.state.settings.libraryDataFolder} onChange={(event) => this.handleChange(event, "libraryDataFolder")} />
					</Setting>
					<Setting label="Data Folder Path">
						<FolderSelector styling={this.props.styling} value={this.state.settings.dataDataFolder} onChange={(event) => this.handleChange(event, "dataDataFolder")} />
					</Setting>
					<Setting label="Library Style">
						<Dropdown styling={this.props.styling} value={this.state.settings.libraryStyle} options={[
							{name:'Grid', value:'grid'},
							{name:'Rows', value:'row'}
						]} onChange={(event) => this.handleChange(event, "libraryStyle")} />
					</Setting>
					<Setting label="Display Authors in Library">
						<Checkbox styling={this.props.styling} value={this.state.settings.libraryDisplayAuthors} onChange={(event) => this.handleChange(event, "libraryDisplayAuthors")} />
					</Setting>
					<Setting>
						<input type="submit" value="Save" disabled={!this.isDirty} style={{
							padding:' 1em 4em',
							fontSize:' 1.5em',
							border: 'none',
							cursor: this.isDirty ? 'pointer' : 'default',
							backgroundColor: this.props.styling.inputBackground,
							color: this.isDirty ? this.props.styling.activeText : this.props.styling.inactiveText,
						}}/>
					</Setting>
				</form>
			</div>
		);
	}
})

