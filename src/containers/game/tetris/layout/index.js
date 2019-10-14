import React,{Component} from 'react';
import {Dimensions,ScrollView,Text,TouchableOpacity,Vibration,View} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Sound from 'react-native-sound';

import config	from '../../../../config';
import Icon		from 'react-native-vector-icons/FontAwesome5';
import Events	from './events';
import Scheme	from './scheme';
import f		from '../../../../functions';

import Sound1	from '../../../../../assets/sounds/tetris/success.wav';
import Sound2	from '../../../../../assets/sounds/tetris/fail.wav';
import Sound3	from '../../../../../assets/sounds/tetris/win.wav';

const scale = 1*Dimensions.get('window').width/config.base_width;
const cellSize = 20 // размер 1 ячейки фигуры в тетрисе
const nextSize = 8; // размер 1 ячейки следующей фигуры в правом боковом меню
const tetrisWidth =  Math.round(210/cellSize)*cellSize;
const tetrisHeight =  Math.round(361/cellSize)*cellSize;
const cellQuantity = (tetrisWidth*tetrisHeight)/(cellSize*cellSize)

const styles = EStyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		backgroundColor: '#212121',
	},
	content: {
		//backgroundColor: '#fff',
		position: 'relative',
		height: 435,
	},
	tetris_container:{
		position: 'absolute',
		top: 0, left: 20,
		width: tetrisWidth, height: tetrisHeight,
		backgroundColor: 'black',
	},
	scroll: {
		borderWidth: 0,
	},
	tetris:{
		flex: 1,
		flexDirection: 'row', flexWrap: 'wrap',
	},
	grid: {
		width: cellSize, height: cellSize,
		borderWidth: 1, borderColor: '#1A1A1A',
	},
	cell: {
		width: cellSize, height: cellSize,
		borderWidth: 1,
		position: 'absolute', zIndex: 5,
	},
	bottom_menu: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'center',alignItems: 'center',
		position: 'absolute', bottom: -5,
	},
	button: {
		justifyContent: 'center',alignItems: 'center',
		backgroundColor: '#365CBA',
		width: 61, height: 61,
		marginLeft: 7, marginRight: 7,
		borderRadius: 5,
		borderWidth: 1, borderColor: '#132143',
		elevation: 3,
	},
	right_menu: {
		position: 'absolute',
		top: 0, right: 20,
		width: 50, height: 361,
		justifyContent: 'space-between',alignItems: 'center',
	},
	control: {
		height: 56, width: 56,
		justifyContent: 'center', alignItems: 'center',
		borderRadius: 10, borderWidth: 1,
		elevation: 3,
	},
	volume: {
		backgroundColor: '#43254b',
		borderColor: '#160f1f',
	},
	pause: {
		backgroundColor: '#6d3973',
		borderColor: '#23162c',
	},
	speed:{
		backgroundColor: '#a66ca3',
		borderColor: '#43254b',
	},
	score:{
		backgroundColor: '#ceaec3',
		borderColor: '#160f1f',
	},
	mission:{
		backgroundColor: '#b88ab0',
		borderColor: '#43254b',
	},
	next:{
		backgroundColor: '#e0ccd6',
		borderColor: '#160f1f',
	},
	speed_num:{
		color: '#fff',
		fontSize: 20, fontFamily: 'GothamPro',
		fontWeight: 'bold',
	},
	speed_text:{
		color: '#43254b',
		fontSize: 13, fontFamily: 'GothamPro',
		fontWeight: 'bold',
	},
	mission_num:{
		color: '#fff',
		fontSize: 13, fontFamily: 'GothamPro',
		fontWeight: 'bold',
	},
	mission_text:{
		color: '#43254b',
		fontSize: 12, fontFamily: 'GothamPro',
		fontWeight: 'bold',
	},
	score_num:{
		color: '#fff',
		fontSize: 20, fontFamily: 'GothamPro',
		fontWeight: 'bold',
	},
	score_text:{
		color: '#43254b',
		fontSize: 13, fontFamily: 'GothamPro',
		fontWeight: 'bold',
	},
	next_figure:{
		position: 'absolute',
		top: 8, left: 18,
	},
	next_cell:{
		position: 'absolute',
		width: nextSize, height: nextSize,
		borderWidth:1,
	},
	next_text:{
		color: '#6d3973',
		fontSize: 13, fontFamily: 'GothamPro',
		fontWeight: 'bold',
		marginTop: 35,
	},
});

