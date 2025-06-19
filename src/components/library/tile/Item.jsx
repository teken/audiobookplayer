import React, {Component} from "react";

export default class Item extends Component {

	get hasArtWork() {
		return this.props.work.art && this.props.work.art.length > 0;
	}

	get tilePicture() {
		if (this.hasArtWork) {
			const p = this.props.work.art[0].path;
			return <img src={"file://" + p} alt={this.props.work.name} />;
		}
		return '';
	}

	get hasPicture() {
		return this.props.work && this.props.work.art && this.props.work.art.length > 0;
	}

	get cleanedName() {
		const number = this.props.work.name.split(' ', 1)[0];
		return this.props.series && !isNaN(number) ? this.props.work.name.slice(number.length+1) : this.props.work.name;
	}

	get seriesName() {
		const number = this.props.work.name.split(' ', 1)[0];
		return isNaN(number) ? this.props.series.name : `${this.props.series.name} #${number}`;
	}
}

