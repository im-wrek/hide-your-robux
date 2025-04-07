document.addEventListener('DOMContentLoaded', () => {
    const hideRobuxCheckbox = document.getElementById('hideRobux');
    const hideWalletCheckbox = document.getElementById('hideWallet');
    const fakeRobuxInput = document.getElementById('fakeRobux');[0]
    const fakeWalletInput = document.getElementById('fakeWallet');

    hideRobuxCheckbox.checked = true;
    hideWalletCheckbox.checked = false;
    fakeRobuxInput.value = null;
    fakeWalletInput.value = null;

    chrome.storage.local.get(['hideRobux', 'hideWallet', 'fakeRobux', 'fakeWallet'], (result) => {
        if (result.hideRobux !== undefined) {
            hideRobuxCheckbox.checked = result.hideRobux;
        }
        if (result.hideWallet !== undefined) {
            hideWalletCheckbox.checked = result.hideWallet;
        }
        fakeRobuxInput.value = result.fakeRobux || null;
        fakeWalletInput.value = result.fakeWallet || null;
    }
    );

    chrome.storage.local.onChanged.addListener((changes) => {
        if (changes.hideRobux) {
            hideRobuxCheckbox.checked = changes.hideRobux.newValue || false;
        }
        if (changes.hideWallet) {
            hideWalletCheckbox.checked = changes.hideWallet.newValue || false;
        }
        if (changes.fakeRobux) {
            fakeRobuxInput.value = changes.fakeRobux.newValue || null;
        }
        if (changes.fakeWallet) {
            fakeWalletInput.value = changes.fakeWallet.newValue || null;
        }
    });

    hideRobuxCheckbox.addEventListener('change', (event) => {
        chrome.storage.local.set({ hideRobux: event.target.checked, fakeRobux: null });
    });

    hideWalletCheckbox.addEventListener('change', (event) => {
        chrome.storage.local.set({ hideWallet: event.target.checked, fakeWallet: null });
    });

    fakeRobuxInput.addEventListener('input', (event) => {
        chrome.storage.local.set({ fakeRobux: event.target.value, hideRobux: false });
    });

    fakeWalletInput.addEventListener('input', (event) => {
        chrome.storage.local.set({ fakeWallet: event.target.value, hideWallet: false });
    });
});