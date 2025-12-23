// Alpine.js component for login form
window.loginForm = function() {
    return {
        email: '',
        password: '',
        remember: false,
        showPassword: false,
        loading: false,
        errorMessage: '',
        successMessage: '',

        async submitForm() {
            this.loading = true;
            this.errorMessage = '';
            this.successMessage = '';

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    body: JSON.stringify({ 
                        email: this.email, 
                        password: this.password 
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('auth_token', data.token);
                    this.successMessage = 'Login successful!';
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1000);
                } else {
                    this.errorMessage = data.message || 'Login failed. Please try again.';
                }
            } catch (error) {
                this.errorMessage = "We couldn't find an account with that email. Please check your email and try again.";
            } finally {
                this.loading = false;
            }
        }
    }
}