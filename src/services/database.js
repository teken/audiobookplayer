const path = require('path');
const hyperdb = require('hyperdb');
const SettingsService = require('./settings');
const mp = require('msgpack-lite');

module.exports = class DatabaseService {

	static get library() {
		return this.getDB('library.db');
	}

	static get local() {
		return this.getDB('local.db');
	}

	static get states() {
		return this.getDB('states.db');
	}

	static getDB(name) {
		return this.loadDatabase(path.join(new SettingsService().get('dataPath'), name));
	}

	static loadDatabase(path) {
		//return hyperdb(path, null, {valueEncoding: 'binary'});
		return new Database(path, null, {valueEncoding: 'binary'})
	}
};

class Database {
	constructor(path, key, options) {
		this.db = hyperdb(path, null, {valueEncoding: 'binary'});
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