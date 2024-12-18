// Elementos do DOM
const taskTitleInput = document.getElementById('task-title-input');
const taskDescriptionInput = document.getElementById('task-description-input');
const addTaskButton = document.getElementById('add-task-button');

const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');
const filterStatus = document.getElementById('filter-status');
const filterPriority = document.getElementById('filter-priority');

const highPriorityList = document.getElementById('high-priority-list');
const mediumPriorityList = document.getElementById('medium-priority-list');
const lowPriorityList = document.getElementById('low-priority-list');

const completedTasksList = document.getElementById('completed-tasks-list');

// Modal de Edição
const editModal = document.getElementById('edit-modal');
const closeModalButton = editModal.querySelector('.close-button');
const editTaskTitleInput = document.getElementById('edit-task-title-input');
const editTaskDescriptionInput = document.getElementById('edit-task-description-input');
const editCategorySelect = document.getElementById('edit-category-select');
const editPrioritySelect = document.getElementById('edit-priority-select');
const editDueDateInput = document.getElementById('edit-due-date-input');
const saveEditButton = document.getElementById('save-edit-button');

// Modal de Anexos
const attachmentsModal = document.getElementById('attachments-modal');
const closeAttachmentsModalButton = attachmentsModal.querySelector('.close-button');
const modalAttachmentList = document.getElementById('modal-attachment-list');

// Tema
const themeToggleButton = document.getElementById('theme-toggle-button');
const themeIcon = document.getElementById('theme-icon');

// Subtarefas
const subtaskInput = document.getElementById('subtask-input');
const addSubtaskButton = document.getElementById('add-subtask-button');
const subtaskList = document.getElementById('subtask-list');

// Anexos
const attachmentInput = document.getElementById('attachment-input');
const attachmentLinkInput = document.getElementById('attachment-link-input');
const addAttachmentButton = document.getElementById('add-attachment-button');
const attachmentList = document.getElementById('attachment-list');

// Notificações
const notificationContainer = document.getElementById('notification-container');

// Variáveis
let tasks = [];
let editTaskId = null;
let currentSubtasks = [];
let currentAttachments = [];

// Abas
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanes = document.querySelectorAll('.tab-pane');

// Alternar abas
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        tabPanes.forEach(pane => pane.classList.remove('active'));
        const tab = button.getAttribute('data-tab');
        document.getElementById(tab).classList.add('active');
    });
});

// Salvar tarefas no localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Carregar tarefas do localStorage
function loadTasks() {
    const storedTasks = JSON.parse(localStorage.getItem('tasks'));
    if (storedTasks) {
        tasks = storedTasks;
        tasks.forEach(task => {
            if (task.completed) {
                addCompletedTaskToDOM(task);
            } else {
                addTaskToDOM(task);
            }
        });
        initializeSortable();
    }
}

// Criar nova tarefa
function createTask(title, description, category = 'Geral', priority = 'Média', dueDate = null, completed = false, subtasks = [], attachments = [], id = Date.now()) {
    const createdAt = new Date().toLocaleString();
    return { id, title, description, category, priority, dueDate, completed, subtasks, attachments, createdAt };
}

// Notificações
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.innerHTML = `<span>${message}</span><i class="fas fa-times"></i>`;
    notificationContainer.appendChild(notification);

    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, 4000);

    const closeIcon = notification.querySelector('.fa-times');
    closeIcon.addEventListener('click', () => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    });
}

