import React, { Component } from "react"
import { 
    Text, 
    View, 
    ImageBackground, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity,
    Platform,
    Alert
} from "react-native"

import moment from "moment"
import 'moment/locale/pt-br'

import Icon from "react-native-vector-icons/FontAwesome";

import { server, showError} from '../common'
import commonStyles from "../commonStyles";
import imageToday from "../../assets/imgs/today.jpg"
import imageTomorrow from "../../assets/imgs/tomorrow.jpg"
import imageWeek from "../../assets/imgs/week.jpg"
import imageMonth from "../../assets/imgs/month.jpg"

import Task from "../components/Task";
import AddTask from "./AddTask";
import AsyncStorage from "@react-native-community/async-storage";
import axios from "axios";

const initialState = {
    showDoneTasks: true,
    showAddTask: false,
    visibleTasks: [],
    tasks: []
}

export default class TaskList extends Component {
    state = { ...initialState }

    toogleFilter = () => {
        this.setState({showDoneTasks: !this.state.showDoneTasks}, this.filterTasks)
    }

    loadTasks = async () => {
        try{
            //const maxDate = moment().endOf('day').toDate()
            const maxDate = moment()
                .add({days: this.props.daysAhead})
                .locale('pt-br')
                .format('YYYY-MM-DD 23:59:59')
            const res = await axios.get(`${server}/tasks?date=${maxDate}`)
            this.setState({tasks: res.data}, this.filterTasks)
        } catch (e) {
            showError(e)
        }
    }

    componentDidMount = async () => {
        const stateString = await AsyncStorage.getItem('tasksState')
        const savedState = JSON.parse(stateString) || initialState
        this.setState({
            showDoneTasks: savedState.showDoneTasks
        }, this.filterTasks)

        this.loadTasks()
    }

    filterTasks = () => {
        let visibleTasks = null
        if(this.state.showDoneTasks) {
            visibleTasks = [...this.state.tasks]
        } else {
            const pending = task => task.doneAt === null
            visibleTasks = this.state.tasks.filter(pending)
        }

        this.setState({visibleTasks})
        AsyncStorage.setItem('tasksState', JSON.stringify({
            showDoneTasks: this.state.showDoneTasks
        }))
    }

    toogleTask = async taskId => {
        try {
            await axios.put(`${server}/tasks/${taskId}/toogle`)
            this.loadTasks()
        } catch (error) {
            showError(error)
        }
    }

    addTask = async newTask => {
        if(!newTask.desc || !newTask.desc.trim()) {
            Alert.alert('Dados inválidos', 'Descrição não informada!')
            return
        }

        try {
            await axios.post(`${server}/tasks`, {
                desc: newTask.desc,
                estimateAt: newTask.date
            })

            this.setState({showAddTask: false}, this.loadTasks)
        } catch (error) {
            showError(error)
        }
    }

    deleteTask = async taskId => {
        try {
            await axios.put(`${server}/tasks/${taskId}`)
            this.loadTasks()
        } catch (error) {
            showError(error)
        }
    }

    getImage = () => {
        switch (this.props.daysAhead) {
            case 0: return imageToday
            case 1: return imageTomorrow        
            case 7: return imageWeek        
            default: return imageMonth
        }
    }

    getColor = () => {
        switch (this.props.daysAhead) {
            case 0: return commonStyles.colors.today
            case 1: return commonStyles.colors.tomorrow        
            case 7: return commonStyles.colors.week        
            default: return commonStyles.colors.month
        }
    }

    render () {
        const today = moment()
                        .add({days: this.props.daysAhead})
                        .locale('pt-br').format('ddd, D [de] MMMM')
        return (
            <View style={styles.container}>
                <AddTask 
                    isVisible={this.state.showAddTask}
                    onCancel={() => this.setState({showAddTask: false})}
                    onSave={this.addTask}/>
                <ImageBackground 
                    source={this.getImage()}
                    style={styles.background}>
                    <View style={styles.iconBar}>
                        <TouchableOpacity onPress={() => this.props.navigation.openDrawer()}>
                            <Icon name="bars"
                                size={20}
                                color={commonStyles.colors.secondary}
                                />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.toogleFilter}>
                            <Icon name={
                                    this.state.showDoneTasks 
                                    ? 'eye' 
                                    : 'eye-slash'
                                }
                                size={20}
                                color={commonStyles.colors.secondary}
                                />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.titleBar}>
                            <Text style={styles.title}>{this.props.title}</Text>
                        <Text style={styles.subtitle}>{today}</Text>
                    </View>
                </ImageBackground>
                <View style={styles.taskList}>
                    <FlatList 
                        data={this.state.visibleTasks}
                        keyExtractor={item => `${item.id}`}
                        // renderItem={({item}) o item vêm de keyExtractir obj.item 
                        renderItem={({item}) => <Task {...item} onDelete={this.deleteTask} onToogleTask={this.toogleTask}/>}/>
                </View>
                <TouchableOpacity
                    style={[styles.addButon, {backgroundColor: this.getColor()}]}
                    onPress={() => this.setState({showAddTask: true})}
                    activeOpacity={0.7}>
                    <Icon 
                        name="plus"
                        color={commonStyles.colors.secondary}
                        size={20}/>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    background: {
        flex: 3
    },
    taskList: {
        flex: 7
    },
    titleBar: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    title: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 50,
        marginLeft: 20,
        marginBottom: 20
    },
    subtitle: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 20,
        marginLeft: 20,
        marginBottom: 30
    },
    iconBar: {
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'space-between',
        marginTop: Platform.OS === 'ios' ? 50 : 10
    },
    addButon: {
        width: 50,
        height: 50,
        position: 'absolute',
        right: 30,
        bottom: 30,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
