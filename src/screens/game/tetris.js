import React,{Component} from 'react';
import {StatusBar,View} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import {light,dark}	from '../../navigation';
import Game			from '../../containers/game/tetris';

const styles = EStyleSheet.create({
	container: {
		flex: 1,
	},
});

export default class GameScreen extends Component {
	static navigationOptions = {
		title: 'Игра «‎Тетрис»‎'.toUpperCase(),
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
