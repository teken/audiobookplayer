import React, {Component} from "react";
import {withRouter} from "react-router-dom";

import withTheme from "../theme/withTheme";
import DownloadBar from "./DownloadBar";
import IconButton from "../player/IconButton";

export default withRouter(withTheme(class Download extends Component {

	render() {
		const {download} = this.props;
		const commonButtonStyling = {
			padding: "1em",
			cursor: "pointer",
		};
		return (
			<div>
				<div>{download.name}</div>
				<div>
					<IconButton title="Move Up in Queue" icon={'arrow-up'} onClick={() => console.log('up')} style={{...commonButtonStyling, color: true ? this.props.theme.activeText : this.props.theme.inactiveText}}/>
					<IconButton title="Move Down in Queue" icon={'arrow-down'} onClick={() => console.log('down')} style={{...commonButtonStyling, color: true ? this.props.theme.activeText : this.props.theme.inactiveText}}/>
					<IconButton title="Play/Pause" icon={download.active ? 'pause' : 'play'} onClick={() => console.log('start')} style={{...commonButtonStyling, color: !download.active ? this.props.theme.activeText : this.props.theme.inactiveText}}/>
				</div>
				<DownloadBar progress={download.progress} />

			</div>
		);
	}
}))

