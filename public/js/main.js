/**
 * Main JavaScript file for Office Management System
 * Handles UI interactions, mobile menu, and common functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu functionality
    initMobileMenu();
    
    // Initialize form validations
    initFormValidations();
    
    // Initialize tooltips and other UI enhancements
    initUIEnhancements();
});

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebar-close');
    const overlay = document.getElementById('mobile-menu-overlay');

    if (mobileMenuButton && sidebar) {
        // Open mobile menu
        mobileMenuButton.addEventListener('click', () => {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
            document.body.classList.add('overflow-hidden'); // Prevent scrolling of main content
            document.body.classList.add('lg:overflow-auto'); // Allow scrolling on larger screens
        });

        // Close mobile menu
        const closeMobileMenu = () => {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            document.body.classList.remove('lg:overflow-auto');
        };

        sidebarClose?.addEventListener('click', closeMobileMenu);
        overlay?.addEventListener('click', closeMobileMenu);

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMobileMenu();
            }
        });

        // Handle resize to ensure sidebar state is correct on desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) { // Equivalent to Tailwind's lg breakpoint
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
                document.body.classList.remove('lg:overflow-auto');
            } else {
                // If resized to mobile, ensure sidebar is hidden unless opened by button
                sidebar.classList.add('-translate-x-full');
                // Do not hide overlay if it was already open on mobile before resize
                // overlay.classList.add('hidden'); // This might close the overlay unintentionally
            }
        });
    }
}

/**
 * Initialize form validations
 */
function initFormValidations() {
    const forms = document.querySelectorAll('form[data-validate="true"]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    });
}

/**
 * Validate entire form
 */
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Validate individual field
 */
function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;
    
    // Clear previous errors
    clearFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (fieldType === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Phone validation
    if (fieldName === 'phone' && value) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }
    
    // Salary validation
    if (fieldName === 'salary' && value) {
        if (isNaN(value) || parseFloat(value) < 0) {
            showFieldError(field, 'Please enter a valid salary amount');
            return false;
        }
    }
    
    // Date validation
    if (fieldType === 'date' && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        
        if (fieldName === 'hireDate' && selectedDate > today) {
            showFieldError(field, 'Hire date cannot be in the future');
            return false;
        }
    }
    
    return true;
}

/**
 * Show field error
 */
function showFieldError(field, message) {
    field.classList.add('border-red-500', 'focus:ring-red-500');
    field.classList.remove('border-gray-300', 'focus:ring-indigo-500', 'focus:border-indigo-500');
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('p');
        errorElement.className = 'field-error text-sm text-red-600 mt-1';
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

/**
 * Clear field error
 */
function clearFieldError(field) {
    field.classList.remove('border-red-500', 'focus:ring-red-500');
    field.classList.add('border-gray-300', 'focus:ring-indigo-500', 'focus:border-indigo-500');
    
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

/**
 * Initialize UI enhancements
 */
function initUIEnhancements() {
    // Initialize delete confirmations
    initDeleteConfirmations();
    
    // Initialize search functionality
    initSearchFunctionality();
    
    // Initialize auto-hide flash messages
    initAutoHideFlashMessages();
}

/**
 * Initialize delete confirmations
 */
function initDeleteConfirmations() {
    const deleteButtons = document.querySelectorAll('[data-confirm-delete]');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const message = this.getAttribute('data-confirm-delete') || 
                          'Are you sure you want to delete this item? This action cannot be undone.';
            
            if (confirm(message)) {
                const form = this.closest('form');
                if (form) {
                    form.submit();
                } else {
                    // Handle direct link deletion
                    window.location.href = this.href;
                }
            }
        });
    });
}

/**
 * Initialize search functionality
 */
function initSearchFunctionality() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    
    if (searchForm && searchInput) {
        // Auto-submit search form on input (with debounce)
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.length >= 2 || this.value.length === 0) {
                    searchForm.submit();
                }
            }, 500);
        });
    }
}

/**
 * Initialize auto-hide flash messages
 */
function initAutoHideFlashMessages() {
    const flashMessages = document.querySelectorAll('.fade-in[class*="alert"]');
    
    flashMessages.forEach(message => {
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
    });
}

/**
 * Utility function to show loading state
 */
function showLoading(element, text = 'Loading...') {
    const originalText = element.textContent;
    const originalHTML = element.innerHTML;
    
    element.disabled = true;
    element.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${text}`;
    
    return () => {
        element.disabled = false;
        element.innerHTML = originalHTML;
    };
}

/**
 * Utility function to show toast notification
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    
    toast.className = `fixed top-4 right-4 ${bgClass} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Slide in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);
    
    // Auto hide
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

/**
 * Format currency for display
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Format date for display
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Export functions for use in other scripts
window.OMSUtils = {
    showLoading,
    showToast,
    formatCurrency,
    formatDate,
    validateField,
    clearFieldError,
    showFieldError
};