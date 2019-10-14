import React, { Component } from 'react';
import { Image, Keyboard, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { withNavigation } from 'react-navigation';

import Image1 from '../../../assets/game_screen/smart/1.png';
import Image2 from '../../../assets/game_screen/smart/2.png';
import Image3 from '../../../assets/game_screen/smart/3.png';
import Image4 from '../../../assets/game_screen/smart/4.png';

const styles = EStyleSheet.create({
	hello_container: {
		flex: 1,
		backgroundColor: '#355CBA',
		justifyContent: 'center', alignItems: 'center',
	},
	hello_text: {
		fontSize: 21, fontFamily: 'GothamPro',
		textAlign: 'center',
		color: 'white',
	},
	container: {
		flex: 1,
		backgroundColor: '#151515',
		justifyContent: 'center',
	},
	content: {
		alignItems: 'center',
		//backgroundColor: '#fff',
	},
	game: {
		width: 260,
		//backgroundColor: 'green',
		flexDirection: 'row', flexWrap: 'wrap',
		justifyContent: 'space-around',
		marginBottom: 10,
	},
	icon_container: {
		borderRadius: 10,
		opacity: 0.2,
		marginBottom: 5,
	},
	icon_visible: {
		opacity: 1,
	},
	icon: {
		borderRadius: 10,
		width: 100, height: 140,
		marginBottom: 10,
	},
	icon_text: {
		fontSize: 16, fontFamily: 'GothamPro',
		textAlign: 'center',
		color: 'white',
	},
	button: {
		marginTop: 15,
		backgroundColor: '#56237f',
		paddingVertical: 15,
		width: 250,
		color: 'white',
		borderRadius: 50,
		opacity: 0.3,
	},
	button_active: {
		opacity: 1,
	},
	button_text: {
		fontSize: 20, fontFamily: 'GothamPro',
		textAlign: 'center',
		color: 'white',
	},
});

export default withNavigation(class SmartComponent extends Component {
	constructor(props) {
		super(props);

		this.state = {
			hello: true,
			selected: 0,
		}
	};

	componentDidMount = _ =>{
		setTimeout(_ => this.setState({hello: false}),2500)
	}

	select_game = (selected) => {
		this.setState({ selected });
	}

	play = () => {
		let { props } = this;
		let { selected } = this.state;
		if (!selected) return;
		if (selected == 1) props.navigation.push('game_pair')
		if (selected == 2) props.navigation.push('game_snake')
		if (selected == 3) props.navigation.push('game_arkada')
		if (selected == 4) props.navigation.push('game_tetris')
	}

	render() {
		let {props,state} = this;
		return (
			state.hello ? (
				<View style={styles.hello_container}>
					<Text style={styles.hello_text}>Привет</Text>
				</View>
			) : (
					<View style={styles.container}>
						<View style={styles.content}>
							<View style={styles.game}>
								<TouchableOpacity onPress={_ => this.select_game(1)}>
									<View style={[styles.icon_container, state.selected == 1 ? styles.icon_visible : null]}>
										<Image source={Image1} style={styles.icon} />
										<Text style={styles.icon_text}>Найди пару</Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity onPress={_ => this.select_game(2)}>
									<View style={[styles.icon_container, state.selected == 2 ? styles.icon_visible : null]}>
										<Image source={Image2} style={[styles.icon]} />
										<Text style={styles.icon_text}>Змейка</Text>
									</View>
								</TouchableOpacity>
								{/* <TouchableOpacity onPress={_ => this.select_game(3)}>
									<View style={[styles.icon_container, state.selected == 3 ? styles.icon_visible : null]}>
										<Image source={Image3} style={[styles.icon]} />
										<Text style={styles.icon_text}>Арканоид</Text>
									</View>
								</TouchableOpacity> */}
								<TouchableOpacity onPress={_ => this.select_game(4)}>
									<View style={[styles.icon_container, state.selected == 4 ? styles.icon_visible : null]}>
										<Image source={Image4} style={styles.icon} />
										<Text style={styles.icon_text}>Тетрис</Text>
									</View>
								</TouchableOpacity>
							</View>
							<TouchableOpacity onPress={this.play}>
								<View style={[styles.button, state.selected ? styles.button_active : null]}>
									<Text style={styles.button_text}>Играть</Text>
								</View>
							</TouchableOpacity>
						</View>
					</View>
				)
		);
	}
});