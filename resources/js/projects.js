const API_BASE_URL = '/api';
let allProjects = []; // Store all projects for filtering
let currentCategory = 'all'; // Track selected category
let currentSearch = ''; // Track search term
let activityLogs = []; // Store activity log entries

// Function to calculate task progress
function calculateTaskProgress(task) {
    const subtasks = task.subtasks || [];
    if (subtasks.length === 0) return 0;
    
    const completedSubtasks = subtasks.filter(st => st.status === 'completed').length;
    return Math.round((completedSubtasks / subtasks.length) * 100);
}

// Function to make authenticated API calls
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const headers = {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        return;
    }

    return response;
}

// Load projects and user data
async function loadData() {
    try {
        // Load user data
        const userResponse = await fetchWithAuth(`${API_BASE_URL}/me`);
        if (userResponse && userResponse.ok) {
            const userData = await userResponse.json();
            document.getElementById('userEmail').textContent = userData.email || 'user@gmail.com';
            // Display full name if available, otherwise use email or 'User'
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = userData.fname || userData.email?.split('@')[0] || 'User';
            }
        }

        // Load projects (tasks with collaborators)
        const projectsResponse = await fetchWithAuth(`${API_BASE_URL}/projects`);
        if (projectsResponse && projectsResponse.ok) {
            allProjects = await projectsResponse.json();
            applyFilters();
            loadActivityLogs();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        // If no token, redirect to login
        if (!localStorage.getItem('auth_token')) {
            window.location.href = '/login';
        }
    }
}

// Apply filters to projects
function applyFilters() {
    let filtered = [...allProjects];

    // Apply search filter (by task name)
    if (currentSearch.trim() !== '') {
        const searchLower = currentSearch.toLowerCase();
        filtered = filtered.filter(project => 
            project.title.toLowerCase().includes(searchLower)
        );
    }

    // Apply category filter
    if (currentCategory !== 'all') {
        filtered = filtered.filter(project => 
            project.category && project.category.toUpperCase() === currentCategory.toUpperCase()
        );
    }

    renderProjects(filtered);
}

