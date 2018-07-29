const AppAudioContext = (window.AudioContext || window.webkitAudioContext);

export default class AudioPlayer {
	constructor () {
		/**
		 * Audio context.
		 * @type {AudioContext|webkitAudioContext}
		 */
		this._audioContext = (() => {
			if (AppAudioContext) return new AppAudioContext();
			throw new Error('Web Audio API is not supported.');
		})();

		/**
		 * Audio element.
		 * @type {Audio}
		 */
		this._audio = null;

		/**
		 * Node for audio source。
		 * @type {MediaElementAudioSourceNode}
		 */
		this._sourceNode = null;

		/**
		 * Node for audio volume adjustment.
		 * @type {GainNode}
		 */
		this._gainNode = this._audioContext.createGain();
		this._gainNode.gain.value = 1.0;
		this._gainNode.connect(this._audioContext.destination);

		/**
		 * Node for audio analyze.
		 * @type {AnalyserNode}
		 */
		this._analyserNode = this._audioContext.createAnalyser();
		this._analyserNode.fftSize = 64;
		this._analyserNode.connect(this._gainNode);

		/**
		 * Node for effector
		 * @type {GainNode}
		 */
		this._effectNode = this._audioContext.createGain();
		this._effectNode.gain.value = 1.0;
		this._effectNode.connect(this._analyserNode);

		/**
		 * Node that connects the source and the effector.
		 * @type {GainNode}
		 */
		this._sourceEffectNode = this._audioContext.createGain();
		this._sourceEffectNode.gain.value = 1.0;
		this._sourceEffectNode.connect(this._effectNode);

		/**
		 * Indicates that the audio is playing.
		 * @type {Boolean}
		 */
		this._isPlaying = false;
	}

	get isPlaying () {
		return (this._audio ? this._isPlaying : false);
	}

	get isLoaded () {
		return (this._audio);
	}

	/**
	 * Get an audio duration.
	 *
	 * @return {Number} duration.
	 */
	get duration () {
		return (this._audio ? this._audio.duration : 0);
	}

	/**
	 * Get the currently playback time.
	 *
	 * @return {Number} playback time (milliseconds).
	 */
	get currentTime () {
		return (this._audio ? this._audio.currentTime : 0);
	}

	/**
	 * Set the currently playback time.
	 *
	 * @param {Number} value playback time (milliseconds).
	 */
	set currentTime (value) {
		if (value === undefined || !(this._audio)) return;

		if (isNaN(value)) throw new Error(`provided time is not a number, provide value is ${value}`);

		const currentTime = Number(value);

		if (currentTime < 0 || this.duration < currentTime) return;
		this._audio.currentTime = currentTime;
	}

	/**
	 * Get the frequency spectrum of an audio.
	 *
	 * @return {Uint8Array} Spectrums If an audio during playback. Otherwise null.
	 */
	get spectrums () {
		if (!(this._sourceNode && this._isPlaying)) return null;

		const spectrums = new Uint8Array(this._analyserNode.frequencyBinCount);
		this._analyserNode.getByteFrequencyData(spectrums);

		return spectrums;
	}

	/**
	 * Get the audio volume.
	 *
	 * @return {Number} Volume (range: 0 - 100).
	 */
	get volume () {
		return (this._gainNode.gain.value * 100);
	}

	/**
	 * Set the volume fro playback audio.
	 *
	 * @param {Number} value New volume (range: 0 - 100).
	 */
	set volume (value) {
		if (0 <= value && value <= 100) this._gainNode.gain.value = (value / 100);
	}

	/**
	 * Close the currently audio nodes and source.
	 */
	close () {
		this.stop();

		this._audio = null;
		this._sourceNode = null;
	}

	/**
	 * Open an audio file for playback target.
	 *
	 * @param {String} filePath Audio file path.
	 * @param {Function} loadCallback Callback function that occurs when load a file.
	 */
	open (filePath, loadCallback, endCallback) {
		this.close();

		this._audio = new window.Audio(filePath);
		this._audio.addEventListener('loadstart', () => {
			if (!this._sourceNode) {
				this._sourceNode = this._audioContext.createMediaElementSource(this._audio);
				this._sourceNode.connect(this._sourceEffectNode);
			}
			if (loadCallback) loadCallback()
		});
		this._audio.addEventListener('ended', () => {
			if (endCallback) endCallback()
		})
	}

	/**
	 * Play the audio.
	 */
	play () {
		if (!(this._audio) || this._isPlaying) return;

		this._audio.play();
		this._isPlaying = true;
	}

	/**
	 * Pause the currently playback audio.
	 */
	pause () {
		if (!(this._audio && this._isPlaying)) return;

		this._audio.pause();
		this._isPlaying = false;
	}

	/**
	 * Stop the currently playback audio.
	 */
	stop () {
		if (!(this._sourceNode && this._isPlaying)) return;

		this._audio.pause();
		this._audio.currentTime = 0;
		this._isPlaying = false;
	}
}