// Adicionar tarefa ao DOM
function addTaskToDOM(task) {
    const li = document.createElement('li');
    li.classList.add('task-item');
    li.setAttribute('data-id', task.id);

    const taskHeader = document.createElement('div');
    taskHeader.classList.add('task-header');

    const taskTitle = document.createElement('span');
    taskTitle.classList.add('task-title');
    taskTitle.textContent = task.title;

    const taskDate = document.createElement('span');
    taskDate.classList.add('task-date');
    taskDate.textContent = task.createdAt;

    taskHeader.appendChild(taskTitle);
    taskHeader.appendChild(taskDate);

    const taskDescription = document.createElement('p');
    taskDescription.classList.add('task-description');
    taskDescription.textContent = task.description;

    const taskMeta = document.createElement('div');
    taskMeta.classList.add('task-meta');
    taskMeta.innerHTML = `<span class="category">${task.category}</span> | <span class="priority">${task.priority}</span>`;
    if (task.dueDate) {
        const dueDateSpan = document.createElement('span');
        dueDateSpan.classList.add('due-date');
        // Adicionando 'T00:00:00' para tratar como horário local
        dueDateSpan.textContent = ` | Vencimento: ${new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}`;
        taskMeta.appendChild(dueDateSpan);
    }

    const taskActions = document.createElement('div');
    taskActions.classList.add('task-actions');

    const editButton = document.createElement('button');
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.title = 'Editar tarefa';

    const attachmentButton = document.createElement('button');
    attachmentButton.innerHTML = '<i class="fas fa-paperclip"></i>';
    attachmentButton.title = 'Ver anexos';

    const completeButton = document.createElement('button');
    completeButton.innerHTML = '<i class="fas fa-check-circle"></i>';
    completeButton.title = 'Concluir tarefa';

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.title = 'Excluir tarefa';

    taskActions.appendChild(editButton);
    taskActions.appendChild(attachmentButton);
    taskActions.appendChild(completeButton);
    taskActions.appendChild(deleteButton);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.style.marginRight = '10px';
    checkbox.style.cursor = 'pointer';

    const taskLeft = document.createElement('div');
    taskLeft.classList.add('task-left');
    taskLeft.appendChild(checkbox);
    taskLeft.appendChild(taskHeader);

    li.appendChild(taskLeft);
    li.appendChild(taskDescription);
    li.appendChild(taskMeta);
    li.appendChild(taskActions);

    // Subtarefas
    if (task.subtasks && task.subtasks.length > 0) {
        const subtaskContainer = document.createElement('ul');
        subtaskContainer.classList.add('subtask-list');
        task.subtasks.forEach(subtask => {
            const subLi = document.createElement('li');
            subLi.textContent = subtask.text;
            if (subtask.completed) {
                subLi.classList.add('completed');
            }
            const subCheckbox = document.createElement('input');
            subCheckbox.type = 'checkbox';
            subCheckbox.checked = subtask.completed;
            subCheckbox.style.marginRight = '10px';
            subCheckbox.style.cursor = 'pointer';
            subCheckbox.addEventListener('change', () => {
                subtask.completed = subCheckbox.checked;
                subLi.classList.toggle('completed', subtask.completed);
                saveTasks();
            });
            subLi.prepend(subCheckbox);
            subtaskContainer.appendChild(subLi);
        });
        li.appendChild(subtaskContainer);
    }

    // Adicionar na coluna correspondente
    switch (task.priority) {
        case 'Alta':
            highPriorityList.appendChild(li);
            break;
        case 'Média':
            mediumPriorityList.appendChild(li);
            break;
        case 'Baixa':
            lowPriorityList.appendChild(li);
            break;
        default:
            lowPriorityList.appendChild(li);
    }

    // Eventos
    checkbox.addEventListener('change', () => {
        task.completed = checkbox.checked;
        li.classList.toggle('completed', task.completed);
        if (task.completed) {
            moveToCompleted(task);
            showNotification('Tarefa concluída!', 'success');
        } else {
            moveToActive(task);
            showNotification('Tarefa pendente!', 'success');
        }
        saveTasks();
    });

    editButton.addEventListener('click', () => openEditModal(task.id));

    attachmentButton.addEventListener('click', () => openAttachmentsModal(task.id));

    completeButton.addEventListener('click', () => {
        if (!task.completed) {
            task.completed = true;
            checkbox.checked = true;
            li.classList.add('completed');
            moveToCompleted(task);
            showNotification('Tarefa concluída!', 'success');
            saveTasks();
        }
    });

    deleteButton.addEventListener('click', () => {
        if (confirm('Tem certeza de que deseja excluir esta tarefa?')) {
            deleteTask(task.id);
            showNotification('Tarefa excluída com sucesso!', 'success');
        }
    });
}

