class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.dateInput = document.getElementById('dateInput');
        this.addBtn = document.getElementById('addBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.filterBtn = document.getElementById('filterBtn');
        this.filterSelect = document.getElementById('filterSelect');
        this.deleteAllBtn = document.getElementById('deleteAllBtn');
        this.todoTableBody = document.getElementById('todoTableBody');
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.dateInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.filterSelect.addEventListener('change', (e) => this.filterTodos(e.target.value));
        this.deleteAllBtn.addEventListener('click', () => this.deleteAllTodos());
    }

    addTodo() {
        const task = this.taskInput.value.trim();
        const date = this.dateInput.value;

        // Validate input
        if (!this.validateInput(task, date)) {
            return;
        }

        // Create new todo
        const todo = {
            id: Date.now(),
            task: task,
            date: date,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.saveTodos();
        this.clearInputs();
        this.clearError();
        this.render();
    }

    validateInput(task, date) {
        if (!task) {
            this.showError('Please enter a task');
            return false;
        }

        if (!date) {
            this.showError('Please select a due date');
            return false;
        }

        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            this.showError('Due date cannot be in the past');
            return false;
        }

        return true;
    }

    showError(message) {
        this.errorMessage.textContent = message;
        setTimeout(() => this.clearError(), 3000);
    }

    clearError() {
        this.errorMessage.textContent = '';
    }

    clearInputs() {
        this.taskInput.value = '';
        this.dateInput.value = '';
    }

    completeTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
    }

    deleteAllTodos() {
        if (this.todos.length === 0) {
            this.showError('No tasks to delete');
            return;
        }

        if (confirm('Are you sure you want to delete all tasks?')) {
            this.todos = [];
            this.saveTodos();
            this.render();
        }
    }

    filterTodos(filter) {
        this.currentFilter = filter;
        this.render();
    }

    getFilteredTodos() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (this.currentFilter) {
            case 'today':
                return this.todos.filter(todo => {
                    const todoDate = new Date(todo.date);
                    return todoDate.getTime() === today.getTime();
                });
            case 'upcoming':
                return this.todos.filter(todo => {
                    const todoDate = new Date(todo.date);
                    return todoDate > today && !todo.completed;
                });
            case 'overdue':
                return this.todos.filter(todo => {
                    const todoDate = new Date(todo.date);
                    return todoDate < today && !todo.completed;
                });
            default:
                return this.todos;
        }
    }

    getStatus(todo) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todoDate = new Date(todo.date);

        if (todo.completed) {
            return { status: 'completed', class: 'status-completed' };
        } else if (todoDate < today) {
            return { status: 'overdue', class: 'status-overdue' };
        } else {
            return { status: 'pending', class: 'status-pending' };
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            this.todoTableBody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="4">No task found</td>
                </tr>
            `;
            return;
        }

        this.todoTableBody.innerHTML = filteredTodos.map(todo => {
            const statusInfo = this.getStatus(todo);
            return `
                <tr>
                    <td class="${todo.completed ? 'completed-task' : ''}">${todo.task}</td>
                    <td>${this.formatDate(todo.date)}</td>
                    <td>
                        <span class="status-badge ${statusInfo.class}">
                            ${statusInfo.status}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn complete-btn" onclick="todoApp.completeTodo(${todo.id})">
                                ${todo.completed ? 'Undo' : 'Complete'}
                            </button>
                            <button class="action-btn delete-btn" onclick="todoApp.deleteTodo(${todo.id})">
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});