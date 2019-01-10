import FileService from "./file";
import {CUEFileParser} from 'cuefileparser';

const fs = window.require('fs');

export default class ChapterService {
	constructor(book) {
		this._book = book;
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
					fileName: fileName, tracks: [
						{
							title: name,
							timeInSeconds: timeCode
						}
					]
				});
				timeCode += track.duration;
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
					case 'cue': return [CUEFileParser.parseFile(path)];
					case 'm3u': return this.loadM3UFileData(path);
					default: return [];
				}
			});
			return i[0]; //TODO: Fix this
		}
		return [];
	}
}