// Adicionar tarefa concluída ao DOM
function addCompletedTaskToDOM(task) {
    const li = document.createElement('li');
    li.classList.add('task-item', 'completed');
    li.setAttribute('data-id', task.id);

    const taskHeader = document.createElement('div');
    taskHeader.classList.add('task-header');

    const taskTitle = document.createElement('span');
    taskTitle.classList.add('task-title');
    taskTitle.textContent = task.title;

    const taskDate = document.createElement('span');
    taskDate.classList.add('task-date');
    taskDate.textContent = task.createdAt;

    taskHeader.appendChild(taskTitle);
    taskHeader.appendChild(taskDate);

    const taskDescription = document.createElement('p');
    taskDescription.classList.add('task-description');
    taskDescription.textContent = task.description;

    const taskMeta = document.createElement('div');
    taskMeta.classList.add('task-meta');
    taskMeta.innerHTML = `<span class="category">${task.category}</span> | <span class="priority">${task.priority}</span>`;
    if (task.dueDate) {
        const dueDateSpan = document.createElement('span');
        dueDateSpan.classList.add('due-date');
        // Adicionando 'T00:00:00' para tratar como horário local
        dueDateSpan.textContent = ` | Vencimento: ${new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}`;
        taskMeta.appendChild(dueDateSpan);
    }

    const taskActions = document.createElement('div');
    taskActions.classList.add('task-actions');

    const attachmentButton = document.createElement('button');
    attachmentButton.innerHTML = '<i class="fas fa-paperclip"></i>';
    attachmentButton.title = 'Ver anexos';

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.title = 'Excluir tarefa';

    taskActions.appendChild(attachmentButton);
    taskActions.appendChild(deleteButton);

    li.appendChild(taskHeader);
    li.appendChild(taskDescription);
    li.appendChild(taskMeta);
    li.appendChild(taskActions);

    // Subtarefas
    if (task.subtasks && task.subtasks.length > 0) {
        const subtaskContainer = document.createElement('ul');
        subtaskContainer.classList.add('subtask-list');
        task.subtasks.forEach(subtask => {
            const subLi = document.createElement('li');
            subLi.textContent = subtask.text;
            if (subtask.completed) {
                subLi.classList.add('completed');
            }
            const subCheckbox = document.createElement('input');
            subCheckbox.type = 'checkbox';
            subCheckbox.checked = subtask.completed;
            subCheckbox.style.marginRight = '10px';
            subCheckbox.style.cursor = 'pointer';
            subCheckbox.disabled = true;
            subLi.prepend(subCheckbox);
            subtaskContainer.appendChild(subLi);
        });
        li.appendChild(subtaskContainer);
    }

    completedTasksList.appendChild(li);

    // Eventos
    attachmentButton.addEventListener('click', () => openAttachmentsModal(task.id));

    deleteButton.addEventListener('click', () => {
        if (confirm('Tem certeza de que deseja excluir esta tarefa?')) {
            deleteTask(task.id);
            showNotification('Tarefa excluída com sucesso!', 'success');
        }
    });
}

// Adicionar tarefa
function addTask() {
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const category = document.getElementById('category-select').value;
    const priority = document.getElementById('priority-select').value;
    const dueDate = document.getElementById('due-date-input').value || null;

    if (title === '') {
        showNotification('Por favor, insira um título para a tarefa.', 'error');
        return;
    }

    const newTask = createTask(title, description, category, priority, dueDate, false, currentSubtasks, currentAttachments);
    tasks.push(newTask);
    saveTasks();
    addTaskToDOM(newTask);
    initializeSortable();
    showNotification('Tarefa adicionada com sucesso!', 'success');

    // Resetar subtarefas e anexos
    currentSubtasks = [];
    currentAttachments = [];
    subtaskList.innerHTML = '';
    attachmentList.innerHTML = '';
    document.getElementById('due-date-input').value = '';
    taskTitleInput.value = '';
    taskDescriptionInput.value = '';
    taskTitleInput.focus();
}

// Deletar tarefa
function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
    if (taskElement) {
        taskElement.remove();
    }
}

// Abrir modal de edição
function openEditModal(taskId) {
    editTaskId = taskId;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        editTaskTitleInput.value = task.title;
        editTaskDescriptionInput.value = task.description;
        editCategorySelect.value = task.category;
        editPrioritySelect.value = task.priority;
        editDueDateInput.value = task.dueDate || '';
        editModal.style.display = 'flex';
        editTaskTitleInput.focus();
    }
}

