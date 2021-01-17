"use strict";

let shellLoaded = document.querySelector('meta[name="shelldocument"]');
if (!shellLoaded)
{
    window.location.replace(window.location.origin + "#" + window.location.pathname + window.location.search);
}
