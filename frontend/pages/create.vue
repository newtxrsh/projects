<template>
  <div>
    <h1 class="text-3xl font-bold text-white mb-8">Create Task</h1>
    
    <!-- Error/Success Messages -->
    <Transition name="fade">
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
        <p class="text-red-400 text-sm">{{ errorMessage }}</p>
      </div>
    </Transition>
    <Transition name="fade">
      <div v-if="successMessage" class="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
        <p class="text-emerald-400 text-sm">{{ successMessage }}</p>
      </div>
    </Transition>
    
    <div class="max-w-3xl mx-auto">
      <!-- Main task creation form - prevents default form submission -->
      <form @submit.prevent="submitTask" class="space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">Task Title *</label>
          <input 
            v-model="form.title"
            type="text" 
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-lg shadow-black/20 hover:translate-y-0.5 hover:transition-all"
            placeholder="Enter task title"
            required
          >
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">Category *</label>
          <div class="relative">
            <select 
              v-model="form.category"
              required
              class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer shadow-lg shadow-black/20 hover:translate-y-0.5 transition-all"
            >
              <option value="" disabled class="bg-[#1a1f2e]">Select a category</option>
              <option value="PERSONAL" class="bg-[#1a1f2e]">Personal</option>
              <option value="SCHOOL" class="bg-[#1a1f2e]">School</option>
              <option value="WORK" class="bg-[#1a1f2e]">Work</option>
            </select>
            <!-- Custom dropdown arrow icon -->
            <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>

        <!-- Due Date -->
        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">Due Date</label>
          <input 
            v-model="form.due_date"
            type="date" 
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-lg shadow-black/20 hover:translate-y-0.5 transition-all"
          >
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">Description</label>
          <textarea 
            v-model="form.description"
            rows="4"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none shadow-lg shadow-black/20 hover:translate-y-0.5 transition-all"
            placeholder="Enter task description"
          ></textarea>
        </div>

        <!-- Attachment -->
        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">Attachment</label>
          
          <!-- Upload Option Buttons -->
          <div class="flex gap-3 mb-3">
            <!-- Local Upload Button - triggers hidden file input -->
            <button
              type="button"
              @click="triggerFileInput"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all shadow-lg shadow-black/20 hover:-translate-y-0.5"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <span class="text-sm font-medium">Upload File</span>
            </button>
            
            <!-- Google Drive Button -->
            <button
              type="button"
              @click="openGoogleDrivePicker"
              :disabled="googlePickerLoading"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-white/10 rounded-xl text-black hover:bg-white/90 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/20 hover:-translate-y-0.5"
            >
              <!-- Google Drive logo or loading spinner -->
              <svg v-if="!googlePickerLoading" class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12.24 6.46L17.37 14.85L22.5 6.46H12.24Z" fill="#0066DA"/>
                <path d="M7.13 17.54H17.37L12.24 9.15L7.13 17.54Z" fill="#00AC47"/>
                <path d="M1.5 6.46L6.62 14.85H16.86L11.74 6.46H1.5Z" fill="#EA4335"/>
                <path d="M7.13 17.54L12.24 9.15L7.13 0.77L1.5 9.15L7.13 17.54Z" fill="#FFBA00"/>
              </svg>
              <svg v-else class="w-5 h-5 animate-spin text-white/70" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-sm font-medium">Google Drive</span>
            </button>
          </div>
          
          <input 
            ref="fileInputRef"
            type="file" 
            class="hidden"
            @change="handleFileSelect"
          >
          
          <!-- Drop Zone -->
          <div 
            class="w-full px-4 py-6 bg-white/5 border border-white/10 border-dashed rounded-xl text-center cursor-pointer hover:bg-white/8 transition-colors shadow-lg shadow-black/20"
            @click="handleDropZoneClick"
            @dragover.prevent
            @drop.prevent="handleFileDrop"
          >
            <div v-if="!selectedFile && !googleDriveFile" class="text-white/40">
              <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="text-sm">Drag and drop a file here</p>
            </div>
            
            <!-- Selected File Display -->
            <div v-else class="flex items-center justify-center gap-3">
              <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg v-if="googleDriveFile" class="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 6.46L17.37 14.85L22.5 6.46H12.24Z"/>
                  <path d="M7.13 17.54H17.37L12.24 9.15L7.13 17.54Z"/>
                  <path d="M1.5 6.46L6.62 14.85H16.86L11.74 6.46H1.5Z"/>
                </svg>
                <svg v-else-if="isImageFile(selectedFile)" class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="1.5"/>
                  <circle cx="8.5" cy="8.5" r="1.5" stroke-width="1.5"/>
                  <polyline points="21 15 16 10 5 21" stroke-width="1.5"/>
                </svg>
                <svg v-else-if="isPdfFile(selectedFile)" class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8" stroke-width="1.5"/>
                </svg>
                <svg v-else class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="text-left flex-1">
                <p class="text-sm font-medium text-blue-400">{{ selectedFile?.name || googleDriveFile?.name }}</p>
                <p class="text-xs text-white/40">{{ googleDriveFile ? 'From Google Drive' : 'Local file' }} · Click to preview</p>
              </div>
              <svg class="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </div>
          </div>
          
          <button 
            v-if="selectedFile || googleDriveFile"
            type="button"
            @click="clearSelectedFile"
            class="mt-2 text-xs text-red-400 hover:text-red-300"
          >
            Remove file
          </button>
        </div>

        <!-- Subtasks Section -->
        <div class="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg shadow-black/20">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white">Subtasks</h3>
            <button 
              type="button"
              @click="addSubtask"
                class="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-3xl text-sm font-medium hover:bg-blue-500/30 hover:shadow-lg hover:shadow-black/10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add Subtask
            </button>
          </div>
          
          <div v-if="subtasks.length === 0" class="text-center py-8 text-white/40 text-sm">
            No subtasks added yet
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="(subtask, index) in subtasks" 
              :key="subtask.id"
              class="flex items-center gap-3 p-3 bg-white/5 rounded-lg group"
            >
              <input 
                v-model="subtask.title"
                type="text"
                class="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Subtask title"
              >
              <button 
                type="button"
                @click="openSubtaskModal(index)"
                class="p-2 text-white/40 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                title="Edit subtask details"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button 
                type="button"
                @click="removeSubtask(index)"
                class="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Remove subtask"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Collaborators Section -->
        <div class="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg shadow-black/20">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white">Collaborators</h3>
            <button 
              type="button"
              @click="addCollaborator"
              class="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-3xl text-sm font-medium hover:bg-blue-500/30 transition-colors hover:shadow-lg hover:shadow-black/10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add Collaborator
            </button>
          </div>
          
          <div v-if="collaborators.length === 0" class="text-center py-8 text-white/40 text-sm">
            No collaborators added yet
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="(collab, index) in collaborators" 
              :key="collab.id"
              class="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
            >
              <div class="flex-1 relative">
                <input 
                  v-model="collab.email"
                  type="email"
                  class="w-full px-3 py-2 pr-10 bg-white/5 border rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  :class="getCollaboratorInputClass(collab)"
                  placeholder="Enter collaborator email"
                  @input="debouncedValidateCollaborator(collab)"
                >
                <!-- Validation indicators -->
                <div class="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg v-if="collab.isValidating" class="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else-if="collab.isValid === true" class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <svg v-else-if="collab.isValid === false" class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </div>
              </div>
              <button 
                type="button"
                @click="removeCollaborator(index)"
                class="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Remove collaborator"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
              <p v-if="collab.isValid === false" class="text-xs text-red-400 mt-1 absolute -bottom-5 left-0">
                User not found
              </p>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit"
          :disabled="loading"
          class="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-3xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:-translate-y-0.5"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ loading ? 'Creating...' : 'Create Task' }}</span>
        </button>
      </form>
    </div>

    <!-- Subtask Edit Modal -->
    <Teleport to="body">
      <div 
        v-if="editingSubtaskIndex !== null"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="closeSubtaskModal"
      >
        <div class="bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div class="flex items-center justify-between p-6 border-b border-white/10">
            <h3 class="text-lg font-semibold text-white">Edit Subtask</h3>
            <button 
              @click="closeSubtaskModal"
              class="text-white/40 hover:text-white/80 transition-colors text-xl leading-none"
            >
              &times;
            </button>
          </div>
          
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-white/70 mb-2">Title</label>
              <input 
                v-model="editingSubtask.title"
                type="text"
                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Subtask title"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-white/70 mb-2">Description</label>
              <textarea 
                v-model="editingSubtask.description"
                rows="3"
                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                placeholder="Subtask description"
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-white/70 mb-2">Assign Collaborators</label>
              <div class="space-y-2 max-h-40 overflow-y-auto">
                <!-- Owner (Me) option -->
                <label 
                  class="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/8 transition-colors"
                >
                  <input 
                    type="checkbox"
                    :value="authStore.currentUser?.email"
                    v-model="editingSubtask.collaborators"
                    class="w-4 h-4 rounded border-white/30 bg-transparent text-blue-500 focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all duration-200 ease-in-out checked:scale-110;"
                  >
                  <span class="text-sm text-white">Me</span>
                  <span class="text-xs text-white/40">({{ authStore.currentUser?.email }})</span>
                </label>
                <!-- Other collaborators -->
                <label 
                  v-for="collab in validCollaborators" 
                  :key="collab.id"
                  class="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/8 transition-colors"
                >
                  <input 
                    type="checkbox"
                    :value="collab.email"
                    v-model="editingSubtask.collaborators"
                    class="w-4 h-4 rounded border-white/30 bg-transparent text-blue-500 focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all duration-200 ease-in-out checked:scale-110;"
                  >
                  <span class="text-sm text-white">{{ collab.email }}</span>
                </label>
                <p v-if="validCollaborators.length === 0" class="text-sm text-white/40 text-center py-2">
                  Add collaborators to the task to assign them to subtasks
                </p>
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-end gap-3 p-6 border-t border-white/10">
            <button 
              type="button"
              @click="closeSubtaskModal"
              class="px-4 py-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button 
              type="button"
              @click="saveSubtaskEdit"
              class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- File Preview Modal -->
    <Teleport to="body">
      <div 
        v-if="showPreviewModal"
        class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="closePreviewModal"
      >
        <div class="bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div class="flex items-center justify-between p-4 border-b border-white/10">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <svg v-if="googleDriveFile" class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 6.46L17.37 14.85L22.5 6.46H12.24Z"/>
                  <path d="M7.13 17.54H17.37L12.24 9.15L7.13 17.54Z"/>
                  <path d="M1.5 6.46L6.62 14.85H16.86L11.74 6.46H1.5Z"/>
                </svg>
                <svg v-else-if="isImageFile(selectedFile)" class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="1.5"/>
                  <circle cx="8.5" cy="8.5" r="1.5" stroke-width="1.5"/>
                  <polyline points="21 15 16 10 5 21" stroke-width="1.5"/>
                </svg>
                <svg v-else-if="isPdfFile(selectedFile)" class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8" stroke-width="1.5"/>
                </svg>
                <svg v-else class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13 2 13 9 20 9" stroke-width="1.5"/>
                </svg>
              </div>
              <div>
                <h3 class="text-white font-medium">{{ selectedFile?.name || googleDriveFile?.name }}</h3>
                <p class="text-xs text-white/40">{{ googleDriveFile ? 'Google Drive file' : 'Local file' }}</p>
              </div>
            </div>
            <button 
              @click="closePreviewModal"
              class="text-white/40 hover:text-white/80 transition-colors text-xl leading-none p-2"
            >
              &times;
            </button>
          </div>
          <div class="p-4 flex items-center justify-center min-h-[400px] max-h-[70vh] overflow-auto bg-black/20">
            <!-- Local file preview -->
            <template v-if="selectedFile">
              <img 
                v-if="isImageFile(selectedFile)"
                :src="localFilePreviewUrl"
                :alt="selectedFile.name"
                class="max-w-full max-h-full object-contain rounded-lg"
              />
              <iframe 
                v-else-if="isPdfFile(selectedFile)"
                :src="localFilePreviewUrl"
                class="w-full h-[60vh] rounded-lg"
              />
              <div v-else class="text-center text-white/60">
                <svg class="w-16 h-16 mx-auto mb-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13 2 13 9 20 9" stroke-width="1.5"/>
                </svg>
                <p class="text-lg font-medium mb-2">{{ selectedFile.name }}</p>
                <p class="text-sm text-white/40">Preview not available for this file type</p>
                <p class="text-xs text-white/30 mt-1">{{ getFileExtension(selectedFile.name).toUpperCase() }} File · {{ formatFileSize(selectedFile.size) }}</p>
              </div>
            </template>
            <!-- Google Drive file preview -->
            <template v-else-if="googleDriveFile">
              <div class="text-center text-white/60">
                <svg class="w-16 h-16 mx-auto mb-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 6.46L17.37 14.85L22.5 6.46H12.24Z"/>
                  <path d="M7.13 17.54H17.37L12.24 9.15L7.13 17.54Z"/>
                  <path d="M1.5 6.46L6.62 14.85H16.86L11.74 6.46H1.5Z"/>
                </svg>
                <p class="text-lg font-medium mb-2">{{ googleDriveFile.name }}</p>
                <p class="text-sm text-white/40 mb-3">
                  {{ isGoogleNativeFile(googleDriveFile.mimeType) 
                    ? 'This is a Google ' + getGoogleFileType(googleDriveFile.mimeType) + '. It will be converted to PDF when attached.' 
                    : 'Google Drive file' }}
                </p>
                <p class="text-xs text-white/30">Preview will be available after task creation</p>
              </div>
            </template>
          </div>
          <div class="flex items-center justify-between p-4 border-t border-white/10">
            <button 
              @click="replaceFile"
              class="px-4 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Replace File
            </button>
            <button 
              @click="closePreviewModal"
              class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// SEO Meta
