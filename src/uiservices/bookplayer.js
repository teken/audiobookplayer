import AudioPlayer from "./audioplayer";
import ChapterService from "./chapters";
import LibraryService from "./library";
import FileService from "./file";

export default class BookPlayer {
	constructor(volume) {
		this._audioPlayer = new AudioPlayer();
		this._audioPlayer.volume = Number(volume);
		this._work = null;
		this._currentTrack = null;
		this._tracks = [];
		this.minVolume = 0;
		this.maxVolume = 200;
	}

	get chapterService() {
		if (this._work)
			return new ChapterService(this._work);
		else
			return new ChapterService(null);
	}

	get volumeRange() {
		return Number(this.maxVolume - this.minVolume);
	}

	get work () {
		return this._work;
	}

	open(key, callback, endedCallback) {
		this._tracks = [];
		this._currentTrack = null;
		this._loadData(key);
		this.setToTrack(this._tracks[0].key, callback, endedCallback);
	}

	openFromSpecificTrack(key, trackName, callback, endedCallback) {
		this._tracks = [];
		this._currentTrack = null;
		this._loadData(key);
		this.setToTrack(trackName, callback, endedCallback);
	}

	_loadData(key) {
		const work = LibraryService.getWork(key);
		if (work === null) throw new Error('Failed to find work');
		else this._work = work;
		this._tracks = work.tracks;
	}

	play() {
		this._audioPlayer.play();
	}

	playPause() {
		if (!this.isLoaded) return;
		if (this.isPlaying) this.pause();
		else this.play()
	}

	setToTrack(trackKey, callback, endedCallback) {
		this._currentTrack = trackKey;
		const filePath = FileService.lookupFilePath(trackKey);
		this._audioPlayer.open(filePath, callback, () => {
			if (this.hasNext) this.playNext();
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
		if (!this.isLoaded || this._tracks.length === 0) return 0;
		else if (this._tracks.length === 1) return this.currentTrackTime;
		else return this._tracks.slice(0, this.currentTrackIndex).map(track => track.duration).reduce((a,v) => a + v, 0) + this.currentTrackTime;
	}

	set currentTime(value) {
		if (isNaN(value)) throw new Error(`Current time can not be set to ${value}`);
		if (this.duration > 0 && (value > this.duration || this._tracks.length === 0)) return;
		else if (this._tracks.length === 1) this._audioPlayer.currentTime = value;
		else {
			let remainingTime = value;
			let total = 0;
			let trackName;
			for (let track of this._tracks) {
				trackName = track.key;
				if (this.duration === 0) break;
				if (remainingTime < (total + track.duration)) {
					remainingTime -= total;
					break;
				}
				total += track.duration;
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
		return this.isLoaded ? this._tracks.map(track => track.duration).reduce((a, v) => a + v, 0) : 1;
	}

	get trackDuration() {
		return this._audioPlayer.duration;
	}

	get hasPrevious() {
		if (this.isLoaded) {
			if (this.chapters) {
				return this.currentChapterIndex > 0
			} else {
				return this.currentTrackIndex > 0;
			}
		}
	}

	get hasNext() {
		if (this.isLoaded) {
			if (this.chapters) {
				return this.currentChapterIndex < (this.flattenedChapters.length - 1)
			} else {
				return this.currentTrackIndex < (this._tracks.length - 1);
			}
		}
	}

	get next() {
		if (!this.hasNext) return;
		if (this.chapters) {
			return this.flattenedChapters[this.currentChapterIndex + 1]
		} else {
			return this._tracks[this.currentTrackIndex + 1];
		}
	}

	get previous() {
		if (!this.hasPrevious) return;
		if (this.chapters) {
			return this.flattenedChapters[this.currentChapterIndex - 1]
		} else {
			return this._tracks[this.currentTrackIndex - 1];
		}
	}

	playNext() {
		if (!this.hasNext) return;
		if (this.chapters) {
			this.currentTime = this.next.time;
		} else {
			this.setToTrack(this.next.name, () => this.play());
		}

	}

	playPrevious() {
		if (!this.hasPrevious) return;
		if (this.chapters) {
			this.currentTime = this.previous.time;
		} else {
			this.setToTrack(this.previous.name, () => this.play());
		}
	}

	getTrackIndex(trackName) {
		return this._tracks.findIndex(track => track.name === trackName);
	}

	get currentTrackIndex() {
		return this.getTrackIndex(this._currentTrack);
	}

	get currentChapterIndex() {
		let index = 0;
		let current = this.currentTime;
		for (let i = 0; i < this.flattenedChapters.length; i++) {
			if (current > this.flattenedChapters[i].time) index = i;
			else break;
		}
		return index;
	}

	get currentTrack() {
		return this._currentTrack;
	}

	get flattenedChapters() {
		return this.chapters.reduce((acc, val) => acc.concat(val.data),[]);
	}

	get chapters() {
		return this.chapterService.chapters;
	}
}