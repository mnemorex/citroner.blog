"use strict";

/* Set language based on user agent language */
if (navigator.language.includes("sv"))
{
    document.documentElement.setAttribute('lang', 'sv');
}

load(window.location.hash.substring(1) + window.location.search, true);

fetch("/post/register--refresh.html").then(validate).then(sidepanel);

window.addEventListener('popstate', function (event)
{
    if (event.state)
    {
        load(event.state.path, true);
    }
}, false);

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
        const path = { path: url };

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
        const path = { path: "/" };

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
        throw new Error(response.statusText);
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

    for (let main of document.getElementsByTagName("main"))
    {
        main.insertAdjacentHTML("beforeend", html);
    }

    events();

    try
    {
        /* Try to import additional javascript from article directory */
        import(window.location.pathname + 'javascript/script.js').then(module => module.default()).catch(error => { });
    }
    catch (error) { }
}

function sidepanel(html)
{
    for (let node of document.getElementById("article-register").children)
    {
        node.remove();
    }

    document.getElementById("article-register").insertAdjacentHTML('beforeend', html);

    events();
}
