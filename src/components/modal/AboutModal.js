import React from "react";

import ButtonRow from "../settings/ButtonRow";

import Model from "./Modal";
import About from "../about/About";

export default class AboutModal extends Model {

	listenKeyboard(event) {
		if (event.key === 'Escape' || event.keyCode === 27) this.okClick();
		if (event.key === 'Enter' || event.keyCode === 12) this.okClick();
	}

	get title() {
		return <h1>About</h1>
	}

	get body() {
		return <About/>;
	}

	get buttons() {
		if (this.state.loading) {
			return <Loading />
		} else {
			return <ButtonRow buttonWidth={100} buttons={[
				{value:"OK", onClick:this.okClick},
			]}/>
		}
	}
}