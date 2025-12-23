<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Successfully Created!</title>
    <script src="https://cdn.tailwindcss.com"></script>
    @vite([
        'resources/css/app.css',
        'resources/css/auth/verification-success.css',
        'resources/js/auth/verification-success.js',
        // Load Alpine bootstrap after page components so x-data functions exist when Alpine starts
        'resources/js/app.js',
    ])
</head>
<body class="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-4 font-sans antialiased">
    
    <!-- Decorative background elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Confetti Animation -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden" x-data="{ show: true }" x-show="show" x-init="setTimeout(() => show = false, 4000)">
        <div class="confetti-container">
            <template x-for="i in 50">
                <div class="confetti" :style="`left: ${Math.random() * 100}%; animation-delay: ${Math.random() * 3}s; background-color: ${['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]}`"></div>
            </template>
        </div>
    </div>

    <div class="w-full max-w-lg relative z-10" x-data="successPage()">
        <!-- Card Container -->
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10 text-center">
            
            <!-- Animated Success Icon -->
            <div class="relative mx-auto w-28 h-28 mb-8">
                <div class="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-lg shadow-emerald-500/30"></div>
                <div class="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full animate-ping opacity-20"></div>
                <div class="relative flex items-center justify-center w-full h-full">
                    <svg class="w-14 h-14 text-white checkmark-animate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>
            </div>

            <!-- Title -->
            <h1 class="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">Account Successfully Created!</h1>
            <p class="text-white/70 text-lg mb-8">Your account has been successfully created.</p>

            <!-- Welcome Card -->
            <div class="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6 mb-8">
                <div class="flex items-center justify-center gap-3 mb-3">
                    <svg class="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <h3 class="text-white font-semibold text-lg">Welcome aboard!</h3>
                </div>
                <p class="text-white/70 text-sm leading-relaxed">
                    You're all set! Explore your dashboard, manage your tasks, and make the most of all the features available to you.
                </p>
            </div>

            <!-- Auto-redirect countdown -->
            <div class="mb-6">
                <p class="text-white/50 text-sm mb-4">
                    Redirecting in <span class="text-white font-semibold" x-text="countdown"></span> seconds...
                </p>
                <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000 ease-linear"
                         :style="`width: ${(countdown / initialCountdown) * 100}%`"></div>
                </div>
            </div>

            <!-- Action Button -->
            <a href="/" 
               @click="storeToken"
               class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200">
                <span>Go to Dashboard</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
            </a>
        </div>
    </div>

    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</body>
</html>
