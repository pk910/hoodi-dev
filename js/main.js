// Store for live data
let liveData = null;

// Utility functions
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC'
    }) + ' UTC';
}

function formatNumber(num) {
    return num.toLocaleString('en-US');
}

// API functions
async function fetchNetworkData() {
    try {
        const response = await fetch(HOODI_CONFIG.api.endpoint, {
            headers: {
                'Authorization': `Bearer ${HOODI_CONFIG.api.token}`
            }
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const json = await response.json();
        if (json.status !== 'OK' || !json.data) {
            throw new Error('Invalid API response');
        }

        liveData = json.data;
        return true;
    } catch (err) {
        console.warn('Failed to fetch live network data:', err.message);
        return false;
    }
}

// Map API forks to our display format
function mapApiForks(apiForks) {
    // Group forks by epoch to combine EL/CL forks
    const forksByEpoch = {};

    // Map of CL fork names to EL equivalents and friendly names
    const forkInfo = {
        'Electra': { el: 'Prague', displayName: 'Pectra (Prague/Electra)' },
        'Fulu': { el: 'Osaka', displayName: 'Fusaka (Osaka/Fulu)' },
        'Deneb': { el: 'Cancun', displayName: null }
    };

    for (const fork of apiForks) {
        const epoch = fork.epoch;
        if (!forksByEpoch[epoch]) {
            forksByEpoch[epoch] = {
                epoch: epoch,
                timestamp: fork.time,
                active: fork.active,
                clVersions: [],
                elVersions: [],
                names: [],
                type: fork.type
            };
        }

        // Track fork names and versions
        if (fork.type === 'consensus') {
            forksByEpoch[epoch].clVersions.push(fork.name);
            if (forkInfo[fork.name]) {
                forksByEpoch[epoch].elVersions.push(forkInfo[fork.name].el);
            }
        } else if (fork.type === 'bpo') {
            // Format BPO names nicely (BPO1 -> BPO 1)
            const bpoName = fork.name.replace(/^BPO(\d+)$/, 'BPO $1');
            forksByEpoch[epoch].names.push(bpoName);
            forksByEpoch[epoch].type = 'bpo';
        }
    }

    // Convert to display format
    const displayForks = [];

    // Sort epochs
    const epochs = Object.keys(forksByEpoch).map(Number).sort((a, b) => a - b);

    for (const epoch of epochs) {
        const data = forksByEpoch[epoch];

        let name, elVersion, clVersion;

        if (data.type === 'bpo') {
            // BPO forks
            name = data.names.join(' / ');
            // BPOs don't change versions, use latest consensus versions
            const prevFork = displayForks[displayForks.length - 1];
            elVersion = prevFork ? prevFork.elVersion : 'Osaka';
            clVersion = prevFork ? prevFork.clVersion : 'Fulu';
        } else if (epoch === 0) {
            // Genesis forks
            name = 'Merge / Shapella / Dencun';
            elVersion = 'Cancun';
            clVersion = 'Deneb';
        } else {
            // Regular consensus forks - use friendly name if available
            const latestCl = data.clVersions[data.clVersions.length - 1];
            const latestEl = data.elVersions[data.elVersions.length - 1] || displayForks[displayForks.length - 1]?.elVersion;

            // Use the friendly display name if available
            if (forkInfo[latestCl] && forkInfo[latestCl].displayName) {
                name = forkInfo[latestCl].displayName;
            } else if (latestEl && latestCl) {
                name = `${latestEl}/${latestCl}`;
            } else {
                name = latestCl || latestEl;
            }

            elVersion = latestEl;
            clVersion = latestCl;
        }

        displayForks.push({
            name: name,
            timestamp: data.timestamp,
            epoch: epoch,
            elVersion: elVersion,
            clVersion: clVersion,
            isGenesis: epoch === 0,
            active: data.active
        });
    }

    return displayForks;
}

function getForks() {
    if (liveData && liveData.forks) {
        return mapApiForks(liveData.forks);
    }
    return HOODI_CONFIG.forks;
}

function isForkActive(fork) {
    // If we have live data, use the active flag
    if (fork.active !== undefined) {
        return fork.active;
    }
    // Fallback to timestamp check
    if (fork.isGenesis) return true;
    const now = Math.floor(Date.now() / 1000);
    return fork.timestamp <= now;
}

function getCurrentVersions() {
    const forks = getForks();
    let currentEl = null;
    let currentCl = null;

    // Find the latest active fork to get current versions
    for (const fork of forks) {
        if (isForkActive(fork)) {
            if (fork.elVersion) currentEl = fork.elVersion;
            if (fork.clVersion) currentCl = fork.clVersion;
        }
    }

    return { elVersion: currentEl, clVersion: currentCl };
}

// Render functions
function renderNetworkInfo() {
    const versions = getCurrentVersions();

    const elVersionEl = document.getElementById('current-el-version');
    const clVersionEl = document.getElementById('current-cl-version');

    if (elVersionEl) elVersionEl.textContent = versions.elVersion || '-';
    if (clVersionEl) clVersionEl.textContent = versions.clVersion || '-';
}

function renderLiveStatus() {
    const container = document.getElementById('live-status');
    if (!container) return;

    if (!liveData) {
        container.innerHTML = '<p class="status-unavailable">Live data unavailable</p>';
        return;
    }

    const state = liveData.current_state;
    const checkpoints = liveData.checkpoints;

    container.innerHTML = `
        <div class="live-status-grid">
            <div class="live-status-item">
                <div class="live-status-label">Head Slot</div>
                <div class="live-status-value">${formatNumber(state.current_slot)}</div>
            </div>
            <div class="live-status-item">
                <div class="live-status-label">Head Epoch</div>
                <div class="live-status-value">${formatNumber(state.current_epoch)}</div>
            </div>
            <div class="live-status-item">
                <div class="live-status-label">Finalized Epoch</div>
                <div class="live-status-value">${formatNumber(checkpoints.finalized_epoch)}</div>
            </div>
            <div class="live-status-item">
                <div class="live-status-label">Justified Epoch</div>
                <div class="live-status-value">${formatNumber(checkpoints.justified_epoch)}</div>
            </div>
        </div>
    `;
}

function renderForkSchedule() {
    const container = document.getElementById('fork-timeline');
    if (!container) return;

    container.innerHTML = '';

    const forks = getForks();

    for (const fork of forks) {
        const isActive = isForkActive(fork);
        const forkItem = document.createElement('div');
        forkItem.className = `fork-item ${isActive ? 'active' : 'upcoming'}`;

        let dateText = '';
        let epochText = '';

        if (fork.isGenesis || fork.epoch === 0) {
            dateText = `At Genesis (${formatDate(HOODI_CONFIG.network.launchTimestamp)})`;
        } else {
            dateText = formatDateTime(fork.timestamp);
            epochText = `Epoch ${formatNumber(fork.epoch)} \u2022 Timestamp ${fork.timestamp}`;
        }

        forkItem.innerHTML = `
            <div class="fork-name">${fork.name}</div>
            <div class="fork-date">${dateText}</div>
            ${epochText ? `<div class="fork-epoch">${epochText}</div>` : ''}
        `;

        container.appendChild(forkItem);
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast ' + type;
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// MetaMask integration
async function addToMetaMask() {
    if (typeof window.ethereum === 'undefined') {
        showToast('Please install MetaMask first!', 'error');
        window.open('https://metamask.io/download/', '_blank');
        return;
    }

    const config = HOODI_CONFIG.metamask;

    try {
        // Try to switch to the chain first
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: config.chainId }]
        });
        showToast('Switched to Hoodi Testnet!', 'success');
    } catch (switchError) {
        // Chain not added yet, try to add it
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [config]
                });
                showToast('Hoodi Testnet added to MetaMask!', 'success');
            } catch (addError) {
                console.error('Error adding chain:', addError);
                showToast('Failed to add network', 'error');
            }
        } else {
            console.error('Error switching chain:', switchError);
            showToast('Failed to switch network', 'error');
        }
    }
}

// Copy to clipboard functionality
function initCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn[data-copy]');

    copyButtons.forEach(btn => {
        btn.addEventListener('click', async function() {
            const textToCopy = this.getAttribute('data-copy');

            try {
                await navigator.clipboard.writeText(textToCopy);

                // Show success state
                this.classList.add('copied');

                // Change icon to checkmark
                const originalSvg = this.innerHTML;
                this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>';

                // Reset after 2 seconds
                setTimeout(() => {
                    this.classList.remove('copied');
                    this.innerHTML = originalSvg;
                }, 2000);

            } catch (err) {
                console.error('Failed to copy:', err);
                showToast('Failed to copy to clipboard', 'error');
            }
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Try to fetch live data first
    await fetchNetworkData();

    // Render all sections (will use live data if available, fallback to config)
    renderNetworkInfo();
    renderLiveStatus();
    renderForkSchedule();
    initCopyButtons();
});
