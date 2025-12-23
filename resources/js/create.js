const API_BASE_URL = '/api';
let subtasks = [];
let collaborators = [];
let currentEditingSubtaskId = null;
let subtaskData = {}; // Store subtask details (description and assigned collaborators)

// Function to make authenticated API calls
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const headers = {
        'Authorization': 'Bearer ' + token,
        // Do not set Content-Type for FormData; caller may override if sending JSON
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

// Load user data
async function loadUser() {
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
}

// Open subtask modal for editing
function openSubtaskModal(subtaskId) {
    currentEditingSubtaskId = subtaskId;
    const subtaskInput = document.querySelector(`[data-subtask-id="${subtaskId}"]`);
    
    // Populate modal fields
    document.getElementById('subtaskNameInput').value = subtaskInput?.value || '';
    document.getElementById('subtaskDescriptionInput').value = subtaskData[subtaskId]?.description || '';
    
    // Load and display assigned collaborators
    updateSubtaskCollaboratorsDisplay(subtaskId);
    
    // Show modal
    document.getElementById('subtaskModal').classList.add('show');
}

// Update collaborators display in modal
function updateSubtaskCollaboratorsDisplay(subtaskId) {
    const collaboratorsList = document.getElementById('subtaskCollaboratorsList');
    collaboratorsList.innerHTML = '';
    const assignedCollabs = subtaskData[subtaskId]?.collaborators || [];
    
    assignedCollabs.forEach(email => {
        const tag = document.createElement('div');
        tag.className = 'subtask-collaborator-tag';
        tag.innerHTML = `
            <span>${escapeHtml(email)}</span>
            <button type="button" onclick="removeSubtaskCollaborator('${subtaskId}', '${email}')">&times;</button>
        `;
        collaboratorsList.appendChild(tag);
    });
}

// Remove collaborator from subtask
function removeSubtaskCollaborator(subtaskId, email) {
    if (!subtaskData[subtaskId]) subtaskData[subtaskId] = { description: '', collaborators: [] };
    subtaskData[subtaskId].collaborators = subtaskData[subtaskId].collaborators.filter(c => c !== email);
    updateSubtaskCollaboratorsDisplay(subtaskId);
}

// Add collaborator to subtask
document.getElementById('subtaskCollaboratorSelect')?.addEventListener('change', function() {
    const email = this.value.trim();
    if (!email) return;
    
    if (!subtaskData[currentEditingSubtaskId]) {
        subtaskData[currentEditingSubtaskId] = { description: '', collaborators: [] };
    }
    
    const assigned = subtaskData[currentEditingSubtaskId].collaborators || [];
    if (!assigned.includes(email)) {
        assigned.push(email);
        subtaskData[currentEditingSubtaskId].collaborators = assigned;
    }
    
    updateSubtaskCollaboratorsDisplay(currentEditingSubtaskId);
    this.value = '';
});

// Close subtask modal
document.getElementById('closeSubtaskModal').addEventListener('click', function() {
    document.getElementById('subtaskModal').classList.remove('show');
});

document.getElementById('subtaskCancelBtn').addEventListener('click', function() {
    document.getElementById('subtaskModal').classList.remove('show');
});

// Save subtask changes
document.getElementById('subtaskSaveBtn').addEventListener('click', function() {
    if (!currentEditingSubtaskId) return;
    
    const subtaskInput = document.querySelector(`[data-subtask-id="${currentEditingSubtaskId}"]`);
    if (subtaskInput) {
        subtaskInput.value = document.getElementById('subtaskNameInput').value;
    }
    
    if (!subtaskData[currentEditingSubtaskId]) {
        subtaskData[currentEditingSubtaskId] = { description: '', collaborators: [] };
    }
    
    subtaskData[currentEditingSubtaskId].description = document.getElementById('subtaskDescriptionInput').value;
    
    // Update the visual display
    updateSubtaskItemDetails(currentEditingSubtaskId);
    
    document.getElementById('subtaskModal').classList.remove('show');
});

// Update the subtask item display with details
function updateSubtaskItemDetails(subtaskId) {
    const subtaskItem = document.querySelector(`[data-subtask-id="${subtaskId}"]`)?.closest('.list-item');
    if (!subtaskItem) return;
    
    let details = subtaskItem.querySelector('.subtask-item-details');
    if (!details) {
        details = document.createElement('div');
        details.className = 'subtask-item-details';
        subtaskItem.appendChild(details);
    }
    
    const data = subtaskData[subtaskId];
    const descText = data?.description ? `Description: ${data.description.substring(0, 40)}${data.description.length > 40 ? '...' : ''}` : '';
    const collabCount = data?.collaborators?.length || 0;
    const collabText = collabCount > 0 ? `${collabCount} collaborator(s)` : '';
    
    details.textContent = [descText, collabText].filter(Boolean).join(' • ');
}

// Escape HTML function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add Subtask
document.getElementById('addSubtaskBtn').addEventListener('click', function() {
    const container = document.getElementById('subtasksContainer');
    const subtaskDiv = document.createElement('div');
    subtaskDiv.className = 'form-group';
    
    if (subtasks.length === 0) {
        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = 'Subtasks';
        container.appendChild(label);
        
        const listDiv = document.createElement('div');
        listDiv.className = 'dynamic-list';
        listDiv.id = 'subtasksList';
        container.appendChild(listDiv);
    }
    
    const subtaskItem = document.createElement('div');
    subtaskItem.className = 'list-item';
    const itemId = `subtask-${Date.now()}`;
    
    subtaskItem.innerHTML = `
        <input type="text" placeholder="Enter subtask name" required data-subtask-id="${itemId}" style="flex: 1; cursor: text;">
        <button type="button" class="action-btn" data-edit-subtask style="padding: 6px 12px; font-size: 12px;">Edit Details</button>
        <button type="button" class="remove-btn" data-remove-subtask>Remove</button>
    `;
    
    document.getElementById('subtasksList').appendChild(subtaskItem);
    subtasks.push(itemId);
    
    // Initialize subtask data
    subtaskData[itemId] = { description: '', collaborators: [] };
    
    // Add edit functionality
    subtaskItem.querySelector('[data-edit-subtask]').addEventListener('click', function(e) {
        e.preventDefault();
        // Update the collaborator select options
        const select = document.getElementById('subtaskCollaboratorSelect');
        select.innerHTML = '<option value="">Select collaborator</option>';
        document.querySelectorAll('[data-collaborator-id]').forEach(input => {
            const email = input.value.trim();
            if (email) {
                const option = document.createElement('option');
                option.value = email;
                option.textContent = email;
                select.appendChild(option);
            }
        });
        openSubtaskModal(itemId);
    });
    
    // Add remove functionality
    subtaskItem.querySelector('[data-remove-subtask]').addEventListener('click', function() {
        subtasks = subtasks.filter(id => id !== itemId);
        delete subtaskData[itemId];
        subtaskItem.remove();
        if (subtasks.length === 0) {
            container.innerHTML = '';
        }
    });
});

// Add Collaborator
document.getElementById('addCollaboratorBtn').addEventListener('click', function() {
    const container = document.getElementById('collaboratorsContainer');
    const collaboratorDiv = document.createElement('div');
    collaboratorDiv.className = 'form-group';
    
    if (collaborators.length === 0) {
        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = 'Collaborators';
        container.appendChild(label);
        
        const listDiv = document.createElement('div');
        listDiv.className = 'dynamic-list';
        listDiv.id = 'collaboratorsList';
        container.appendChild(listDiv);
    }
    
    const collaboratorItem = document.createElement('div');
    collaboratorItem.className = 'list-item';
    const itemId = `collaborator-${Date.now()}`;
    
    // Create container for input and error message
    const inputContainer = document.createElement('div');
    inputContainer.style.flex = '1';
    inputContainer.style.display = 'flex';
    inputContainer.style.flexDirection = 'column';
    
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'collaborator-input-wrapper';
    inputWrapper.style.position = 'relative';
    
    const input = document.createElement('input');
    input.type = 'email';
    input.placeholder = 'Enter email address';
    input.required = true;
    input.className = 'collaborator-input form-input';
    input.setAttribute('data-collaborator-id', itemId);
    
    const validatingSpinner = document.createElement('div');
    validatingSpinner.className = 'collaborator-validating';
    
    const successIcon = document.createElement('div');
    successIcon.className = 'collaborator-success-icon';
    successIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'collaborator-error-message';
    errorMessage.textContent = 'User not found';
    errorMessage.setAttribute('data-error-for', itemId);
    
    inputWrapper.appendChild(input);
    inputWrapper.appendChild(validatingSpinner);
    inputWrapper.appendChild(successIcon);
    
    inputContainer.appendChild(inputWrapper);
    inputContainer.appendChild(errorMessage);
    
    collaboratorItem.appendChild(inputContainer);
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.setAttribute('data-remove-collaborator', '');
    removeBtn.textContent = 'Remove';
    collaboratorItem.appendChild(removeBtn);
    
    document.getElementById('collaboratorsList').appendChild(collaboratorItem);
    collaborators.push(itemId);
    
    // Store validation state for this collaborator
    window.collaboratorValidation = window.collaboratorValidation || {};
    window.collaboratorValidation[itemId] = {
        isValid: null,
        isValidating: false,
        email: ''
    };
    
    // Add debounced validation on input
    let validationTimeout;
    input.addEventListener('input', function() {
        const email = this.value.trim();
        window.collaboratorValidation[itemId].email = email;
        
        // Reset validation state
        input.classList.remove('invalid', 'valid');
        errorMessage.classList.remove('show');
        validatingSpinner.classList.remove('show');
        successIcon.classList.remove('show');
        window.collaboratorValidation[itemId].isValid = null;
        
        // Clear previous timeout
        clearTimeout(validationTimeout);
        
        // Only validate if email is provided and looks like an email
        if (email && email.includes('@')) {
            // Show loading state
            validatingSpinner.classList.add('show');
            window.collaboratorValidation[itemId].isValidating = true;
            
            // Debounce validation (wait 500ms after user stops typing)
            validationTimeout = setTimeout(() => {
                validateCollaboratorEmail(email, itemId, input, errorMessage, validatingSpinner, successIcon);
            }, 500);
        }
    });
    
    // Add remove functionality
    removeBtn.addEventListener('click', function() {
        collaborators = collaborators.filter(id => id !== itemId);
        delete window.collaboratorValidation[itemId];
        collaboratorItem.remove();
        if (collaborators.length === 0) {
            container.innerHTML = '';
        }
    });
});

// Track collaborator validation state
window.collaboratorValidation = window.collaboratorValidation || {};

// Function to validate collaborator email
async function validateCollaboratorEmail(email, itemId, inputElement, errorElement, spinnerElement, successElement) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/users/check-user?email=${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response && response.ok) {
            const data = await response.json();
            
            // Hide loading spinner
            spinnerElement.classList.remove('show');
            window.collaboratorValidation[itemId].isValidating = false;
            
            if (data.exists) {
                // Email exists - valid
                inputElement.classList.remove('invalid');
                inputElement.classList.add('valid');
                errorElement.classList.remove('show');
                successElement.classList.add('show');
                window.collaboratorValidation[itemId].isValid = true;
            } else {
                // Email doesn't exist - invalid
                inputElement.classList.remove('valid');
                inputElement.classList.add('invalid');
                errorElement.classList.add('show');
                successElement.classList.remove('show');
                window.collaboratorValidation[itemId].isValid = false;
            }
        } else {
            // Error checking - treat as invalid for safety
            spinnerElement.classList.remove('show');
            inputElement.classList.remove('valid');
            inputElement.classList.add('invalid');
            errorElement.classList.add('show');
            successElement.classList.remove('show');
            window.collaboratorValidation[itemId].isValid = false;
            window.collaboratorValidation[itemId].isValidating = false;
        }
    } catch (error) {
        console.error('Error validating email:', error);
        spinnerElement.classList.remove('show');
        inputElement.classList.remove('valid');
        inputElement.classList.add('invalid');
        errorElement.classList.add('show');
        successElement.classList.remove('show');
        window.collaboratorValidation[itemId].isValid = false;
        window.collaboratorValidation[itemId].isValidating = false;
    }
}

