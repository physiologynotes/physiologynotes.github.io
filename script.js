let notesData = [];
let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchNotes();
    loadCartFromStorage();
});

async function fetchNotes() {
    try {
        const response = await fetch('notes.json');
        notesData = await response.json();
        renderShop(notesData);
    } catch (error) {
        console.error("Critical layout processing error:", error);
        document.getElementById('notes-container').innerHTML = `<p class='text-red-500 text-center col-span-3'>Error loading notes store database.</p>`;
    }
}

function renderShop(items) {
    const container = document.getElementById('notes-container');
    container.innerHTML = '';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = "bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between";
        
        let actionsHtml = '';
        if (item.in_stock) {
            actionsHtml = `
                <button onclick="addToCart('${item.id}')" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl transition cursor-pointer">Add To Cart</button>
                <a href="${item.razorpay_link}" target="_blank" class="bg-gray-900 hover:bg-black text-white text-center font-bold py-2.5 px-4 rounded-xl transition">Buy Now</a>
            `;
        } else {
            actionsHtml = `
                <button disabled class="w-full bg-gray-300 text-gray-500 font-bold py-2.5 px-4 rounded-xl cursor-not-allowed">Out of Stock</button>
            `;
        }

        card.innerHTML = `
            <div>
                <div class="w-full h-48 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl mb-4 flex items-center justify-center text-red-700 font-bold text-center px-4 shadow-inner">
                    ${item.title}
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">${item.title}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-3">${item.description}</p>
            </div>
            <div>
                <div class="flex justify-between items-center mb-4">
                    <span class="text-2xl font-black text-gray-900">${item.price}</span>
                    <button onclick="openPreview('${item.preview_url}', '${item.title}')" class="text-sm font-semibold text-red-600 hover:underline cursor-pointer">📄 Preview Sample</button>
                </div>
                <div class="flex space-x-2">
                    ${actionsHtml}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function openPreview(url, title) {
    document.getElementById('preview-title').innerText = `${title} (Sample Preview)`;
    document.getElementById('preview-frame').src = url;
    const modal = document.getElementById('preview-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closePreview() {
    const modal = document.getElementById('preview-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('preview-frame').src = '';
}

function toggleCartModal() {
    const modal = document.getElementById('cart-modal');
    modal.classList.toggle('hidden');
    modal.classList.toggle('flex');
    renderCart();
}

function addToCart(id) {
    const note = notesData.find(n => n.id === id);
    if (!note || !note.in_stock) return;

    if (!cart.some(item => item.id === id)) {
        cart.push(note);
        saveCartToStorage();
        updateCartCount();
        alert(`"${note.title}" added to cart!`);
    } else {
        alert("This item is already in your cart.");
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCartToStorage();
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    document.getElementById('cart-count').innerText = cart.length;
}

function saveCartToStorage() {
    localStorage.setItem('phys_recap_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const stored = localStorage.getItem('phys_recap_cart');
    if (stored) {
        cart = JSON.parse(stored);
        updateCartCount();
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = `<p class="text-gray-500 text-center py-8">Your cart is empty.</p>`;
        totalEl.innerText = "₹0";
        checkoutBtn.disabled = true;
        checkoutBtn.className = "w-full bg-gray-300 text-gray-500 py-3 rounded-xl font-bold text-center cursor-not-allowed";
        return;
    }

    checkoutBtn.disabled = false;
    checkoutBtn.className = "w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-center block transition shadow-md cursor-pointer";
    
    let runningTotal = 0;
    cart.forEach(item => {
        const priceNum = parseInt(item.price.replace(/[^0-9]/g, ''));
        runningTotal += priceNum;

        const div = document.createElement('div');
        div.className = "flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100";
        div.innerHTML = `
            <div class="max-w-[75%]">
                <h4 class="font-bold text-sm text-gray-900 truncate">${item.title}</h4>
                <p class="text-sm font-semibold text-gray-600">${item.price}</p>
            </div>
            <button onclick="removeFromCart('${item.id}')" class="text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer">Remove</button>
        `;
        container.appendChild(div);
    });

    totalEl.innerText = `₹${runningTotal}`;
}

function processCartCheckout() {
    if (cart.length === 1) {
        window.open(cart[0].razorpay_link, '_blank');
    } else {
        alert("To purchase multiple notes safely on GitHub Pages, please check them out individually or use the individual 'Buy Now' buttons.");
    }
}