// Core
import React, { PureComponent } from "react";
//Components
import Checkbox from "../../theme/assets/Checkbox";
import Star from "../../theme/assets/Star";
import Edit from "../../theme/assets/Edit";
import Remove from "../../theme/assets/Remove";

// Instruments
import Styles from "./styles.m.css";

export default class Task extends PureComponent {
    state = {
        isTaskEditing: false,
        newMessage:    this.props.message,
    };
    taskInput = React.createRef();

    _getTaskShape = ({
        id = this.props.id,
        completed = this.props.completed,
        favorite = this.props.favorite,
        message = this.props.message,
    }) => ({
        id,
        completed,
        favorite,
        message,
    });

    _removeTask = () => {
        const { id, _removeTaskAsync } = this.props;

        _removeTaskAsync(id);
    };
    _updateTask = () => {
        const { message, _updateTaskAsync, id } = this.props;
        const { newMessage } = this.state;

        this._setTaskEditingState(false);
        if (message === newMessage) {
            return null;
        }
        const model = this._getTaskShape({ message: newMessage });

        _updateTaskAsync(model);

    };
    _setTaskEditingState = (state) => {
        this.setState({ isTaskEditing: state }, () => {
            if (state) {
                this.taskInput.current.focus();
            }
        });
    };
    _updateNewTaskMessage = (event) => {
        this.setState({
            newMessage: event.target.value,
        });
    };
    _updateTaskMessageOnClick = () => {
        const { isTaskEditing } = this.state;

        if (isTaskEditing) {
            this._updateTask();

            return null;
        }
        this._setTaskEditingState(!isTaskEditing);

    };
    _cancelUpdatingTaskMessage = () => {
        const { message } = this.props;

        this.setState({
            isTaskEditing: false,
            newMessage:    message,
        });
    };
    _updateTaskMessageOnKeyDown = (event) => {
        const { newMessage } = this.state;
        const enterKey = event.key === "Enter";
        const enterEscape = event.key === "Escape";

        if (!newMessage) {
            return null;
        }
        if (enterKey) {
            this._updateTask();
        }
        if (enterEscape) {
            this._cancelUpdatingTaskMessage();
        }
    };
    _toggleTaskCompletedState = () => {
        const { ...props } = this.props;
        const model = this._getTaskShape({ completed: !props.completed });

        props._updateTaskAsync(model);
    };
    _toggleTaskFavoriteState = () => {
        const { _updateTaskAsync, favorite } = this.props;
        const model = this._getTaskShape({ favorite: !favorite });

        _updateTaskAsync(model);
    };
    render () {
        const { ...tasks } = this.props;
        const { isTaskEditing, newMessage } = this.state;
        const favorite = tasks.favorite;
        const completed = tasks.completed;

        return (
            <li className = { Styles.task }>
                <div className = { Styles.content }>
                    <Checkbox
                        checked = { completed }
                        className = { Styles.toggleTaskCompletedState }
                        color1 = '#3B8EF3'
                        color2 = '#FFF'
                        onClick = { this._toggleTaskCompletedState }
                    />
                    <input
                        disabled = { !isTaskEditing }
                        maxLength = '50'
                        onChange = { this._updateNewTaskMessage }
                        onKeyDown = { this._updateTaskMessageOnKeyDown }
                        ref = { this.taskInput }
                        type = 'text'
                        value = { newMessage }
                    />
                </div>
                <div className = { Styles.actions }>
                    <Star
                        checked = { favorite }
                        className = { Styles.toggleTaskFavoriteState }
                        color1 = '#3B8EF3'
                        color2 = '#000'
                        inlineBlock
                        onClick = { this._toggleTaskFavoriteState }
                    />
                    <Edit
                        checked = { isTaskEditing }
                        className = { Styles.updateTaskMessageOnClick }
                        color1 = '#3B8EF3'
                        color2 = '#000'
                        inlineBlock
                        onClick = { this._updateTaskMessageOnClick }
                    />
                    <Remove
                        className = { Styles.removeTask }
                        color1 = '#3B8EF3'
                        color2 = '#000'
                        inlineBlock
                        onClick = { this._removeTask }
                    />
                </div>
            </li>
        );
    }
}