// Fechar modal de edição
function closeEditModal() {
    editModal.style.display = 'none';
    editTaskId = null;
}

// Salvar edição
function saveEdit() {
    const updatedTitle = editTaskTitleInput.value.trim();
    const updatedDescription = editTaskDescriptionInput.value.trim();
    const updatedCategory = editCategorySelect.value;
    const updatedPriority = editPrioritySelect.value;
    const updatedDueDate = editDueDateInput.value || null;

    if (updatedTitle === '') {
        showNotification('O título da tarefa não pode estar vazio.', 'error');
        return;
    }

    const taskIndex = tasks.findIndex(t => t.id === editTaskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].title = updatedTitle;
        tasks[taskIndex].description = updatedDescription;
        tasks[taskIndex].category = updatedCategory;
        tasks[taskIndex].priority = updatedPriority;
        tasks[taskIndex].dueDate = updatedDueDate;
        saveTasks();
        const taskElement = document.querySelector(`.task-item[data-id="${editTaskId}"]`);
        if (taskElement) {
            taskElement.remove();
            if (tasks[taskIndex].completed) {
                addCompletedTaskToDOM(tasks[taskIndex]);
            } else {
                addTaskToDOM(tasks[taskIndex]);
            }
            initializeSortable();
        }
        closeEditModal();
        showNotification('Tarefa atualizada com sucesso!', 'success');
    }
}

// Aplicar filtros e busca
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = filterCategory.value;
    const selectedStatus = filterStatus.value;
    const selectedPriority = filterPriority.value;

    highPriorityList.innerHTML = '';
    mediumPriorityList.innerHTML = '';
    lowPriorityList.innerHTML = '';

    tasks.forEach(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory;
        const matchesStatus = selectedStatus === 'All' ||
                              (selectedStatus === 'Completed' && task.completed) ||
                              (selectedStatus === 'Pending' && !task.completed);
        const matchesPriority = selectedPriority === 'All' || task.priority === selectedPriority;

        if (matchesSearch && matchesCategory && matchesStatus && matchesPriority && !task.completed) {
            addTaskToDOM(task);
        }
    });

    initializeSortable();
}

// Abrir modal de anexos
function openAttachmentsModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.attachments.length > 0) {
        modalAttachmentList.innerHTML = '';
        task.attachments.forEach((attachment, index) => {
            const li = document.createElement('li');
            if (attachment.type === 'file') {
                const fileLink = document.createElement('a');
                fileLink.href = attachment.url;
                fileLink.textContent = attachment.name;
                fileLink.download = attachment.name;
                li.appendChild(fileLink);
            } else if (attachment.type === 'link') {
                const link = document.createElement('a');
                link.href = attachment.url;
                link.textContent = attachment.url;
                link.target = '_blank';
                li.appendChild(link);
            }
            const removeButton = document.createElement('button');
            removeButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            removeButton.title = 'Remover anexo';
            removeButton.addEventListener('click', () => {
                if (confirm('Deseja remover este anexo?')) {
                    task.attachments.splice(index, 1);
                    saveTasks();
                    openAttachmentsModal(taskId);
                    showNotification('Anexo removido com sucesso!', 'success');
                }
            });
            li.appendChild(removeButton);
            modalAttachmentList.appendChild(li);
        });
        attachmentsModal.style.display = 'flex';
    } else {
        showNotification('Esta tarefa não possui anexos.', 'error');
    }
}

// Fechar modal de anexos
function closeAttachmentsModal() {
    attachmentsModal.style.display = 'none';
}

// Adicionar subtarefa
function addSubtask() {
    const subtaskText = subtaskInput.value.trim();
    if (subtaskText === '') {
        showNotification('Por favor, insira uma sub-tarefa.', 'error');
        return;
    }
    const subLi = document.createElement('li');
    subLi.textContent = subtaskText;

    const removeButton = document.createElement('button');
    removeButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    removeButton.title = 'Remover sub-tarefa';
    removeButton.addEventListener('click', () => {
        subLi.remove();
        currentSubtasks = currentSubtasks.filter(st => st.text !== subtaskText);
        showNotification('Sub-tarefa removida.', 'success');
    });

    subLi.appendChild(removeButton);
    subtaskList.appendChild(subLi);
    currentSubtasks.push({ text: subtaskText, completed: false });
    subtaskInput.value = '';
}

