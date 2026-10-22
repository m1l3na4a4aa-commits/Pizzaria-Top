// BANCO DE DADOS DE PRODUTOS
const products = [
    {
        id: 1,
        name: "Margherita Napoletana",
        category: "tradicionais",
        desc: "Molho de tomate San Marzano, Muzzarella fior di latte, manjericão fresco e azeite EV.",
        prices: { P: 38, M: 48, G: 58, GG: 68 },
        img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
        badge: "Clássica"
    },
    {
        id: 2,
        name: "Prosciutto e Tartufo",
        category: "gourmet",
        desc: "Presunto de Parma artesanal, creme de trufas negras, muzzarella de búfala e rúcula.",
        prices: { P: 52, M: 68, G: 82, GG: 96 },
        img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
        badge: "Chef Choice"
    },
    {
        id: 3,
        name: "Calabresa Artisanal",
        category: "tradicionais",
        desc: "Calabresa defumada fatiada fina, cebola roxa caramelizada, azeitonas pretas e orégano.",
        prices: { P: 40, M: 50, G: 62, GG: 72 },
        img: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80",
        badge: "Popular"
    },
    {
        id: 4,
        name: "Quattro Formaggi Spezial",
        category: "gourmet",
        desc: "Gorgonzola Dolce, Parmigiano Reggiano 24 meses, Muzzarella e Catupiry original.",
        prices: { P: 46, M: 58, G: 70, GG: 84 },
        img: "https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 5,
        name: "Pizza Dolce Pistacchio",
        category: "doces",
        desc: "Creme de Pistache italiano, chocolate branco refinado e pistaches torrados granulados.",
        prices: { P: 42, M: 55, G: 68, GG: 80 },
        img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
        badge: "Doces Premium"
    },
    {
        id: 6,
        name: "Vinho Chianti DOCG Riserva",
        category: "bebidas",
        desc: "Vinho tinto seco italiano 750ml. Perfeita harmonização para pizzas de carnes e molhos vermelhos.",
        prices: { UN: 110 },
        img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80",
        badge: "Importado"
    }
];

// ESTADO DO CARRINHO
let cart = [];
let discount = 0;
let selectedSizes = {}; // Guarda o tamanho selecionado para cada pizza no menu

// INICIALIZAR A APLICAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    renderMenu(products);
    startCountdown();
    updateCalculator();
});

