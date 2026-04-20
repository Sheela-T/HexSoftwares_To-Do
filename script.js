// Elements
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

// Data
let tasks = [];
let currentFilter = "all";

// Add Task
function addTask() {
    const text = taskInput.value.trim();

    if (!text) {
        alert("Task cannot be empty");
        return;
    }

    if (tasks.some(task => task.text === text)) {
        alert("Task already exists");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();

    taskInput.value = "";
}

// Render Tasks
function renderTasks() {
    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if (currentFilter === "active") {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === "completed") {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<p class="empty">No tasks found</p>`;
        return;
    }

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task";

        li.setAttribute("draggable", "true");
        li.dataset.id = task.id;

        if (task.completed) li.classList.add("completed");

        li.innerHTML = `
            <input type="checkbox" ${task.completed ? "checked" : ""} 
                onchange="toggleTask(${task.id})">

            <span ondblclick="editTask(${task.id})">${task.text}</span>

            <button onclick="deleteTask(${task.id})">✖</button>
        `;

        li.addEventListener("dragstart", () => {
            li.classList.add("dragging");
        });

        li.addEventListener("dragend", () => {
            li.classList.remove("dragging");
            updateOrder();
        });

        taskList.appendChild(li);

    });

    updateTaskCount();
    updateStats();
    
}

// Toggle Task
function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();

    renderTasks();
}

// Delete Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Save Task
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Load Task
function loadTasks() {
    const storedTasks = localStorage.getItem("tasks");

    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }

    renderTasks();
}

function updateTaskCount() {
    const remaining = tasks.filter(task => !task.completed).length;
    document.getElementById("taskCount").innerText = `${remaining} tasks left`;
}

function setFilter(filter) {
    currentFilter = filter;
    renderTasks();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);

    const newText = prompt("Edit your task:", task.text);

    if (newText === null) return; // user cancelled

    const trimmed = newText.trim();

    if (!trimmed) {
        alert("Task cannot be empty");
        return;
    }

    task.text = trimmed;

    saveTasks();
    renderTasks();
}

function updateOrder() {
    const ids = [...taskList.children].map(li => Number(li.dataset.id));

    tasks.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

    saveTasks();
}

// Event Listener
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        addTask();
    }
});

window.onload = function () {
    taskInput.focus();
    loadTasks();
};

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
    document.body.classList.add("light");
}

taskList.addEventListener("dragover", (e) => {
    e.preventDefault();

    const dragging = document.querySelector(".dragging");
    const siblings = [...taskList.querySelectorAll(".task:not(.dragging)")];

    const nextSibling = siblings.find(sibling => {
        return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    });

    taskList.insertBefore(dragging, nextSibling);
});

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");

    const theme = document.body.classList.contains("light") ? "light" : "dark";
    localStorage.setItem("theme", theme);
});

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;

    const percent = total === 0 ? 0 : (completed / total) * 100;

    document.getElementById("taskStats").innerText =
        `Completed: ${Math.round(percent)}% (${completed}/${total})`;

    document.getElementById("progressFill").style.width = percent + "%";
}