import React from "react";

export const ThemeContext = React.createContext();

export default function withTheme(Component) {
	return React.forwardRef((props, ref) => (
		<ThemeContext.Consumer>
			{theme => <Component {...props} theme={theme} ref={ref} />}
		</ThemeContext.Consumer>
	));
}
