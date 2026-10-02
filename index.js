"use strict";
// Object.defineProperty(exports, "__esModule", { value: true });
// "use strict";
let addTaskBtn = document.querySelector("#add-task-btn");
let modalOverlay = document.querySelector("#modal-overlay");
let closeModalBtn = document.querySelector("#close-modal-btn");
let cancelBtn = document.querySelector("#cancel-btn");
let taskForm = document.querySelector("#task-form");
let taskTitle = document.querySelector("#task-title");
let taskPriority = document.querySelector("#task-priority");
let taskDueDate = document.querySelector("#task-due-date");
let taskDescription = document.querySelector("#task-description");
let submitBtn = document.querySelector("#submit-btn");
let submitBtnText = document.querySelector("#submit-btn-text");
let titleError = document.querySelector("#title-error");
let dateError = document.querySelector("#date-error");
let TaskContainerTodo = document.querySelector("#TaskContainerTodo");
let TaskContainerProgress = document.querySelector("#TaskContainerProgress");
let TaskContainerCompleted = document.querySelector("#TaskContainerCompleted");
// ================== Counters ================== //
let todoCount = document.querySelector("#todo-count");
let progressCount = document.querySelector("#progress-count");
let completedCount = document.querySelector("#completed-count");
// ================== Modal Title ================== //
let modalTitle = document.querySelector("#modal-title");
// ================== Enum ================== //
var statue;
(function (statue) {
    statue[statue["TODO"] = 0] = "TODO";
    statue[statue["IN_PROGRESS"] = 1] = "IN_PROGRESS";
    statue[statue["COMPLETED"] = 2] = "COMPLETED";
})(statue || (statue = {}));
// ================== Tasks ================== //
let Alltasks = [];
let savedTasks = localStorage.getItem("Ltasks");
if (savedTasks) {
    Alltasks = JSON.parse(savedTasks);
    // Add createdAt to old tasks
    Alltasks = Alltasks.map((task) => ({
        ...task,
        createdAt: task.createdAt ?? task.id,
    }));
    localStorage.setItem("Ltasks", JSON.stringify(Alltasks));
}
// ================== Edit State ================== //
let editTaskId = null;
// ================== Submit Form ================== //
taskForm.addEventListener("submit", function (e) {
    e.preventDefault();
    let title = taskTitle.value.trim();
    let dueDate = taskDueDate.value;
    let isValid = true;
    // ================== Reset Errors ================== //
    titleError.classList.add("hidden");
    dateError.classList.add("hidden");
    // ================== Title Validation ================== //
    if (title === "") {
        titleError.textContent = "Task title is required";
        titleError.classList.remove("hidden");
        isValid = false;
    }
    // ================== Date Validation ================== //
    if (dueDate === "") {
        dateError.textContent = "Due date is required";
        dateError.classList.remove("hidden");
        isValid = false;
    }
    else {
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        let [year, month, day] = dueDate.split("-").map(Number);
        let selectedDate = new Date(year, month - 1, day);
        selectedDate.setHours(0, 0, 0, 0);
        // If we are editing
        let oldTask = editTaskId !== null
            ? Alltasks.find((task) => task.id === editTaskId)
            : null;
        // Allow an already overdue task to be edited
        // if the date itself wasn't changed
        let sameOldDate = oldTask !== null && oldTask.date === dueDate;
        if (selectedDate < today && !sameOldDate) {
            dateError.textContent = "Due date cannot be in the past";
            dateError.classList.remove("hidden");
            isValid = false;
        }
    }
    // ================== Stop ================== //
    if (!isValid) {
        return;
    }
    // ==================================================
    // EDIT TASK
    // ==================================================
    if (editTaskId !== null) {
        let task = Alltasks.find((task) => task.id === editTaskId);
        if (!task) {
            return;
        }
        task.title = title;
        task.date = dueDate;
        task.taskDescription = taskDescription.value;
        task.taskPriority = taskPriority.value;
        localStorage.setItem("Ltasks", JSON.stringify(Alltasks));
        // Reset edit mode
        editTaskId = null;
        resetModal();
        Display();
        return;
    }
    // ==================================================
    // CREATE NEW TASK
    // ==================================================
    let currentTime = Date.now();
    const task = {
        title: title,
        date: dueDate,
        taskDescription: taskDescription.value,
        taskPriority: taskPriority.value,
        statue: statue.TODO,
        id: currentTime,
        createdAt: currentTime,
    };
    Alltasks.push(task);
    localStorage.setItem("Ltasks", JSON.stringify(Alltasks));
    resetModal();
    Display();
    // ================== Success Message ================== //
    showMessage("Task added successfully!");
});
// ================== Reset Modal ================== //
function resetModal() {
    taskTitle.value = "";
    taskDueDate.value = "";
    taskDescription.value = "";
    taskPriority.value = "medium";
    titleError.classList.add("hidden");
    dateError.classList.add("hidden");
    editTaskId = null;
    modalTitle.textContent = "Create New Task";
    submitBtnText.textContent = "Add Task";
    let icon = submitBtn.querySelector("i");
    if (icon) {
        icon.className = "fa-solid fa-plus";
    }
    modalOverlay.classList.add("hidden");
}
// ================== Display ================== //
function Display() {
    // ================== Clear Containers ================== //
    TaskContainerTodo.innerHTML = "";
    TaskContainerProgress.innerHTML = "";
    TaskContainerCompleted.innerHTML = "";
    // ================== Counters ================== //
    let todoTasks = Alltasks.filter((task) => task.statue === statue.TODO);
    let progressTasks = Alltasks.filter((task) => task.statue === statue.IN_PROGRESS);
    let completedTasks = Alltasks.filter((task) => task.statue === statue.COMPLETED);
    todoCount.textContent = `${todoTasks.length} ${todoTasks.length === 1 ? "task" : "tasks"}`;
    progressCount.textContent = `${progressTasks.length} ${progressTasks.length === 1 ? "task" : "tasks"}`;
    completedCount.textContent = `${completedTasks.length} ${completedTasks.length === 1 ? "task" : "tasks"}`;
    // ================== Create Cards ================== //
    Alltasks.forEach((task, index) => {
        let card = document.createElement("div");
        card.innerHTML = `
        <div
            class="group bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200"
            data-task-id="${task.id}"
        >
            <!-- Top Bar -->
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-slate-300"></span>
                    <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        #${index}
                    </span>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        class="edit-btn text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        data-task-id="${task.id}"
                        title="Edit task"
                    >
                        <i class="fa-solid fa-pen text-xs pointer-events-none"></i>
                    </button>
                    <button
                        class="delete-btn text-slate-400 hover:text-red-500 hover:bg-red-50 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        data-task-id="${task.id}"
                        title="Delete task"
                    >
                        <i class="fa-solid fa-trash-can text-xs pointer-events-none"></i>
                    </button>
                </div>
            </div>
            <!-- Title -->
            <h3 class="font-semibold text-slate-800 mb-2 leading-snug">
                ${task.title}
            </h3>
            <!-- Description -->
            <p class="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2">
                ${task.taskDescription}
            </p>
            <!-- Tags -->

            <div class="flex flex-wrap items-center gap-2 mb-4">

                <span class="bg-amber-50 text-amber-600 text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wide">

                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>

                    ${task.taskPriority}

                </span>


                ${getDateBadge(task.date)}

            </div>


            <!-- Meta Info -->

            <div class="flex items-center gap-3 text-xs text-slate-400 pb-3 mb-3 border-b border-slate-100">

                <div class="flex items-center gap-1.5 text-red-500">

                    <i class="fa-regular fa-calendar"></i>

                    <span>
                        ${formatDate(task.date)}
                    </span>

                </div>


                <div
                    class="flex items-center gap-1.5"
                    title="Created task"
                >

                    <i class="fa-regular fa-clock"></i>

                    <span>
                        ${getCreatedTime(task.createdAt)}
                    </span>

                </div>

            </div>


            <!-- Action Buttons -->

            <div class="flex flex-wrap gap-2">

                ${getStatusButtons(task)}

            </div>

        </div>

        `;
        // ================== Put Card In Correct Column ================== //
        if (task.statue === statue.TODO) {
            TaskContainerTodo.appendChild(card);
        }
        else if (task.statue === statue.IN_PROGRESS) {
            TaskContainerProgress.appendChild(card);
        }
        else if (task.statue === statue.COMPLETED) {
            TaskContainerCompleted.appendChild(card);
        }
    });
    // ================== Empty States ================== //
    document
        .querySelector("#emptyContainerTodo")
        ?.classList.toggle("hidden", todoTasks.length > 0);
    document
        .querySelector("#emptyContainerProgress")
        ?.classList.toggle("hidden", progressTasks.length > 0);
    document
        .querySelector("#emptyContainerCompleted")
        ?.classList.toggle("hidden", completedTasks.length > 0);
}
// ================== Status Buttons ================== //
function getStatusButtons(task) {
    // ================== TODO ================== //
    if (task.statue === statue.TODO) {
        return `

            <button
                class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 bg-amber-100 text-amber-700 hover:bg-amber-200"
                data-task-id="${task.id}"
                data-status="in-progress"
            >

                <i class="fa-solid fa-play pointer-events-none"></i>

                <span class="pointer-events-none">
                    Start
                </span>

            </button>


            <button
                class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                data-task-id="${task.id}"
                data-status="completed"
            >

                <i class="fa-solid fa-check pointer-events-none"></i>

                <span class="pointer-events-none">
                    Complete
                </span>

            </button>

        `;
    }
    // ================== IN PROGRESS ================== //
    if (task.statue === statue.IN_PROGRESS) {
        return `

            <button
                class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 bg-slate-100 text-slate-700 hover:bg-slate-200"
                data-task-id="${task.id}"
                data-status="todo"
            >

                <i class="fa-solid fa-arrow-left pointer-events-none"></i>

                <span class="pointer-events-none">
                    To Do
                </span>

            </button>


            <button
                class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                data-task-id="${task.id}"
                data-status="completed"
            >

                <i class="fa-solid fa-check pointer-events-none"></i>

                <span class="pointer-events-none">
                    Complete
                </span>

            </button>

        `;
    }
    // ================== COMPLETED ================== //
    if (task.statue === statue.COMPLETED) {
        return `

            <button
                class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 bg-slate-100 text-slate-700 hover:bg-slate-200"
                data-task-id="${task.id}"
                data-status="todo"
            >

                <i class="fa-solid fa-arrow-left pointer-events-none"></i>

                <span class="pointer-events-none">
                    To Do
                </span>

            </button>


            <button
                class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 bg-amber-100 text-amber-700 hover:bg-amber-200"
                data-task-id="${task.id}"
                data-status="in-progress"
            >

                <i class="fa-solid fa-play pointer-events-none"></i>

                <span class="pointer-events-none">
                    Start
                </span>

            </button>

        `;
    }
    return "";
}
// ================== All Card Actions ================== //
TaskContainerTodo.addEventListener("click", handleTaskActions);
TaskContainerProgress.addEventListener("click", handleTaskActions);
TaskContainerCompleted.addEventListener("click", handleTaskActions);
function handleTaskActions(e) {
    let button = e.target.closest("button");
    if (!button) {
        return;
    }
    let taskId = Number(button.dataset.taskId);
    let task = Alltasks.find((task) => task.id === taskId);
    if (!task) {
        return;
    }
    // ==================================================
    // DELETE
    // ==================================================
    if (button.classList.contains("delete-btn")) {
        let confirmDelete = confirm("Are you sure you want to delete this task?");
        if (!confirmDelete) {
            return;
        }
        Alltasks = Alltasks.filter((task) => task.id !== taskId);
        localStorage.setItem("Ltasks", JSON.stringify(Alltasks));
        Display();
        return;
    }
    // ==================================================
    // EDIT
    // ==================================================
    if (button.classList.contains("edit-btn")) {
        editTaskId = task.id;
        taskTitle.value = task.title;
        taskDueDate.value = task.date;
        taskDescription.value = task.taskDescription;
        taskPriority.value = task.taskPriority;
        modalTitle.textContent = "Edit Task";
        submitBtnText.textContent = "Update Task";
        let icon = submitBtn.querySelector("i");
        if (icon) {
            icon.className = "fa-solid fa-pen";
        }
        modalOverlay.classList.remove("hidden");
        return;
    }
    // ==================================================
    // CHANGE STATUS
    // ==================================================
    if (button.classList.contains("status-btn")) {
        let newStatus = button.dataset.status;
        if (newStatus === "todo") {
            task.statue = statue.TODO;
        }
        if (newStatus === "in-progress") {
            task.statue = statue.IN_PROGRESS;
        }
        if (newStatus === "completed") {
            task.statue = statue.COMPLETED;
        }
        localStorage.setItem("Ltasks", JSON.stringify(Alltasks));
        Display();
    }
}
// ================== Date Status ================== //
function getDateStatus(taskDate) {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let [year, month, day] = taskDate.split("-").map(Number);
    let date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    let difference = date.getTime() - today.getTime();
    let days = difference / (1000 * 60 * 60 * 24);
    if (days < 0) {
        return "overdue";
    }
    if (days === 0) {
        return "today";
    }
    if (days === 1) {
        return "tomorrow";
    }
    return "upcoming";
}
// ================== Date Badge ================== //
function getDateBadge(taskDate) {
    let status = getDateStatus(taskDate);
    if (status === "overdue") {
        return `

            <span class="bg-red-100 text-red-600 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">

                <i class="fa-solid fa-triangle-exclamation"></i>

                Overdue

            </span>

        `;
    }
    if (status === "today") {
        return `

<span class="bg-red-100 text-red-600 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
              <i class="fa-solid fa-triangle-exclamation"></i>
              Overdue
            </span>

        `;
    }
    if (status === "tomorrow") {
        return `

            <span class="bg-blue-100 text-blue-600 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">

                <i class="fa-solid fa-calendar-day"></i>

                Tomorrow

            </span>

        `;
    }
    return `

        <span class="bg-slate-100 text-slate-500 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">

            <i class="fa-regular fa-calendar"></i>

            Upcoming

        </span>

    `;
}
// ================== Format Date ================== //
function formatDate(dateString) {
    let [year, month, day] = dateString.split("-").map(Number);
    let date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
// ================== Created Time ================== //
function getCreatedTime(createdAt) {
    let difference = Math.floor((Date.now() - createdAt) / 1000);
    if (difference < 60) {
        return "Just now";
    }
    let minutes = Math.floor(difference / 60);
    if (minutes < 60) {
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }
    let hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }
    let days = Math.floor(hours / 24);
    if (days === 1) {
        return "Yesterday";
    }
    return `${days} days ago`;
}
// ================== Success Message ================== //
function showMessage(message) {
    let messageBox = document.createElement("div");
    messageBox.className = `
        fixed
        top-5
        right-5
        z-[100]
        bg-emerald-500
        text-white
        px-5
        py-3
        rounded-xl
        shadow-lg
        flex
        items-center
        gap-2
        text-sm
        font-medium
        transition-all
    `;
    messageBox.innerHTML = `

        <i class="fa-solid fa-circle-check"></i>

        <span>${message}</span>

    `;
    document.body.appendChild(messageBox);
    setTimeout(() => {
        messageBox.remove();
    }, 2500);
}
// ================== Modal ================== //
addTaskBtn.addEventListener("click", () => {
    // Make sure it opens in Add mode
    editTaskId = null;
    modalTitle.textContent = "Create New Task";
    submitBtnText.textContent = "Add Task";
    let icon = submitBtn.querySelector("i");
    if (icon) {
        icon.className = "fa-solid fa-plus";
    }
    modalOverlay.classList.remove("hidden");
});
closeModalBtn.addEventListener("click", () => {
    resetModal();
});
cancelBtn.addEventListener("click", () => {
    resetModal();
});
// ================== First Display ================== //
Display();
//# sourceMappingURL=index.js.map