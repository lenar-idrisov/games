import React,{Component} from 'react';
import {Dimensions,Image,Modal,Text,TouchableOpacity,View} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Icon		from 'react-native-vector-icons/FontAwesome5';

import Winner   from '../../../../../assets/game_screen/tetris/winner.png';
import Loser   	 from '../../../../../assets/game_screen/tetris/loser.png';
import Pause   	 from '../../../../../assets/game_screen/tetris/pause.png';

const styles = EStyleSheet.create({
	modal: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		height: '100%',
		backgroundColor: 'rgba(0,0,0,0.7)',
	},
	modal_container: {
		alignItems: 'center',
		width: 300,
		padding: 30,
		backgroundColor: '#fff',
	},
	image: {
		height: 110, width: 110,
		marginBottom: 20,
	},
	text: {
		marginBottom: 20,
		color: '#3d3d3d',
		fontSize: 14, fontFamily: 'GothamPro',
		lineHeight: 18,
		textAlign: 'center',
	},
	button_container: {
		flexDirection: 'row',
		justifyContent: 'center',
	},
	button: {
		justifyContent: 'center',alignItems: 'center',
		paddingVertical: 15, paddingHorizontal: 25,
		borderRadius: 50,
		backgroundColor: '#7AC248',
	},
	button_text: {
		color: '#fff',
		fontSize: 14, fontFamily: 'GothamPro-Medium',
		textAlign: 'center',
	},
	home: {
		backgroundColor: '#9469AA',
		borderRadius: 50,
		marginLeft: 10,
		paddingHorizontal: 11,
		justifyContent: 'center',alignItems: 'center',
	}
});

export default (props) => {
	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={props.status == 'pause'  || props.status == 'fail' || props.status == 'win'}
		>
			<View style={styles.modal}>
				{props.status == 'pause' ? (
					<View style={styles.modal_container}>
						<Image source={Pause} style={styles.image} />
						<Text style={styles.text}>Жизнь требует движений.</Text>
						<View style={styles.button_container}>
							<TouchableOpacity style={styles.button} onPress={props.continue}>
								<Text style={styles.button_text}>Продолжить</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.home} onPress={props.go_home}>
								<Icon name={'home'} size={27} color='#fff' />
							</TouchableOpacity>
						</View>
					</View>
				) : null}
				{props.status == 'fail' ? (
					<View style={styles.modal_container}>
						<Image source={Loser} style={styles.image} />
						<Text style={styles.text}>Ты проиграл. Попробуй снова.</Text>
						<View style={styles.button_container}>
							<TouchableOpacity style={styles.button} onPress={props.restart}>
								<Text style={styles.button_text}>Перезапуск</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.home} onPress={props.go_home}>
								<Icon name={'home'} size={27} color='#fff' />
							</TouchableOpacity>
						</View>
					</View>
				) : null}
				{props.status == 'win' ? (
					<View style={styles.modal_container}>
						<Image source={Winner} style={styles.image} />
						<Text style={styles.text}>Ты победил! Ура!</Text>
						<View style={styles.button_container}>
							<TouchableOpacity style={styles.button} onPress={props.restart}>
								<Text style={styles.button_text}>Играть снова</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.home} onPress={props.go_home}>
								<Icon name={'home'} size={27} color='#fff' />
							</TouchableOpacity>
						</View>
					</View>
				) : null}
			</View>
		</Modal>
	)
}