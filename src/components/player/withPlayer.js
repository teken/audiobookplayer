import React from 'react';

export const PlayerContext = React.createContext();

export default function withPlayer(Component) {
	return React.forwardRef((props, ref) => (
		<PlayerContext.Consumer>
			{theme => <Component {...props} player={theme} ref={ref} />}
		</PlayerContext.Consumer>
	));
}
