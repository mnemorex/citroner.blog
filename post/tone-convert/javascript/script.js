"use strict";

function parse(text)
{
    let head = text.charAt(0).toUpperCase();

    if (text.charAt(1).toLowerCase() == 'b' || text.charAt(1) == '#')
    {
        head += text.charAt(1).toLowerCase();
        return { tone: head, tail: text.slice(2) };
    }
    else
    {
        return { tone: head, tail: text.slice(1) };
    }
}

function numeric(tone)
{
    if (tone == "A") { return 0; }
    if (tone == "A#") { return 1; }
    if (tone == "Bb") { return 1; }
    if (tone == "B") { return 2; }
    if (tone == "C") { return 3; }
    if (tone == "C#") { return 4; }
    if (tone == "Db") { return 4; }
    if (tone == "D") { return 5; }
    if (tone == "D#") { return 6; }
    if (tone == "Eb") { return 6; }
    if (tone == "E") { return 7; }
    if (tone == "F") { return 8; }
    if (tone == "F#") { return 9; }
    if (tone == "Gb") { return 9; }
    if (tone == "G") { return 10; }
    if (tone == "G#") { return 11; }
    if (tone == "Ab") { return 11; }

    return -1;
}

function display(tone)
{
    if (tone == 0) { return "A"; }
    //if (tone == 1) { return "A#"; }
    if (tone == 1) { return "Bb"; }
    if (tone == 2) { return "B"; }
    if (tone == 3) { return "C"; }
    //if (tone == 4) { return "C#"; }
    if (tone == 4) { return "Db"; }
    if (tone == 5) { return "D"; }
    // if (tone == 6) { return "D#"; }
    if (tone == 6) { return "Eb"; }
    if (tone == 7) { return "E"; }
    if (tone == 8) { return "F"; }
    //if (tone == 9) { return "F#"; }
    if (tone == 9) { return "Gb"; }
    if (tone == 10) { return "G"; }
    //if (tone == 11) { return "G#"; }
    if (tone == 11) { return "Ab"; }

    return "";
}

function convert()
{
    /* Remove previous output */
    for (let output of document.getElementsByTagName('output'))
    {
        while (output.firstChild)
        {
            output.removeChild(output.firstChild);
        }
    }

    const target = parseInt(document.getElementById('key').value);
    const tone = numeric(parse(document.getElementById('insert').firstElementChild.value).tone);
    const distance = target - tone;


    var template = document.querySelector('#select-list');
    var result = document.getElementById('result');

    for (let input of document.getElementById("insert").children)
    {
        var converted = document.importNode(template.content, true);
        const old = parse(input.value);

        if (old.tone != "")
        {
            converted.firstElementChild.value = display(mod(numeric(old.tone) + distance, 12)) + old.tail;
        }
        result.appendChild(converted);
    }
}

function mod(n, m)
{
    return ((n % m) + m) % m;
}

function setup()
{
    document.getElementById('insert-key').lastElementChild.addEventListener('input', convert, false);

    let insert = document.getElementById('insert');
    for (var i = 0; i < 50; i++)
    {
        let input = document.importNode(document.querySelector('#select-list').content, true);
        insert.appendChild(input);
        insert.lastElementChild.addEventListener('input', convert, false);
    }
}

export default setup;