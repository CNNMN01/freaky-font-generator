// Unicode character mappings for the freaky font style
const normalToFreaky = Object.freeze({
    'a': '𝓪', 'b': '𝓫', 'c': '𝓬', 'd': '𝓭', 'e': '𝓮', 'f': '𝓯', 'g': '𝓰', 'h': '𝓱', 'i': '𝓲', 'j': '𝓳',
    'k': '𝓴', 'l': '𝓵', 'm': '𝓶', 'n': '𝓷', 'o': '𝓸', 'p': '𝓹', 'q': '𝓺', 'r': '𝓻', 's': '𝓼', 't': '𝓽',
    'u': '𝓾', 'v': '𝓿', 'w': '𝔀', 'x': '𝔁', 'y': '𝔂', 'z': '𝔃',
    'A': '𝓐', 'B': '𝓑', 'C': '𝓒', 'D': '𝓓', 'E': '𝓔', 'F': '𝓕', 'G': '𝓖', 'H': '𝓗', 'I': '𝓘', 'J': '𝓙',
    'K': '𝓚', 'L': '𝓛', 'M': '𝓜', 'N': '𝓝', 'O': '𝓞', 'P': '𝓟', 'Q': '𝓠', 'R': '𝓡', 'S': '𝓢', 'T': '𝓣',
    'U': '𝓤', 'V': '𝓥', 'W': '𝓦', 'X': '𝓧', 'Y': '𝓨', 'Z': '𝓩',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
});

// Error logging utility
const ErrorLogger = {
    log: function(error, context = '') {
        const timestamp = new Date().toISOString();
        const errorInfo = {
            timestamp,
            context,
            message: error.message || error,
            stack: error.stack || 'No stack trace available',
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.error('FreakFont Error:', errorInfo);
        
        // In production, you might want to send this to an error tracking service
        // this.sendToErrorService(errorInfo);
    },
    
    // Placeholder for error tracking service integration
    sendToErrorService: function(errorInfo) {
        // Example: Send to Sentry, LogRocket, or your own error tracking
        // fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorInfo) });
    }
};

// Global error handler
window.addEventListener('error', function(event) {
    ErrorLogger.log(event.error, 'Global Error Handler');
    showToast('⚠️ An unexpected error occurred. Please refresh and try again.', '#dc3545');
});

window.addEventListener('unhandledrejection', function(event) {
    ErrorLogger.log(event.reason, 'Unhandled Promise Rejection');
    showToast('⚠️ Something went wrong. Please try again.', '#dc3545');
});

// Security: Input validation and sanitization with error handling
function sanitizeInput(input) {
    try {
        // Remove any potentially harmful characters and limit length
        const maxLength = 10000; // Prevent memory exhaustion
        
        if (input === null || input === undefined) {
            return '';
        }
        
        if (typeof input !== 'string') {
            input = String(input);
        }
        
        // Truncate if too long
        if (input.length > maxLength) {
            input = input.substring(0, maxLength);
            showToast('⚠️ Text truncated to 10,000 characters for security', '#ff9800');
        }
        
        // Remove null bytes and other control characters (except common whitespace)
        input = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        return input;
    } catch (error) {
        ErrorLogger.log(error, 'sanitizeInput');
        showToast('⚠️ Error processing input. Please try again.', '#dc3545');
        return '';
    }
}

// Security: Escape HTML to prevent XSS with error handling
function escapeHtml(text) {
    try {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    } catch (error) {
        ErrorLogger.log(error, 'escapeHtml');
        return String(text).replace(/[&<>"']/g, function(match) {
            const escapeMap = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return escapeMap[match];
        });
    }
}

function convertText() {
    try {
        const inputElement = document.getElementById('input');
        const outputElement = document.getElementById('output');
        
        // Security: Validate elements exist
        if (!inputElement) {
            throw new Error('Input element not found in DOM');
        }
        if (!outputElement) {
            throw new Error('Output element not found in DOM');
        }
        
        // Check if elements are accessible
        if (inputElement.disabled || outputElement.disabled) {
            showToast('⚠️ Text fields are currently disabled', '#ff9800');
            return;
        }
        
        // Security: Sanitize input
        const rawInput = inputElement.value || '';
        
        if (rawInput.length === 0) {
            outputElement.value = '';
            return;
        }
        
        const sanitizedInput = sanitizeInput(rawInput);
        
        if (!sanitizedInput && rawInput.length > 0) {
            throw new Error('Input sanitization failed');
        }
        
        let convertedText = '';
        let conversionErrors = 0;
        
        // Convert with error tracking
        for (let i = 0; i < sanitizedInput.length; i++) {
            try {
                const char = sanitizedInput[i];
                const convertedChar = normalToFreaky[char] || char;
                convertedText += convertedChar;
            } catch (charError) {
                conversionErrors++;
                convertedText += sanitizedInput[i]; // Fallback to original character
                if (conversionErrors === 1) { // Only log first error to avoid spam
                    ErrorLogger.log(charError, `Character conversion at position ${i}`);
                }
            }
        }
        
        if (conversionErrors > 0) {
            showToast(`⚠️ ${conversionErrors} characters couldn't be converted`, '#ff9800');
        }
        
        // Security: Set value safely
        outputElement.value = convertedText;
        
        // Add animation effect with error handling
        try {
            outputElement.style.transform = 'scale(0.95)';
            setTimeout(() => {
                if (outputElement && outputElement.style) {
                    outputElement.style.transform = 'scale(1)';
                }
            }, 100);
        } catch (animationError) {
            ErrorLogger.log(animationError, 'Animation effect');
            // Animation failure shouldn't break functionality
        }
        
    } catch (error) {
        ErrorLogger.log(error, 'convertText');
        showToast('⚠️ Failed to convert text. Please try again.', '#dc3545');
        
        // Attempt to clear output on error
        try {
            const outputElement = document.getElementById('output');
            if (outputElement) {
                outputElement.value = '';
            }
        } catch (clearError) {
            ErrorLogger.log(clearError, 'convertText cleanup');
        }
    }
}

function copyText() {
    try {
        const outputElement = document.getElementById('output');
        
        // Security: Validate element exists
        if (!outputElement) {
            throw new Error('Output element not found');
        }
        
        const outputValue = outputElement.value || '';
        
        if (outputValue.trim() === '') {
            showToast('Nothing to copy! Type some text first. 😅', '#dc3545');
            return;
        }
        
        // Check for extremely large text that might cause issues
        if (outputValue.length > 50000) {
            showToast('⚠️ Text is very long. Copy may take a moment...', '#ff9800');
        }
        
        // Modern clipboard API (more secure than execCommand)
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(outputValue)
                .then(() => {
                    showToast('Text copied to clipboard! 🎉');
                })
                .catch((clipboardError) => {
                    ErrorLogger.log(clipboardError, 'Modern clipboard API');
                    // Fallback to older method
                    fallbackCopy(outputElement);
                });
        } else {
            // Fallback for older browsers or non-HTTPS
            fallbackCopy(outputElement);
        }
        
    } catch (error) {
        ErrorLogger.log(error, 'copyText');
        showToast('⚠️ Failed to copy text. Please try selecting and copying manually.', '#dc3545');
    }
}

