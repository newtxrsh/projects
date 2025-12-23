@extends('layouts.app')

@push('styles')
    @vite(['resources/css/projects.css'])
@endpush

@section('content')
<!-- Projects Header -->
<div class="projects-header">
    <h1 class="projects-title">Projects</h1>
    
    <div class="projects-controls">
        <div class="search-bar">
            <input type="text" class="search-input" placeholder="Search projects" id="searchInput">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2">
                <circle cx="9" cy="9" r="6"/>
                <path d="M13.5 13.5L17 17"/>
            </svg>
        </div>
        
        <div class="quick-filters" id="quickFilters">
            <div class="quick-filters-content">
                <span id="filterText">Quick Filters</span>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2" id="filterIcon">
                    <polyline points="5 7 10 12 15 7"/>
                </svg>
            </div>
            <div class="filters-dropdown" id="filtersDropdown">
                <div class="filter-option active" data-category="all">
                    <span>All Categories</span>
                </div>
                <div class="filter-option" data-category="PERSONAL">
                    <span>Personal</span>
                </div>
                <div class="filter-option" data-category="SCHOOL">
                    <span>School</span>
                </div>
                <div class="filter-option" data-category="WORK">
                    <span>Work</span>
                </div>
            </div>
        </div>
    </div>
</div>

        <!-- Projects Board -->
        <div class="projects-board" id="projectsBoard">
            <div class="project-column" data-status="pending">
                <div class="column-header">
                    <div class="status-indicator blue"></div>
                    <h2 class="column-title">Pending</h2>
                    <span class="task-count">(0)</span>
                </div>
                <div class="tasks-container">
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <rect x="4" y="3" width="16" height="18" rx="2" ry="2"></rect>
                                <line x1="8" y1="7" x2="16" y2="7"></line>
                                <line x1="8" y1="11" x2="16" y2="11"></line>
                                <line x1="8" y1="15" x2="12" y2="15"></line>
                            </svg>
                        </div>
                        <div>Loading projects...</div>
                    </div>
                </div>
            </div>
            <div class="project-column" data-status="ongoing">
                <div class="column-header">
                    <div class="status-indicator yellow"></div>
                    <h2 class="column-title">Ongoing</h2>
                    <span class="task-count">(0)</span>
                </div>
                <div class="tasks-container">
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <circle cx="12" cy="12" r="9"></circle>
                                <polyline points="12 7 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <div>Loading projects...</div>
                    </div>
                </div>
            </div>
            <div class="project-column" data-status="completed">
                <div class="column-header">
                    <div class="status-indicator green"></div>
                    <h2 class="column-title">Completed</h2>
                    <span class="task-count">(0)</span>
                </div>
                <div class="tasks-container">
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <circle cx="12" cy="12" r="9"></circle>
                                <polyline points="16 9 11 14 8 11"></polyline>
                            </svg>
                        </div>
                        <div>Loading projects...</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Activity Log -->
        <div class="activity-log-section">
            <div class="activity-log-header">
                <div>
                    <h2 class="activity-log-title">Activity Log</h2>
                    <p class="activity-log-context" id="activityContext">Showing the latest updates for all projects.</p>
                </div>
                <div class="activity-log-actions">
                    <button class="clear-log-btn" id="clearActivityLog">Clear Activity Log</button>
                </div>
            </div>
            <div class="activity-log-list" id="activityLogList">
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <rect x="4" y="3" width="16" height="18" rx="2" ry="2"></rect>
                            <line x1="8" y1="7" x2="16" y2="7"></line>
                            <line x1="8" y1="11" x2="16" y2="11"></line>
                            <line x1="8" y1="15" x2="12" y2="15"></line>
                        </svg>
                    </div>
                    <div>No activity recorded yet.</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Task Details Modal -->
    <div class="task-modal" id="taskModal">
        <div class="modal-content">
            <button class="modal-close" id="closeModal">&times;</button>
            
            <!-- Header Section -->
            <div class="modal-header">
                <div>
                    <h2 class="modal-title" id="modalTitle"></h2>
                    <span class="modal-category" id="modalCategory"></span>
                </div>
            </div>

            <!-- Main Content - Reorganized Sections -->
            <div>
                <!-- Task Information Section -->
                <div class="modal-section">
                    <h3 class="modal-section-title-with-icon">
                        <svg class="modal-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <span>Description</span>
                    </h3>
                    <p class="modal-description" id="modalDescription"></p>
                </div>

                <div class="modal-section-divider"></div>

                <!-- Task Details Section -->
                <div class="modal-section">
                    <h3 class="modal-section-title-with-icon">
                        <svg class="modal-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>Task Details</span>
                    </h3>
                    <div class="modal-details-grid">
                        <div class="modal-detail-item-with-icon">
                            <svg class="modal-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <div class="modal-detail-content">
                                <span class="modal-detail-label">Due Date</span>
                                <p class="modal-info" id="modalDueDate" style="margin: 0;"></p>
                            </div>
                        </div>
                        <div class="modal-detail-item-with-icon">
                            <svg class="modal-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                            </svg>
                            <div class="modal-detail-content">
                                <span class="modal-detail-label">Status</span>
                                <div class="status-select-wrapper">
                                    <select class="status-select" id="statusSelect">
                                        <option value="pending">Pending</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    <div class="status-select-chevron">
                                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
                                            <polyline points="5 7 10 12 15 7"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-section" id="modalProgressSection" style="display: none;">
                    <h3 class="modal-section-title-with-icon">
                        <svg class="modal-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                        <span>Progress</span>
                    </h3>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" id="modalProgressFill" style="width: 0%"></div>
                        </div>
                        <div class="progress-text" id="modalProgressText">0% complete</div>
                    </div>
                </div>

                <div class="modal-section-divider"></div>

                <!-- People Section -->
                <div class="modal-section">
                    <h3 class="modal-section-title-with-icon">
                        <svg class="modal-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span>People</span>
                    </h3>
                    <div style="margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: rgba(34, 197, 94, 0.8);">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span style="font-size: 12px; color: rgba(255, 255, 255, 0.6); text-transform: uppercase; letter-spacing: 0.5px;">Creator</span>
                        </div>
                        <div class="modal-collaborators-list" id="modalCreator"></div>
                    </div>
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: rgba(59, 130, 246, 0.8);">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span style="font-size: 12px; color: rgba(255, 255, 255, 0.6); text-transform: uppercase; letter-spacing: 0.5px;">Collaborators</span>
                        </div>
                        <div class="modal-collaborators-list" id="modalCollaborators"></div>
                    </div>
                </div>

                <div class="modal-section-divider"></div>

                <!-- Attachments Section -->
                <div class="modal-section">
                    <h3 class="modal-section-title-with-icon">
                        <svg class="modal-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <span>Attachments</span>
                    </h3>
                    <div id="modalAttachments"></div>
                </div>

                <div class="modal-section-divider"></div>

                <!-- Subtasks Section -->
                <div class="modal-section">
                    <h3 class="modal-section-title-with-icon">
                        <svg class="modal-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 11 12 14 22 4"></polyline>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                        <span>Subtasks</span>
                    </h3>
                    <ul class="subtask-list" id="modalSubtasks"></ul>
                </div>
            </div>

            <!-- Actions (Full Width) -->
            <div class="modal-actions">
                <button class="delete-btn" id="deleteTaskBtn">Delete Task</button>
            </div>
        </div>
    </div>

    <!-- Attachment Preview Modal -->
    <div class="attachment-preview-modal" id="attachmentPreviewModal">
        <div class="attachment-preview-content">
            <button class="attachment-preview-close" id="attachmentPreviewClose">&times;</button>
            <div id="attachmentPreviewContent"></div>
            <div class="attachment-preview-actions" id="attachmentPreviewActions"></div>
        </div>
    </div>
@endsection

@push('scripts')
    @vite(['resources/js/projects.js'])
@endpush