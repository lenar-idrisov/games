import React,{Component} from 'react';
import {StatusBar,View} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import {light,dark}	from '../../navigation';
import Game			from '../../containers/game/pair';

const styles = EStyleSheet.create({
	container: {
		flex: 1,
	},
});

export default class GameScreen extends Component {
	static navigationOptions = {
		title: 'Игра  «Найди пару‎»‎'.toUpperCase(),
		...light,
	};

	render() {
		return (
			<View style={styles.container}>
				<StatusBar barStyle="light-content" />
				<Game/>
			</View>
		);
	}
}