// Render projects inside columns similar to the board layout
function renderProjects(projects) {
    const groups = { pending: [], ongoing: [], completed: [] };

    projects.forEach(project => {
        const status = (project.status || 'pending').toLowerCase();
        if (groups[status]) {
            groups[status].push(project);
        } else {
            groups.pending.push(project);
        }
    });

    ['pending', 'ongoing', 'completed'].forEach(status => {
        const column = document.querySelector(`.project-column[data-status="${status}"]`);
        if (!column) return;

        const tasksContainer = column.querySelector('.tasks-container');
        const countSpan = column.querySelector('.task-count');
        const data = groups[status] || [];

        if (countSpan) {
            countSpan.textContent = `(${data.length})`;
        }

        tasksContainer.innerHTML = '';

        if (data.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div class="empty-state-icon">
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
                    </svg>
                </div>
                <div>No projects found.</div>
            `;
            tasksContainer.appendChild(emptyState);
            return;
        }

        data.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';

            const normalizedStatus = (project.status || 'pending').toLowerCase();
            const statusClass = normalizedStatus === 'pending' ? 'pending' : normalizedStatus === 'ongoing' ? 'ongoing' : 'completed';
            const statusText = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
            const creatorEmail = project.user?.email || null;
            const collaborators = [];

            if (project.task_collaborators && project.task_collaborators.length > 0) {
                project.task_collaborators.forEach(collab => {
                    // Exclude the creator from the collaborators list
                    if (collab.user && collab.user.email && collab.user.email !== creatorEmail) {
                        collaborators.push(collab.user.email);
                    }
                });
            } else if (project.collaborators && Array.isArray(project.collaborators)) {
                project.collaborators.forEach(email => {
                    if (email !== creatorEmail) {
                        collaborators.push(email);
                    }
                });
            }

            const categoryValue = (project.category || 'PERSONAL').toUpperCase();
            const categoryClass =
                categoryValue === 'WORK'
                    ? 'category-work'
                    : categoryValue === 'SCHOOL'
                        ? 'category-school'
                        : 'category-personal';

            projectCard.innerHTML = `
                <div class="project-header">
                    <div style="flex: 1;">
                        <div class="project-title">${escapeHtml(project.title)}</div>
                        <div class="project-category ${categoryClass}">
                            <span>${categoryValue}</span>
                        </div>
                    </div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="project-description">${escapeHtml(project.description || 'No description provided.')}</div>
                <div class="project-meta">
                    <div class="project-meta-item">
                        <span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <rect x="3" y="4" width="18" height="17" rx="2" ry="2"></rect>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                            </svg>
                        </span>
                        <span>${project.due_date ? new Date(project.due_date).toLocaleDateString() : 'No due date'}</span>
                    </div>
                    <div class="project-meta-item">
                        <span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </span>
                        <span>${(project.subtasks || []).length} subtask(s)</span>
                    </div>
                </div>
                ${(project.subtasks || []).length > 0 ? `
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${calculateTaskProgress(project)}%"></div>
                        </div>
                        <div class="progress-text">${calculateTaskProgress(project)}% complete</div>
                    </div>
                ` : ''}
                <div class="creator-section">
                    <div class="creator-label">Creator</div>
                    <span class="creator-badge">${escapeHtml(creatorEmail || 'Unknown')}</span>
                </div>
                <div class="collaborators-section">
                    <div class="collaborators-title">Collaborators (${collaborators.length})</div>
                    <div class="collaborators-list">
                        ${collaborators.length > 0 
                            ? collaborators.slice(0, 3).map(email => 
                                `<span class="collaborator-badge">${escapeHtml(email)}</span>`
                            ).join('') + (collaborators.length > 3 ? `<span class="collaborator-badge">+${collaborators.length - 3} more</span>` : '')
                            : '<span class="no-data">No collaborators</span>'
                        }
                    </div>
                </div>
            `;

            projectCard.addEventListener('click', () => openTaskModal(project));
            tasksContainer.appendChild(projectCard);
        });
    });
}

async function loadActivityLogs() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/activity-logs`);
        if (response && response.ok) {
            activityLogs = await response.json();
            renderActivityLogs();
        }
    } catch (error) {
        console.error('Error loading activity logs:', error);
    }
}

function renderActivityLogs() {
    const list = document.getElementById('activityLogList');
    if (!list) return;
    list.innerHTML = '';

        if (!activityLogs || activityLogs.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.innerHTML = `
                <div class="empty-state-icon">
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="4" y="3" width="16" height="18" rx="2" ry="2"></rect>
                        <line x1="8" y1="7" x2="16" y2="7"></line>
                        <line x1="8" y1="11" x2="16" y2="11"></line>
                        <line x1="8" y1="15" x2="12" y2="15"></line>
                    </svg>
                </div>
                <div>No activity recorded yet.</div>
            `;
            list.appendChild(empty);
            return;
        }

    activityLogs.forEach(log => {
        const entry = document.createElement('div');
        entry.className = 'activity-card';
        const actor = (log.user && (log.user.fname || log.user.email)) || 'Someone';
        const summary = log.description || `${actor} made an update.`;
        const createdAt = log.created_at ? new Date(log.created_at) : null;
        const dateText = createdAt ? createdAt.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) : 'Unknown date';
        const categoryValue = (log.task?.category || 'PERSONAL').toUpperCase();
        const categoryClass = getCategoryClass(categoryValue);
        const categoryLabel = formatCategoryLabel(categoryValue);

        entry.innerHTML = `
            <div class="activity-card-header">
                <div class="activity-card-title">
                    <span>${escapeHtml(log.task?.title || 'Task Update')}</span>
                    <span class="category-chip ${categoryClass}">${categoryLabel}</span>
                </div>
                <div class="activity-card-meta">Updated at ${dateText}</div>
            </div>
            <div class="activity-card-body">${escapeHtml(summary)}</div>
        `;
        list.appendChild(entry);
    });
}

function formatCategoryLabel(category) {
    return category?.toUpperCase() || 'PERSONAL';
}

function getCategoryClass(category) {
    const normalized = category?.toUpperCase();
    if (normalized === 'WORK') return 'work';
    if (normalized === 'SCHOOL') return 'school';
    return 'personal';
}

