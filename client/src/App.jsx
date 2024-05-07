// src/components/TodoApp.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import TodoContract from './contracts/SimpleStorage.json';
import "./styles.css"

function TodoApp() {
    const [tasks, setTasks] = useState([]);
    const [taskContent, setTaskContent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        initWeb3();
        loadTasks();
    }, []);

    async function initWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            alert('Please install MetaMask!');
        }
    }

    async function loadTasks() {
        setLoading(true);
        const networkId = await window.web3.eth.net.getId();
        const deployedNetwork = TodoContract.networks[networkId];
        const todoContract = new window.web3.eth.Contract(
            TodoContract.abi,
            deployedNetwork && deployedNetwork.address
        );

        const taskCount = await todoContract.methods.taskCount().call();
        let tasks = [];
        for (let i = 1; i <= taskCount; i++) {
            const task = await todoContract.methods.tasks(i).call();
            tasks.push(task);
        }
        setTasks(tasks);
        setLoading(false);
    }
    async function createTask(e) {
      e.preventDefault();
      if (!taskContent.trim()) return;
  
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const from = accounts[0];
  
      const todoContract = new window.web3.eth.Contract(
          TodoContract.abi,
          TodoContract.networks[await window.web3.eth.net.getId()].address
      );
  
      await todoContract.methods.createTask(taskContent).send({ from });
      setTaskContent('');
      loadTasks();
  }
  
  async function toggleCompleted(taskId) {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const from = accounts[0];

    const todoContract = new window.web3.eth.Contract(
        TodoContract.abi,
        TodoContract.networks[await window.web3.eth.net.getId()].address
    );

    await todoContract.methods.toggleCompleted(taskId).send({ from });
    
    // Remove the task from the tasks array in the state
    setTasks(prevTasks => prevTasks.filter((task, index) => index + 1 !== taskId));
}
  

    return (
        <div>
            <h1>Decentralized Todo List</h1>
            <form onSubmit={createTask}>
                <input
                    type="text"
                    value={taskContent}
                    onChange={(e) => setTaskContent(e.target.value)}
                    placeholder="Enter task"
                />
                <button type="submit" onClick={() => createTask()}>Add Task</button>
            </form>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {tasks.map((task, index) => (
        <li key={index} className={task.completed ? 'completed' : ''}>
            {task.content}
            <button onClick={() => toggleCompleted(index + 1)}>
                {task.completed ? "Mark Incomplete" : "Mark Complete"}
            </button>
        </li>
    ))}
                </ul>
            )}
        </div>
    );
}

export default TodoApp;
