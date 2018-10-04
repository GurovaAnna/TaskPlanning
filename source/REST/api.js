// Instruments
import { MAIN_URL, TOKEN } from "./config";

export const api = {
    fetchTasks: async () => {
        const response = await fetch(MAIN_URL, {
            method:  "GET",
            headers: {
                'Content-Type': 'application/json',
                Authorization:  TOKEN,
            },
        });

        if (response.status !== 200) {

            throw new Error("Tasks were not fetched");
        }
        const { data: task } = await response.json();

        return task;
    },

    createTask: async (message) => {
        const response = await fetch(MAIN_URL, {
            method:  "POST",
            headers: {
                Authorization:  TOKEN,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
        });

        if (response.status !== 200) {
            throw new Error("Task was not created");
        }
        const { data: task } = await response.json();

        return task;
    },

    updateTask: async (model) => {
        const response = await fetch(MAIN_URL, {
            method:  "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization:  TOKEN,
            },
            body: JSON.stringify([model]),
        });

        const {
            data: [task],
        } = await response.json();

        if (response.status !== 200) {
            throw new Error("Task was not updated");
        }

        return task;
    },

    removeTask: async (id) => {
        const response = await fetch(`${MAIN_URL}/${id}`, {
            method:  "DELETE",
            headers: {
                Authorization: TOKEN,
            },
        });

        if (response.status !== 204) {
            throw new Error("Task was not deleted");
        }
    },

    completeAllTasks: async (tasks) => {
        const requests = tasks.map((task) => {
            return fetch(MAIN_URL,{
                method:'PUT',
                headers:{
                    'Content-Type':'application/json',
                    Authorization:TOKEN
                },
                body: JSON.stringify([task])
            });

        });

        
return Promise.all(requests).then((responses) => {
            const result = responses.every((response) => response.status === 200);

            !result ? false : '';
        });
    },

};