useHead({
  title: 'Create Task',
  meta: [
    { name: 'description', content: 'Create a new task with title, description, due date, subtasks, and collaborators.' },
    { property: 'og:title', content: 'Create Task | Task Manager' },
    { property: 'og:description', content: 'Create and organize new tasks with subtasks and collaborators.' },
  ],
})

const config = useRuntimeConfig()
const authStore = useAuthStore()
const { checkUser } = useApi() // API method to validate if a user exists by email
const toast = useToast() // Toast notification composable

// Google Drive Picker
interface GoogleDriveFile {
  id: string // Google Drive file ID
  name: string // File name
  mimeType: string // MIME type (e.g., 'application/pdf', 'application/vnd.google-apps.document')
  url: string // Google Drive URL to the file
}

// Currently selected Google Drive file (null if none selected)
const googleDriveFile = ref<GoogleDriveFile | null>(null)
// Loading state for Google Drive picker
const googlePickerLoading = ref(false)

const { openPicker, isLoading: pickerLoading, selectedFile: pickerSelectedFile, accessToken: driveAccessToken } = useGooglePicker({
  // Called when user selects a file from Google Drive
  onSelect: (file) => {
    googleDriveFile.value = file
    selectedFile.value = null // Clear local file if Drive file selected
    googlePickerLoading.value = false
    toast.success('File selected from Google Drive')
  },
  // Called when user cancels the picker
  onCancel: () => {
    googlePickerLoading.value = false
  },
  // Called when an error occurs
  onError: (error) => {
    googlePickerLoading.value = false
    // Only show error if it's not a user cancellation
    const errorMsg = error.message || ''
    if (!errorMsg.includes('cancelled') && !errorMsg.includes('popup_closed')) {
      toast.error('Failed to open Google Drive: ' + errorMsg)
    }
  },
})

