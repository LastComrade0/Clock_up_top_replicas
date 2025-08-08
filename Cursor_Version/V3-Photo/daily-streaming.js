// Daily.co streaming manager for stretching sessions
class DailyStretchingManager {
    constructor() {
        this.dailyCall = null;
        this.roomUrl = null;
        this.sessionActive = false;
        this.DAILY_API_KEY = 'YOUR_DAILY_API_KEY'; // Replace with your Daily.co API key
        this.timerInterval = null;
        this.joinInProgress = false;
        this.teardownInProgress = false;
        this.listenersAttached = false;
    }

    async initializeDaily() {
        try {
            await this.loadDailyScript();
            console.log('Daily.co initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Daily.co:', error);
            return false;
        }
    }

    async loadDailyScript() {
        // Avoid loading the SDK more than once
        if (window.DailyIframe) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            const existing = document.querySelector('script[src="https://unpkg.com/@daily-co/daily-js"]');
            if (existing) {
                existing.addEventListener('load', resolve, { once: true });
                existing.addEventListener('error', reject, { once: true });
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@daily-co/daily-js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async createRoom() {
        try {
            // Use a simple room URL without API key requirement
            // This creates a temporary room that anyone can join
            const roomName = `stretch-session-${Date.now()}`;
            this.roomUrl = `https://your-domain.daily.co/${roomName}`;
            
            // For now, let's use a demo room that doesn't require API key
            // You can replace this with your own Daily.co domain later
            this.roomUrl = 'https://demo.daily.co/hello';
            
            console.log('Using demo room URL:', this.roomUrl);
            
            return {
                url: this.roomUrl,
                name: roomName
            };
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    }

    async joinSession(roomUrl = null) {
        try {
            if (this.joinInProgress || this.teardownInProgress) {
                console.warn('Join requested while another operation is in progress. Ignoring.');
                return;
            }

            this.joinInProgress = true;

            // Get current user from your custom Firebase setup (optional for display)
            const currentUser = window.firebase?.auth?.currentUser;
            let userName = 'Anonymous';
            
            if (currentUser) {
                userName = currentUser.user || currentUser.email || 'Anonymous';
            }

            // Use a simple demo room for testing
            this.roomUrl = 'https://demo.daily.co/hello';

            const container = document.getElementById('daily-video-container');
            if (!container) {
                throw new Error('Video container not found');
            }

            // Create the frame only once; reuse it on subsequent joins
            if (!this.dailyCall) {
                console.log('Creating Daily.co frame');
                this.dailyCall = window.DailyIframe.createFrame(container, {
                    url: this.roomUrl,
                    userName: userName,
                    showLeaveButton: true,
                    showFullscreenButton: true,
                    showLocalVideo: true,
                    showParticipantsBar: true
                });

                if (!this.listenersAttached) {
                    this.dailyCall.on('participant-joined', this.updateParticipantList.bind(this));
                    this.dailyCall.on('participant-left', this.updateParticipantList.bind(this));
                    this.dailyCall.on('left-meeting', () => {
                        this.sessionActive = false;
                        const sessionUI = document.getElementById('stretching-session-ui');
                        if (sessionUI) sessionUI.style.display = 'none';
                        // Do not destroy; keep frame for reuse
                    });
                    this.listenersAttached = true;
                }
            } else {
                console.log('Reusing existing Daily.co frame');
                // Ensure the iframe is attached in case container was cleared
                if (!container.contains(this.dailyCall.iframe())) {
                    container.innerHTML = '';
                    container.appendChild(this.dailyCall.iframe());
                }
                // Optionally update user name if API is available
                if (typeof this.dailyCall.setUserName === 'function') {
                    try { await this.dailyCall.setUserName(userName); } catch {}
                }
            }

            console.log('Joining Daily.co room:', this.roomUrl);
            await this.dailyCall.join();
            this.sessionActive = true;
            this.startSessionTimer();
            this.updateParticipantList();
        } catch (error) {
            console.error('Error joining session:', error);
            throw error;
        } finally {
            this.joinInProgress = false;
        }
    }

    async leaveSession() {
        try {
            // Clear timer if running
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }

            if (this.dailyCall) {
                try { await this.dailyCall.leave(); } catch {}
            }

            // Reset session state but keep the frame for reuse
            this.sessionActive = false;

            // Hide the session UI
            const sessionUI = document.getElementById('stretching-session-ui');
            if (sessionUI) {
                sessionUI.style.display = 'none';
            }
            
            console.log('Left meeting; frame retained for reuse');
        } catch (error) {
            console.error('Error leaving session:', error);
            // Fallback: hide UI and reset flag
            this.sessionActive = false;
            const sessionUI = document.getElementById('stretching-session-ui');
            if (sessionUI) {
                sessionUI.style.display = 'none';
            }
        }
    }

    async _teardownCall() {
        if (this.teardownInProgress) return;
        this.teardownInProgress = true;

        // Clear timer if running
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Prefer this.dailyCall, else check for any global instance
        const call = this.dailyCall || (window.DailyIframe?.getCallInstance?.() || null);
        if (call) {
            try {
                call.off('participant-joined');
                call.off('participant-left');
                call.off('left-meeting');
            } catch {}
            try {
                await call.leave();
            } catch {}
            try {
                call.destroy();
            } catch {}
        }

        // Clear the container
        const container = document.getElementById('daily-video-container');
        if (container) {
            container.innerHTML = '';
        }

        // Reset state
        this.sessionActive = false;
        this.dailyCall = null;
        this.roomUrl = null;

        // Small delay to let Daily cleanup globals
        await new Promise((r) => setTimeout(r, 50));
        this.teardownInProgress = false;
    }

    updateParticipantList() {
        if (!this.dailyCall) return;

        const participants = this.dailyCall.participants();
        const participantCount = Object.keys(participants).length;
        
        // Update participant count
        const countElement = document.getElementById('participant-count');
        if (countElement) {
            countElement.textContent = participantCount;
        }

        // Update participant list
        const listElement = document.getElementById('stretch-online-users');
        if (listElement) {
            listElement.innerHTML = '';
            Object.values(participants).forEach(participant => {
                const li = document.createElement('li');
                li.className = 'online-user';
                
                // Get user info from participant data
                const userData = participant.userData || {};
                const displayName = participant.user_name || userData.userName || 'Anonymous';
                
                li.textContent = `• ${displayName}`;
                
                // Add online status
                if (participant.video || participant.audio) {
                    li.classList.add('active');
                    li.style.color = '#7CFFB2'; // Green for active users
                }
                
                listElement.appendChild(li);
            });
        }

        // Store session info in Firebase
        this.updateSessionInFirebase(participants);
    }

    async updateSessionInFirebase(participants) {
        try {
            if (!this.roomUrl) return;

            const sessionRef = window.firebase.firestore.doc(
                window.firebase.firestore.db,
                'stretching-sessions',
                this.roomUrl.split('/').pop()
            );

            await window.firebase.firestore.setDoc(sessionRef, {
                participants: Object.values(participants).map(p => ({
                    userName: p.user_name || 'Anonymous',
                    active: p.video || p.audio,
                    joinedAt: new Date().toISOString()
                })),
                lastUpdated: window.firebase.firestore.serverTimestamp(),
                roomUrl: this.roomUrl,
                status: 'active'
            }, { merge: true });
        } catch (error) {
            console.error('Error updating session in Firebase:', error);
        }
    }

    startSessionTimer() {
        // Reset any existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        let timeLeft = 5 * 60; // 5 minutes
        const timerElement = document.getElementById('session-timer');
        this.timerInterval = setInterval(() => {
            if (!this.sessionActive) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
                return;
            }

            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timerElement) {
                timerElement.textContent = timeString;
            }

            if (timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
                this.leaveSession();
            }

            timeLeft--;
        }, 1000);
    }
}

// Create global instance
window.dailyStretchingManager = new DailyStretchingManager(); 