const sound = [
	Sound1,
	Sound2,
	Sound3,
];
// цвет кубика фигуры и его рамки
const color = [
	{i: '#F74545', j: '#BE0909'}, // красный
	{i: '#FFB84F', j: '#B86D00'}, // оранжевый
	{i: '#F6E051', j: '#F7A631'}, // желтый
	{i: '#C0CF4F', j: '#4EA856'}, // светло-зеленый
	{i: '#44AA47', j: '#2F7631'}, // темно-зеленый
	{i: '#58C7C8', j: '#048D8D'}, // бирюзовый
	{i: '#55B8EC', j: '#1374A7'}, // голубой
	{i: '#5D8AC5', j: '#0A1E65'}, // синий
	{i: '#DF5769', j: '#8D1B2A'}, // розовый
]

/*
все фигуры хранятся в figureList,
падающая фигура в currentFigure
в Scheme хранятся все возможные фигуры и их трансформации
все цвета фигур хранятся в массиве colorList
цвет падающей фигуры в currentColor
transform_id, figure_id - номера текущей фигуры из массива scheme и текущая трансформация
*/

export default class Game extends Component {
	constructor(props) {
		super(props);

		this.state = {
			volume: true,
			score: 0,
			status: '',
			speedVisible: 1, // скорость, отображаемая в правом боковом меню игры
			speedHidden: 640, // реальная скорость для запуска таймера

			figure_id: 0, // номер падающей фигуры из массива Scheme
			transform_id: 0, // номер трансформации падающей фигуры из массива Scheme
			currentFigure: [], // текущая(падающая) фигура
			currentColor: [], // цвет текущей фигуры
			figureList: [], // массив всех упавших фигур
			colorList: [], // массив цветов всех упавших фигур
		};
		this.prepare_scheme();
		this.next_generate();
	}

	componentWillUnmount = () =>{
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
		this.game_initialize();
	}

	game_initialize = () =>{
		this.setState({
			score: 0,
			status: '',
			speedVisible: 1,
			speedHidden: 600,

			figure_id: 0,
			transform_id: 0,
			currentFigure: [],
			currentColor: [],
			figureList: [],
			colorList: [],
		});

		this.offsetX = 0;
		this.offsetY = 0;
		// запускаем тетрис
		this.fall_figure();
	}

	// используется чтобы продолжить игру после паузы
	game_continue = () =>{
		this.setState({status:''});
		this.check_bottom();
	}
	// используется для постановки на паузу, завершению с победой или проигрышем
	game_stop = (status) =>{
		this.setState({status});
		clearTimeout(this.timerOut);
		clearTimeout(this.timerIn);
	}