function fallbackCopy(element) {
    try {
        if (!element) {
            throw new Error('Element is null or undefined');
        }
        
        // Check if element supports selection
        if (typeof element.select !== 'function') {
            throw new Error('Element does not support selection');
        }
        
        element.focus();
        element.select();
        
        // For mobile devices
        if (element.setSelectionRange && typeof element.setSelectionRange === 'function') {
            element.setSelectionRange(0, 99999);
        }
        
        const successful = document.execCommand('copy');
        
        if (successful) {
            showToast('Text copied to clipboard! 🎉');
        } else {
            throw new Error('execCommand copy returned false');
        }
        
    } catch (error) {
        ErrorLogger.log(error, 'fallbackCopy');
        
        // Final fallback - show manual copy instructions
        showToast('Copy failed. Please select the text and press Ctrl+C (or Cmd+C on Mac)', '#dc3545');
        
        // Try to help user by selecting the text
        try {
            if (element && element.select) {
                element.focus();
                element.select();
            }
        } catch (selectError) {
            ErrorLogger.log(selectError, 'fallbackCopy manual selection');
        }
    }
}

function clearText() {
    try {
        const inputElement = document.getElementById('input');
        const outputElement = document.getElementById('output');
        
        let errors = [];
        
        // Clear input with error handling
        if (inputElement) {
            try {
                inputElement.value = '';
                inputElement.focus();
            } catch (inputError) {
                errors.push('input');
                ErrorLogger.log(inputError, 'clearText - input');
            }
        } else {
            errors.push('input element not found');
        }
        
        // Clear output with error handling
        if (outputElement) {
            try {
                outputElement.value = '';
            } catch (outputError) {
                errors.push('output');
                ErrorLogger.log(outputError, 'clearText - output');
            }
        } else {
            errors.push('output element not found');
        }
        
        if (errors.length > 0) {
            showToast(`⚠️ Some fields couldn't be cleared: ${errors.join(', ')}`, '#ff9800');
        } else {
            showToast('Fields cleared! 🗑️', '#28a745');
        }
        
    } catch (error) {
        ErrorLogger.log(error, 'clearText');
        showToast('⚠️ Failed to clear fields. Please refresh the page.', '#dc3545');
    }
}

function showToast(message, color = '#28a745') {
    try {
        const toastElement = document.getElementById('toast');
        
        // Security: Validate element exists
        if (!toastElement) {
            console.warn('Toast element not found - falling back to alert');
            alert(message.replace(/[⚠️🎉🗑️]/g, '')); // Remove emojis for alert
            return;
        }
        
        // Security: Sanitize message
        let sanitizedMessage;
        try {
            sanitizedMessage = sanitizeInput(message);
        } catch (sanitizeError) {
            ErrorLogger.log(sanitizeError, 'showToast sanitization');
            sanitizedMessage = 'An error occurred';
        }
        
        // Use textContent for security
        toastElement.textContent = sanitizedMessage;
        
        // Security: Validate color input
        const validColors = ['#28a745', '#dc3545', '#ff9800', '#007bff'];
        const safeColor = validColors.includes(color) ? color : '#28a745';
        
        toastElement.style.backgroundColor = safeColor;
        toastElement.classList.add('show');
        
        // Auto-hide with error handling
        setTimeout(() => {
            try {
                if (toastElement && toastElement.classList) {
                    toastElement.classList.remove('show');
                }
            } catch (hideError) {
                ErrorLogger.log(hideError, 'showToast auto-hide');
            }
        }, 3000);
        
    } catch (error) {
        ErrorLogger.log(error, 'showToast');
        // Final fallback to browser alert
        try {
            alert(message.replace(/[⚠️🎉🗑️]/g, ''));
        } catch (alertError) {
            console.error('Complete toast failure:', alertError);
        }
    }
}

