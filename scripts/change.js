let creditBalance = 0;
let robuxBalance = 0;

chrome.storage.local.set({fakeRobux: null, hideRobux: true, hideWallet: false, fakeWallet: null})

fetch('https://apis.roblox.com/credit-balance/v1/get-credit-balance-for-navigation', {
    method: 'GET',
    credentials: 'include',
}).then(response => {
    if (response.ok) {
        response.json().then(data => {
            creditBalance = data.creditBalance;
        });
    } else {
        console.error('Failed to fetch credit balance:', response);
    }
})

fetch('https://economy.roblox.com/v1/user/currency', {
    method: 'GET',
    credentials: 'include',
}).then(response => {
    if (response.ok) {
        response.json().then(data => {
            robuxBalance = data.robux;
        });
    } else {
        console.error('Failed to fetch credit balance:', response);
    }
})

function formatCredit(value) {
    if (value === undefined || value === null) {
        return '-';
    }
    if (typeof value !== 'number') {
        return '-';
    }
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function formatRobux(value, secondary = false) {
    if (value === undefined || value === null) {
        return '-';
    }
    if (typeof value !== 'number') {
        return '-';
    }
    let formattedValue = value.toLocaleString('en-US');
    if (document.querySelector('btroblox')) {
        secondary = true;
    }
    if (secondary) {
        formattedValue = value.toLocaleString('en-US', { useGrouping: true });
    } else {
        if (value >= 1000000) {
            formattedValue = `${(value / 1000000).toFixed(1)}M+`;
        } else if (value >= 1000) {
            formattedValue = `${(value / 1000).toFixed(0)}K+`;
        } else {
            formattedValue = `${value.toLocaleString('en-US')}`;
        }
    }
    return formattedValue;
}

function waitForElement(id, callback) {
    const intervalId = setInterval(() => {
        const element = document.querySelector(id)
        if (element) {
            clearInterval(intervalId);
            callback(element);
        }
    }, 1);
}

function waitForElements(id, callback) {
    const intervalId = setInterval(() => {
        const element = document.querySelectorAll(id)
        if (element.length > 0) {
            clearInterval(intervalId);
            callback(element);
        }
    }, 1);
}

function observeRemoval(element, callback) {
    if (element.__isBeingObserved) {
        return;
    }
    element.__isBeingObserved = true;
    if (!element) {
        console.error("Element is null or undefined.");
        return;
    }

    let elementExists = true;

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.removedNodes) {
                for (const removedNode of mutation.removedNodes) {
                    if (removedNode === element || element.contains(removedNode)) {
                        if (elementExists) {
                            elementExists = false;
                            observer.disconnect();
                            element.__isBeingObserved = null;
                            callback();
                            return;
                        }
                    } else if (removedNode === element.parentNode) {
                        if (elementExists) {
                            elementExists = false;
                            observer.disconnect();
                            element.__isBeingObserved = null;
                            callback();
                            return;
                        }
                    }
                }
            }
        }

        if (elementExists && !document.body.contains(element)) {
            elementExists = false;
            observer.disconnect()
            element.__isBeingObserved = null;
            callback();
            return;
        }
    });


    observer.observe(document.body, { childList: true, subtree: true });

    return observer;
}

function updateRobux() {
    let fakeRobux
    let hideRobux
    chrome.storage.local.get('fakeRobux', (result) => {
        fakeRobux = result.fakeRobux
    })
    chrome.storage.local.get('hideRobux', (result) => {
        hideRobux = result.hideRobux
    })

    waitForElement('#nav-robux-amount.rbx-text-navbar-right.text-header', (element) => {
        let html = ""
        if (hideRobux === true) {
            html = ("-").repeat(formatRobux(robuxBalance, true).length);
        } else if (fakeRobux) {
            html = fakeRobux
        } else {
            html = formatRobux(robuxBalance, true)
        }
        element.innerText = html
    });
    waitForElement('#nav-robux-balance', (element) => {
        let html = ""
        if (hideRobux === true) {
            html = ("-").repeat(formatRobux(robuxBalance, true).length);
        } else if (fakeRobux) {
            html = fakeRobux
        } else {
            html = formatRobux(robuxBalance, true)
        }
        element.innerText = html
    });
}

function updateWallet() {
    let fakeWallet
    let hideWallet
    chrome.storage.local.get('fakeWallet', (result) => {
        fakeWallet = result.fakeWallet
    })
    chrome.storage.local.get('hideWallet', (result) => {
        hideWallet = result.hideWallet
    })
    waitForElements('.price-tag', (elements) => {
        for (const element of elements) {
            let html = ""
            if (hideWallet) {
                html = ("-").repeat(formatCredit(creditBalance).length);
            } else if (fakeWallet) {
                html = fakeWallet
            } else {
                html = formatCredit(creditBalance)
            }
            element.innerText = html
        }
    });
}

function update() {
    updateRobux()
    updateWallet()
}

function updateRobuxOnRemoval() {
    waitForElement(".popover-content", (element) => {
        observeRemoval(element, updateRobuxOnRemoval);
        update();
    })
}

update()
updateRobuxOnRemoval()
waitForElement("#nav-robux-amount.rbx-text-navbar-right.text-header", update)

chrome.storage.onChanged.addListener(update);