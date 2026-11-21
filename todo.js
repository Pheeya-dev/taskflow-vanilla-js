
// 1. Store todos
let todos = [];

let currentFilter = "all";
let currentCategory = "all";
let currentSort = "default";
let searchTerm = "";

// 2. Select HTML elements
const todoInput = document.getElementById("todo-input");
const dueDateInput = document.getElementById("due-date-input");
const addTodoButton = document.getElementById("add-todo");
const todoList = document.getElementById("todo-list");

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-todos");

const emptyMessage = document.getElementById("empty-message");

const todoCounter = document.getElementById("todo-counter");
const completedCounter = document.getElementById("completed-counter");
const uncompletedCounter = document.getElementById("uncompleted-counter");
const totalCounter = document.getElementById("total-counter");

const clearCompletedButton = document.getElementById("clear-completed");
const priorityInput = document.getElementById("priority");
const categoryInput = document.getElementById("category");
const categoryFilterInput = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort-todos");


// 3. Add a todo
function addTodo() {
    const todoText = todoInput.value.trim();
    const dueDate = dueDateInput.value;
    const priority = priorityInput.value;
    const category = categoryInput.value;
    if (!todoText) {
        return;
    }

    const todo = {
        text: todoText,
        dueDate: dueDate,
        priority: priority,
        category: category,
        completed: false
    };

    todos.push(todo);

    saveTodos();

    todoInput.value = "";
    dueDateInput.value = "";
    priorityInput.value = "medium";
    categoryInput.value = "personal";

    renderTodos();
}

addTodoButton.addEventListener("click", addTodo);

todoInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTodo();
    }
});


// 4. Get todos that match the current filter and search
function getVisibleTodos() {
    return todos.filter(todo => {

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "active" && !todo.completed) ||
            (currentFilter === "completed" && todo.completed);

        const todoCategory = todo.category || "uncategorized";

        const matchesCategory =
            currentCategory === "all" ||
            todoCategory === currentCategory;

        const matchesSearch =
            todo.text.toLowerCase().includes(searchTerm);

        return matchesFilter && matchesCategory && matchesSearch;
    });
}

function applyFilter(filter) {
    currentFilter = filter;

    renderTodos();
}

function applyCategoryFilter(category) {
    currentCategory = category;

    renderTodos();
}

categoryFilterInput.addEventListener("change", () => {
    applyCategoryFilter(categoryFilterInput.value);
});

const priorityOrder = {
    high: 3,
    medium: 2,
    low: 1
};

//rearranges the todos from highest to lowest priority, treats todo without a priority as having medium priority (2)

function sortTodosByPriority(todos) {
    return todos.sort((a, b) => {
        const priorityA = priorityOrder[a.priority] || 2;
        const priorityB = priorityOrder[b.priority] || 2;

        return priorityB - priorityA; // Sort in descending order
    });
}

// Sort todos by due date,earliest first,followed by latest, todos without due dates always appears at the bottom, default restores the initial order
function sortTodosByDueDate(todos, direction = "asc") {
    return todos.sort((a, b) => {

        if (!a.dueDate && !b.dueDate) return 0;

        if (!a.dueDate) return 1;

        if (!b.dueDate) return -1;

        if (direction === "desc") {
            return b.dueDate.localeCompare(a.dueDate);
        }

        return a.dueDate.localeCompare(b.dueDate);
    });
}
//event listener to the sort select element to handle sorting when the user selects a different option
sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value;
    renderTodos();
});

