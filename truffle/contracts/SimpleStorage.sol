// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SimpleStorage {
   struct Task {
        string content;
        bool completed;
    }

    mapping(uint => Task) public tasks;
    uint public taskCount;

    event TaskCreated(uint id, string content, bool completed);
    event TaskCompleted(uint id, bool completed);

    function createTask(string memory _content) public {
        taskCount++;
        tasks[taskCount] = Task(_content, false);
        emit TaskCreated(taskCount, _content, false);
    }

    function toggleCompleted(uint _id) public {
        Task storage task = tasks[_id];
        task.completed = !task.completed;
        emit TaskCompleted(_id, task.completed);
    }
}
