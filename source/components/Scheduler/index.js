// Core
import React, { Component } from "react";
//Components
import Task from "../../components/Task";
import Spinner from "../../components/Spinner";
// Instruments
import Styles from "./styles.m.css";
import { BaseTaskModel } from "../../instruments/helpers";
import { api } from "../../REST"; // ! Импорт модуля API должен иметь именно такой вид (import { api } from '../../REST')
import FlipMove from "react-flip-move";

import Checkbox from "../../theme/assets/Checkbox";
import { sortTasksByGroup } from "../../instruments/helpers";

export default class Scheduler extends Component {
    state = {
        tasks:           [],
        newTaskMessage:  "",
        tasksFilter:     "",
        isTasksFetching: false,
    };
    componentDidMount () {
        this._fetchTasksAsync();
    }

    _updateTasksFilter = (event) => {
        this.setState({
            tasksFilter: event.target.value.toLowerCase(),
        });
    };
    _setTasksFetchingState = (state) => {
        this.setState({
            isTasksFetching: state,
        });
    };
    _updateNewTaskMessage = (event) => {
        this.setState({
            newTaskMessage: event.target.value,
        });
    };
    _fetchTasksAsync = async () => {
        this._setTasksFetchingState(true);
        const tasks = await api.fetchTasks();

        this.setState({
            tasks:           sortTasksByGroup(tasks),
            isTasksFetching: false,
        });
    };
    _createTaskAsync = async (newTaskMessage) => {
        this._setTasksFetchingState(true);
        const task = await api.createTask(newTaskMessage);

        this.setState(({ tasks }) => ({
            tasks:           sortTasksByGroup([task, ...tasks]),
            isTasksFetching: false,
        }));
    };
    _removeTaskAsync = async (id) => {
        this._setTasksFetchingState(true);
        const task = await api.removeTask(id);

        this.setState(({ tasks }) => ({
            tasks: tasks.filter((task) => {
                return task.id !== id;
            }),
            isTasksFetching: false,
        }));
    };
    _updateTaskAsync = async (model) => {
        const { tasks } = this.state;

        this._setTasksFetchingState(true);
        const update_task = await api.updateTask(model);

        this.setState(({ tasks }) => ({
            tasks: sortTasksByGroup(
                tasks.map(
                    (task) => task.id === update_task.id ? update_task : task
                )
            ),
            isTasksFetching: false,
        }));
    };
    _handleSubmit = (event) => {
        event.preventDefault();
        this._submitTask();
    };
    _submitTask = () => {
        const { newTaskMessage } = this.state;

        if (!newTaskMessage) {
            return null;
        }
        this._createTaskAsync(newTaskMessage);
        this.setState({
            newTaskMessage: "",
        });
    };
    _submitOnEnter = (event) => {
        const enterKey = event.key === "Enter";

        if (enterKey) {
            event.preventDefault();
            this._submitTask();
        }
    };
    _getAllCompleted = () => {
        const { tasks } = this.state;

        return tasks.every((task) => task.completed);
    };
    _completeAllTasksAsync = async () => {
        const { tasks } = this.state;

        if (this._getAllCompleted()) {
            return null;
        }
        this._setTasksFetchingState(true);
        const res = await api.completeAllTasks(tasks);

        this.setState({
            tasks:           res,
            isTasksFetching: false,
        });
    };
    render () {
        const {
            tasks,
            newTaskMessage,
            isTasksFetching,
            tasksFilter,
        } = this.state;
        const allTasksChecked = this._getAllCompleted();

        const tasksFilterArray = tasks.filter((task) =>
            task.message.toLowerCase().includes(tasksFilter)
        );
        const tasksJSX = tasksFilterArray.map((task) => {
            return (
                <Task
                    key = { task.id }
                    { ...task }
                    _removeTaskAsync = { this._removeTaskAsync }
                    _updateTaskAsync = { this._updateTaskAsync }
                />
            );
        });

        return (
            <section className = { Styles.scheduler }>
                <Spinner isSpinning = { isTasksFetching } />
                <main>
                    <header>
                        <h1>Планировщик задач</h1>
                        <input
                            placeholder = 'Поиск'
                            type = 'search'
                            value = { tasksFilter }
                            onChange = { this._updateTasksFilter }
                        />
                    </header>
                    <section>
                        <form onSubmit = { this._handleSubmit }>
                            <input
                                maxLength = '50'
                                onChange = { this._updateNewTaskMessage }
                                onKeyPress = { this._submitOnEnter }
                                placeholder = 'Описание моей новой задачи'
                                type = 'text'
                                value = { newTaskMessage }
                            />
                            <button>Добавить задачу</button>
                        </form>
                        <div>
                            <ul>
                                <div>
                                    <FlipMove>{tasksJSX}</FlipMove>
                                </div>
                            </ul>
                        </div>
                    </section>
                    <footer>
                        <Checkbox
                            checked = { allTasksChecked }
                            color1 = '#363636'
                            color2 = '#fff'
                            onClick = { this._completeAllTasksAsync }
                        />
                        <span className = { Styles.completeAllTasks }>
                            Все задачи выполнены
                        </span>
                    </footer>
                </main>
            </section>
        );
    }
}
