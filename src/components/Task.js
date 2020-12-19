import React from 'react'
import { 
    View, 
    Text, 
    StyleSheet,
    TouchableWithoutFeedback,
    TouchableOpacity
} from 'react-native'

import Swipeable from 'react-native-gesture-handler/Swipeable'
import Icon from "react-native-vector-icons/FontAwesome";

import commonStyles from '../commonStyles';

import moment from "moment"
import 'moment/locale/pt-br'

export default props => {
    const doneOrNotStyle = props.doneAt !== null 
        ? { textDecorationLine: 'line-through'} 
        : ''

    const date = props.doneAt ? props.doneAt : props.estimateAt
    const formattedDate = moment(date).locale('pr-br')
        .format('ddd, D, [de] MMMM')

    const getLeftContent = () => {
        return (
            <TouchableOpacity style={styles.left}>
                <Icon 
                    name="trash" 
                    size={30}
                    color='#fff'
                    style={styles.excludeIcon}/>
                <Text style={styles.excludeText}>Excluir</Text>
            </TouchableOpacity>
        )
    }

    const getRightContent = () => {
        return (
            <TouchableOpacity
                onPress={() => props.onDelete && props.onDelete(props.id)} style={styles.right}>
                <Icon  name="trash" size={30} color='#fff'/>
            </TouchableOpacity>
        )
    }

    return (
        <Swipeable 
            onSwipeableLeftOpen={() => props.onDelete && props.onDelete(props.id)}
            renderRightActions={getRightContent}
            renderLeftActions={getLeftContent}>

            <View style={styles.container}>
                <TouchableWithoutFeedback
                    onPress={() => props.onToogleTask(props.id)} >
                    <View style={styles.checkContainer}>
                        {getCheckView(props.doneAt)}
                    </View>
                </TouchableWithoutFeedback>
                <View>
                    <Text style={[styles.desc, doneOrNotStyle]}>{props.desc}</Text>
                    <Text style={styles.date}>{formattedDate + ""}</Text>
                </View>
            </View>

        </Swipeable>

    )
}

function getCheckView(doneAt) {
    if(doneAt != null) {
        return (
            <View style={styles.done}>
                <Icon name='check'
                    color='#fff'
                    size={20} />
            </View>
        )
    } else {
        return (
            <View style={styles.pedding}></View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderColor: '#AAA',
        borderBottomWidth: 1,
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#fff'
    },
    checkContainer: {
        width: '20%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    pedding: {
        height: 25,
        width: 25,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: '#555',

    },
    done: {
        height: 25,
        width: 25,
        borderRadius: 13,
        backgroundColor: 'green',
        alignItems: 'center',
        justifyContent: 'center'
    },
    desc: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.mainText,
        fontSize: 15
    },
    date: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.subText,
    },
    right: {
        backgroundColor: 'red',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 20
    },
    left: {
        flex: 1,
        backgroundColor: 'red',
        flexDirection: 'row',
        alignItems: 'center'
    },
    excludeText: {
        fontFamily: commonStyles.fontFamily,
        color: '#fff',
        fontSize: 20,
        margin: 10
    },
    excludeIcon: {
        marginLeft: 10
    }
})
