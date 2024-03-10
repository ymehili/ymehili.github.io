fetch('https://api.kedufront.juniortaker.com/item/')
    .then(response => response.json())
    .then(data => {
        const itemsContainer = document.getElementById('itemsContainer');
        data.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('item-box');

            itemElement.id = item._id;

            const imageElement = document.createElement('img');
            imageElement.src = `https://api.kedufront.juniortaker.com/item/picture/${item._id}`;
            imageElement.classList.add('item-image');
            itemElement.appendChild(imageElement);

            const descElement = document.createElement('p');
            descElement.textContent = item.description;
            descElement.classList.add('item-desc');
            itemElement.appendChild(descElement);

            const nameElement = document.createElement('p');
            nameElement.textContent = item.name.toUpperCase();
            nameElement.classList.add('item-name');
            itemElement.appendChild(nameElement);

            const priceElement = document.createElement('p');
            priceElement.textContent = item.price + ' €';
            priceElement.classList.add('item-price');
            itemElement.appendChild(priceElement);

            itemsContainer.appendChild(itemElement);
        });
        const itemBoxes = document.querySelectorAll('.item-box');
        itemBoxes.forEach(box => {
            box.addEventListener('click', () => {
                const id = box.getAttribute('id');
                console.log(`Box with id ${id} was clicked`);
                window.location.href = `product/product.html?id=${id}`;
            });
        });
    })
    .then(() => {
        const cartButton = document.getElementById("cart-button");
        const cartPopup = document.getElementById("cart-popup");

        cartButton.addEventListener('click', function() {
            let cart = localStorage.getItem('cart');
            if (cart) {
                cart = JSON.parse(cart);
                let fetchPromises = [];
                for (let productId in cart) {
                    let fetchPromise = fetch(`https://api.kedufront.juniortaker.com/item/${productId}`)
                        .then(response => response.json())
                        .then(data => {
                            return `
                                <div class="cart-item" itemid=${productId}>
                                    <img src="https://api.kedufront.juniortaker.com/item/picture/${productId}" alt="${data.item.name}">
                                    <div class="cart-item-info">
                                        <p class="cart-item-title">${data.item.name}</p>
                                        <p class="cart-item-price">${data.item.price} €</p>
                                        <div class="cart-item-quantity">
                                            <button class="decrease">-</button>
                                            <p>Quantity: ${cart[productId]}</p>
                                            <button class="increase">+</button>
                                            <button class="delete"><i class="fa fa-trash" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `;
                        })
                        .catch(error => console.error('Error:', error));
                    fetchPromises.push(fetchPromise);
                }
                Promise.all(fetchPromises).then(cartItemsHtml => {
                    const checkoutButtonHtml = `<button id="checkout-button">Checkout</button>`;
                    cartItemsHtml.push(checkoutButtonHtml);
                    cartPopup.innerHTML = cartItemsHtml.join('');

                    const increaseButtons = document.querySelectorAll('.increase');
                    const decreaseButtons = document.querySelectorAll('.decrease');
                    const deleteButtons = document.querySelectorAll('.delete');

                    increaseButtons.forEach((button, index) => {
                        button.addEventListener('click', function() {
                            let cart = JSON.parse(localStorage.getItem('cart'));
                            const productId = Object.keys(cart)[index];
                            cart[productId]++;
                            localStorage.setItem('cart', JSON.stringify(cart));
                            console.log('Increased quantity:', productId);
                        });
                    });

                    decreaseButtons.forEach((button, index) => {
                        button.addEventListener('click', function() {
                            let cart = JSON.parse(localStorage.getItem('cart'));
                            const productId = Object.keys(cart)[index];
                            if (cart[productId] > 1) {
                                cart[productId]--;
                            } else {
                                delete cart[productId];
                            }
                            localStorage.setItem('cart', JSON.stringify(cart));
                            console.log('Decreased quantity:', productId);
                        });
                    });

                    deleteButtons.forEach((button, index) => {
                        button.addEventListener('click', function() {
                            let cart = JSON.parse(localStorage.getItem('cart'));
                            const productId = Object.keys(cart)[index];
                            delete cart[productId];
                            localStorage.setItem('cart', JSON.stringify(cart));
                            console.log('Deleted item:', productId);
                        });
                    });
                    const checkoutButton = document.getElementById("checkout-button");
                    const checkoutPopup = document.querySelector(".checkout-popup");
                    checkoutButton.addEventListener('click', function() {
                        checkoutPopup.style.display = "block";
                    });
                    const checkoutForm = document.getElementById('checkout-form');
                    checkoutForm.addEventListener('submit', function(event) {
                        event.preventDefault();
                        const email = document.getElementById('email').value;
                        const name = document.getElementById('name').value;
                        const address = document.getElementById('address').value;
                        const cart = JSON.parse(localStorage.getItem('cart'));
                        const data = {
                            "email": email,
                            "name": name,
                            "address": address,
                            "cart": cart
                        };
                        checkoutPopup.style.display = "none";
                        fetch('https://api.kedufront.juniortaker.com/order', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data),
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log('Success:', data);
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                    });
                });
            }
            cartPopup.classList.toggle('show');
        });
    })
    .catch(error => console.error('Error:', error));
