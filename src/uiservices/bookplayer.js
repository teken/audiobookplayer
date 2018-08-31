import AudioPlayer from './audioplayer';

const {ipcRenderer} = window.require('electron');
const mm = window.require('music-metadata');
const fs = window.require('fs');

export default class BookPlayer {
	constructor(volume) {
		this._audioPlayer = new AudioPlayer();
		this._audioPlayer.volume = Number(volume);
		this._work = null;
		this._bookNameIfSeries = null;
		this._author = null;
		this._currentTrack = null;
		this._tracks = [];
		this.minVolume = 0;
		this.maxVolume = 200;
	}

	get volumeRange() {
		return Number(this.maxVolume - this.minVolume);
	}

	get author () {
		return this._author;
	}

	get work () {
		return this._work;
	}

	get book () {
		return this._work.type === 'SERIES' ? this._work.books.find(x => x.name === this._bookNameIfSeries) : this._work;
	}

	get timingKey() {
		if (!this.isLoaded) return '';
		let parts = [
			this._author.name,
			this._work.type === 'SERIES' ? this._work.name : '',
			this.book.name,
		];
		return parts.filter(x => x.length > 0).join('-');

	}

	open(work_id, bookNameIfSeries, callback, endedCallback) {
		this._bookNameIfSeries = bookNameIfSeries;
		this._tracks = [];
		this._currentTrack = null;
		this._loadData(work_id);
		this.setToTrack(this._tracks[0].name, callback, endedCallback);
	}

	openFromSpecificTrack(work_id, bookNameIfSeries, trackName, callback, endedCallback) {
		this._bookNameIfSeries = bookNameIfSeries;
		this._tracks = [];
		this._currentTrack = null;
		this._loadData(work_id);
		this.setToTrack(trackName, callback, endedCallback);
	}

	_loadData(work_id) {
		let work = ipcRenderer.sendSync('library.getWork', work_id);
		if (work === null) throw new Error('Failed to find work');
		else this._work = work;

		this._tracks = this.book.tracks;

		this._tracks.forEach(track => {
			mm.parseFile(track.path).then(metadata => {
				this._tracks.find(t => t.path === track.path).meta = metadata;
			})
		});

		let author = ipcRenderer.sendSync('library.getAuthor', this._work.author_id);
		if (author === null) throw new Error('Failed to find author');
		else this._author = author;
	}

	play() {
		this._audioPlayer.play();
	}

	playPause() {
		if (!this.isLoaded) return;
		if (this.isPlaying) this.pause();
		else this.play()
	}

	setToTrack(trackName, callback, endedCallback) {
		this._currentTrack = trackName;
		const filePath = this._tracks.find(track => track.name === this._currentTrack).path;
		this._audioPlayer.open(filePath, callback, () => {
			if (this.hasNextTrack) this.playNextTrack();
			else {
				this.stop();
				if (endedCallback) endedCallback();
			}
		});
	}

	pause() {
		this._audioPlayer.pause();
	}

	stop() {
		if (!this.isLoaded) return;
		this._audioPlayer.stop();
		this._tracks = [];
		this._currentTrack = null;
		this._audioPlayer.close();
	}

	get currentTrackTime() {
		return this._audioPlayer.currentTime;
	}

	get currentTime() {
		if (this._tracks.length === 0) return 0;
		else if (this._tracks.length === 1) return this.currentTrackTime;
		else return this._tracks.slice(0, this.currentTrackIndex).map(track => track.meta ? track.meta.format.duration : 0).reduce((a,v) => a + v, 0) + this.currentTrackTime;
	}

	set currentTime(value) {
		if (this.duration > 0 && (value > this.duration || this._tracks.length === 0)) return;
		else if (this._tracks.length === 1) this._audioPlayer.currentTime = value;
		else {
			let remainingTime = value;
			let total = 0;
			let trackName = '';
			for (let track of this._tracks) {
				trackName = track.name;
				if (remainingTime < (total + (track.meta ? track.meta.format.duration: 0 ))) {
					remainingTime -= total;
					break;
				}
				total += (track.meta ? track.meta.format.duration: 0 )
			}
			this.setToTrack(trackName, () => {
				this._audioPlayer.currentTime = remainingTime;
				this.play();
			});
		}
	}

	get progress() {
		const value = this.currentTime / this.duration;
		return isNaN(value) ? 0 : value;
	}

	get isPlaying() {
		return this._audioPlayer.isPlaying;
	}

	get isLoaded() {
		return this._audioPlayer.isLoaded;
	}

	get volume() {
		return this._audioPlayer.volume;
	}

	set volume(value) {
		this._audioPlayer.volume = value;
	}

	get duration() {
		return this._tracks.map( track => track.meta ? track.meta.format.duration : 0).reduce((a,v) => a + v, 0);
	}

	get trackDuration() {
		return this._audioPlayer.duration;
	}

	get hasPreviousTrack() {
		return this.isLoaded && this.currentTrackIndex > 0;
	}

	get hasNextTrack() {
		return this.isLoaded && this.currentTrackIndex < (this._tracks.length -1);
	}

	get nextTrack() {
		if (!this.hasNextTrack) return;
		return this._tracks[this.currentTrackIndex + 1];
	}

	get previousTrack() {
		if (!this.hasPreviousTrack) return;
		return this._tracks[this.currentTrackIndex - 1];
	}

	playNextTrack() {
		if (!this.hasNextTrack) return;
		this.setToTrack(this.nextTrack.name, () => this.play());
	}

	playPreviousTrack() {
		if (!this.hasPreviousTrack) return;
		this.setToTrack(this.previousTrack.name, () => this.play());
	}

	getTrackIndex(trackName) {
		return this._tracks.findIndex(track => track.name === trackName);
	}

	get currentTrackIndex() {
		return this.getTrackIndex(this._currentTrack);
	}

	get currentTrack() {
		return this._currentTrack;
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

	get chapters() {
		//TODO: finish chapter markers
		return [];//this.isLoaded ? this.book.info.map(file => this.loadCUEFileData(file.path)) : [];
	}
}