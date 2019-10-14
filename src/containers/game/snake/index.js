import React,{Component} from 'react';
import {StyleSheet,ScrollView,TouchableOpacity,View,Text} from 'react-native';
import {withNavigation} from 'react-navigation';

import Layout from './layout';

export default withNavigation(class PromoPassportComponent extends Component {

	render() {
		console.log("Component",this.props);
		return (
			<Layout
				{...this.props}
			/>
		);
	}
});