// Security: Rate limiting for input events with error handling
let inputTimeout;
function handleInput() {
    try {
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => {
            try {
                const inputElement = document.getElementById('input');
                if (inputElement && inputElement.value.trim() !== '') {
                    convertText();
                } else {
                    const outputElement = document.getElementById('output');
                    if (outputElement) {
                        outputElement.value = '';
                    }
                }
            } catch (timeoutError) {
                ErrorLogger.log(timeoutError, 'handleInput timeout callback');
            }
        }, 100); // Debounce input to prevent excessive processing
    } catch (error) {
        ErrorLogger.log(error, 'handleInput');
    }
}

// Enhanced DOM ready handler with comprehensive error handling
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Track initialization errors
        const initErrors = [];
        
        // Security: Validate all elements exist before adding listeners
        const inputElement = document.getElementById('input');
        const copyBtn = document.querySelector('.copy-btn');
        const clearBtn = document.querySelector('.clear-btn');
        
        // Input element setup
        if (inputElement) {
            try {
                // Rate-limited input handler
                inputElement.addEventListener('input', handleInput);
                
                // Focus on input when page loads
                inputElement.focus();
                
                // Keyboard shortcuts
                inputElement.addEventListener('keydown', function(e) {
                    try {
                        if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
                            e.preventDefault();
                            convertText();
                        }
                    } catch (keyError) {
                        ErrorLogger.log(keyError, 'Input keydown handler');
                    }
                });
                
            } catch (inputSetupError) {
                initErrors.push('input setup');
                ErrorLogger.log(inputSetupError, 'Input element setup');
            }
        } else {
            initErrors.push('input element not found');
        }
        
        // Button event listeners with error handling
        if (copyBtn) {
            try {
                copyBtn.addEventListener('click', copyText);
            } catch (copyBtnError) {
                initErrors.push('copy button');
                ErrorLogger.log(copyBtnError, 'Copy button setup');
            }
        } else {
            initErrors.push('copy button not found');
        }
        
        if (clearBtn) {
            try {
                clearBtn.addEventListener('click', clearText);
            } catch (clearBtnError) {
                initErrors.push('clear button');
                ErrorLogger.log(clearBtnError, 'Clear button setup');
            }
        } else {
            initErrors.push('clear button not found');
        }
        
        // Report initialization issues
        if (initErrors.length > 0) {
            ErrorLogger.log(new Error(`Initialization errors: ${initErrors.join(', ')}`), 'DOMContentLoaded');
            showToast(`⚠️ Some features may not work properly. Consider refreshing the page.`, '#ff9800');
        }
        
    } catch (error) {
        ErrorLogger.log(error, 'DOMContentLoaded');
        showToast('⚠️ Failed to initialize properly. Please refresh the page.', '#dc3545');
    }
});

// Security: Prevent certain global attacks with error handling
(function() {
    'use strict';
    
    try {
        // Freeze important objects to prevent tampering
        if (Object.freeze) {
            Object.freeze(normalToFreaky);
        }
        
        // Basic CSP violation reporting
        window.addEventListener('securitypolicyviolation', function(e) {
            try {
                const violation = {
                    directive: e.violatedDirective,
                    blockedURI: e.blockedURI,
                    lineNumber: e.lineNumber,
                    sourceFile: e.sourceFile
                };
                ErrorLogger.log(violation, 'CSP Violation');
            } catch (cspError) {
                console.warn('CSP violation handler error:', cspError);
            }
        });
        
    } catch (securityError) {
        ErrorLogger.log(securityError, 'Security initialization');
    }
})();

// Graceful degradation check (Less Strict Version)
(function() {
    try {
        // Check for critical browser features only
        const criticalFeatures = {
            'addEventListener': !!document.addEventListener,
            'querySelector': !!document.querySelector,
            'setTimeout': !!window.setTimeout
        };
        
        const missingCritical = Object.keys(criticalFeatures).filter(feature => !criticalFeatures[feature]);
        
        // Only warn for truly critical missing features
        if (missingCritical.length > 0) {
            const message = `Your browser doesn't support: ${missingCritical.join(', ')}. Some features may not work.`;
            ErrorLogger.log(new Error(message), 'Browser compatibility check');
            
            if (window.alert) {
                alert(message);
            }
        }
        
    } catch (compatError) {
        console.error('Compatibility check failed:', compatError);
    }
})();