    /* Make sure the shell is present if it was previously disabled */
    shellstyle(true, true);

    load(window.location.hash.substring(1) + window.location.search, true);

    fetch("/post/register--refresh.html").then(validate).then(sidepanel);

window.onpopstate = function (event)
{
    if (event.state)
    {
        shellstyle(true, true);
        load(event.state.path, true);
    }
};

function events()
{
    for (let link of document.getElementsByTagName("a"))
    {
        if (link.pathname.startsWith("/post/") || link.pathname.startsWith("/authors/"))
        {
            if (link.getAttribute("download") == null)
            {
	              link.addEventListener("click", relay);
            }
        }
    }
}

function relay(event)
{
    event.preventDefault();

    document.getElementById("navigation-toggle").checked = false;

    const path = event.target.pathname + event.target.search + event.target.hash;
    load(path, false);
}

function load(url, replace)
{
    if (url.startsWith("/post/"))
    {
        var path = {
            path: url
        };

        if (replace)
        {
            history.replaceState(path, null, url);
        }
        else
        {
            history.pushState(path, null, url);
        }

        fetch(url).then(validate).then(insert).catch(offline);
    }
    else
    {
        var path = {
            path: "/"
        };

        if (replace)
        {
            history.replaceState(path, null, "/");
        }
        else
        {
            history.pushState(path, null, "/");
        }

        fetch("/post/feed/").then(validate).then(insert).catch(offline);
    }
}

function validate(response)
{
    if (response.ok)
    {
        return response.text();
    }
    else
    {
        throw new Error('Network response was not valid');
    }
}

function offline()
{
    fetch("/post/offline/").then(validate).then(insert);
}

function insert(html)
{
    for (let article of document.getElementsByTagName("article"))
    {
        article.remove();
    }

    if (html.includes('data-shellstyle="hide"'))
    {
        shellstyle(true, false);
    }
    if (html.includes('data-shellstyle="purge"'))
    {
        shellstyle(false, false);
    }

    try
    {
        for (let main of document.getElementsByTagName("main"))
        {
            main.insertAdjacentHTML("beforeend", html);
        }
    }
    catch (message)
    {
        console.error("Not possible to get refrence of 'main' node, inserting into 'body' instead");

        for (let body of document.getElementsByTagName("body"))
        {
            body.insertAdjacentHTML("beforeend", html);
        }
    }

    events();

    try
    {
        let entrypoint = document.getElementById("javascript-entrypoint");
        if (entrypoint != null)
        {
            eval(entrypoint.innerHTML);
        }
    }
    catch (error)
    {
        console.error("Running eval on element 'javascript-entrypoint' failed");
        console.error(error);
    }

}

var bodystorage = null;
function shellstyle(shell, style)
{
    // Enable or disable the shell by moving it to and from a template node.
    // This enable us to remove the shell if a web application wants to use the
    // whole page without a chrome. The web application can also choose to keep
    // or disable the stylesheets to.
    if (!shell)
    {
        let body = document.getElementsByTagName("body")[0];
        bodystorage = body.cloneNode(true);

        // Remove the body node and all its children.
        while (body.firstChild)
        {
            body.removeChild(body.firstChild);
        }
    }
    else
    {
        if (bodystorage != null)
        {
            // Restore the body node and clear the temporary storage.
            let body = document.getElementsByTagName("body")[0];
            body.replaceWith(bodystorage);
            bodystorage = null;
        }
    }

    for (let stylesheet of document.getElementsByClassName("main-stylesheet"))
    {
        stylesheet.disabled = !style;
    }
}

function sidepanel(html)
{
    try
    {
        for (let node of document.getElementById("article-register").children)
        {
            node.remove();
        }

        document.getElementById("article-register").insertAdjacentHTML('beforeend', html);
    }
    catch (message) { }

    events();
}
