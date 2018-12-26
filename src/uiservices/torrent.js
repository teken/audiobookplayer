import WebTorrent from 'webtorrent';

export default class TorrentService {

	constructor() {
		if (!WebTorrent.WEBRTC_SUPPORT) {
			console.error('Web RTC not supported')
		}

		this.client = new WebTorrent({
			tracker: false,
			dht:false,
		});

		this.client.on('error', (err) => {
			console.error(err)
		});
	}

	get downloads() {
		return [{
			infoHash: '1',
			progress:.9,
			name: 'Test 1',
			active: true,
		},{
			infoHash: '2',
			progress:.4,
			name: 'Test 2',
			active: false,
		}];

		return this.client.torrents.map(torrent => ({
			progress: torrent.progress,
			name: torrent.name,
			active: torrent.progress === 1,
		}));
	}
}
