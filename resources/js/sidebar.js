// Sidebar functionality
// API Base URL
const API_BASE_URL = 'http://localhost:8000/api';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // User profile dropdown toggle
    const userProfileSection = document.getElementById('userProfileSection');
    const userDropdownMenu = document.getElementById('userDropdownMenu');

    if (userProfileSection && userDropdownMenu) {
        userProfileSection.addEventListener('click', function(e) {
            e.stopPropagation();
            userProfileSection.classList.toggle('expanded');
            userDropdownMenu.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userProfileSection.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                userProfileSection.classList.remove('expanded');
                userDropdownMenu.classList.remove('show');
            }
        });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            const token = localStorage.getItem('auth_token');
            
            if (token) {
                try {
                    await fetch(`${API_BASE_URL}/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });
                } catch (error) {
                    console.error('Logout error:', error);
                }
            }
            
            // Clear auth data and redirect
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        });
    }
});
