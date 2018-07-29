import React, {Component} from 'react';
import { withRouter } from 'react-router-dom'

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
		this.oldSettings = {
			libraryDataFolder: ipcRenderer.sendSync('settings.get', 'libraryPath'),
			dataDataFolder: ipcRenderer.sendSync('settings.get', 'dataPath'),
			libraryStyle: ipcRenderer.sendSync('settings.get', 'libraryStyle'),
			libraryDisplayAuthors: ipcRenderer.sendSync('settings.get', 'libraryDisplayAuthors'),
		};
		this.state = this.oldSettings;
		this.handleSubmit = this.handleSubmit.bind(this);
		this.clearLibrary = this.clearLibrary.bind(this);
		this.reimportLibrary = this.reimportLibrary.bind(this);
		this.addDeltasToLibrary = this.addDeltasToLibrary.bind(this);
	}

	handleChange(event, name) {
		this.setState({[name]: event.target.value});
	}

	handleSubmit(event) {
		event.preventDefault();
		if (this.oldSettings.libraryDataFolder !== this.state.libraryDataFolder) ipcRenderer.send('settings.set', {name:'libraryPath', value: this.state.libraryDataFolder});
		if (this.oldSettings.dataDataFolder !== this.state.dataDataFolder) ipcRenderer.send('settings.set', {name:'dataPath', value: this.state.dataDataFolder});
		if (this.oldSettings.libraryStyle !== this.state.libraryStyle) ipcRenderer.send('settings.set', {name:'libraryStyle', value: this.state.libraryStyle});
		if (this.oldSettings.libraryDisplayAuthors !== this.state.libraryDisplayAuthors) ipcRenderer.send('settings.set', {name:'libraryDisplayAuthors', value: this.state.libraryDisplayAuthors});
		this.props.history.push('/');
	}

	get isDirty() {
		if (this.oldSettings.libraryDataFolder !== this.state.libraryDataFolder ||
			this.oldSettings.dataDataFolder !== this.state.dataDataFolder) return true;
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
				<ConfirmModal show={this.state.showClear} styling={this.props.styling} heading="Are you sure?" body="This will clear the library completely. Are you sure you want to do this?" okOnClick={this.clearLibrary} cancelOnClick={() => this.setState({showClear: false})} />
				<ConfirmModal show={this.state.showReimport} styling={this.props.styling} heading="Are you sure?" body="This will clear the library completely and then import everything from fresh. Are you sure you want to do this?" okOnClick={this.reimportLibrary} cancelOnClick={() => this.setState({showReimport: false})} />
				<h1>Settings</h1>
				<form onSubmit={this.handleSubmit} style={{color:this.props.styling.secondaryText}}>
					<Setting label="Library Actions">
						<ButtonRow styling={this.props.styling} buttons={this.buttons}/>
					</Setting>
					<Setting label="Library Folder Path">
						<FolderSelector styling={this.props.styling} value={this.state.libraryDataFolder} onChange={(event) => this.handleChange(event, "libraryDataFolder")} />
					</Setting>
					<Setting label="Data Folder Path">
						<FolderSelector styling={this.props.styling} value={this.state.dataDataFolder} onChange={(event) => this.handleChange(event, "dataDataFolder")} />
					</Setting>
					<Setting label="Library Style">
						<Dropdown styling={this.props.styling} value={this.state.libraryStyle} options={[
							{name:'Grid', value:'grid'},
							{name:'Rows', value:'row'}
						]} onChange={(event) => this.handleChange(event, "libraryStyle")} />
					</Setting>
					<Setting label="Display Authors in Library">
						<Checkbox styling={this.props.styling} value={this.state.libraryDisplayAuthors} onChange={(event) => this.handleChange(event, "libraryDisplayAuthors")} />
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

