import React from "react";

export const TorrentContext = React.createContext();

export default function withTorrent(Component) {
	return React.forwardRef((props, ref) => (
		<TorrentContext.Consumer>
			{torrent => <Component {...props} torrent={torrent} ref={ref} />}
		</TorrentContext.Consumer>
	));
}