// RENDERIZAR O CARDÁPIO
function renderMenu(items) {
    const grid = document.getElementById('menuGrid');
    grid.innerHTML = '';

    items.forEach(product => {
        const isBebida = product.category === 'bebidas';
        const defaultSize = isBebida ? 'UN' : 'G';
        if (!selectedSizes[product.id]) {
            selectedSizes[product.id] = defaultSize;
        }

        const currentPrice = product.prices[selectedSizes[product.id]];

        const card = document.createElement('div');
        card.className = 'pizza-card';
        card.innerHTML = `
            <div class="pizza-img">
                <img src="${product.img}" alt="${product.name}">
                ${product.badge ? `<span class="pizza-badge">${product.badge}</span>` : ''}
            </div>
            <div class="pizza-info">
                <h3>${product.name}</h3>
                <p>${product.desc}</p>
                
                ${!isBebida ? `
                <div class="size-selector">
                    ${['P', 'M', 'G', 'GG'].map(size => `
                        <button class="size-btn ${selectedSizes[product.id] === size ? 'active' : ''}" 
                                onclick="changeSize(${product.id}, '${size}')">
                            ${size}
                        </button>
                    `).join('')}
                </div>
                ` : '<div style="height: 30px;"></div>'}

                <div class="pizza-bottom">
                    <span class="pizza-price" id="price-${product.id}">R$ ${currentPrice.toFixed(2).replace('.', ',')}</span>
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">
                        <i class="fa-solid fa-plus"></i> Adicionar
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// TROCAR TAMANHO NO CARD
function changeSize(productId, size) {
    selectedSizes[productId] = size;
    const product = products.find(p => p.id === productId);
    const newPrice = product.prices[size];
    document.getElementById(`price-${productId}`).innerText = `R$ ${newPrice.toFixed(2).replace('.', ',')}`;
    
    // Atualizar classe ativa dos botões
    renderMenu(products);
}

// FILTRAR CARDÁPIO
function filterMenu(category, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (category === 'todas') {
        renderMenu(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        renderMenu(filtered);
    }
}

// LÓGICA DO CARRINHO
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const size = selectedSizes[productId];
    const price = product.prices[size];

    const cartItem = cart.find(item => item.id === productId && item.size === size);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            size: size,
            price: price,
            quantity: 1
        });
    }

    updateCartUI();
    openCart();
}

function updateCartUI() {
    const cartItemsList = document.getElementById('cartItemsList');
    const cartBadge = document.getElementById('cartBadge');
    
    cartItemsList.innerHTML = '';
    let subtotal = 0;
    let totalItems = 0;

    cart.forEach((item, index) => {
        subtotal += item.price * item.quantity;
        totalItems += item.quantity;

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div>
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-sub">Tamanho: ${item.size} | Qtd: ${item.quantity}</div>
                <div class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
            </div>
            <button onclick="removeFromCart(${index})" style="color: #EF4444; background:none; border:none; cursor:pointer;">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        cartItemsList.appendChild(itemEl);
    });

    cartBadge.innerText = totalItems;

    const discountAmount = subtotal * discount;
    const total = subtotal - discountAmount;

    document.getElementById('cartSubtotal').innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('cartTotal').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;

    if (discount > 0) {
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('cartDiscount').innerText = `-R$ ${discountAmount.toFixed(2).replace('.', ',')}`;
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function applyCoupon() {
    const input = document.getElementById('couponInput').value.trim().toUpperCase();
    if (input === 'ITALIA10') {
        discount = 0.10;
        alert('Cupom de 10% aplicado com sucesso!');
        updateCartUI();
    } else {
        alert('Cupom inválido. Tente o cupom ITALIA10');
    }
}

function openCart() {
    document.getElementById('cartModal').classList.add('open');
}

function closeCart() {
    document.getElementById('cartModal').classList.remove('open');
}

function checkoutWhatsApp() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    let message = "*NOVO PEDIDO - LA BELLA PIZZA*\n\n";
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        message += `• ${item.quantity}x ${item.name} (${item.size}) - R$ ${itemTotal.toFixed(2)}\n`;
    });

    const total = subtotal - (subtotal * discount);
    if (discount > 0) {
        message += `\nDesconto Aplicado: 10%`;
    }
    message += `\n*TOTAL: R$ ${total.toFixed(2)}*\n\n`;
    message += "Por favor, confirme meu pedido e o tempo de entrega!";

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/5511999998888?text=${encoded}`, '_blank');
}

// CALCULADORA DE EVENTOS
function updateCalculator() {
    const guests = document.getElementById('calcGuests').value;
    const pricePerPerson = parseFloat(document.getElementById('calcPackage').value);
    
    document.getElementById('guestCountDisplay').innerText = `${guests} pessoas`;
    const total = guests * pricePerPerson;
    document.getElementById('calcTotalDisplay').innerText = `R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}

function requestEventQuote() {
    const guests = document.getElementById('calcGuests').value;
    const pkgSelect = document.getElementById('calcPackage');
    const pkgName = pkgSelect.options[pkgSelect.selectedIndex].text;
    const total = document.getElementById('calcTotalDisplay').innerText;

    const message = `Olá! Gostaria de consultar a disponibilidade para o evento:\n\n` +
                    `• *Nº de Convidados:* ${guests} pessoas\n` +
                    `• *Pacote Escolhido:* ${pkgName}\n` +
                    `• *Valor Estimado:* ${total}\n\n` +
                    `Podemos agendar a data?`;

    window.open(`https://wa.me/5511999998888?text=${encodeURIComponent(message)}`, '_blank');
}

// CRONÔMETRO DE PROMOÇÃO
function startCountdown() {
    let hours = 4, minutes = 32, seconds = 15;
    setInterval(() => {
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        
        document.getElementById('timerHours').innerText = String(hours).padStart(2, '0');
        document.getElementById('timerMinutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('timerSeconds').innerText = String(seconds).padStart(2, '0');
    }, 1000);
}

// MODAL DE ARTIGOS/DICAS
const articles = {
    vinho: `
        <h2>Harmonização de Vinhos com Pizza</h2>
        <br>
        <p>A harmonização entre vinho e pizza busca equilibrar a acidez do molho de tomate com o teor de gordura dos queijos e embutidos.</p>
        <br>
        <ul>
            <li><strong>Margherita e Molho Vermelho:</strong> Combine com Chianti ou Sangiovese.</li>
            <li><strong>Quatro Queijos:</strong> Vinhos brancos encorpados como Chardonnay ou tintos leves como Pinot Noir.</li>
            <li><strong>Calabresa/Carnes:</strong> Vinhos de corpo médio como Cabernet Sauvignon ou Malbec.</li>
        </ul>
    `,
    massa: `
        <h2>Os Benefícios da Fermentação de 48 Horas</h2>
        <br>
        <p>Ao dar tempo para a massa maturar no frio, o glúten se transforma em aminoácidos mais fáceis de digerir. Esse processo reduz o inchaço abdominal e garante uma borda alveolada e incrivelmente crocante.</p>
    `,
    evento: `
        <h2>Como Planejar a Quantidade de Pizzas do Seu Evento</h2>
        <br>
        <p>Em eventos no formato de buffet com garçons, o consumo médio é calculado da seguinte forma:</p>
        <br>
        <ul>
            <li><strong>Adultos:</strong> 5 a 6 fatias grandes por pessoa.</li>
            <li><strong>Crianças (de 5 a 10 anos):</strong> 2 a 3 fatias.</li>
            <li><strong>Tempo de Servimento Ideal:</strong> 3 a 4 horas.</li>
        </ul>
    `
};

function openTipModal(type) {
    document.getElementById('articleContent').innerHTML = articles[type];
    document.getElementById('articleModal').classList.add('open');
}

function closeTipModal() {
    document.getElementById('articleModal').classList.remove('open');
}

// FORMULÁRIO DE RESERVA
function handleReservation(event) {
    event.preventDefault();
    alert('Mesa reservada com sucesso! Enviamos a confirmação para seu número de telefone.');
    event.target.reset();
}