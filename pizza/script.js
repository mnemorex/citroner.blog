const buttons = document.getElementsByTagName("button");
//Document. ger tillbaka en lista med alla knappar på sidan
for (const button of buttons) {
    button.addEventListener('click', function (event) {
        if (event.target.id == "addToCart") {
            document.getElementsByClassName("noteringar")[0].style.display = "none";
            document.getElementsByClassName("kvitto")[0].style.display = "block";


            var nyPizza = '<li class="list-group-item"><b>' + noteName.textContent + ' </b> <button class="removePizza btn btn-danger float-right" data-price="' + notePrice.textContent + '"> Ta bort </button> <br/> <span class="price"> ' + notePrice.textContent + 'kr </span> <br/> <span> ' + noteText.value + '</span> </li> ';
            noteText.value = "";

            totalPrice.textContent = Number(totalPrice.textContent) + Number(notePrice.textContent);

            kvittoLista.innerHTML += nyPizza;

            const tabort = document.getElementsByClassName("removePizza");
            for (const button of tabort) {
                button.addEventListener('click', function (event) {
                    //https://stackoverflow.com/q/2727717
                    console.log(event);
                    event.target.parentNode.parentNode.removeChild(event.target.parentNode);
                    totalPrice.textContent = Number(totalPrice.textContent) - Number(event.target.getAttribute("data-price"));
                    checkPrice();
                })

            }
        } else if (event.target.id == "closeCart") {
            document.getElementsByClassName("noteringar")[0].style.display = "none";

        } else if (event.target.id == "order") {

            document.getElementsByClassName("noteringar")[0].style.display = "none";
            document.getElementsByClassName("kvitto")[0].style.display = "none";
            document.getElementsByClassName("klart")[0].style.display = "block";
            kvittoLista.innerHTML = "";
            totalPrice.textContent = "0";

        } else if (event.target.id == "closeKvitto") {

            document.getElementsByClassName("kvitto")[0].style.display = "none";
            document.getElementsByClassName("noteringar")[0].style.display = "none";


        } else if (event.target.id == "finalOrder") {
            document.getElementsByClassName("kvitto")[0].style.display = "block";


        } else if (event.target.id == "closeFinal") {
            document.getElementsByClassName("klart")[0].style.display = "none";

        } else {
            var price = event.target.getAttribute("data-price");
            var name = event.target.getAttribute("data-name");

            noteName.textContent = name;
            notePrice.textContent = price;
            document.getElementsByClassName("noteringar")[0].style.display = "block";
        }
        checkPrice();
    });
}

function checkPrice() {
    if (Number(totalPrice.textContent) == 0) {
        order.disabled = true;
    } else {
        order.disabled = false;
    }
}
