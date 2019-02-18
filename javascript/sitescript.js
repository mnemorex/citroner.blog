window.onload = function () {
    // Make sure the shell is present if it was previously disabled
    shellstyle(true, true);
    // Read the hash on the end of the url and fetch that article
    fetchArticle(window.location.hash.substring(1) + window.location.search, true);

    // registerServiceworker();

    // Load side-panel
    fetch("/post/register--refresh.html").then(validate).then(insertRegister);
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
	if(links[counter].getAttribute("download") == null)
	{
		links[counter].addEventListener("click", relay);
        }
    }
}

function registerServiceworker() {
    if ('serviceWorker' in navigator) {
        installServiceworker();
    }
}

function installServiceworker() {
    navigator.serviceWorker.register('/serviceworker.js').then(function (registration) {
        if (registration.installing) {
            console.info('Serviceworker installing...');
        } else if (registration.waiting) {
            console.info('Serviceworker installed, waiting for handover by old serviceworker...');
        } else if (registration.active) {
            console.info('Serviceworker active');
        }
        console.log('Serviceworker scope: ', registration.scope);
    }).catch(function (error) {
        console.error('Serviceworker registration failed: ', error);
    });

    navigator.serviceWorker.onmessage = function (event) {
        var message = JSON.parse(event.data);
        var refreshed = message.type === 'refresh';
        var qualify = message.url.includes('--refresh');
        var old = localStorage.currentETag;

        var changed = old !== message.eTag;

        if (refreshed && qualify && changed) {
            fetch("/post/register--refresh.html").then(validate).then(insertRegister);
            localStorage.currentETag = message.eTag;
        }
    };
}

function relay(event) {
    // Prevent the browser from navigating to the internal urls, and instead let the javascript
    // fetch the article.
    if (event.target.pathname.startsWith("/post/") || event.target.pathname.startsWith("/authors/")) {
        event.preventDefault();
        document.getElementById("navigation-toggle").checked = false;
        const path = event.target.pathname + event.target.search + event.target.hash;
        fetchArticle(path, false);
    }
}

function fetchArticle(url, replace) {
    // Fetch a article from the provided url and then call to insert it
    // into the document. Replace bool determit if to replace or push a history state.
    if (url.startsWith("/post/")) {
        var path = {
            path: url
        };
        if (replace) {
            history.replaceState(path, null, url);
        } else {
            history.pushState(path, null, url);
        }
        fetch(url).then(validate).then(insertArticle).catch(offline);
    }
    else {
        // If url is pointing to a index page, fetch the "startpage".
        var path = {
            path: "/"
        };
        if (replace) {
            history.replaceState(path, null, "/");
        } else {
            history.pushState(path, null, "/");
        }
        fetch("/post/feed/").then(validate).then(insertArticle).catch(offline);
    }
}

function validate(response) {
    // Validate the network response if it is valid or not.
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
    // Removes the previus article from the body node and inserts the new one.
    // If the web application wants to remove the shell chrome it can remove it.
    var articles = document.getElementsByTagName("article");
    for (var counter = 0; counter < articles.length; ++counter) {
        articles[counter].remove();
    }
    // If the new article contains the meta-tags to hide/remove the shell.
    if (html.includes('data-shellstyle="hide"')) {
        shellstyle(true, false);
    }
    if (html.includes('data-shellstyle="purge"')) {
        shellstyle(false, false);
    }
    // Try to insert into main node, and if not possible (when the shell is removed)
    // into the body node.
    try {
        var main = document.getElementsByTagName("main")[0];
        main.insertAdjacentHTML("beforeend", html);
    } catch (message) {
        console.error("Not possible to get refrence of 'main' node, inserting into 'body' instead");
        var body = document.getElementsByTagName("body")[0];
        body.insertAdjacentHTML("beforeend", html);
    }
    // Register javascript eventhandlers (mainly for the <a> links).
    registerEvents();
    // If the article contains a scriptnode that is wants to run, evaluate it.
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
    // Enable or disable the shell by moving it to and from a template node.
    // This enable us to remove the shell if a web application wants to use the
    // whole page without a chrome. The web application can also choose to keep
    // or disable the stylesheets to.
    if (!shell) {
        // Clone the body node.
        var body = document.getElementsByTagName("body")[0];
        bodystorage = body.cloneNode(true);

        // Remove the body node and all its children.
        while (body.firstChild) {
            body.removeChild(body.firstChild);
        }
    } else {
        if (bodystorage != null) {
            // Restore the body node and clear the temporary storage.
            var body = document.getElementsByTagName("body")[0];
            body.replaceWith(bodystorage);
            bodystorage = null;
        }
    }
    // Enable or disable main stylesheets.
    var stylesheets = document.getElementsByClassName("main-stylesheet");
    for (var counter = 0; counter < stylesheets.length; ++counter) {
        stylesheets[counter].disabled = !style;
    }
}

function insertRegister(html) {
    // Insert the articles register into the side-panel.
    try {
        var register = document.getElementById("article-register");
        while (register.firstChild) {
            register.removeChild(register.firstChild);
        }
        register.insertAdjacentHTML('beforeend', html);
    } catch (message) { }
    // Register javascript eventhandlers (mainly for the <a> links).
    registerEvents();
}