	set_volume = _ => {
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
	// центрируем фигуры и поднимаем наверх, чтобы они стали невидимыми
	prepare_scheme = _=>{
		let leftOffset = 4*cellSize;
		let topOffset = -4*cellSize;
		this.scheme = Scheme.map(fig =>(
			fig.map(transf =>(
				transf.map(cell =>({
					 x: cell.x*cellSize+leftOffset,
					 y: cell.y*cellSize+topOffset
				}))
			))
		))
	}
	// генерирование следующей фигуры
	next_generate = _=>{
		//let figure_id =  f.randA(2,3);
		let figure_id =  f.randA(0, 10);
		let amountTransform = this.scheme[figure_id].length;
		let transform_id = f.randA(0,amountTransform-1);
		let color_id = f.randA(0, 9);
		this.next = {figure_id, transform_id, color_id}
	}
	// падение фигуры вниз
	fall_figure = () =>{
		let {figure_id,transform_id,color_id} = this.next;

		let currentFigure = this.scheme[figure_id][transform_id];
		let currentColor = color[color_id];

		this.next_generate();
		this.setState({
			currentFigure,currentColor,
			figure_id, transform_id,
		});
		this.offsetX = 0;
		this.offsetY = 0;
		if(!this.state.speedHidden){
			this.timerOut = setTimeout(this.check_bottom, 100);
		} else {
			this.timerOut = setTimeout(this.check_bottom, 0);
		}
	}
	// проверка баррикад при падении
	check_bottom = () =>{
		let {figureList,colorList,currentFigure,currentColor,speedHidden} = this.state;
		currentFigure = currentFigure.map((cell,i) =>({x:cell.x, y:cell.y+cellSize}));
		let isMatch1 = false;
		let isMatch2 = false;
		let isMatch3 = false;
		// фигура упала
		isMatch1 = currentFigure.some(e => e.y == tetrisHeight-cellSize)
		// фигура не влезает в тетрис
		isMatch2 = currentFigure.some(e => e.y == 0-cellSize)
		// фигура коснулась упавших фигур
		isMatch3 = currentFigure.some(cell =>
			figureList.some(fig =>
				fig.some(e => cell.x == e.x && cell.y == e.y)
			)
		)
		if(isMatch2 && isMatch3){
			this.game_stop('fail');
			this.sound[1].play();
		}
		else if(isMatch3){
			clearTimeout(this.timerIn);
			figureList.push(this.state.currentFigure);
			colorList.push(currentColor);
			this.setState({figureList,colorList,currentFigure:[]})
			this.check_solid_row(tetrisHeight);
		} else if(isMatch1){
			clearTimeout(this.timerIn);
			figureList.push(currentFigure);
			colorList.push(currentColor);
			this.setState({figureList,colorList,currentFigure:[]})
			this.check_solid_row(tetrisHeight);
		} else{
			this.offsetY += cellSize;
			this.setState({currentFigure})
			this.timerIn = setTimeout(this.check_bottom, speedHidden);
		}
	}

	check_solid_row = (height) =>{
		let {score,figureList} = this.state;
		let removeList = [];
		if(height == tetrisHeight) height -= cellSize;
		figureList.forEach(fig =>{
			fig.forEach(cell =>{
				if(cell.y == height){
					removeList.push(cell);
				}
			})
		})
		if(removeList.length == 11){
			score++;
			figureList = this.remove_row(figureList,removeList);
			figureList = this.offset_cell(figureList,height);
			setTimeout(_ => {
				this.setState({score,figureList})
				this.sound[0].stop()
				this.sound[0].play()
				Vibration.vibrate()
				if(score == 20) {
					setTimeout(_ => {
						this.game_stop('win');
						this.sound[2].play();
					},400);
				} else{
					height = tetrisHeight;
					this.check_solid_row(height);
				}
			},400);
		} else if(height > 0){
			height -= cellSize;
			this.check_solid_row(height);
		} else{
			this.fall_figure();
		}
	}
	// удаление сплошного ряда
	remove_row = (figureList,removeList)=>(
		figureList.map(fig =>
			fig.filter(cell => !removeList.some(e => cell.x == e.x && cell.y == e.y))
		)
	)
	// смещение всех фигур находящихся выше удаленного ряда вниз
	offset_cell = (figureList,height)=>(
		figureList.map(fig =>
			fig.map(cell =>(cell.y < height ? {x:cell.x, y:cell.y+cellSize} : cell))
		)
	)

	// перемещение фигуры влево
	move_left = _ =>{
		let {currentFigure} = this.state;
		let isMatch1 = false;
		let isMatch2 = false;
		currentFigure = currentFigure.map((e,i) =>({x:e.x-cellSize, y:e.y}));
		isMatch1 = currentFigure.some(cell => cell.x < 0);
		isMatch2 = this.check_barrier(currentFigure);
		if(!isMatch1 && !isMatch2){
			this.offsetX -= cellSize;
			this.setState({currentFigure})
		}
	}
	// перемещение фигуры вправо
	move_right = _ =>{
		let {currentFigure} = this.state;
		let isMatch1 = false;
		let isMatch2 = false;
		currentFigure = currentFigure.map((e,i) =>({x:e.x+cellSize, y:e.y}));
		isMatch1 = currentFigure.some(cell => cell.x == tetrisWidth);
		isMatch2 = this.check_barrier(currentFigure);
		if(!isMatch1 && !isMatch2){
			this.offsetX += cellSize;
			this.setState({currentFigure})
		}
	}
	// проверка баррикад при перемещении и трансформации падающей фигуры
	check_barrier = (currentFigure)=>{
		let {figureList} = this.state;
		if(!figureList.length) return;
		return currentFigure.some(cell =>
					figureList.some(fig =>
						fig.some(e => cell.x == e.x && cell.y == e.y)
					)
				)
	}

	// трансформация фигуры
	transform_figure = _ =>{
		let {figure_id,transform_id} = this.state;
		if(figure_id <= 1) return;
		let amountTransform = this.scheme[figure_id].length;
		if(transform_id < amountTransform-1) transform_id++;
		else transform_id = 0;
		let currentFigure = this.scheme[figure_id][transform_id];
		currentFigure = currentFigure.map(e => ({x: e.x+this.offsetX, y: e.y+this.offsetY}))

		// если фигура вышла за левую границу экрана
		while(currentFigure.some(e => e.x < 0)){
			currentFigure = currentFigure.map(e =>({x:e.x+cellSize, y:e.y}))
			this.offsetX += cellSize;
		}
		// если фигура вышла за правую границу экрана
		while(currentFigure.some(e => e.x == tetrisWidth)){
			currentFigure = currentFigure.map(e =>({x:e.x-cellSize, y:e.y}))
			this.offsetX -= cellSize;
		}
		if(!this.check_barrier(currentFigure)){
			this.setState({transform_id,currentFigure})
		}
	}

	// изменение скорости падения фигуры
	change_speed = _ =>{
		this.setState(({ speedVisible, speedHidden }) => {
			if(speedVisible < 3) {
				speedVisible++;
			} else speedVisible = 1;

			if(speedVisible == 1) speedHidden = 640;
			if(speedVisible == 2) speedHidden = 540;
			if(speedVisible == 3) speedHidden = 440;

			return {speedVisible,speedHidden}
		})
	}
	// нажали на ускорение
	accelerate_start = _ =>{
		this.setState({speedHidden: 2})
	}

	// убрали палец с ускорения
	accelerate_end = _ =>{
		this.setState(({speedVisible,speedHidden}) =>{
			if(speedVisible == 1) speedHidden = 640;
			if(speedVisible == 2) speedHidden = 540;
			if(speedVisible == 3) speedHidden = 440;
			return {speedHidden}
		})
	}

	render() {
		let state = this.state;
		// масштабирование стилей
		let grid = Array.from({length:cellQuantity});
		let nextFigure = Scheme[this.next.figure_id][this.next.transform_id];
		nextFigure = nextFigure.map(e => ({left: e.x*nextSize*scale,top: e.y*nextSize*scale}))
		let nextColor =  {backgroundColor: '#a66ca3',borderColor: '#160f1f'}

		let currentFigure = state.currentFigure;
		let currentColor =  state.currentColor;
		currentFigure = currentFigure.map(e => ({left: e.x*scale,top: e.y*scale}))
		currentColor = {backgroundColor: currentColor.i,borderColor: currentColor.j}

		let figureList = state.figureList;
		let colorList =  state.colorList;
		figureList = figureList.map(fig => (
			fig.map(cell =>({left: cell.x*scale,top: cell.y*scale}))
		))
		colorList = colorList.map(e =>({backgroundColor: e.i,borderColor: e.j}))

		return (
			<View style={styles.container}>
				<View style={styles.content}>
					<View style={styles.tetris_container}>
						<ScrollView style={styles.scroll}>
							<View style={styles.tetris}>
								{grid.map((e, i) => <View style={styles.grid} key={i}></View>)}
								{currentFigure.map((e, i) =>
									<View style={[styles.cell, currentColor, e]} key={i}></View>)}
								{figureList.map((fig, i) =>
									fig.map((cell, j) => <View style={[styles.cell, colorList[i], cell]} key={j}></View>)
								)}
							</View>
						</ScrollView>
					</View>
					<View style={styles.right_menu}>
						<TouchableOpacity style={[styles.control,styles.volume]} onPress={this.set_volume}>
							<Icon name={state.volume ? 'volume-up' : 'volume-mute'} size={25} color='#fff' />
						</TouchableOpacity>
						<TouchableOpacity style={[styles.control,styles.pause]} onPress={_ => this.game_stop('pause')}>
							<Icon name={state.pause ? 'play' : 'pause'} size={25} color='#fff' />
						</TouchableOpacity>
						<TouchableOpacity style={[styles.control, styles.speed]} onPress={this.change_speed}>
							<Text style={styles.speed_num}>{state.speedVisible}</Text>
							<Text style={styles.speed_text}>speed</Text>
						</TouchableOpacity>
						<View style={[styles.control,styles.mission]}>
							<Text style={styles.mission_num}>20 rows</Text>
							<Text style={styles.mission_text}>mission</Text>
						</View>
						<View style={[styles.control,styles.score]}>
							<Text style={styles.score_num}>{state.score}</Text>
							<Text style={styles.score_text}>score</Text>
						</View>
						<View style={[styles.control, styles.next]}>
							<View style={styles.next_figure}>
								{nextFigure.map((e,i) =>
									<View style={[styles.next_cell, nextColor, e]} key={i}></View>)}
							</View>
							<Text style={styles.next_text}>next</Text>
						</View>
					</View>
					<View style={styles.bottom_menu}>
						<TouchableOpacity style={styles.button} onPress={this.move_left}>
							<Icon name='arrow-left' size={27} color='#fff' />
						</TouchableOpacity>
						<TouchableOpacity style={styles.button} onPress={this.move_right}>
							<Icon name='arrow-right' size={27} color='#fff' />
						</TouchableOpacity>
						<TouchableOpacity style={styles.button} onPress={this.transform_figure}>
							<Icon name='spinner' size={27} color='#fff' />
						</TouchableOpacity>
						<TouchableOpacity style={styles.button} onPressIn={this.accelerate_start} onPress={this.accelerate_end}>
							<Icon name='arrow-down' size={27} color='#fff' />
						</TouchableOpacity>
					</View>
					<Events {...state} continue={this.game_continue} restart={this.game_initialize} go_home={_ =>this.props.navigation.goBack()} />
				</View>
			</View>
		);
	}
}