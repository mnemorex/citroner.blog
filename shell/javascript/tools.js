/* Enter fullscreen mode */
function launchFullscreen(element) {
    'use strict';
    if (typeof element == "undefined") {
        // Set element to the whole page
        element = document.documentElement;
        console.log("Fullscreen API: launching whole page into fullscreen");
    }
    else {}
    if (element.requestFullscreen) {
        element.requestFullscreen();
        console.log("Fullscreen API: page launched in fullscreen");
    }
    else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
        console.log("Fullscreen API: page launched in fullscreen via mozilla request");
    }
    else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
        console.log("Fullscreen API: page launched in fullscreen via webkit request");
    }
    else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
        console.log("Fullscreen API: page launched in fullscreen via ms request");
    }
}