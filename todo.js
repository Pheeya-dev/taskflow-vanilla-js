
// 1. Store todos
let todos = [];

let currentFilter = "all";
let currentCategory = "all";
let currentSort = "default";
let searchTerm = "";
let currentTheme = "light";

// 2. Select HTML elements
const todoInput = document.getElementById("todo-input");
const dueDateInput = document.getElementById("due-date-input");
const dueTimeInput = document.getElementById("due-time-input");
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
const themeButton = document.getElementById("theme-toggle");


// 3. Add a todo
function addTodo() {
    const todoText = todoInput.value.trim();
    const dueDate = dueDateInput.value;
    const dueTime = dueTimeInput.value;
    const priority = priorityInput.value;
    const category = categoryInput.value;
    if (!todoText) {
        return;
    }

    const todo = {
        text: todoText,
        dueDate: dueDate,
        dueTime: dueTime,
        priority: priority,
        category: category,
        completed: false
    };

    todos.push(todo);

    saveTodos();

    todoInput.value = "";
    dueDateInput.value = "";
    dueTimeInput.value = "";
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

    updateFilterButtonStyles();

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


// Apply selected theme
function applyTheme(themeName) {

    currentTheme = themeName;

    const isDark = currentTheme === "dark";

    document.documentElement.classList.toggle("dark-mode", isDark);

    themeButton.textContent = isDark ? "Light Mode" : "Dark Mode";

    themeButton.setAttribute("aria-pressed", String(isDark));
}


// Toggle theme when button is clicked
themeButton.addEventListener("click", () => {

    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    localStorage.setItem("taskflow-theme", nextTheme);

    applyTheme(nextTheme);
});


//rearranges the todos from highest to lowest priority, treats todo without a priority as having medium priority (2)

function sortTodosByPriority(todos) {
    return todos.sort((a, b) => {
        const priorityA = priorityOrder[a.priority] || 2;
        const priorityB = priorityOrder[b.priority] || 2;

        return priorityB - priorityA; // Sort in descending order
    });
}

// Return a comparable timestamp for a todo's due date and time.
function getDueDateTime(todo) {
    if (!todo.dueDate) {
        return null;
    }

    const [year, month, day] = todo.dueDate.split("-").map(Number);

    const [hours, minutes] = (todo.dueTime || "23:59")
        .split(":")
        .map(Number);

    const dateTime = new Date(year, month - 1, day, hours, minutes);

    return Number.isNaN(dateTime.getTime())
        ? null
        : dateTime.getTime();
}

// Sort todos by due date and time, earliest first; todos without a due date stay at the bottom.
function sortTodosByDueDate(todos, direction = "asc") {
    return todos.sort((a, b) => {

        const dateTimeA = getDueDateTime(a);
        const dateTimeB = getDueDateTime(b);

        if (dateTimeA === null && dateTimeB === null) return 0;

        if (dateTimeA === null) return 1;
        if (dateTimeB === null) return -1;

        if (direction === "desc") {
            return dateTimeB - dateTimeA;
        }

        return dateTimeA - dateTimeB;
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

        // Display due date and time
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

        const formattedTime = todo.dueTime
    ? (() => {
        const [hours, minutes] = todo.dueTime.split(":").map(Number);

        return new Date(2000, 0, 1, hours, minutes)
            .toLocaleTimeString("en-NG", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            });
    })()
    : "";

        dueDateElement.textContent = `Due: ${formattedDate}${formattedTime ? ` • ${formattedTime}` : ""}`;
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

// 10. Save todos to local storage
function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

// 11. Load todos from local storage
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

// 12. update filter button styles based on the current filter
function updateFilterButtonStyles() {
    const filterButtons = document.querySelectorAll(".filter-button");

    filterButtons.forEach(button => {
        const filter = button.getAttribute("data-filter");

        if (filter === currentFilter) {
            button.classList.add("is-active");
            button.setAttribute("aria-pressed", "true");
        } else {
            button.classList.remove("is-active");
            button.setAttribute("aria-pressed", "false");
        }
    });
}



// Restore saved theme
const savedTheme = localStorage.getItem("taskflow-theme");

applyTheme(savedTheme === "dark" ? "dark" : "light");

// Update filter buttons
updateFilterButtonStyles();

// Load saved todos
loadTodos();

// Display todos
renderTodos();
