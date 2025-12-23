// Alpine.js component for register form
window.registerForm = function() {
    return {
        email: '',
        password: '',
        confirmPassword: '',
        showPassword: false,
        showConfirmPassword: false,
        agreeTerms: false,
        loading: false,
        errorMessage: '',
        successMessage: '',
        passwordStrength: 0,
        passwordStrengthText: '',

        checkPasswordStrength() {
            let strength = 0;
            const password = this.password;
            
            if (password.length >= 8) strength++;
            if (password.length >= 12) strength++;
            if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            
            this.passwordStrength = Math.min(strength, 4);
            
            if (password.length < 8) {
                this.passwordStrengthText = 'Password must be at least 8 characters';
            } else if (this.passwordStrength <= 1) {
                this.passwordStrengthText = 'Weak password';
            } else if (this.passwordStrength <= 2) {
                this.passwordStrengthText = 'Fair password';
            } else if (this.passwordStrength <= 3) {
                this.passwordStrengthText = 'Good password';
            } else {
                this.passwordStrengthText = 'Strong password';
            }
        },

        async submitForm() {
            if (this.password !== this.confirmPassword) {
                this.errorMessage = 'Passwords do not match.';
                return;
            }

            this.loading = true;
            this.errorMessage = '';
            this.successMessage = '';

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    body: JSON.stringify({ 
                        email: this.email, 
                        password: this.password,
                        fname: this.email.split('@')[0]
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
                    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();

                // Store auth token so the user is logged in immediately
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }

                this.successMessage = 'Account created successfully! Redirecting...';

                setTimeout(() => {
                    window.location.href = '/verification-success';
                }, 1500);
                
            } catch (error) {
                console.error('Registration error:', error);
                this.errorMessage = error.message || 'Registration failed. Please try again.';
            } finally {
                this.loading = false;
            }
        }
    }
}