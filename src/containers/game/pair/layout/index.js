import React,{Component} from 'react';
import {Animated,Easing,Image,Text,TouchableOpacity,Vibration,View} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Sound from 'react-native-sound'

import f 		from '../../../../functions';
import Volume	from 'react-native-vector-icons/FontAwesome5';
import Winner   from '../../../../../assets/game_screen/pair/winner.png';
import Timeout   from '../../../../../assets/game_screen/pair/timeout.png';

import Image0	from '../../../../../assets/game_screen/pair/icon0.png';
import Image1	from '../../../../../assets/game_screen/pair/icon1.png';
import Image2	from '../../../../../assets/game_screen/pair/icon2.png';
import Image3	from '../../../../../assets/game_screen/pair/icon3.png';
import Image4	from '../../../../../assets/game_screen/pair/icon4.png';
import Image5	from '../../../../../assets/game_screen/pair/icon5.png';
import Image6	from '../../../../../assets/game_screen/pair/icon6.png';
import Image7	from '../../../../../assets/game_screen/pair/icon7.png';
import Image8	from '../../../../../assets/game_screen/pair/icon8.png';
import Image9	from '../../../../../assets/game_screen/pair/icon9.png';
import Image10	from '../../../../../assets/game_screen/pair/icon10.png';

import Sound1	from '../../../../../assets/sounds/pair/success.wav';
import Sound2	from '../../../../../assets/sounds/pair/fail.wav';
import Sound3	from '../../../../../assets/sounds/pair/win.wav';
import Sound4	from '../../../../../assets/sounds/pair/timeout.wav';

const styles = EStyleSheet.create({
	container: {
	},
	header: {
		backgroundColor: '#B0EA75',
		flexDirection: 'row',
		justifyContent: 'space-between',alignItems: 'center',
		paddingHorizontal: 20, paddingVertical: 8,
		borderBottomColor: 'white', borderBottomWidth: 7,
	},
	volume: {
		backgroundColor: '#778EFB',
		height: 40, width: 45,
		justifyContent: 'center', alignItems: 'center',
		borderWidth: 1, borderColor: '#2F4C88',
		borderRadius: 10,
	},
	time: {
		color: '#fff',
		fontSize: 27, fontFamily: 'GothamPro-Medium',
		fontWeight: 'bold',
		textShadowColor: 'rgba(0, 0, 0, 0.3)',
		textShadowOffset: {width: 0, height: 0},
		textShadowRadius: 10,
	},
	score:{
		backgroundColor: '#FB7873',
		height: 40, width: 45,
		justifyContent: 'center', alignItems: 'center',
		borderWidth: 1, borderColor: '#A03E3D',
		borderRadius: 10,
	},
	score_text:{
		color: '#fff',
		fontSize: 22, fontFamily: 'GothamPro',
		fontWeight: 'bold',
	},
	content: {
		paddingTop: 20,
		height: '100%',
		backgroundColor: '#E0C7EA',
		alignItems: 'center',
	},
	card_area: {
		width: 300,
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center', justifyContent: 'center',
	},
	card_container: {
		position: 'relative',
		width: 60,
		height: 60,
		margin: 5,
	},
	card: {
		width: 60,
		height: 60,
		position: "absolute", top: 0,
		backfaceVisibility: 'hidden',
	},
	win_area: {
		alignItems: 'center', justifyContent: 'center',
	},
	win_img:{
		width: 200,
		height: 300,
		resizeMode: 'contain',
	},
	win_text: {
		color: '#212121',
		fontSize: 20, fontFamily: 'GothamPro',
		fontWeight: 'bold',
	},
	fail_area: {
		alignItems: 'center', justifyContent: 'center',
	},
	fail_img:{
		width: 180,
		height: 280,
		resizeMode: 'contain',
	},
	fail_text: {
		color: '#212121',
		fontSize: 20, fontFamily: 'GothamPro',
		fontWeight: 'bold',
	},
});

const image = [
	Image1,
	Image2,
	Image3,
	Image4,
	Image5,
	Image6,
	Image7,
	Image8,
	Image9,
	Image10,
];
const sound = [
	Sound1,
	Sound2,
	Sound3,
	Sound4,
];
const interval = 30;	// Отступ до начала появления каждой картинки
const duration = 400;	// Время появления картинки
const quantity = 20;	// Кол-во карточек(с удвоением)
const wait_1 = 50 		// Ожидание в самом начале игры
const wait_2 = wait_1+interval*(quantity-1)+duration+7000; // Ожидание открытия всех карт
const wait_3 = wait_2+interval*(quantity-1)+duration+6000; // Ожидание закрытия всех карт

export default class Game extends Component {
	constructor(props) {
		super(props);

		this.state = {
			ready: false, // чтобы не открылось сразу больше 2 карт + в начале показа блокируем открытие карт
			volume: true,
			time: '',
			score: 0,
			status: '',
			
			cards: this.get_cards(),
			list: Array.from({length: quantity}).fill('close'),
			opened: {}, // {img: 4,i: 7} img-картинка, i-номер в массиве list
		};
	}
	get_cards = () =>{
		// удваиваем, тасуем карты
		let cards = [...image, ...image];
		return cards.sort(_ => (f.randAB(-10, 10)));
	}

	componentWillUnmount() {
		this.will_mounted = true;
		clearTimeout(this.timerId);
	}

