import React from 'react';
import {ThemeContext} from './ThemeContext';

export default function withTheme(Component) {
	return React.forwardRef((props, ref) => (
		<ThemeContext.Consumer>
			{theme => <Component {...props} theme={theme} ref={ref} />}
		</ThemeContext.Consumer>
	));
}
