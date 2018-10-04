// Core
import React, { Component } from "react";
//Components
import Task from "../../components/Task";
import Spinner from "../../components/Spinner";
// Instruments
import Styles from "./styles.m.css";

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
        const updatedTasksFilter = event.target.value;

        this.setState({
            tasksFilter: updatedTasksFilter ? updatedTasksFilter.toLowerCase() : null,
        });
    };

    _setTasksFetchingState = (state) => {
        this.setState({
            isTasksFetching: state,
        });
    };

    _updateNewTaskMessage = (event) => {
        const enterKey = event.key ==='Enter';

        if (enterKey) {
            this._createTaskAsync(event);

            return;
        }

        this.setState({
            newTaskMessage: event.target.value,
        });
    };

    _fetchTasksAsync = async () => {
        this._setTasksFetchingState(true);
        const tasks = await api.fetchTasks();

        this.setState({
            tasks: sortTasksByGroup(tasks),
        });
        this._setTasksFetchingState(false);
    };

    _createTaskAsync = async (event) => {
        event.preventDefault();
        const { newTaskMessage } = this.state;

        if (!newTaskMessage) {
            return null;
        }

        this._setTasksFetchingState(true);
        const task = await api.createTask(newTaskMessage);

        if (task !== null) {
            const newTask = { ...task };

            this.setState(({ tasks }) => ({
                tasks: [newTask, ...tasks],
            }));
        }

        this.setState({
            newTaskMessage: '',
        });
        this._setTasksFetchingState(false);
    };

    _removeTaskAsync = async (id) => {
        this._setTasksFetchingState(true);

        const res = await api.removeTask(id);

        if (res===undefined) {
            this.setState(({ tasks }) => ({
                tasks: tasks.filter((task) => task.id !== id
                ),
            }));
        }
        this._setTasksFetchingState(false);
    };

    _updateTaskAsync = async (model) => {
        const { tasks } = this.state;

        this._setTasksFetchingState(true);
        const updatedTask = await api.updateTask(model);

        this.setState(({ tasks }) => ({
            tasks: sortTasksByGroup(
                tasks.map(
                    (task) => task.id === updatedTask.id ? updatedTask : task
                )
            ),
        }));
        this._setTasksFetchingState(false);
    };

    _getAllCompleted = () => {
        const { tasks } = this.state;

        return tasks.every((task) => task.completed);
    };

    _completeAllTasksAsync = async () => {
        const { tasks } = this.state;
        const allTasksCompleted = this._getAllCompleted();

        if (allTasksCompleted) {
            return null;
        }

        this._setTasksFetchingState(true);
        const uncompletedTasks = tasks.filter((task) => {
            if (!task.completed) {
                task.completed = !task.completed;

                return task;
            }
        });
        const result = await api.completeAllTasks(uncompletedTasks);

        if (result === undefined) {
            const tasksComplited = tasks.map((task) => {
                return uncompletedTasks.find((uncompletedTask) => uncompletedTask.id === task.id) || task;
            });

            const sortedTasks = sortTasksByGroup(tasksComplited);

            this.setState({
                tasks:           sortedTasks,
                isTasksFetching: false,
            });
        } else {
            return null;
        }
    };
    render () {
        const {
            tasks,
            newTaskMessage,
            isTasksFetching,
            tasksFilter,
        } = this.state;
        const allTasksChecked = this._getAllCompleted();

        const tasksJSX = tasks
            .filter((task) =>
                task.message.toLowerCase().includes(tasksFilter)
            )
            .map((task) => {
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
                        <form
                            onSubmit = { this._createTaskAsync }>
                            <input
                                className = 'createTask'
                                maxLength = { 50 }
                                placeholder = 'Описaние моей новой задачи'
                                type = 'text'
                                value = { newTaskMessage }
                                onChange = { this._updateNewTaskMessage }
                            />
                            <button>Добавить задачу</button>
                        </form>
                        <div className = { Styles.overlay }>
                            <ul>
                                <FlipMove duration = { 400 }>{tasksJSX}</FlipMove>
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
