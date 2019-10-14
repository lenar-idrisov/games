import React,{Component} from 'react';
import {StatusBar,View} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import {light,dark}	from '../navigation';

import Smart			from '../containers/smart';

const styles = EStyleSheet.create({
	container: {
		flex: 1,
	},
});

export default class SplashScreen extends Component {
	static navigationOptions = {
		title: 'Игры'.toUpperCase(),
		...light,
	};

	render() {
		return (
			<View style={styles.container}>
				<StatusBar barStyle="light-content" />
				<Smart/>
			</View>
		);
	}
}
