var tabArr = [];

function checkForDuplicate(tab)
{
	const isDuplicate = tabArr.some(t => t.url === tab.url && t !== tab);
	if (isDuplicate && !tab.url.includes("://newtab")) {
		chrome.tabs.remove(tab.id, function () {
			console.log("Closed duplicate tab:", tab.id);
		});
	}
}

chrome.runtime.onInstalled.addListener((reason) => {
	// Create welcome page
	if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
		chrome.tabs.create({
			url: "popup.html"
		});
	}

	// Add existing tabs to tabArr
	chrome.tabs.query({}, function (existingTabs) {
		existingTabs.forEach(function (tab) {
			tabArr.push(tab);
		});
	});

	// Check for duplicate tabs in tabArr
	tabArr.forEach(function (tab) {
		checkForDuplicate(tab);
	});
});

// CREATE TAB LISTENER
chrome.tabs.onCreated.addListener(function (newTab) {
	tabArr.push(newTab);
});

// UPDATE TAB LISTENER
chrome.tabs.onUpdated.addListener(function (tabID, changeInfo, updatedTab) {
	if (changeInfo.url) {
		const tab = tabArr.findIndex(tab => tab.id === tabID);
		if (tab !== -1)
		{
			tabArr[tab] = updatedTab;
			checkForDuplicate(tabArr[tab]);
		}
	}
});

// REMOVE TAB LISTENER
chrome.tabs.onRemoved.addListener(function (tabID) {
	try {
		// Find the index of the tab in the array
		const index = tabArr.findIndex(tab => tab.id === tabID);
		// Remove the tab from the array
		if (index !== -1) {
			tabArr.splice(index, 1);
		}
	}
	catch (error) {
		console.log("[Tabtivity] ERROR:", error);
	}
});