// 5. Display todos
function renderTodos() {

    todoList.replaceChildren();

    const visibleTodos = getVisibleTodos();

    // Apply selected sorting option
    if (currentSort === "priority") {

        sortTodosByPriority(visibleTodos);

    } else if (currentSort === "due-asc") {

        sortTodosByDueDate(visibleTodos, "asc");

    } else if (currentSort === "due-desc") {

        sortTodosByDueDate(visibleTodos, "desc");

    }


    visibleTodos.forEach(todo => {

        const li = document.createElement("li");
        li.className = "todo-item";

        if (todo.completed) {
            li.classList.add("completed");
        }

        // Checkbox
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = todo.completed;



        // Complete or uncomplete todo
        checkbox.addEventListener("change", () => {

            todo.completed = checkbox.checked;

            saveTodos();

            renderTodos();
        });

        // Todo text
        const todoText = document.createElement("span");

        todoText.className = "todo-text";
        todoText.textContent = todo.text;

        // Display due date
        const dueDateElement = document.createElement("span");

        dueDateElement.className = "due-date";

        if (todo.dueDate) {
        const [year, month, day] = todo.dueDate.split("-").map(Number);

        const formattedDate = new Date(year, month - 1, day)
        .toLocaleDateString("en-NG", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

         dueDateElement.textContent = `Due: ${formattedDate}`;
        }

        // Display priority
        const priorityElement = document.createElement("span");

        // Older todos might not have a priority property
        const todoPriority = todo.priority || "medium";

        priorityElement.className = `priority priority-${todoPriority}`;

        priorityElement.textContent =
        todoPriority.charAt(0).toUpperCase() + todoPriority.slice(1);

        // Display category
        const categoryElement = document.createElement("span");

        // Older todos might not have a category property
        const todoCategory = todo.category || "uncategorized";

        categoryElement.className = `category category-${todoCategory}`;

        categoryElement.textContent =
        todoCategory.charAt(0).toUpperCase() + todoCategory.slice(1);

        // Edit button
        const editButton = document.createElement("button");

        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {

            const newTodoText = prompt("Edit your todo:", todo.text);

            if (newTodoText === null) {
                return;
            }

            const updatedText = newTodoText.trim();

            if (!updatedText) {
                return;
            }

            todo.text = updatedText;

            saveTodos();
            renderTodos();
        });


        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {

            todos = todos.filter(item => item !== todo);

            saveTodos();
            renderTodos();
        });


        // Add elements to list item
        li.append(
            checkbox,
            todoText,
            dueDateElement,
            priorityElement,
            categoryElement,
            editButton,
            deleteButton
        );

        todoList.appendChild(li);

    });


    // Empty list message
    if (todos.length === 0) {
        emptyMessage.textContent = "No todos yet. Add your first task!";
    } else if (visibleTodos.length === 0) {
        emptyMessage.textContent = "No matching todos found.";
    } else {
        emptyMessage.textContent = "";
    }

    updateCounters(visibleTodos);
}


// 6. Update counters
function updateCounters(visibleTodos) {



    const completed = todos.filter(todo => todo.completed).length;

    const uncompleted = todos.length - completed;

    todoCounter.textContent = visibleTodos.length;

    completedCounter.textContent = completed;

    uncompletedCounter.textContent = uncompleted;

    totalCounter.textContent = todos.length;
}


// 7. Search todos
function searchTodos() {
    searchTerm = searchInput.value.trim().toLowerCase();

    renderTodos();
}
searchButton.addEventListener("click", searchTodos);

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchTodos();
    }
});

// 8. Filter todos

document.getElementById("filter-all").addEventListener("click", () => {
    applyFilter("all");
});

document.getElementById("filter-active").addEventListener("click", () => {
    applyFilter("active");
});

document.getElementById("filter-completed").addEventListener("click", () => {
    applyFilter("completed");
});

// 9. Clear completed todos
clearCompletedButton.addEventListener("click", () => {

    todos = todos.filter(todo => !todo.completed);

    saveTodos();
    renderTodos();
});

// Save todos to local storage
function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Load todos from local storage
function loadTodos() {
    const savedTodos = localStorage.getItem("todos");

    if (!savedTodos) {
        return;
    }

    try {
        const parsedTodos = JSON.parse(savedTodos);

        todos = Array.isArray(parsedTodos) ? parsedTodos : [];

    } catch (error) {
        console.error("Could not load todos:", error);
        todos = [];
    }
}

// Load saved todos when the application starts
loadTodos();

// Display todos
renderTodos();
