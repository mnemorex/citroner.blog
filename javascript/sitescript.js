window.onload = function () {
    // Read hash on url and fetch article
    var hash = window.location.hash.substring(1);
    if (hash != "" && hash.startsWith("/post/")) {
        fetchArticle(hash + window.location.search, true);
    } else {
        fetchArticle("/", true);
    }
    //setupServiceWorker();

    // Load side-panel
    fetch("/post/index-articles.html").then(validateArticle).then(insertArticleIndex).catch(offlineMessage);
};
window.onpopstate = function (event) {
    if (event.state) {
        fetchArticle(event.state.path, true);
    }
};

function setupLinkEvent() {
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

function linkRelay(event) {
    if (event.target.pathname.startsWith("/post/")) {
        event.preventDefault();
        document.getElementsByTagName("main")[0].classList.add("hide");
        document.getElementById("navigation-toggle").checked = false;
        fetchArticle(event.target.href, false);
    }
}

function fetchArticle(url, replaceUrl) {
    if (url == "/" || url == "/feed.html" || url == "/index" || url == "/index.html" || url == "/index.htm") {
        var path = {
            path: "/"
        };
        if (replaceUrl) {
            history.replaceState(path, null, "/");
        } else {
            history.pushState(path, null, "/");
        }
        fetch("/feed.html").then(validateArticle).then(insertArticle).catch(offlineMessage);
    } else {
        var path = {
            path: url
        };
        if (replaceUrl) {
            history.replaceState(path, null, url);
        } else {
            history.pushState(path, null, url);
        }
        fetch(url).then(validateArticle).then(insertArticle).catch(offlineMessage);
    }
}

function validateArticle(response) {
    if (response.ok) {
        return response.text();
    } else {
        throw new Error('Network response was not ok.');
    }
}

function offlineMessage() {
    try {
        document.getElementsByTagName("main")[0].classList.remove("hide");
    } catch (errorCatch) {}

    fetch("/post/offline").then(validateArticle).then(insertArticle);
}

function insertArticle(rawHtml) {
    var articles = document.getElementsByTagName("article");
    for (var counter = 0; counter < articles.length; ++counter) {
        articles[counter].remove();
    }
    var main = document.getElementsByTagName("main")[0];
    main.insertAdjacentHTML('beforeend', rawHtml);
    document.getElementsByTagName("main")[0].classList.remove("hide");

    /*
    var shellStyleNone = document.querySelector('article[data-shellstyle="none"]');
    var shellStylePurge = document.querySelector('article[data-shellstyle="purge"]');
    if (shellStyleNone) {
        // Hide the website shell, but keep stylesheet
        var mainStylesheet = document.getElementsByClassName("main-stylesheet");
        for (var counter = 0; counter < mainStylesheet.length; ++counter) {
            mainStylesheet[counter].remove();
        }
    }
    if (shellStylePurge) {
        // Hide the website shell, and don't keep main stylesheet
        var mainStylesheet = document.getElementsByClassName("main-stylesheet");
        for (var counter = 0; counter < mainStylesheet.length; ++counter) {
            mainStylesheet[counter].remove();
        }
        var body = document.getElementsByTagName("body")[0];
        body.innerHTML = "";
        body.insertAdjacentHTML('beforeend', rawHtml);
        setupLinkEvent();
        try{
        var entrypoint = document.getElementById("javascript-entrypoint");
        if(entrypoint != null) {
            eval(entrypoint.innerHTML);
        }
        }
        catch (errorCatch) {
            console.error("Error running eval");
            alert("Error: error parsing script")
        }
    }*/
}

function insertArticleIndex(rawHtml) {
    var index = document.getElementById("article-index");
    index.innerHTML = "";
    index.insertAdjacentHTML('beforeend', rawHtml);
    setupLinkEvent();
}
