let cart = [];
let total = 0;

function addToCart(itemName, itemPrice, itemQuantity) {
    itemQuantity = parseInt(itemQuantity); // Certifica-se de que a quantidade é um número inteiro
    const existingItem = cart.find(item => item.name === itemName);

    if (existingItem) {
        // Se o item já estiver no carrinho, atualiza a quantidade
        existingItem.quantity += itemQuantity;
        total += itemPrice * itemQuantity;
    } else {
        // Adiciona novo item ao carrinho
        cart.push({ name: itemName, price: itemPrice, quantity: itemQuantity });
        total += itemPrice * itemQuantity;
    }
    
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = ''; // Limpa o carrinho antes de adicionar os itens

    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.quantity} - ${item.name} - R$${(item.price * item.quantity).toFixed(2)}`;
        cartItems.appendChild(li);
    });

    document.getElementById('total-price').textContent = `Total: R$${total.toFixed(2)}`;
}

function makeOrder() {
    if (cart.length === 0) {
        alert('Por favor, adicione itens ao carrinho.');
        return;
    }

    const items = cart.map(item => `${item.quantity}x ${item.name} (R$${(item.price * item.quantity).toFixed(2)})`).join(', ');
    const payment = document.getElementById('payment').value;
    const message = `Olá, gostaria de pedir: ${items}. Forma de pagamento: ${payment}. Total: R$${total.toFixed(2)}.`;
    const phone = '5519987205121';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
}
