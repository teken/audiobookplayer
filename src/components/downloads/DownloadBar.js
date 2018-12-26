import React, {Component} from "react";

import ProgressBar from "../player/timeline/ProgressBar";

import withTheme from "../theme/withTheme";

export default withTheme(class DownloadBar extends Component {
	constructor(props) {
		super(props);

		this.state = {
			barWidth: window.innerWidth,
			translate: 0,
		};
		this.changeTranslate = this.changeTranslate.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.progress) this.changeTranslate(nextProps.progress);
	}

	changeTranslate(progress) {
		const lengthPerSecond = this.state.barWidth / 100;
		let translate = (progress * 100) * lengthPerSecond;
		const max = this.state.barWidth;
		if (translate < 0) { translate = 0; }
		if (translate > max) { translate = max; }
		this.setState({ translate });
	}

	componentDidMount() {
		this.updateDimensions();
		window.addEventListener("resize", this.updateDimensions.bind(this));
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions.bind(this));
	}

	updateDimensions() {
		this.setState({ barWidth: window.innerWidth });
		this.changeTranslate(this.props.progress);
	}

	render() {
		const handlerWidth = 12;
		const handlerHeight = 12;
		const barHeight = 4;

		return (
			<div className="downloadbar" style={{ width: "100%" }}>
				<ProgressBar
					width={this.state.barWidth}
					height={handlerHeight}
					barHeight={barHeight}
					handlerWidth={handlerWidth}
					translate={this.state.translate}
					duration={this.duration}
					onMouseDown={null}
					onMouseOver={null}
					onMouseOut={null}
					colour={this.props.theme.activeText}
					inactiveColour={this.props.theme.inactiveText}
					chapterColour={this.props.theme.inputBackground}
					steps={[]}
				/>
			</div>
		);
	}
})