<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title ?? 'Task Manager' }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js', 'resources/css/sidebar.css', 'resources/js/sidebar.js'])
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
            background: #0a0e1a;
            color: white;
            min-height: 100vh;
            display: flex;
        }

        .main-content {
            flex: 1;
            padding: 40px;
            background: #0f1623;
            overflow-y: auto;
        }
    </style>
    @stack('styles')
</head>
<body>
    <!-- Sidebar -->
    <div class="sidebar">
        <!-- User Profile Section -->
        <div class="user-profile-section" id="userProfileSection">
            <div class="user-info">
                <div class="user-avatar">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/>
                        <path d="M4 20c0-2.761 3.134-5 7-5s7 2.239 7 5"/>
                    </svg>
                </div>
                <div class="user-details">
                    <div class="user-name" id="userName">User</div>
                    <div class="user-email" id="userEmail">{{ $user->email ?? 'user@gmail.com' }}</div>
                </div>
            </div>
            <div class="chevron-icon">›</div>
        </div>

        <!-- User Dropdown Menu -->
        <div class="user-dropdown-menu" id="userDropdownMenu">
            <button class="logout-btn" id="logoutBtn">Log out</button>
        </div>

        <!-- Navigation -->
        <nav class="nav-section">
            <a href="{{ route('board') }}" class="nav-item {{ request()->routeIs('board') ? 'active' : '' }}">
                <div class="nav-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="14" height="14" rx="2"/>
                        <rect x="7" y="7" width="6" height="6" rx="1"/>
                    </svg>
                </div>
                <span>Board</span>
            </a>
            <a href="{{ route('create') }}" class="nav-item {{ request()->routeIs('create') ? 'active' : '' }}">
                <div class="nav-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="10" y1="4" x2="10" y2="16"/>
                        <line x1="4" y1="10" x2="16" y2="10"/>
                    </svg>
                </div>
                <span>Create</span>
            </a>
            <a href="{{ route('projects') }}" class="nav-item {{ request()->routeIs('projects') ? 'active' : '' }}">
                <div class="nav-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="14" height="14" rx="2"/>
                        <line x1="9" y1="3" x2="9" y2="17"/>
                    </svg>
                </div>
                <span>Project</span>
            </a>
            <a href="{{ route('calendar') }}" class="nav-item {{ request()->routeIs('calendar') ? 'active' : '' }}">
                <div class="nav-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="14" height="14" rx="2"/>
                        <line x1="3" y1="9" x2="17" y2="9"/>
                        <line x1="7" y1="4" x2="7" y2="20"/>
                    </svg>
                </div>
                <span>Calendar</span>
            </a>
        </nav>
    </div>

    <!-- Main Content -->
    <div class="main-content">
        @yield('content')
    </div>

    @stack('scripts')
</body>
</html>