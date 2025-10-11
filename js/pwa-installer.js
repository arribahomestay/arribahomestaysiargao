// PWA Installation Prompt and Management

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        // Check if already installed
        this.checkInstallationStatus();
        
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('PWA: beforeinstallprompt event fired');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Listen for appinstalled event
        window.addEventListener('appinstalled', () => {
            console.log('PWA: App was installed');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showInstallationSuccess();
        });

        // Check if running as PWA
        this.checkPWAStatus();
    }

    checkInstallationStatus() {
        // Check if running in standalone mode (PWA)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('PWA: Running as installed app');
        }

        // Check for iOS PWA
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('PWA: Running as iOS PWA');
        }
    }

    checkPWAStatus() {
        // Check if running as PWA
        const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone === true ||
                      document.referrer.includes('android-app://');

        if (isPWA) {
            document.body.classList.add('pwa-mode');
            console.log('PWA: Running in PWA mode');
        }
    }

    showInstallButton() {
        // Create install button if it doesn't exist
        if (!document.getElementById('pwa-install-btn')) {
            const installButton = document.createElement('button');
            installButton.id = 'pwa-install-btn';
            installButton.className = 'pwa-install-button';
            installButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Install App
            `;
            
            // Add click handler
            installButton.addEventListener('click', () => {
                this.installApp();
            });

            // Add to page
            document.body.appendChild(installButton);

            // Add CSS for the button
            this.addInstallButtonCSS();
        }
    }

    hideInstallButton() {
        const installButton = document.getElementById('pwa-install-btn');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    async installApp() {
        if (!this.deferredPrompt) {
            // For iOS, show instructions
            this.showIOSInstructions();
            return;
        }

        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`PWA: User choice: ${outcome}`);
            
            if (outcome === 'accepted') {
                console.log('PWA: User accepted the install prompt');
            } else {
                console.log('PWA: User dismissed the install prompt');
            }
            
            // Clear the deferred prompt
            this.deferredPrompt = null;
            this.hideInstallButton();
            
        } catch (error) {
            console.error('PWA: Error during installation:', error);
        }
    }

    showIOSInstructions() {
        // Create iOS installation instructions modal
        const modal = document.createElement('div');
        modal.className = 'pwa-install-modal';
        modal.innerHTML = `
            <div class="pwa-install-modal-content">
                <div class="pwa-install-modal-header">
                    <h3>Install Arriba Homestay App</h3>
                    <button class="pwa-install-modal-close">&times;</button>
                </div>
                <div class="pwa-install-modal-body">
                    <div class="pwa-install-steps">
                        <div class="pwa-install-step">
                            <div class="pwa-install-step-number">1</div>
                            <div class="pwa-install-step-content">
                                <strong>Tap the Share button</strong>
                                <p>Look for the share icon in Safari's bottom toolbar</p>
                            </div>
                        </div>
                        <div class="pwa-install-step">
                            <div class="pwa-install-step-number">2</div>
                            <div class="pwa-install-step-content">
                                <strong>Scroll down and tap "Add to Home Screen"</strong>
                                <p>You'll see this option in the share menu</p>
                            </div>
                        </div>
                        <div class="pwa-install-step">
                            <div class="pwa-install-step-number">3</div>
                            <div class="pwa-install-step-content">
                                <strong>Tap "Add" to install</strong>
                                <p>The app will appear on your home screen</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="pwa-install-modal-footer">
                    <button class="pwa-install-modal-close-btn">Got it!</button>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.appendChild(modal);

        // Add CSS for modal
        this.addModalCSS();

        // Add close handlers
        const closeButtons = modal.querySelectorAll('.pwa-install-modal-close, .pwa-install-modal-close-btn');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                modal.remove();
            });
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showInstallationSuccess() {
        // Show success message
        const successToast = document.createElement('div');
        successToast.className = 'pwa-success-toast';
        successToast.innerHTML = `
            <div class="pwa-success-content">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22,4 12,14.01 9,11.01"></polyline>
                </svg>
                <span>App installed successfully!</span>
            </div>
        `;

        document.body.appendChild(successToast);

        // Add CSS for toast
        this.addToastCSS();

        // Remove after 3 seconds
        setTimeout(() => {
            successToast.remove();
        }, 3000);
    }

    addInstallButtonCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .pwa-install-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #3498db, #2c3e50);
                color: white;
                border: none;
                border-radius: 50px;
                padding: 12px 20px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(52, 152, 219, 0.3);
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                animation: pwa-install-pulse 2s infinite;
            }

            .pwa-install-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(52, 152, 219, 0.4);
            }

            .pwa-install-button svg {
                width: 20px;
                height: 20px;
            }

            @keyframes pwa-install-pulse {
                0% { box-shadow: 0 4px 20px rgba(52, 152, 219, 0.3); }
                50% { box-shadow: 0 4px 20px rgba(52, 152, 219, 0.6); }
                100% { box-shadow: 0 4px 20px rgba(52, 152, 219, 0.3); }
            }

            @media screen and (max-width: 768px) {
                .pwa-install-button {
                    bottom: 15px;
                    right: 15px;
                    padding: 10px 16px;
                    font-size: 13px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    addModalCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .pwa-install-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
            }

            .pwa-install-modal-content {
                background: white;
                border-radius: 15px;
                max-width: 400px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
            }

            .pwa-install-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 20px 0;
            }

            .pwa-install-modal-header h3 {
                margin: 0;
                color: #2c3e50;
                font-size: 1.5rem;
            }

            .pwa-install-modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6c757d;
            }

            .pwa-install-modal-body {
                padding: 20px;
            }

            .pwa-install-steps {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .pwa-install-step {
                display: flex;
                align-items: flex-start;
                gap: 15px;
            }

            .pwa-install-step-number {
                background: #3498db;
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                flex-shrink: 0;
            }

            .pwa-install-step-content strong {
                display: block;
                color: #2c3e50;
                margin-bottom: 5px;
            }

            .pwa-install-step-content p {
                color: #6c757d;
                margin: 0;
                font-size: 0.9rem;
            }

            .pwa-install-modal-footer {
                padding: 0 20px 20px;
            }

            .pwa-install-modal-close-btn {
                width: 100%;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.3s ease;
            }

            .pwa-install-modal-close-btn:hover {
                background: #2980b9;
            }
        `;
        document.head.appendChild(style);
    }

    addToastCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .pwa-success-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #27ae60;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(39, 174, 96, 0.3);
                z-index: 10000;
                animation: pwa-toast-slide-in 0.3s ease;
            }

            .pwa-success-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .pwa-success-content svg {
                width: 24px;
                height: 24px;
            }

            @keyframes pwa-toast-slide-in {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @media screen and (max-width: 768px) {
                .pwa-success-toast {
                    top: 15px;
                    right: 15px;
                    left: 15px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize PWA installer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PWAInstaller();
});