const openGoogleDrivePicker = async () => {
  googlePickerLoading.value = true
  try {
    await openPicker()
  } catch (error) {
    // Catch any unhandled errors and reset loading state
    googlePickerLoading.value = false
  }
}

const clearSelectedFile = () => {
  selectedFile.value = null
  googleDriveFile.value = null
  // Clean up object URL to prevent memory leaks
  if (localFilePreviewUrl.value) {
    URL.revokeObjectURL(localFilePreviewUrl.value)
    localFilePreviewUrl.value = ''
  }
}

// ==========================================
// FORM STATE
// ==========================================

const loading = ref(false) // Form submission loading state
const successMessage = ref('') // Success message after task creation
const errorMessage = ref('') // Error message for validation/API errors
const selectedFile = ref<File | null>(null) // Currently selected local file
const fileInputRef = ref<HTMLInputElement | null>(null) // Reference to hidden file input
const showPreviewModal = ref(false) // Controls visibility of file preview modal
const localFilePreviewUrl = ref('') // Object URL for local file preview

// Interfaces
interface Subtask {
  id: string // Temporary ID for Vue list key
  title: string // Subtask title
  description: string // Subtask description
  collaborators: string[] // Array of collaborator emails assigned to this subtask
}

interface Collaborator {
  id: string
  email: string
  isValid: boolean | null
  isValidating: boolean
}

