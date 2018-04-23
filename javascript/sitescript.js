window.onload = function () {
    // Read hash on url and fetch article
    shellstyle(true, true);
    var hash = window.location.hash.substring(1);
    if (hash != "" && hash.startsWith("/post/")) {
        fetchArticle(hash + window.location.search, true);
    } else {
        fetchArticle("/", true);
    }
    //registerServiceworker();

    // Load side-panel
    fetch("/post/index-articles.html").then(validate).then(insertIndex);
};

window.onpopstate = function (event) {
    if (event.state) {
        shellstyle(true, true);
        fetchArticle(event.state.path, true);
    }
};

function registerEvents() {
    var links = document.getElementsByTagName("a");
    for (var counter = 0; counter < links.length; ++counter) {
        links[counter].addEventListener("click", relay);
    }
}

function registerServiceworker() {
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
            console.error('ServiceWorker registration failed: ', error);
        });
    }
}

function relay(event) {
    if (event.target.pathname.startsWith("/post/") || event.target.pathname.startsWith("/authors/")) {
        event.preventDefault();
        document.getElementById("navigation-toggle").checked = false;
        fetchArticle(event.target.href, false);
    }
}

// Fetch a article from provided url, bool to replace or push a history state
function fetchArticle(url, replace) {
    if (url == "/" || url == "/index" || url == "/index.html" || url == "/index.htm") {
        var path = {
            path: "/"
        };
        if (replace) {
            history.replaceState(path, null, "/");
        } else {
            history.pushState(path, null, "/");
        }
        fetch("/post/feed").then(validate).then(insertArticle).catch(offline);
    } else {
        var path = {
            path: url
        };
        if (replace) {
            history.replaceState(path, null, url);
        } else {
            history.pushState(path, null, url);
        }
        fetch(url).then(validate).then(insertArticle);
    }
}

function validate(response) {
    if (response.ok) {
        return response.text();
    } else {
        throw new Error('Network response was not valid');
    }
}

function offline() {
    fetch("/post/offline/").then(validate).then(insertArticle);
}

function insertArticle(html) {
    var articles = document.getElementsByTagName("article");
    for (var counter = 0; counter < articles.length; ++counter) {
        articles[counter].remove();
    }

    if (html.includes('data-shellstyle="hide"')) {
        shellstyle(true, false);
    }
    if (html.includes('data-shellstyle="purge"')) {
        shellstyle(false, false);
    }
    try {
        var main = document.getElementsByTagName("main")[0];
        main.insertAdjacentHTML("beforeend", html);
    } catch (message) {
        console.error("Not possible to get refrence of 'main' node, inserting into 'body' instead");
        var body = document.getElementsByTagName("body")[0];
        body.insertAdjacentHTML("beforeend", html);
    }
    registerEvents();

    try {
        var entrypoint = document.getElementById("javascript-entrypoint");
        if (entrypoint != null) {
            eval(entrypoint.innerHTML);
        }
    } catch (error) {
        console.error("Running eval on element 'javascript-entrypoint' failed");
        console.error(error);
    }

}
var bodystorage = null;

function shellstyle(shell, style) {
    // Enable or disable the shell by moving it to and from a template node
    if (!shell) {
        var body = document.getElementsByTagName("body")[0];
        bodystorage = body.cloneNode(true);
        while (body.firstChild) {
            body.removeChild(body.firstChild);
        }
    } else {
        if (bodystorage != null) {
            var body = document.getElementsByTagName("body")[0];
            body.replaceWith(bodystorage);
            bodystorage = null;
        }
    }
    // Enable or disable main stylesheets
    var stylesheets = document.getElementsByClassName("main-stylesheet");
    for (var counter = 0; counter < stylesheets.length; ++counter) {
        stylesheets[counter].disabled = !style;
    }
}

function insertIndex(html) {
    try {
        var index = document.getElementById("article-index");
        while (index.firstChild) {
            index.removeChild(index.firstChild);
        }
        index.insertAdjacentHTML('beforeend', html);
    } catch (message) {}
    registerEvents();
}
