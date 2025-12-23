@extends('layouts.app')

@push('styles')
    @vite(['resources/css/create.css'])
@endpush

@section('content')
<h1 class="page-title">Create</h1>
<p class="page-subtitle">Add a new task, define its schedule, subtasks, collaborators, and attachments.</p>

<div class="form-shell">
<div id="errorMessage" class="error-message"></div>
<div id="successMessage" class="success-message"></div>

<form id="createTaskForm" class="form-container" enctype="multipart/form-data">
    <!-- Task Name -->
    <div class="form-group">
        <label for="taskName" class="form-label">Name</label>
        <input 
            type="text" 
            id="taskName" 
            name="title" 
            class="form-input" 
            placeholder="Enter task name"
            required
        >
    </div>

    <!-- Category and Due Date Row -->
    <div class="category-row">
        <div class="form-group" style="flex: 1;">
            <label for="category" class="form-label">Category</label>
            <div class="category-select-wrapper">
                <select id="category" name="category" class="form-select category-select" required>
                    <option value="">Select</option>
                    <option value="SCHOOL">School</option>
                    <option value="PERSONAL">Personal</option>
                    <option value="WORK">Work</option>
                </select>
                <div class="category-select-chevron">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
                        <polyline points="5 7 10 12 15 7"/>
                    </svg>
                </div>
            </div>
        </div>

        <div class="form-group" style="flex: 1;">
            <label for="dueDate" class="form-label">Due Date</label>
            <input 
                type="date" 
                id="dueDate" 
                name="due_date" 
                class="form-input"
                min="2024-01-01"
            >
        </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons-row">
        <button type="button" class="action-btn" id="addSubtaskBtn">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="10" y1="4" x2="10" y2="16"/>
                <line x1="4" y1="10" x2="16" y2="10"/>
            </svg>
            Add Subtask
        </button>
        <button type="button" class="action-btn" id="addCollaboratorBtn">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="10" y1="4" x2="10" y2="16"/>
                <line x1="4" y1="10" x2="16" y2="10"/>
            </svg>
            Add Collaborators
        </button>
    </div>

    <!-- Subtasks List -->
    <div id="subtasksContainer"></div>

    <!-- Collaborators List -->
    <div id="collaboratorsContainer"></div>

    <!-- Description -->
    <div class="form-group">
        <label for="description" class="form-label">Description</label>
        <textarea 
            id="description" 
            name="description" 
            class="form-textarea" 
            placeholder="Enter task description"
        ></textarea>
    </div>

    <!-- Attachment -->
    <div class="form-group">
        <label for="attachment" class="form-label">Attachment</label>
        <input 
            type="file" 
            id="attachment" 
            name="attachment" 
            class="form-input"
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        >
    </div>

    <!-- Submit Button -->
    <button type="submit" class="submit-btn">Create Task</button>
</form>
</div>

<!-- Subtask Modal -->
<div class="subtask-modal" id="subtaskModal">
    <div class="subtask-modal-content">
        <div class="subtask-modal-header">
            <h3 class="subtask-modal-title">Edit Subtask</h3>
            <button class="subtask-modal-close" id="closeSubtaskModal">&times;</button>
        </div>
        <div class="subtask-form-group">
            <label class="subtask-form-label">Subtask Name</label>
            <input type="text" class="subtask-form-input" id="subtaskNameInput" placeholder="Enter subtask name" />
        </div>
        <div class="subtask-form-group">
            <label class="subtask-form-label">Description</label>
            <textarea class="subtask-form-textarea" id="subtaskDescriptionInput" placeholder="Enter subtask description"></textarea>
        </div>
        <div class="subtask-form-group">
            <label class="subtask-form-label">Assign Collaborators</label>
            <select id="subtaskCollaboratorSelect" class="subtask-form-input">
                <option value="">Select collaborator</option>
            </select>
            <div class="subtask-collaborators-list" id="subtaskCollaboratorsList"></div>
        </div>
        <div class="subtask-modal-actions">
            <button class="subtask-save-btn" id="subtaskSaveBtn">Save</button>
            <button class="subtask-cancel-btn" id="subtaskCancelBtn">Cancel</button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
    @vite(['resources/js/create.js'])
@endpush