// Form state
const form = reactive({
  title: '',
  description: '',
  category: '',
  due_date: '',
  status: 'pending',
})

const subtasks = ref<Subtask[]>([])
const collaborators = ref<Collaborator[]>([])

// Subtask modal state
const editingSubtaskIndex = ref<number | null>(null)
const editingSubtask = reactive({
  title: '',
  description: '',
  collaborators: [] as string[],
})

// Computed
const validCollaborators = computed(() => 
  collaborators.value.filter(c => c.isValid === true && c.email.trim())
)

// Methods
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const generateId = () => Math.random().toString(36).substr(2, 9)

const addSubtask = () => {
  subtasks.value.push({
    id: generateId(),
    title: '',
    description: '',
    collaborators: [],
  })
}

const removeSubtask = (index: number) => {
  subtasks.value.splice(index, 1)
}

const openSubtaskModal = (index: number) => {
  editingSubtaskIndex.value = index
  const subtask = subtasks.value[index]
  editingSubtask.title = subtask.title
  editingSubtask.description = subtask.description
  editingSubtask.collaborators = [...subtask.collaborators]
}

const closeSubtaskModal = () => {
  editingSubtaskIndex.value = null
}

const saveSubtaskEdit = () => {
  if (editingSubtaskIndex.value !== null) {
    const subtask = subtasks.value[editingSubtaskIndex.value]
    subtask.title = editingSubtask.title
    subtask.description = editingSubtask.description
    subtask.collaborators = [...editingSubtask.collaborators]
  }
  closeSubtaskModal()
}

