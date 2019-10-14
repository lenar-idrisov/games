import React,{Component}							from 'react';
import {Dimensions,Linking,StatusBar,View}	from 'react-native';
import EStyleSheet					from 'react-native-extended-stylesheet';
import {
	createAppContainer,
	createStackNavigator,
	NavigationActions
}									from 'react-navigation';

import config						from './config';
import colors						from './config/colors';


import SmartScreen					from './screens/smart';
import GamePairScreen				from './screens/game/pair';
import GameSnakeScreen				from './screens/game/snake';
import GameArkadaScreen				from './screens/game/arkada';
import GameTetrisScreen				from './screens/game/tetris';

// отключаем предупреждения
console.disableYellowBox = true;

// Глобальные стили
EStyleSheet.build({
	$scale: 1*Dimensions.get('window').width/config.base_width,
	...colors,
});

// Полоска вверху экрана
StatusBar.setBarStyle('light-content', true);
StatusBar.setBackgroundColor('black', true);

// Страницы приложения
var Navigator = createAppContainer(createStackNavigator(
	{
		smart:						SmartScreen,
		game_pair:					GamePairScreen,
		game_snake:					GameSnakeScreen,
		game_arkada:				GameArkadaScreen,
		game_tetris:				GameTetrisScreen,
	},
	{
		initialRouteName: 'smart',
	}
));


export default class Router extends Component {
	constructor(props) {
		super(props);

		this.state = {
			page: 'navigator',
		};
	}


	render() {
		return (
			<View style={{flex:1}}>
				{this.state.page == 'navigator'		? (<Navigator	ref={ref => config.navigator_ref=ref} />) : null}
				{/* {this.state.page == 'smart'			? (<SmartScreen/>)	: null} */}
			</View>
		);
	}
}