async function clearActivityLogs() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/activity-logs`, {
            method: 'DELETE'
        });

        if (response && response.ok) {
            activityLogs = [];
            renderActivityLogs();
            await loadActivityLogs();
        } else {
            const data = await response.json();
            alert('Failed to clear activity log: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error clearing activity log:', error);
        alert('An error occurred while clearing the activity log.');
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
    currentSearch = e.target.value;
    applyFilters();
});

// Quick Filters dropdown functionality
const quickFilters = document.getElementById('quickFilters');
const filtersDropdown = document.getElementById('filtersDropdown');
const filterOptions = document.querySelectorAll('.filter-option');

// Toggle dropdown
quickFilters.addEventListener('click', function(e) {
    e.stopPropagation();
    filtersDropdown.classList.toggle('show');
    quickFilters.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!quickFilters.contains(e.target)) {
        filtersDropdown.classList.remove('show');
        quickFilters.classList.remove('active');
    }
});

// Handle filter option selection
filterOptions.forEach(option => {
    option.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Remove active class from all options
        filterOptions.forEach(opt => opt.classList.remove('active'));
        
        // Add active class to selected option
        this.classList.add('active');
        
        // Update current category and filter text
        currentCategory = this.dataset.category;
        const filterText = document.getElementById('filterText');
        
        if (currentCategory === 'all') {
            filterText.textContent = 'Quick Filters';
        } else {
            filterText.textContent = this.querySelector('span').textContent;
        }
        
        // Apply filters
        applyFilters();
        
        // Close dropdown
        filtersDropdown.classList.remove('show');
        quickFilters.classList.remove('active');
    });
});

const clearActivityButton = document.getElementById('clearActivityLog');
if (clearActivityButton) {
    clearActivityButton.addEventListener('click', async function() {
        const shouldClear = confirm('Clear all activity log entries?');
        if (!shouldClear) {
            return;
        }
        await clearActivityLogs();
    });
}

// Attachment helper functions
function openAttachmentPreview(url, fileName, ext, isImage, isPdf) {
    const previewModal = document.getElementById('attachmentPreviewModal');
    const previewContent = document.getElementById('attachmentPreviewContent');
    const previewActions = document.getElementById('attachmentPreviewActions');
    
    previewContent.innerHTML = '';
    previewActions.innerHTML = '';
    
    if (isImage) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = fileName;
        img.className = 'attachment-preview-image';
        previewContent.appendChild(img);
    } else if (isPdf) {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.className = 'attachment-preview-iframe';
        previewContent.appendChild(iframe);
    }
    
    // Action buttons
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'attachment-preview-btn';
    downloadBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="8 17 12 21 16 17"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path></svg> Download`;
    downloadBtn.addEventListener('click', () => downloadAttachment(url, fileName));
    previewActions.appendChild(downloadBtn);
    
    if (isPdf || isImage) {
        const printBtn = document.createElement('button');
        printBtn.className = 'attachment-preview-btn';
        printBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> Print`;
        printBtn.addEventListener('click', () => printAttachment(url, fileName, isPdf));
        previewActions.appendChild(printBtn);
    }
    
    previewModal.classList.add('show');
}

function downloadAttachment(url, fileName) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function printAttachment(url, fileName, isPdf) {
    if (isPdf) {
        const printWindow = window.open(url, '_blank');
        printWindow.onload = () => {
            printWindow.print();
        };
    } else {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head><title>Print ${fileName}</title></head>
                    <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;">
                        <img src="${url}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.onload = () => printWindow.print();
        };
    }
}

// Open task modal with details
function openTaskModal(task) {
    document.getElementById('modalTitle').textContent = task.title;

    const modalCategoryEl = document.getElementById('modalCategory');
    const modalCategoryValue = (task.category || 'PERSONAL').toUpperCase();
    modalCategoryEl.className = 'modal-category';
    if (modalCategoryValue === 'WORK') {
        modalCategoryEl.classList.add('category-work');
    } else if (modalCategoryValue === 'SCHOOL') {
        modalCategoryEl.classList.add('category-school');
    } else {
        modalCategoryEl.classList.add('category-personal');
    }
    modalCategoryEl.textContent = modalCategoryValue;
    document.getElementById('modalDescription').textContent = task.description || 'No description provided.';
    document.getElementById('modalDueDate').textContent = task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date set.';
    document.getElementById('statusSelect').value = (task.status || 'pending').toLowerCase();
    
    // Display progress
    const progressSection = document.getElementById('modalProgressSection');
    const subtasksCount = (task.subtasks || []).length;
    if (subtasksCount > 0) {
        const progress = calculateTaskProgress(task);
        document.getElementById('modalProgressFill').style.width = progress + '%';
        document.getElementById('modalProgressText').textContent = progress + '% complete';
        progressSection.style.display = 'block';
    } else {
        progressSection.style.display = 'none';
    }
    
    // Display subtasks
    const subtasksList = document.getElementById('modalSubtasks');
    subtasksList.innerHTML = '';
    if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(subtask => {
            const li = document.createElement('li');
            li.className = 'subtask-item';

            // Create subtask title and details container
            const titleAndDetailsDiv = document.createElement('div');
            titleAndDetailsDiv.style.marginBottom = '8px';
            
            const label = document.createElement('div');
            label.textContent = subtask.title;
            label.style.fontWeight = '600';
            label.style.marginBottom = '4px';
            titleAndDetailsDiv.appendChild(label);

            // Show description if available
            if (subtask.description) {
                const descDiv = document.createElement('div');
                descDiv.style.fontSize = '12px';
                descDiv.style.color = 'rgba(255,255,255,0.7)';
                descDiv.style.marginBottom = '4px';
                descDiv.textContent = `Description: ${subtask.description}`;
                titleAndDetailsDiv.appendChild(descDiv);
            }

            // Show collaborators if available
            if (subtask.collaborators && subtask.collaborators.length > 0) {
                const collabDiv = document.createElement('div');
                collabDiv.style.fontSize = '12px';
                collabDiv.style.color = 'rgba(255,255,255,0.7)';
                collabDiv.style.marginBottom = '4px';
                const collabNames = subtask.collaborators.map(c => c.user?.email || 'Unknown').join(', ');
                collabDiv.textContent = `Assigned to: ${collabNames}`;
                titleAndDetailsDiv.appendChild(collabDiv);
            }

            li.appendChild(titleAndDetailsDiv);

            const wrapper = document.createElement('div');
            wrapper.className = 'status-select-wrapper';

            const select = document.createElement('select');
            select.className = 'status-select';
            select.innerHTML = `
                <option value="pending">Pending</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
            `;
            select.value = (subtask.status || 'pending').toLowerCase();

            select.addEventListener('change', async function() {
                const newStatus = this.value;
                try {
                    const response = await fetchWithAuth(`${API_BASE_URL}/subtasks/${subtask.subtask_id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ status: newStatus })
                    });

                    if (response && response.ok) {
                        const idx = window.currentTask.subtasks.findIndex(s => s.subtask_id === subtask.subtask_id);
                        if (idx !== -1) {
                            window.currentTask.subtasks[idx].status = newStatus;
                        }
                        
                        // Update progress bar in modal
                        const progress = calculateTaskProgress(window.currentTask);
                        const progressSection = document.getElementById('modalProgressSection');
                        if (window.currentTask.subtasks.length > 0) {
                            document.getElementById('modalProgressFill').style.width = progress + '%';
                            document.getElementById('modalProgressText').textContent = progress + '% complete';
                            progressSection.style.display = 'block';
                        }
                        
                        // Update the task in allProjects array to sync with board
                        const taskIndex = allProjects.findIndex(t => t.task_id === window.currentTask.task_id);
                        if (taskIndex !== -1) {
                            allProjects[taskIndex] = { ...window.currentTask };
                        }
                        
                        // Refresh the board to update progress bar on task card
                        applyFilters();
                        
                        // Check if all subtasks are completed and auto-complete task
                        const allCompleted = window.currentTask.subtasks.every(s => s.status === 'completed');
                        if (allCompleted && window.currentTask.subtasks.length > 0 && window.currentTask.status !== 'completed') {
                            // Auto-complete the task
                            const taskUpdateResponse = await fetchWithAuth(`${API_BASE_URL}/tasks/${window.currentTask.task_id}`, {
                                method: 'PUT',
                                body: JSON.stringify({ status: 'completed' })
                            });
                            
                            if (taskUpdateResponse && taskUpdateResponse.ok) {
                                const updatedTask = await taskUpdateResponse.json();
                                window.currentTask = updatedTask;
                                
                                // Update the task in allProjects array
                                const taskIdx = allProjects.findIndex(t => t.task_id === window.currentTask.task_id);
                                if (taskIdx !== -1) {
                                    allProjects[taskIdx] = updatedTask;
                                }
                                
                                // Update the modal status select
                                document.getElementById('statusSelect').value = 'completed';
                                
                                // Update progress bar to 100%
                                document.getElementById('modalProgressFill').style.width = '100%';
                                document.getElementById('modalProgressText').textContent = '100% complete';
                                
                                // Refresh the board to move the card to Completed column
                                applyFilters();
                                await loadActivityLogs();
                            }
                        } else {
                            await loadActivityLogs();
                        }
                    } else {
                        const data = await response.json();
                        alert('Failed to update subtask: ' + (data.message || 'Unknown error'));
                        this.value = (subtask.status || 'pending').toLowerCase();
                    }
                } catch (err) {
                    console.error('Error updating subtask status:', err);
                    alert('An error occurred while updating the subtask status.');
                    this.value = (subtask.status || 'pending').toLowerCase();
                }
            });

            const chevron = document.createElement('div');
            chevron.className = 'status-select-chevron';
            chevron.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
                    <polyline points="5 7 10 12 15 7"/>
                </svg>
            `;

            wrapper.appendChild(select);
            wrapper.appendChild(chevron);

            li.appendChild(wrapper);
            subtasksList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.className = 'no-data';
        li.textContent = 'No subtasks';
        subtasksList.appendChild(li);
    }
    
    // Display collaborators (exclude the task creator)
    const collaboratorsList = document.getElementById('modalCollaborators');
    collaboratorsList.innerHTML = '';
    const collaborators = [];
    const creatorEmail = task.user?.email || null;
    
    // Display creator
    const creatorEl = document.getElementById('modalCreator');
    creatorEl.innerHTML = '';
    if (creatorEmail) {
        const badge = document.createElement('span');
        badge.className = 'creator-badge';
        badge.textContent = creatorEmail;
        creatorEl.appendChild(badge);
    } else {
        const badge = document.createElement('span');
        badge.className = 'no-data';
        badge.textContent = 'Unknown';
        creatorEl.appendChild(badge);
    }
    
    if (task.task_collaborators && task.task_collaborators.length > 0 && task.task_collaborators[0].user) {
        task.task_collaborators.forEach(collab => {
            // Exclude the creator from the collaborators list
            if (collab.user && collab.user.email && collab.user.email !== creatorEmail) {
                collaborators.push(collab.user.email);
            }
        });
    } else if (task.collaborators && Array.isArray(task.collaborators)) {
        task.collaborators.forEach(email => {
            if (email !== creatorEmail) {
                collaborators.push(email);
            }
        });
    }
    
    if (collaborators.length > 0) {
        collaborators.forEach(email => {
            const badge = document.createElement('span');
            badge.className = 'collaborator-badge';
            badge.textContent = email;
            collaboratorsList.appendChild(badge);
        });
    } else {
        const badge = document.createElement('span');
        badge.className = 'no-data';
        badge.textContent = 'No collaborators';
        collaboratorsList.appendChild(badge);
    }

    // Display attachments with enhanced UI
    const attachmentsWrap = document.getElementById('modalAttachments');
    attachmentsWrap.innerHTML = '';
    const attachments = task.attachments || [];
    if (attachments.length === 0) {
        const none = document.createElement('div');
        none.className = 'no-data';
        none.textContent = 'No attachments';
        attachmentsWrap.appendChild(none);
    } else {
        attachments.forEach(att => {
            const filePath = att.file_path || '';
            const url = `/storage/${filePath}`;
            const fileName = filePath.split('/').pop() || 'attachment';
            const ext = filePath.split('.').pop()?.toLowerCase() || '';
            const isImage = ['jpg','jpeg','png','gif','webp'].includes(ext);
            const isPdf = ext === 'pdf';
            
            // Create attachment tile
            const tile = document.createElement('div');
            tile.className = 'attachment-tile';
            
            // Icon wrapper
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'attachment-icon-wrapper';
            
            // Get appropriate icon based on file type
            const fileTypeIcons = {
                'pdf': `<svg class="attachment-icon" viewBox="0 0 24 24" fill="#dc2626"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
                'doc': `<svg class="attachment-icon" viewBox="0 0 24 24" fill="#2563eb"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
                'docx': `<svg class="attachment-icon" viewBox="0 0 24 24" fill="#2563eb"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
                'xls': `<svg class="attachment-icon" viewBox="0 0 24 24" fill="#16a34a"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`,
                'xlsx': `<svg class="attachment-icon" viewBox="0 0 24 24" fill="#16a34a"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`,
                'txt': `<svg class="attachment-icon" viewBox="0 0 24 24" fill="#8b5cf6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
                'zip': `<svg class="attachment-icon" viewBox="0 0 24 24" fill="#f97316"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>`
            };
            
            if (isImage) {
                iconWrapper.innerHTML = `<svg class="attachment-icon" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
            } else {
                iconWrapper.innerHTML = fileTypeIcons[ext] || `<svg class="attachment-icon" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
            }
            
            // File info
            const info = document.createElement('div');
            info.className = 'attachment-info';
            
            const nameEl = document.createElement('div');
            nameEl.className = 'attachment-name';
            nameEl.textContent = fileName;
            info.appendChild(nameEl);
            
            const metaEl = document.createElement('div');
            metaEl.className = 'attachment-meta';
            metaEl.textContent = ext ? `${ext.toUpperCase()} File` : 'File';
            info.appendChild(metaEl);
            
            // Actions container
            const actions = document.createElement('div');
            actions.className = 'attachment-actions';
            
            // Preview button (for images and PDFs)
            if (isImage || isPdf) {
                const previewBtn = document.createElement('div');
                previewBtn.className = 'attachment-action-btn';
                previewBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
                previewBtn.title = 'Preview';
                previewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openAttachmentPreview(url, fileName, ext, isImage, isPdf);
                });
                actions.appendChild(previewBtn);
            }
            
            // Download button
            const downloadBtn = document.createElement('div');
            downloadBtn.className = 'attachment-action-btn';
            downloadBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="8 17 12 21 16 17"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path></svg>`;
            downloadBtn.title = 'Download';
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                downloadAttachment(url, fileName);
            });
            actions.appendChild(downloadBtn);
            
            // Print button (for PDFs and images)
            if (isPdf || isImage) {
                const printBtn = document.createElement('div');
                printBtn.className = 'attachment-action-btn';
                printBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`;
                printBtn.title = 'Print';
                printBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    printAttachment(url, fileName, isPdf);
                });
                actions.appendChild(printBtn);
            }
            
            // For images, also show thumbnail
            if (isImage) {
                const thumbnail = document.createElement('img');
                thumbnail.className = 'attachment-image-thumbnail';
                thumbnail.src = url;
                thumbnail.alt = fileName;
                thumbnail.addEventListener('click', () => openAttachmentPreview(url, fileName, ext, true, false));
                tile.appendChild(thumbnail);
            }
            
            // Click tile to preview (if image/PDF) or download
            tile.addEventListener('click', () => {
                if (isImage || isPdf) {
                    openAttachmentPreview(url, fileName, ext, isImage, isPdf);
                } else {
                    downloadAttachment(url, fileName);
                }
            });
            
            tile.appendChild(iconWrapper);
            tile.appendChild(info);
            tile.appendChild(actions);
            attachmentsWrap.appendChild(tile);
        });
    }
    
    // Show modal
    document.getElementById('taskModal').classList.add('show');
    
    // Store current task for status update and refresh contextual logs
    window.currentTask = task;
}

// Close modal
document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('taskModal').classList.remove('show');
});

// Close modal when clicking outside
document.getElementById('taskModal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.remove('show');
    }
});

// Close attachment preview modal
document.getElementById('attachmentPreviewClose').addEventListener('click', function() {
    document.getElementById('attachmentPreviewModal').classList.remove('show');
});

// Close attachment preview modal when clicking outside
document.getElementById('attachmentPreviewModal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.remove('show');
    }
});

// Update task status
document.getElementById('statusSelect').addEventListener('change', async function() {
    const newStatus = this.value;
    const taskId = window.currentTask.task_id;
    
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response && response.ok) {
            const updatedTask = await response.json();
            
            // Update the task in allProjects array with full response data
            const taskIndex = allProjects.findIndex(t => t.task_id === taskId);
            if (taskIndex !== -1) {
                allProjects[taskIndex] = updatedTask;
            }
            
            // Update window.currentTask with the updated task data
            window.currentTask = updatedTask;
            
            // Reload projects to reflect the change
            applyFilters();
            await loadActivityLogs();
            
            // Close modal
            document.getElementById('taskModal').classList.remove('show');
        } else {
            const data = await response.json();
            alert('Failed to update status: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating task status:', error);
        alert('An error occurred while updating the status.');
    }
});

document.getElementById('deleteTaskBtn').addEventListener('click', async function() {
    if (!window.currentTask) return;
    const confirmed = confirm('Are you sure you want to delete this task? This action cannot be undone.');
    if (!confirmed) return;

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/tasks/${window.currentTask.task_id}`, {
            method: 'DELETE'
        });

        if (response && response.ok) {
            allProjects = allProjects.filter(project => project.task_id !== window.currentTask.task_id);
            applyFilters();
            document.getElementById('taskModal').classList.remove('show');
            window.currentTask = null;
            await loadActivityLogs();
        } else {
            const data = await response.json();
            alert('Failed to delete task: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('An error occurred while deleting the task.');
    }
});

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        // Set default active filter
        const allCategoryOption = document.querySelector('.filter-option[data-category="all"]');
        if (allCategoryOption) {
            allCategoryOption.classList.add('active');
        }
        loadData();
    } else {
        window.location.href = '/login';
    }
});