import React,{Component} from 'react';
import {Alert,Animated,Dimensions,Easing,PanResponder,Text,TouchableOpacity,View} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Sound from 'react-native-sound';

import config	from '../../../../config';
import f 		from '../../../../functions';
import Icon		from 'react-native-vector-icons/FontAwesome5';
import Events	from './events';

import Sound1	from '../../../../../assets/sounds/arkada/success.wav';
import Sound2	from '../../../../../assets/sounds/arkada/fail.wav';
import Sound3	from '../../../../../assets/sounds/arkada/win.mp3';

const scale = 1*Dimensions.get('window').width/config.base_width;
const width =  Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const brick = {width: 22, height: 15}
const board = {width: 70, height: 10, half: 35*scale, x0: (width/scale/2-35)*scale, y0: 320*scale}
const ball =  {width: 10, height: 10, half: 5*scale,  x0: (width/scale/2-5)*scale,  y0: 310*scale}
var brickColor = 'transparent', boardColor = 'transparent';

const styles = EStyleSheet.create({
	container: {
	},
	header: {
		backgroundColor: '#D7C2EA',
		borderBottomColor: '#663394', borderBottomWidth: 7,
		flexDirection: 'row',
		justifyContent: 'space-between',alignItems: 'center',
		paddingHorizontal: 20, paddingVertical: 8,
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
	pause: {
		backgroundColor: '#F5DE42',
		borderColor: '#A79309',
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
		position: 'relative',
		backgroundColor: '#202020',
		height: '100%',
	},
	brick: {
		width: brick.width, height: brick.height,
		position: 'absolute',
		top: 0, left: 0,
		backgroundColor: '#BF7FB7',
	},
	board: {
		width: board.width, height: board.height,
		position: 'absolute',
		top: 0, left: 0,
		borderRadius: 5,
	},
	ball: {
		width: ball.width, height: ball.height,
		borderRadius: 50,
		position: 'absolute',
		top: 0, left: 0,
		backgroundColor: '#fff',
	},
});

const sound = [
	Sound1,
	Sound2,
	Sound3,
];
// цвет кирпичей и доски
const color = [
	{i: '#FB5C5E', j: '#5696EB'}, // красный,голубой
	{i: '#6187F3', j: '#6AE85F'}, // голубой,зеленый
	{i: '#9B76DF', j: '#06C475'}, // сиреневый,бирюзовый
]

export default class Game extends Component {
	constructor(props) {
		super(props);

		this.state = {
			volume: true,
			score: 0,
			status: '', // пауза/проиграл/выиграл
			brickList: [],  // массив кирпичей
		}
		this.animatedBoard = new Animated.Value(board.x0);
		this.animatedBall = new Animated.ValueXY({x:ball.x0,y:ball.y0})
		this.gesture = this.gesture_handle();
	}

	componentWillUnmount = ()=>{
		this.animatedBall.removeAllListeners();
		this.animatedBall.stopAnimation();
		this.animatedBoard.stopAnimation();
	}

	componentDidMount = () =>{
		// предварительно загружаем звуки
		this.sound = [
			new Sound(sound[0]),
			new Sound(sound[1]),
			new Sound(sound[2]),
		];
		this.game_initialize();
	}

	game_initialize = () =>{
		// при каждой перзапуске кирпичи и доска меняют цвет
		let randColor = f.randA(0,2);
		brickColor = {backgroundColor: color[randColor].i};
		boardColor = {backgroundColor: color[randColor].j};
		this.setState({
			score: 0,
			status: '',
			brickList: this.create_brick(),
		});
		this.animatedBoard.setValue(board.x0);
		this.animatedBall.setValue ({x:ball.x0, y:ball.y0})
		this.speed = {dx: -1, dy: -1} // направление мяча по оси x и y
		this.sticking = true; // залипание мяча к доске в начале игры
		this.attempt = 0; // число проигрышей, если > 3 - игра прекращается
		this.duration = 3000; // скорость анимации
		this.check = Array.from({length:4}).fill(1); // разрешения на проверки
	}

	game_start = async () =>{
		await this.setState({status:''});
		if (!this.sticking) this.move_ball();
	}

	game_stop = (status) =>{
		this.animatedBall.stopAnimation();
		this.animatedBoard.stopAnimation();
		if(status != 'pause'){
			this.animatedBall.removeAllListeners();
		}
		this.setState({status});
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

	// формируем аркаду
	create_brick = () =>{
		let num_rows = 5; // сколько кирпичей по вертикали
		let num_columns = 8; // сколько кирпичей по горизонтали
		let interval = 7; // интервал между кирпичами
		
		let w = brick.width*num_columns + interval*(num_columns-1); // ширина блока кирпичей
		let h = brick.height*num_rows + interval*(num_rows-1); // высота блока кирпичей
		let x0 = Math.round((width/scale-w)/2); // отступ блока кирпичей слева и справа
		let y0 = 30;  // отступ блока кирпичей сверху
		let mass = [];

		for(let a = 0; a < num_rows; a++) {
			for(let b = 0; b < num_columns; b++) {
				let x = (x0 + interval*b + brick.width*b)*scale;
				let y = (y0 + interval*a + brick.height*a)*scale;
				mass.push({x,y})
			}
		}
		return mass;
	}

	// движение мяча
	move_ball = () =>{
		if(this.state.status == 'pause') return;
		let {dx,dy} = this.speed;
		// обеспечиваем хаусность движения шара 
		let xRand = f.randA(-50,50);
		let yRand = f.randA(-100,100);
		this.duration -= 5;
		// прекращаем анимацию и запускаем ее с новыми значениями
		this.animatedBall.stopAnimation();
		Animated.timing(this.animatedBall, {
			toValue: {x: dx*width+xRand, y: dy*height+yRand},
			duration: this.duration,
			easing: Easing.linear,
			useNativeDriver: true,
		}).start();
	}

	// функция нужна чтобы любая проверка(например, на столкновение с левой стеной)
	// никогда не выполянлась повторно, а чередовалась с другими проверками
	// без этой функции проверки из-за особенностей Animated будут повторяться и зацикливание будет
	ajust_check = (num) =>{
		this.check = this.check.map(e => 1)
		if(this.check[num]){
			this.check[num] = 0;
			if (num == 0 || num == 1) this.speed.dx *= -1;
			if (num == 2 || num == 3) this.speed.dy *= -1;
			this.move_ball();
		}
	}

	check_wall = (ballX, ballY) => {
		let boardX = this.animatedBoard._value, boardY = board.y0;
		let ballW = ball.width*scale; ballH = ball.height*scale;
		let boardW = board.width*scale; boardH = board.height*scale;
		// столкновение с левой стеной
		if (this.check[0] &&  ballX <= 1) {
			this.ajust_check(0);
		}
		// столкновение с правой стеной
		else if (this.check[1] && ballX >= width-ballW) {
			this.ajust_check(1);
		}
		// столкновение с потолком
		else if (this.check[2] && ballY <= 1) {
			this.ajust_check(2);
		}
		// столкновение мяча с доской
		else if (this.check[3] && (boardX < ballX+ballW && boardX+boardW > ballX &&
			boardY < ballY+ballH && boardY+boardH > ballY)) {
			this.ajust_check(3);
		}
		// шар провалился за доску вниз и столкнуся с полом
		else if (ballY > height-120) {
			this.attempt++;
			if (this.attempt == 3) {
				this.sound[1].play();
				this.game_stop('fail');
			} else {
				this.game_stop('');
				this.animatedBoard.setValue(board.x0);
				this.animatedBall.setValue ({x:ball.x0, y:ball.y0})
				this.speed = {dx: -1, dy: -1}
				this.sticking = true;
				this.duration = 3000;
				this.ajust_check(10);
			}
		}
		else this.check_arkada(ballX, ballY);
	}

	check_arkada = async (ballX, ballY) => {
		let {brickList,score} = this.state;
		let ballW = ball.width*scale, ballH = ball.height*scale;
		let brickW = brick.width*scale,brickH = brick.height*scale;
		// столкновение мяча с кирпичами
		let isHit = brickList.some(({x, y}, i) => {
			if (x < ballX+ballW && x+brickW > ballX &&
				y < ballY+ballH && y+brickH > ballY) {
					brickList.splice(i, 1);
					score += 10;
					return true;
			}
		})
		if (isHit) {
			if (!brickList.length) {
				this.sound[0].stop();
				this.sound[0].play();
				await this.setState({brickList, score});
				this.game_stop('win')
				this.sound[2].play();
			} else {
				this.ajust_check(10);
				this.sound[0].stop();
				this.sound[0].play();
				await this.setState({brickList, score});
				this.speed.dy *= -1;
				this.move_ball();
			}
		}
	}

	// обработчик жестов
	gesture_handle = () =>(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: () => true,
			// палец коснулся тачскрина
			onPanResponderGrant: (event, {x0}) => {
				// проверка, чтобы доска не выходила за экран
				if(x0 < board.half) x0 = board.half;
				if(x0 > width-board.half) x0 = width-board.half;
				this.animatedBoard.setValue (x0-board.half)
				if(this.sticking) this.animatedBall.setValue ({x:x0-ball.half, y:ball.y0})
			},
			// палец движется по тачскрину
			onPanResponderMove: (event, {x0,dx}) => {
				// проверка, чтобы доска не выходила за экран
				if(x0+dx >= board.half && x0+dx <= width-board.half) {
					this.animatedBoard.setValue(x0-board.half+dx);
					if(this.sticking) this.animatedBall.setValue({x:x0-ball.half+dx, y:ball.y0})
				}
			},
			// палец убрали тачскрина
			onPanResponderRelease: () => {
				if(this.sticking){
					this.sticking = false;
					this.animatedBall.addListener(({x,y}) => {
						if(x.toFixed(5) == this.oldX || y.toFixed(5) == this.oldY) return;
						this.oldX = x.toFixed(5); this.oldY = y.toFixed(5);
						this.check_wall(x,y);
					})
					this.move_ball();
				}
			},
		})
	)

	render() {
		let {props,state} = this;
		// масштабирование стилей
		let brickList = state.brickList.map((e,i) => ({transform: [{translateX: e.x}, {translateY: e.y}]}))
		let boardStyle = {transform: [{translateX:this.animatedBoard},{translateY: board.y0}]};
		let ballStyle =  {transform: [{translateX:this.animatedBall.x},{translateY:this.animatedBall.y}]};
		return (
			<View style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity style={[styles.control,styles.volume]} onPress={this.set_volume}>
						<Icon name={state.volume ? 'volume-up' : 'volume-mute'} size={25} color='#fff' />
					</TouchableOpacity>
					<TouchableOpacity style={[styles.control,styles.pause]} onPress={_ => this.game_stop('pause')}>
						<Icon name={state.pause ? 'play' : 'pause'} size={25} color='#fff' />
					</TouchableOpacity>
					<View style={[styles.control,styles.score]}>
						<Text style={styles.score_text}>{state.score}</Text>
					</View>
				</View>
				<View style={styles.content} {...this.gesture.panHandlers}>
					<View style={styles.brick_area}>
						{brickList.map((brickStyle, i) => (<View key={i} style={[styles.brick,brickStyle,brickColor]}></View>))}
					</View>
					<Animated.View style={[styles.ball,ballStyle]}></Animated.View>
					<Animated.View style={[styles.board,boardStyle,boardColor]}></Animated.View>
				</View>
				<Events {...state} continue={this.game_start} restart={this.game_initialize} go_home={_=>this.props.navigation.goBack()}/>
			</View>
		);
	}
}