const addCollaborator = () => {
  collaborators.value.push({
    id: generateId(),
    email: '',
    isValid: null,
    isValidating: false,
  })
}

const removeCollaborator = (index: number) => {
  collaborators.value.splice(index, 1)
}

// Debounced validation
let validationTimeouts: Record<string, ReturnType<typeof setTimeout>> = {}

const debouncedValidateCollaborator = (collab: Collaborator) => {
  // Clear previous timeout
  if (validationTimeouts[collab.id]) {
    clearTimeout(validationTimeouts[collab.id])
  }
  
  // Reset state
  collab.isValid = null
  collab.isValidating = false
  
  const email = collab.email.trim()
  if (!email || !email.includes('@')) return
  
  collab.isValidating = true
  
  validationTimeouts[collab.id] = setTimeout(async () => {
    try {
      const result = await checkUser(email)
      collab.isValid = result?.exists === true
    } catch (error) {
      collab.isValid = false
    } finally {
      collab.isValidating = false
    }
  }, 500)
}

const getCollaboratorInputClass = (collab: Collaborator) => {
  if (collab.isValid === true) return 'border-green-500/50'
  if (collab.isValid === false) return 'border-red-500/50'
  return 'border-white/10'
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files?.length) {
    selectedFile.value = target.files[0]
    googleDriveFile.value = null // Clear Google Drive file if local file selected
  }
}

const handleFileDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files?.length) {
    selectedFile.value = event.dataTransfer.files[0]
    googleDriveFile.value = null // Clear Google Drive file if local file dropped
  }
}

// File preview helpers
const isImageFile = (file: File | null) => {
  if (!file) return false
  const ext = getFileExtension(file.name).toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)
}

const isPdfFile = (file: File | null) => {
  if (!file) return false
  const ext = getFileExtension(file.name).toLowerCase()
  return ext === 'pdf'
}

