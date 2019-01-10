const path = require('path');
const hyperdb = require('hyperdb');
const SettingsService = require('./settings');
const mp = require('msgpack-lite');
const swarm = require('hyperdiscovery');

module.exports = class DatabaseService {

	// libraryDBSync: false,
	// libraryDBKey: null,
	// stateDBSync: false,
	// stateDBKey: null,

	static get dbOptions() {
		return {valueEncoding: 'binary'};
	}

	static get settings() {
		return new SettingsService();
	}

	static makeFilePath(name) {
		return path.join(this.settings.get('dataPath'), name);
	}

	static get library() {
		const filePath = this.makeFilePath('library.db');
		const sync = JSON.parse(this.settings.get('libraryDBSync'));
		console.log(this.settings.get('libraryDBKey'), typeof this.settings.get('libraryDBKey'))
		const s = this.settings.get('libraryDBKey');
		const key = s && Buffer.from(s, 'hex');
		return new Database(
			filePath,
			sync ? key : null,
			this.dbOptions,
			sync);
	}

	static get local() {
		const filePath = this.makeFilePath('local.db');
		return new Database(
			filePath,
			null,
			this.dbOptions,
			false);
	}

	static get states() {
		const filePath = this.makeFilePath('states.db');
		const sync = JSON.parse(this.settings.get('stateDBSync'));
		console.log(this.settings.get('stateDBKey'), typeof this.settings.get('stateDBKey'))
		const s = this.settings.get('stateDBKey');
		const key = s && Buffer.from(s, 'hex');
		return new Database(
			filePath,
			sync ? key : null,
			this.dbOptions,
			sync);
	}
};

class Database {
	constructor(path, key, options, enableSwarm) {
		this.db = hyperdb(path, key, options);
		this.db.ready(() => {
			if (enableSwarm) {
				console.info(`${path} sync enabled`)
				const sw = swarm(this.db);
				sw.on('connection', (peer, type) => {
					console.info(`${path} connected to: ${type.type} ${type.host} ${type.port}`)
					console.info(`${path} connected to ${sw1.connections.length} peers`)
				});
			} else console.info(`${path} sync not enabled`)
		});
	}

	get(key) {
		return new Promise((res, rej) => {
			this.db.get(key, (err, results) => {
				if (err) rej(err);
				res(results)
			})
		});
	}

	put(key, value) {
		const codedValue = mp.encode(value);
		return new Promise((res, rej) => {
			this.db.put(key, codedValue, (err, results) => {
				if (err) rej(err);
				res(results)
			})
		});
	}

	del(key) {
		return new Promise((res, rej) => {
			this.db.del(key, (err, results) => {
				if (err) rej(err);
				res(results)
			})
		});
	}

	batch(batch) {
		return new Promise((res, rej) => {
			this.db.batch(batch, (err, results) => {
				if (err) rej(err);
				res(results)
			})
		});
	}

	list(key) {
		return new Promise((res, rej) => {
			this.db.list(key, (err, results) => {
				if (err) rej(err);
				res(results)
			})
		});
	}

	cleanUpResults(results) {
		if (results.length === 0) return [];
		if (Array.isArray(results[0])) results = results.reduce((a,v) => a.concat(v[0]), []);
		if (Array.isArray(results))
			return results.map(this.cleanUpResult);
		else
			return this.cleanUpResult(results)

	}

	cleanUpResult(node) {
		const item = mp.decode(node.value);
		if (typeof item === 'object') {
			const keys = node.key.split('/');
			item.key = node.key;
			item.author = keys[0];
			if (keys.length === 3) {
				item.series = keys[1];
				item.name = keys[2];
			} else {
				item.name = keys[1];
			}
		}

		return item;
	}
}