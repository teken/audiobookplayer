import React from "react";

export const PlayerContext = React.createContext();

export default function withPlayer(Component) {
	return React.forwardRef((props, ref) => (
		<PlayerContext.Consumer>
			{player => <Component {...props} player={player} ref={ref} />}
		</PlayerContext.Consumer>
	));
}