	componentDidMount = () =>{
		// предварительно загружаем звуки
		this.sound = [
			new Sound(sound[0]),
			new Sound(sound[1]),
			new Sound(sound[2]),
			new Sound(sound[3]),
		];
		// в начале игры показываем все карточки
		setTimeout(() => {
			for(let i=0; i<quantity; i++) if(!this.will_mounted) setTimeout(_=>this.start(i,'open'),interval*i);
		}, wait_1);
		// затем скрываем все карточки
		setTimeout(() => {
			for(let i=0; i<quantity; i++) if(!this.will_mounted) setTimeout(_=>this.start(quantity-i-1,'close'),interval*i);
		}, wait_2);
		// делаем карты кликабельными, запускаем таймер
		setTimeout(() => {
			if(!this.will_mounted){
				this.setState({ready:true});
				this.timer(40);
			}
		}, wait_3);
	}

	start = (i, value) => {
		this.setState(({list}) => {
			list[i] = value;
			return {list};
		});
	}
	set_volume = () => {
		requestAnimationFrame(() => {
			if(this.state.volume){
				this.setState({volume:false});
				this.sound.forEach(e => e.setVolume(0));
			} else{
				this.setState({volume:true});
				this.sound.forEach(e => e.setVolume(1));
			}
		});
	}
	open = (img, i) =>{
		let {list,opened,ready} = this.state;
		// если карта уже открыта - игнорируем
		if(list[i] == 'open' || !ready) return;
		list[i] = 'open';
		// если ни одна карта еще открыта не была
		if(!Object.keys(opened).length){
			this.setState({list,opened:{img,i}});
		} else{
			this.setState({list,ready:false}); // открыли вторую карту, заблокировали открытие 3й
			img == opened.img ? this.success(i,opened.i) : this.fail(i,opened.i)
		}
	}
	success = (i,j) =>{
		setTimeout(_ => {
			requestAnimationFrame(() => {
				this.setState(({list,score,status}) => {
					list[i] = list[j] = 'hide';
					if (score != 9) {
						this.sound[0].play();
					} else {
						clearTimeout(this.timerId);
						status = 'win';
						this.sound[2].play();
					}
					return {list, ready:true, opened:{}, score:score + 1, status}
				})
			})
		},950);
	}
	fail = (i,j) =>{
		setTimeout(_ => {
			requestAnimationFrame(() => {
				this.setState(({list}) => {
					list[i] = list[j] = 'close';
					this.sound[1].play();
					return {list, ready:true, opened:{}}
				})
			})
		},950);
	}

	timer = async (time) => {
		if (!time) {
			this.setState({status:'timeout',time})
			this.sound[3].play();
			Vibration.vibrate();
		} else {
			await this.setState({time});
			this.timerId = setTimeout(_ => {
				if(time>=1)	this.timer(time-1);
			},1000);
		}
	}

	render() {
		let {props,state} = this;
		return (
			<View style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity style={styles.volume} onPress={this.set_volume}>
						<Volume name={state.volume ? 'volume-up' : 'volume-mute'} size={25} color='#fff' />
					</TouchableOpacity>
					<Text style={styles.time}>{state.time === '' ? '@findpair' : state.time+' с.'}</Text>
					<View style={styles.score}>
						<Text style={styles.score_text}>{state.score}</Text>
					</View>
				</View>
				<View style={styles.content}>
					{state.status === '' ? (
							<View style={styles.card_area}>
								{state.list.map((e, i) =>
									(<Card key={i} i={i} state={e} source={state.cards[i]} open={this.open} />))}
							</View>
					) : null}
					{state.status === 'win' ? (
							<View style={styles.win_area}>
								<Image source={Winner} style={styles.win_img} />
								<Text style={styles.win_text}>Ты победил! Ура!</Text>
							</View>
					) : null}
					{state.status === 'timeout' ? (
							<View style={styles.fail_area}>
								<Image source={Timeout} style={styles.fail_img} />
								<Text style={styles.fail_text}>Время вышло :(</Text>
							</View>
					) : null}
				</View>
			</View>
		);
	}
}


class Card extends Component {
	state = {
		transform_face: {rotateY: '180deg'},
		transform_back: {rotateY: '0deg'},
		opacity_face: 0,
		opacity_back: 1,
	}
	componentDidMount(){
		this.animate = new Animated.Value(0),
		/* this.animate.addListener(({ value }) => {
			console.log(value);
		}); */
		this.setState({
			transform_back: {
				rotateY: this.animate.interpolate({
					inputRange: [0,1],
					outputRange: ['0deg','180deg'],
				})
			},
			opacity_back: this.animate.interpolate({
				inputRange: [0,1],
				outputRange: [1,0]
			}),
			transform_face: {
				rotateY: this.animate.interpolate({
					inputRange: [0,1],
					outputRange: ['180deg','360deg']
				})
			},
			opacity_face: this.animate.interpolate({
				inputRange: [0,1],
				outputRange: [0,1]
			}),
		});
	}
	componentDidUpdate = (prev_props) => {
		if(!Object.is(prev_props.state,this.props.state)){

			if(this.props.state == 'open' || this.props.state == 'close') {
				this.animation = Animated.timing(this.animate,{
					toValue: this.props.state == 'open' ? 1 : 0,
					duration: duration,
					easing: Easing.linear,
					useNativeDriver: true,
				});
				this.animation?.start();
			}
		}
	}	
	componentWillUnmount() {
		this.animation.stop();
		this.animate.stopAnimation();
	}
	render() {
		let {state,props} = this;
		let face = [{transform:[state.transform_face,{perspective: 1000}]},{opacity:state.opacity_face}]
		let back = [{transform:[state.transform_back,{perspective: 1000}]},{opacity:state.opacity_back}]
		return (
			props.state != 'hide' ? (
				<TouchableOpacity style={styles.card_container} onPress={_=>props.open(props.source,props.i)}>
					<Animated.Image
						style={[styles.card,...face]}
						source={this.props.source}
					/>
					<Animated.Image
						style={[styles.card,...back]}
						source={Image0}
					/>
				</TouchableOpacity>
			) : (<View style={styles.card_container}></View>)
		);
	}
}