// Form submission
document.getElementById('createTaskForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    // Hide previous messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    // Pre-submission validation: Check all collaborator emails
    const invalidCollaborators = [];
    const allCollaboratorInputs = document.querySelectorAll('[data-collaborator-id]');
    
    // First, validate any collaborators that haven't been validated yet
    const validationPromises = [];
    allCollaboratorInputs.forEach(input => {
        const email = input.value.trim();
        const itemId = input.getAttribute('data-collaborator-id');
        
        if (email && email.includes('@')) {
            const validationState = window.collaboratorValidation[itemId];
            // If not validated yet or currently validating, wait for validation
            if (!validationState || validationState.isValid === null || validationState.isValidating) {
                // Find the associated elements
                const listItem = input.closest('.list-item');
                const inputWrapper = listItem.querySelector('.collaborator-input-wrapper');
                const errorMsg = listItem.querySelector(`[data-error-for="${itemId}"]`) || listItem.querySelector('.collaborator-error-message');
                const spinner = inputWrapper?.querySelector('.collaborator-validating');
                const successIcon = inputWrapper?.querySelector('.collaborator-success-icon');
                
                // Perform immediate validation
                validationPromises.push(
                    validateCollaboratorEmail(email, itemId, input, errorMsg, spinner, successIcon)
                );
            }
        }
    });
    
    // Wait for all validations to complete
    if (validationPromises.length > 0) {
        await Promise.all(validationPromises);
        // Wait a bit more for UI to update
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Check validation results
    allCollaboratorInputs.forEach(input => {
        const email = input.value.trim();
        const itemId = input.getAttribute('data-collaborator-id');
        
        if (email && email.includes('@')) {
            const validationState = window.collaboratorValidation[itemId];
            // Block if not validated, currently validating, or explicitly invalid
            if (!validationState || validationState.isValid === null || validationState.isValidating || validationState.isValid === false) {
                invalidCollaborators.push(email);
            }
        }
    });
    
    // Block submission if there are invalid collaborators
    if (invalidCollaborators.length > 0) {
        errorDiv.textContent = 'Please add a valid email for the collaborator.';
        errorDiv.style.display = 'block';
        
        // Scroll to top to show error message
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }
    
    // Gather form data
    const dueDateValue = document.getElementById('dueDate').value.trim() || null;
    const categoryValue = document.getElementById('category').value;
    
    // Validate required fields
    if (!categoryValue) {
        errorDiv.textContent = 'Please select a category.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Build multipart form data for file upload support
    const formData = new FormData();
    formData.append('title', document.getElementById('taskName').value);
    formData.append('description', document.getElementById('description').value || '');
    formData.append('category', categoryValue);
    if (dueDateValue) formData.append('due_date', dueDateValue);
    formData.append('status', 'pending');
    
    // Gather subtasks with descriptions and assigned collaborators
    const subtasksArr = [];
    document.querySelectorAll('[data-subtask-id]').forEach(input => {
        if (input.value.trim()) {
            const itemId = input.getAttribute('data-subtask-id');
            const subtaskObj = {
                title: input.value.trim(),
                status: 'pending',
                description: subtaskData[itemId]?.description || '',
                collaborators: subtaskData[itemId]?.collaborators || []
            };
            subtasksArr.push(subtaskObj);
        }
    });
    
    // Gather task collaborators
    const collaboratorsArr = [];
    document.querySelectorAll('[data-collaborator-id]').forEach(input => {
        if (input.value.trim()) {
            collaboratorsArr.push(input.value.trim());
        }
    });

    // Append arrays as JSON strings for server-side parsing
    if (subtasksArr.length) formData.append('subtasks', JSON.stringify(subtasksArr));
    if (collaboratorsArr.length) formData.append('collaborators', JSON.stringify(collaboratorsArr));

    // Append file if selected
    const fileInput = document.getElementById('attachment');
    if (fileInput.files && fileInput.files[0]) {
        formData.append('attachment', fileInput.files[0]);
    }
    
    try {
        console.log('Submitting form data:', formData);
        
        const response = await fetchWithAuth(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            body: formData,
        });
        
        const data = await response.json();
        console.log('Response status:', response.status, 'Response data:', data);
        
        if (response.ok) {
            successDiv.textContent = 'Task created successfully!';
            successDiv.style.display = 'block';
            
            // Determine redirect destination based on collaborators
            // If collaborators were added, redirect to projects, otherwise to board
            const hasCollaborators = collaborators.length > 0;
            const redirectUrl = hasCollaborators ? '/projects' : '/board';
            
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1500);
        } else {
            // Display validation errors if available
            let errorMsg = data.message || 'Failed to create task. Please try again.';
            if (data.errors) {
                const errorList = Object.values(data.errors).flat().join(', ');
                errorMsg = errorList;
            }
            errorDiv.textContent = errorMsg;
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error creating task:', error);
        errorDiv.textContent = 'An error occurred. Please try again. Error: ' + error.message;
        errorDiv.style.display = 'block';
    }
});

// Load user on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        loadUser();
    } else {
        window.location.href = '/login';
    }
});