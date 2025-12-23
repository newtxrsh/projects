// Alpine.js component for verification success page
window.successPage = function() {
    return {
        countdown: 3,
        initialCountdown: 3,
        timer: null,

        init() {
            // User is already logged in (token stored after registration)
            this.timer = setInterval(() => {
                this.countdown--;
                if (this.countdown <= 0) {
                    clearInterval(this.timer);
                    window.location.href = '/';
                }
            }, 1000);
        },

        storeToken() {
            // No-op: token is already stored during registration
        }
    }
}