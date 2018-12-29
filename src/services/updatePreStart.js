const {ipcMain} = require('electron');

module.exports = class UpdatePreStartService {
	static checkForMigration() {
		console.log("Checking Migrations")
	}

	static runMigration() {
		console.log("Running Migrations")
	}

	static migrations() {

	}
};