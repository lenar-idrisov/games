import React,{Component} from 'react';
import {Dimensions,Image,PanResponder,Text,TouchableOpacity,Vibration,View} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Sound from 'react-native-sound';

import config	from '../../../../config';
import f 		from '../../../../functions';
import Icon		from 'react-native-vector-icons/FontAwesome5';
import Events	from './events';

import Sound1	from '../../../../../assets/sounds/snake/success.wav';
import Sound2	from '../../../../../assets/sounds/snake/fail.wav';
import Sound3	from '../../../../../assets/sounds/snake/win.wav';

const scale = 1*Dimensions.get('window').width/config.base_width;
const chunck = 14; // размер одного сегмента змеи
const footer = Math.round(100/chunck)*chunck; // размер блока с кнопками
const width = Math.floor(300/chunck)*chunck; // ширина блока, где ходит змея
var height = Math.floor(390/chunck)*chunck; // высота блока, где ходит змея

const styles = EStyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#DEE2E8',
	},
	header: {
		height: 60, paddingHorizontal: 20,
		flexDirection: 'row',
		justifyContent: 'space-between',alignItems: 'center',
		//borderBottomColor: '#AAC6F0', borderBottomWidth: 7,
		backgroundColor: '#AAC6F0',
	},
	control: {
		height: 40, width: 45,
		justifyContent: 'center', alignItems: 'center',
		borderRadius: 10, borderWidth: 1,
	},
	volume: {
		backgroundColor: '#6BD061',
		 borderColor: '#399D2F',
	},
	mode: {
		backgroundColor: '#517AF6',
		borderColor: '#1D55AA',
	},
	pause: {
		backgroundColor: '#F5DE42',
		borderColor: '#AA9509',
	},
	score:{
		backgroundColor: '#FB7873',
		borderColor: '#A03E3D',
	},
	score_text:{
		color: '#fff',
		fontSize: 22, fontFamily: 'GothamPro',
		fontWeight: 'bold',
	},
	content: {
		flex: 1,
		justifyContent: 'center', alignItems: 'center',
		//borderWidth: 1, borderColor: 'blue',
	},
	content_area: {
		position: 'relative',
		backgroundColor: 'white',
	},
	food: {
		position: 'absolute',
		width: chunck, height: chunck,
		borderWidth: 1,
	},
	chunck:{
		position: 'absolute',
		width: chunck, height: chunck,
	},
	footer: {
		height: footer,
		paddingHorizontal: 3, paddingBottom: 3,
		flexDirection: 'row',
	},
	side: {
		flex: 1,
	},
	middle: {
		flex: 2,
	},
	button: {
		margin: 3,
		backgroundColor: '#517AF6',
		justifyContent: 'center', alignItems: 'center',
		flexGrow: 1,
	},
});

const sound = [
	Sound1,
	Sound2,
	Sound3,
];
// цвет квадратика(еды) и его рамки
const color = [
	{i: '#F26B5F', j: '#AE1B0F'}, // красный
	{i: '#FCC87C', j: '#F8A71A'}, // оранжевый
	{i: '#F6E051', j: '#F7A631'}, // желтый
	{i: '#C0CF4F', j: '#4EA856'}, // зеленый
	{i: '#58C7C8', j: '#048D8D'}, // бирюзовый
	{i: '#5D8AC5', j: '#0A1E65'}, // синий
	{i: '#9072C8', j: '#4B1E79'}, // сиреневый
	{i: '#BF7FB7', j: '#840F73'}, // фиолетовый
]

const wait = 500;  // ожидание в начале игры
const speed = 300; // скорость змеи

export default class Game extends Component {
	constructor(props) {
		super(props);

		this.state = {
			volume: true,
			score: 0,
			status: '', // пауза/проиграл/выиграл
			mode: 'gesture', // управление кнопками/ жестами
			
			dx: chunck, // горизонтальная скорость
			dy: 0, 	 	// вертикальная скорость
			snake: [],
			snake_color: 'lightgrey', // цвет змеи
			food: [],
		};
		this.gesture = this.gesture_identity();
	}

	componentWillUnmount = () =>{
		if(this.state.mode == 'button') height+=footer;
		clearTimeout(this.timerOut);
		clearTimeout(this.timerIn);
	}

