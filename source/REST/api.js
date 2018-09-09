// Instruments
import { MAIN_URL, TOKEN } from "./config";

export const api = {
    fetchTasks : async () => {
        const response = await fetch(MAIN_URL, {
            method: "GET",
            headers: {
                Authorization:  TOKEN,
            },
        }),
        { data:task } = await response.json();
        if (response.status !== 200) {
            throw new Error ('Tasks were not fetched');
        }
        return task;
  },
  createTask : async (message) => {
      const response = await fetch(MAIN_URL, {
          method: "POST",
          headers: {
              Authorization:  TOKEN,
              "Content-Type": "application/json",
          },
          body:JSON.stringify({message : message}),
      }),
      { data:task } = await response.json();
      if (response.status !== 200) {
          throw new Error ('Task was not created');
      }
      return task;
},
updateTask : async (model) => {
    const response = await fetch(MAIN_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization:  TOKEN,
        },
        body:JSON.stringify([model]),
    }),
    { data:[task]} = await response.json();
    if (response.status !== 200) {
        throw new Error ('Task was not updated');
    }
    return task;
},
removeTask: async (id) => {
    const response = await fetch(`${MAIN_URL}/${id}`, {
        method: "DELETE",
        headers: {
            Authorization:  TOKEN,
        },
    });
    if (response.status !== 204) {
        throw new Error ('Task was not deleted');
    }
},
completeAllTasks: async (tasks) => {
   
    const new_array = [];
    tasks.map((task) => {
        new_array.push(
            fetch(MAIN_URL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization:  TOKEN,
                },
                body:JSON.stringify([Object.assign({},task, {completed: true})]),
            })
        )
    });
    if (!(await Promise.all(new_array)).every((response) => response.status === 200
    )) {
        throw new Error("Tasks were not changed");
    }else {
        const res = await api.fetchTasks()
       
        return res
    }
    
//     let [...tasks] = await Promise.all(new_array);
//     let t=[];
//     tasks.map((task)=>{
//        task.json().then(res=>t.push(res.data[0]))

//     })

//   return t

},
}
