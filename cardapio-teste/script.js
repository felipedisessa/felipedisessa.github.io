let cart = [];
let total = 0;

function addToCart(itemName, itemPrice) {
    cart.push({ name: itemName, price: itemPrice });
    total += itemPrice;
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = ''; // Limpa o carrinho antes de adicionar os itens

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - R$${item.price.toFixed(2)}`;
        cartItems.appendChild(li);
    });

    document.getElementById('total-price').textContent = `Total: R$${total.toFixed(2)}`;
}

function makeOrder() {
    if (cart.length === 0) {
        alert('Por favor, adicione itens ao carrinho.');
        return;
    }

    const items = cart.map(item => `${item.name} (R$${item.price.toFixed(2)})`).join(', ');
    const payment = document.getElementById('payment').value;
    const message = `Olá, gostaria de pedir: ${items}. Forma de pagamento: ${payment}. Total: R$${total.toFixed(2)}.`;
    const phone = '5519987205121';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
}