	componentDidMount = () =>{
		// предварительно загружаем звуки
		this.sound = [
			new Sound(sound[0]),
			new Sound(sound[1]),
			new Sound(sound[2]),
		];
		this.game_init();
	}

	game_init = () =>{
		// генерируем еду
		let food = Array.from({length: 10}, _ => this.create_food());
		this.setState({
			score: 0,
			dx: chunck,
			dy: 0,
			food,
			snake: [
				{ x: chunck*2, y: chunck*10 },
				{ x: chunck,   y: chunck*10 },
				{ x: 0, 	   y: chunck*10 },
			]
		});
		// запускаем змею
		this.game_start();
	}
	
	game_start = () =>{
		this.setState({status:''});
		this.timerOut = setTimeout(this.move_snake,wait);
	}

	game_stop = (status) =>{
		this.setState({status});
		clearTimeout(this.timerOut);
		clearTimeout(this.timerIn);
	}

	set_mode = () => {
		requestAnimationFrame(() => {
			if(this.state.mode == 'button'){
				height += footer;
				this.setState({mode: 'gesture'});
				this.game_stop('');
				this.game_init();
			} else{
				height -= footer;
				this.setState({mode: 'button'});
				this.game_stop('');
				this.game_init();
			}
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

	// формируем квадратик(еду) различного цвета с различным местоположением
 	create_food = () =>{
		let n = f.randA(0,8); // любой из 8 цветов
		let i = color[n].i // цвет квадратика
		let j = color[n].j // цвет рамки квадратика
		let x = Math.round(f.randA(0, width-chunck) / chunck) * chunck;
		let y = Math.round(f.randA(0, height-chunck) / chunck) * chunck;
		// чтобы еда не попала в зону змеи
		this.state.snake.forEach(e =>{
			if(x == e.x && y == e.y) this.create_food();
		})
		// чтобы координаты еды не совпали(2х квадратиков)
		this.state.food.forEach(e =>{
			if(x == e.x && y == e.y) this.create_food();
		})
		return {x,y,i,j};
	}

	move_snake = () =>{
		let {snake,dx,dy,food,score,snake_color} = this.state;
		let head = {x:snake[0].x+dx, y:snake[0].y+dy};
		let eaten = null;
		let wall = this.check_wall(head.x,head.y);

		food.map(e => {
			if(head.x == e.x && head.y == e.y) eaten = e;
		})
		if(eaten){
			if(score == 490){
				this.setState({score: score+=10});
				this.game_stop('win');
				this.sound[2].play();
			} else{
				snake.unshift(head);
				food = food.filter(e => !Object.is(e,eaten));
				food.push(this.create_food());
				snake_color = eaten.i;
				this.setState({snake,food,snake_color,score: score+=10});
				this.sound[0].stop();
				this.sound[0].play();
				this.timerIn = setTimeout(this.move_snake,speed);
			}
		} else {
			if(wall){
				this.game_stop('fail');
				this.sound[1].play();
				Vibration.vibrate();
			} else{
				snake.unshift(head);
				snake.pop();
				this.setState({snake})
				this.timerIn = setTimeout(this.move_snake,speed);
			}
		}
	}

	check_wall = (headX,headY) =>{
		let snake = this.state.snake;
		// проверяем, не ударилась ли змея о саму себя
		for (let i = 3; i < snake.length; i++) {
			if (headX == snake[i].x && headY == snake[i].y){
				return true;
			}
		}
		// проверяем, не ударилась ли змея о стену
		if(headX<0 || headX > width-chunck || headY<0 || headY > height-chunck){
			return true
		}
		return false;
	}

	change_course = (course) =>{
		let {dx,dy} = this.state;
		if(course == 'left' && dx == 0) {dx = -chunck; dy = 0 }
		else if(course == 'left' && dx == chunck) {dx = 0; dy = -chunck }

		if(course == 'right' && dx == 0) {dx = chunck; dy = 0 }
		else if(course == 'right' && dx == -chunck) {dx = 0; dy = -chunck }

		if(course == 'up' && dy == 0) {dx = 0; dy = -chunck }
		else if(course == 'up' && dy == chunck) {dx = -chunck; dy = 0 }

		if(course == 'down' && dy == 0) {dx = 0; dy = chunck }
		else if(course == 'down' && dy == -chunck) {dx = -chunck; dy = 0 }
		if (dx != this.state.dx && dy != this.state.dy) this.setState({dx,dy});
	}

	gesture_handle = (dx,dy)=>{
		if(Math.abs(dx) > Math.abs(dy) && dx < 0) this.change_course('left');
		if(Math.abs(dx) > Math.abs(dy) && dx > 0) this.change_course('right');
		if(Math.abs(dy) > Math.abs(dx) && dy < 0) this.change_course('up');
		if(Math.abs(dy) > Math.abs(dx) && dy > 0) this.change_course('down');
	}
	gesture_identity = () =>(
		PanResponder.create({
			onStartShouldSetPanResponder: () => this.state.mode == 'gesture',
			onMoveShouldSetPanResponder: () => 	this.state.mode == 'gesture',
			// палец коснулся тачскрина
			onPanResponderGrant: () => {
				setTimeout(_ => {this.ready = true}, 0.0005)
			},
			// палец движется по тачскрину
			onPanResponderMove: (event, {dx,dy}) => {
				if(this.ready) {this.ready = false; this.gesture_handle(dx,dy)}
			},
			// палец убрали тачскрина
			onPanResponderRelease: () => {
			},
		})
	)

	render() {
		let {props,state} = this;
		// масштабирование стилей
		//console.log('food',state.food);
		let food = 	state.food.map((e,i) => ({top:e.y*scale, left:e.x*scale, backgroundColor:e.i, borderColor:e.j}))
		let snake = state.snake.map((e,i) => {
			// у головы змеи особые стили
			if(!i) return {top:e.y*scale, left:e.x*scale, backgroundColor:'black', zIndex:1}
			else   return {top:e.y*scale, left:e.x*scale, backgroundColor:state.snake_color, zIndex:0}
		})
		let content_area = {width:width*scale, height:height*scale}
		return (
			<View style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity style={[styles.control,styles.volume]} onPress={this.set_volume}>
						<Icon name={state.volume ? 'volume-up' : 'volume-mute'} size={25} color='#fff' />
					</TouchableOpacity>
					<TouchableOpacity style={[styles.control,styles.mode]} onPress={this.set_mode}>
						<Icon name={state.mode == 'button' ? 'hand-point-up' : 'arrows-alt'} size={30} color='#fff' solid/>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.control,styles.pause]} onPress={_ => this.game_stop('pause')}>
						<Icon name={state.pause ? 'play' : 'pause'} size={25} color='#fff' />
					</TouchableOpacity>
					<View style={[styles.control,styles.score]}>
						<Text style={styles.score_text}>{state.score}</Text>
					</View>
				</View>
				<View style={styles.content} {...this.gesture.panHandlers}>
					<View style={[styles.content_area,content_area]}>
						{food.map((st, i) => (<View key={i} style={[styles.food,st]}></View>))}
						{snake.map((st, i) => (<View key={i} style={[styles.chunck,st]}></View>))}
					</View>
				</View>
				{state.mode == 'button' ? (
					<View style={styles.footer}>
						<View style={styles.side}>
							<TouchableOpacity style={styles.button} onPress={_ => this.change_course('left')}>
								<Icon name='arrow-left' size={25} color='#fff' />
							</TouchableOpacity>
						</View>
						<View style={styles.middle}>
							<TouchableOpacity style={styles.button} onPress={_ => this.change_course('up')}>
								<Icon name='arrow-up' size={25} color='#fff' />
							</TouchableOpacity>
							<TouchableOpacity style={styles.button} onPress={_ => this.change_course('down')}>
								<Icon name='arrow-down' size={25} color='#fff' />
							</TouchableOpacity>
						</View>
						<View style={styles.side}>
							<TouchableOpacity style={styles.button} onPress={_ => this.change_course('right')}>
								<Icon name='arrow-right' size={25} color='#fff' />
							</TouchableOpacity>
						</View>
					</View>) : null}
				<Events {...state} continue={this.game_start} restart={this.game_init} go_home={_ =>this.props.navigation.goBack()} />
			</View>
		);
	}
}