const getFileExtension = (filename: string) => {
  return filename.split('.').pop() || ''
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const isGoogleNativeFile = (mimeType: string) => {
  return mimeType.startsWith('application/vnd.google-apps')
}

const getGoogleFileType = (mimeType: string) => {
  if (mimeType.includes('document')) return 'Doc'
  if (mimeType.includes('spreadsheet')) return 'Sheet'
  if (mimeType.includes('presentation')) return 'Slides'
  if (mimeType.includes('drawing')) return 'Drawing'
  if (mimeType.includes('form')) return 'Form'
  return 'File'
}

const handleDropZoneClick = () => {
  if (selectedFile.value || googleDriveFile.value) {
    // File is attached, open preview modal
    openPreviewModal()
  } else {
    // No file attached, trigger file input
    triggerFileInput()
  }
}

const openPreviewModal = () => {
  if (selectedFile.value) {
    // Create object URL for local file preview
    localFilePreviewUrl.value = URL.createObjectURL(selectedFile.value)
  }
  showPreviewModal.value = true
}

const closePreviewModal = () => {
  showPreviewModal.value = false
  // Revoke object URL to free memory (but keep it for display while modal is open)
  if (localFilePreviewUrl.value && !selectedFile.value) {
    URL.revokeObjectURL(localFilePreviewUrl.value)
    localFilePreviewUrl.value = ''
  }
}

const replaceFile = () => {
  closePreviewModal()
  triggerFileInput()
}

const submitTask = async () => {
  // Validate category
  if (!form.category) {
    errorMessage.value = 'Please select a category.'
    return
  }
  
  // Check for invalid collaborators
  const invalidCollabs = collaborators.value.filter(c => 
    c.email.trim() && c.email.includes('@') && (c.isValid === false || c.isValidating)
  )
  
  if (invalidCollabs.length > 0) {
    errorMessage.value = 'Please add valid emails for all collaborators.'
    return
  }
  
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    // Build form data for file upload support
    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description || '')
    formData.append('category', form.category)
    if (form.due_date) formData.append('due_date', form.due_date)
    formData.append('status', 'pending')
    
    // Add subtasks as JSON
    const subtasksData = subtasks.value
      .filter(s => s.title.trim())
      .map(s => ({
        title: s.title.trim(),
        status: 'pending',
        description: s.description || '',
        collaborators: s.collaborators || [],
      }))
    
    if (subtasksData.length > 0) {
      formData.append('subtasks', JSON.stringify(subtasksData))
    }
    
    // Add collaborators as JSON
    const collaboratorsData = collaborators.value
      .filter(c => c.email.trim() && c.isValid === true)
      .map(c => c.email.trim())
    
    if (collaboratorsData.length > 0) {
      formData.append('collaborators', JSON.stringify(collaboratorsData))
    }
    
    // Add file if selected (local file)
    if (selectedFile.value) {
      formData.append('attachment', selectedFile.value)
    }
    
    // Add Google Drive file info if selected
    if (googleDriveFile.value) {
      formData.append('google_drive_file', JSON.stringify({
        id: googleDriveFile.value.id,
        name: googleDriveFile.value.name,
        mimeType: googleDriveFile.value.mimeType,
        accessToken: driveAccessToken.value,
      }))
    }
    
    // Make request
    const response = await fetch(`${config.public.apiBase}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to create task')
    }
    
    successMessage.value = 'Task created successfully!'
    toast.success('Task created successfully!')
    
    // Clear form
    clearSelectedFile()
    
    // Redirect based on collaborators
    const hasCollaborators = collaboratorsData.length > 0
    setTimeout(() => {
      navigateTo(hasCollaborators ? '/projects' : '/')
    }, 1500)
  } catch (error: any) {
    errorMessage.value = error?.message || 'Failed to create task. Please try again.'
    toast.error(error?.message || 'Failed to create task')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Style the date input */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

/* Custom checkbox styling */
input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.25rem;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  position: relative;
}

input[type="checkbox"]:checked {
  background: #3b82f6;
  border-color: #3b82f6;
}

input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 0px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
</style>