// Adicionar anexo
function addAttachment() {
    const files = attachmentInput.files;
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const attachment = { type: 'file', name: file.name, url: e.target.result };
            currentAttachments.push(attachment);
            displayAttachment(attachment);
            showNotification('Arquivo anexado com sucesso!', 'success');
        };
        reader.readAsDataURL(file);
    }

    const link = attachmentLinkInput.value.trim();
    if (link !== '') {
        if (validateURL(link)) {
            const attachment = { type: 'link', url: link };
            currentAttachments.push(attachment);
            displayAttachment(attachment);
            showNotification('Link de anexo adicionado com sucesso!', 'success');
        } else {
            showNotification('Por favor, insira um link válido.', 'error');
        }
    }
}

// Validar URL
function validateURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;  
    }
}

// Exibir anexo no formulário
function displayAttachment(attachment) {
    const li = document.createElement('li');
    li.textContent = attachment.type === 'file' ? attachment.name : attachment.url;

    const removeButton = document.createElement('button');
    removeButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    removeButton.title = 'Remover anexo';
    removeButton.addEventListener('click', () => {
        attachmentList.removeChild(li);
        currentAttachments = currentAttachments.filter(att => att !== attachment);
        showNotification('Anexo removido.', 'success');
    });
    li.appendChild(removeButton);
    attachmentList.appendChild(li);
}

// Inicializar SortableJS
function initializeSortable() {
    const lists = document.querySelectorAll('.task-list');
    lists.forEach(list => {
        if (!list.getAttribute('data-sortable-initialized')) {
            Sortable.create(list, {
                group: 'tasks',
                animation: 150,
                onEnd: function (evt) {
                    const itemEl = evt.item;
                    const taskId = parseInt(itemEl.getAttribute('data-id'));
                    const newPriority = itemEl.parentElement.getAttribute('data-priority');
                    const task = tasks.find(t => t.id === taskId);
                    if (task) {
                        task.priority = newPriority;
                        saveTasks();
                        showNotification(`Prioridade da tarefa "${task.title}" atualizada para ${newPriority}.`, 'success');
                    }
                },
            });
            list.setAttribute('data-sortable-initialized', 'true');
        }
    });
}

// Gerenciar tema
function manageTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    updateThemeIcon(savedTheme);

    themeToggleButton.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        showNotification(`Tema ${newTheme === 'dark' ? 'escuro' : 'claro'} aplicado.`, 'success');
    });
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
}

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    } else {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
}

// Mover tarefa para concluídas
function moveToCompleted(task) {
    addCompletedTaskToDOM(task);
    removeTaskFromDOM(task.id);
}

// Mover tarefa para ativa
function moveToActive(task) {
    addTaskToDOM(task);
    removeCompletedTaskFromDOM(task.id);
}

// Remover tarefa ativa do DOM
function removeTaskFromDOM(taskId) {
    const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
    if (taskElement) {
        taskElement.remove();
    }
}

// Remover tarefa concluída do DOM
function removeCompletedTaskFromDOM(taskId) {
    const taskElement = document.querySelector(`#completed-tasks-list .task-item[data-id="${taskId}"]`);
    if (taskElement) {
        taskElement.remove();
    }
}

// Eventos
addTaskButton.addEventListener('click', addTask);

taskTitleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

taskDescriptionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

saveEditButton.addEventListener('click', saveEdit);

closeModalButton.addEventListener('click', closeEditModal);
closeAttachmentsModalButton.addEventListener('click', closeAttachmentsModal);

window.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
    if (e.target === attachmentsModal) closeAttachmentsModal();
});

searchInput.addEventListener('input', applyFilters);
filterCategory.addEventListener('change', applyFilters);
filterStatus.addEventListener('change', applyFilters);
filterPriority.addEventListener('change', applyFilters);

addSubtaskButton.addEventListener('click', addSubtask);
subtaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addSubtask();
});

addAttachmentButton.addEventListener('click', addAttachment);
attachmentInput.addEventListener('change', () => addAttachment());

// Inicializar
manageTheme();
window.addEventListener('DOMContentLoaded', loadTasks);
