/* Main OnLoad function */
window.onload = function () {
    'use strict';
    console.log("Javascript: DOM loaded");

    // Read hash on url and fetch article
    var hash = window.location.hash.substring(1);
    if (hash != "" && hash.startsWith("/post/")) {
        fetchArticle(hash, true);
    } else {
        fetchArticle("/", true);
    }

    // Setup event and services
    setupEvents();
    //setupServiceWorker();

    // Load side-panel
    fetch("/post/index-articles.html").then(validate).then(insertArticleIndex).catch(riseError);
};
window.onpopstate = function (event) {
    if (event.state) {
        fetchArticle(event.state.path, true);
    }
};

function setupEvents() {
    /* window.addEventListener('devicelight', function(event) {
   alert('The current value of light is ' + event.value + ' lux');
   });
    */
}

function registerClickEvent() {
    'use strict';
    console.log("Javascript: setting up document events");

    // Setup click event for all links in the document
    var links = document.getElementsByTagName("a");
    for (var counter = 0; counter < links.length; ++counter) {
        links[counter].addEventListener("click", linkRelay);
    }
}

function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/serviceworker.js').then(function (registration) {
            if (registration.installing) {
                console.info('Service worker installing');
            } else if (registration.waiting) {
                console.info('Service worker installed, waiting for handover by old service worker');
            } else if (registration.active) {
                console.info('Service worker active');
            }
            console.log('ServiceWorker scope: ', registration.scope);
        }).catch(function (error) {
            // Serviceworker registration failed
            console.error('ServiceWorker registration failed: ', error);
        });
    }
}
// Check if link is heading for another article and if so, fade to that page insteat of jump
function linkRelay(event) {
    if (event.target.pathname.startsWith("/post/")) {
        event.preventDefault();
        document.getElementsByTagName("main")[0].classList.add("hide");
        document.getElementById("navigation-toggle").checked = false;
        fetchArticle(event.target.href, false);
    }
}

function fetchArticle(hrefToArticle, boolReplaceState) {
    if (hrefToArticle == "/" || hrefToArticle == "/feed.html" || hrefToArticle == "/index" || hrefToArticle == "/index.html" || hrefToArticle == "/index.htm") {
        var pathState = {
            path: "/"
        };
        if (boolReplaceState) {
            history.replaceState(pathState, null, "/");
        } else {
            history.pushState(pathState, null, "/");
        }
        fetch("/feed.html").then(validate).then(insertArticle).catch(offlineMessage);
    } else {
        var pathState = {
            path: hrefToArticle
        };
        if (boolReplaceState) {
            history.replaceState(pathState, null, hrefToArticle);
        } else {
            history.pushState(pathState, null, hrefToArticle);
        }
        fetch(hrefToArticle).then(validate).then(insertArticle).catch(offlineMessage);
    }
}

function validate(response) {
    if (response.ok) {
        return response.text();
    } else {
        throw new Error('Network response was not ok.');
    }
}

function riseError(error) {
    console.log('There has been a problem with a fetch operation: ' + error);
    document.getElementsByTagName("main")[0].classList.remove("hide");
}

function offlineMessage() {
    console.log('There has been a problem with a fetch operation');
    document.getElementsByTagName("main")[0].classList.remove("hide");
    fetch("/post/offline").then(validate).then(insertArticle);
}

function insertArticle(rawHtmlText) {
    var article = document.getElementsByTagName("article");
    if (article.length > 0) {
        article[0].remove();
    }
    var main = document.getElementsByTagName("main")[0];
    main.insertAdjacentHTML('beforeend', rawHtmlText);
    document.getElementsByTagName("main")[0].classList.remove("hide");

    var shellStyleNone = document.querySelector('article[data-shellstyle="none"]');
    var shellStylePurge = document.querySelector('article[data-shellstyle="purge"]');
    if (shellStyleNone) {
        // Hide the website shell, but keep stylesheet
        var mainStylesheet = document.getElementsByClassName("main-stylesheet");
        for (var counter = 0; counter < mainStylesheet.length; ++counter) {
            mainStylesheet[counter].disable = true;
        }
    }
    if (shellStylePurge) {
        // Hide the website shell, and don't keep main stylesheet
        var mainStylesheet = document.getElementsByClassName("main-stylesheet");
        for (var counter = 0; counter < mainStylesheet.length; ++counter) {
            mainStylesheet[counter].disable = true;
        }
        var body = document.getElementsByTagName("body")[0];
        body.innerHTML = "";
        body.insertAdjacentHTML('beforeend', rawHtmlText);
        registerClickEvent();
    }
}

function insertArticleIndex(rawHtmlText) {
    var articleIndex = document.getElementById("article-index");
    articleIndex.innerHTML = "";
    articleIndex.insertAdjacentHTML('beforeend', rawHtmlText);
    registerClickEvent();
}
