export default class StateService {
	constructor(gunService) {
		this.gunService = gunService;
	}

	saveState(data, key) {
		const state = this.gunService.get(`state#${key}`).put(data);
		this.gunService.get('states').set(state);
	}

	getState(key) {
		return this.gunService.get(`state#${key}`).then();
	}

	getAllStates() {
		return this.gunService.get('states').map();
	}
}
