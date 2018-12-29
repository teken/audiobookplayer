import FileService from "./file";

const fs = window.require('fs');

export default class ChapterService {
	constructor(book) {
		this._book = book;
	}

	loadCUEFileData(path) {
		if (path === null) return [];
		const buffer = fs.readFileSync(path);
		const lines = buffer.toString('utf8').split('\n').map(line => line.trim()).filter(line => line.length > 0);
		const name = lines.slice(0,1)[0].slice(6, -5);
		const content = lines.slice(1);
		let data = [];
		for (let i = 0; i <= content.length; i+=3) {
			let name = String(content[i+1]).slice(7,-1);
			let timeCode = String(content[i+2]).slice(9);
			if (timeCode) data.push({name:name, time:this.formatCUETimeAsSecond(timeCode)})
		}
		return {name:name,data:data};
	}

	formatCUETimeAsSecond(time) {
		if (!isNaN(time)) return time;
		if (!time) time = '0:0:00';
		const parts = time.split(':');
		let date = new Date(null);
		date.setMinutes(Number(parts[0]));
		date.setSeconds(Number(parts[1]));
		date.setMilliseconds(Number(parts[2])*10);
		return date.getTime()/1000;
	}

	loadM3UFileData(path) {
		if (path === null) return [];
		const buffer = fs.readFileSync(path);
		const lines = buffer.toString('utf8').split('\n').map(line => line.trim()).filter(line => line.length > 0);
		const content = lines.slice(1);
		let data = [];
		let timeCode = 0;
		for (let i = 0; i <= content.length; i+=2) {
			let name = String(content[i]).split(',')[1];
			let fileName = String(content[i+1]);
			let track = this._book.tracks.find(x => x.name.includes(fileName));
			if (track && track.meta) {
				data.push({
					name: fileName, data: [
						{name: name, time: timeCode}
					]
				});
				timeCode += track.meta.format.duration;
			}
		}
		return data;
	}

	get chapters() {
		if (this._book) {
			let i = this._book.info.map(file => {
				let parts = file.split('.');
				const path = FileService.lookupFilePath(file);
				switch (parts[parts.length - 1].toLowerCase()) {
					case 'cue': return [this.loadCUEFileData(path)];
					case 'm3u': return this.loadM3UFileData(path);
					default: return [];
				}
			});
			return i[0]; //TODO: Fix this
		}
		return [];
	}
}