import AudioPlayer from "./audioplayer";
import ChapterService from "./chapters";

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

	get chapterService() {
		if (this.work)
			return new ChapterService(this.book);
		else
			return new ChapterService(null);
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
		return parts.filter(x => x.length > 0).join('##');

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
		let work = window.electron.sendSync('library.getWork', work_id);
		if (work === null) throw new Error('Failed to find work');
		else this._work = work;

		this._tracks = this.book.tracks;

		this._tracks.forEach(track => {
			window.electron.mm.parseFile(track.path, {duration:true}).then(metadata => {
				this._tracks.find(t => t.path === track.path).meta = metadata;
			}).catch(x => console.error("Failed to parse metadata", x))
		});

		let author = window.electron.sendSync('library.getAuthor', this._work.author_id);
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
		if (!this.isLoaded) return 1;
		return this._tracks.map( track => track.meta ? track.meta.format.duration : 0).reduce((a,v) => a + v, 0);
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
		return false;
	}

	get hasNext() {
		if (this.isLoaded) {
			if (this.chapters) {
				return this.currentChapterIndex < (this.flattenedChapters.length - 1)
			} else {
				return this.currentTrackIndex < (this._tracks.length - 1);
			}
		}
		return false;
	}

	get next() {
		if (!this.hasNext) return null;
		if (this.chapters) {
			return this.flattenedChapters[this.currentChapterIndex + 1]
		} else {
			return this._tracks[this.currentTrackIndex + 1];
		}
	}

	get previous() {
		if (!this.hasPrevious) return null;
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

	formatTime(time) {
		if (isNaN(time)) return "--:--:--";
		const f = n => (n).toLocaleString('en-GB', {minimumIntegerDigits: 2, useGrouping:false});
		if (!time) time = 0;
		const base = new Date(1000 * time);
		const hor = base.getHours() - 1;
		const day = (base.getDate() - 1) * 24;
		return `${f(hor+day)}:${f(base.getMinutes())}:${f(base.getSeconds())}`;
	}
}