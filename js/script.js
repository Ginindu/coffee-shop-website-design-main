// ==========================================
// CORE LAYOUT CONTROLS (RESPONSIVE NAVBAR)
// ==========================================
let menu = document.querySelector('#menu-btn');
let navbar = document.querySelector('.navbar');

menu.onclick = () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
};

window.onscroll = () => {
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
};

// Home Image Gallery Selector
document.querySelectorAll('.image-slider img').forEach(images => {
    images.onclick = () => {
        var src = images.getAttribute('src');
        document.querySelector('.main-home-image').src = src;
    };
});

// Swiper Review Slider Carousel
var swiper = new Swiper(".review-slider", {
    spaceBetween: 20,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    loop: true,
    grabCursor: true,
    autoplay: {
        delay: 7500,
        disableOnInteraction: false,
    },
    breakpoints: {
        0: { slidesPerView: 1 },
        768: { slidesPerView: 2 }
    },
});


// ==========================================
// THEME SWITCHER (DARK ESPRESSO / LIGHT CREAM)
// ==========================================
const themeBtn = document.querySelector('#theme-btn');
const savedTheme = localStorage.getItem('theme') || 'warm-cream';

// Apply saved theme on boot
if (savedTheme === 'dark-espresso') {
    document.body.classList.add('dark-espresso');
    themeBtn.className = 'fas fa-sun';
} else {
    document.body.classList.remove('dark-espresso');
    themeBtn.className = 'fas fa-moon';
}

themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-espresso');
    if (document.body.classList.contains('dark-espresso')) {
        themeBtn.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark-espresso');
    } else {
        themeBtn.className = 'fas fa-moon';
        localStorage.setItem('theme', 'warm-cream');
    }
});


// ==========================================
// SHOPPING CART DRAWER MANAGEMENT
// ==========================================
const cartBtn = document.querySelector('#cart-btn');
const cartDrawer = document.querySelector('#cart-drawer');
const cartOverlay = document.querySelector('#cart-overlay');
const closeCart = document.querySelector('#close-cart');
const cartItemsContainer = document.querySelector('#cart-items-container');
const cartSubtotalPrice = document.querySelector('#cart-subtotal-price');
const cartBadgeCount = document.querySelector('#cart-btn .cart-badge');

let cart = JSON.parse(localStorage.getItem('coffee_shop_cart')) || [];

function toggleCartDrawer() {
    cartDrawer.classList.toggle('active');
    cartOverlay.classList.toggle('active');
}

cartBtn.addEventListener('click', toggleCartDrawer);
closeCart.addEventListener('click', toggleCartDrawer);
cartOverlay.addEventListener('click', toggleCartDrawer);

// Save cart to local storage and refresh interface
function saveAndRenderCart() {
    localStorage.setItem('coffee_shop_cart', JSON.stringify(cart));
    renderCart();
}

// Render cart items dynamically
function renderCart() {
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;
    let itemCount = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message" style="font-size: 1.6rem; color: var(--text-muted); text-align: center; margin-top: 5rem; padding: 0 2rem;">
                <i class="fas fa-shopping-basket" style="font-size: 4rem; color: var(--main-color); margin-bottom: 1.5rem; display: block;"></i>
                Your cart is empty.<br>Select a popular drink from our menu or build a custom brew!
            </div>
        `;
        cartBadgeCount.style.display = 'none';
        cartSubtotalPrice.textContent = '0.00';
        return;
    }

    cart.forEach((item, index) => {
        subtotal += item.price * item.quantity;
        itemCount += item.quantity;

        const cartItemHTML = `
            <div class="cart-item">
                <img src="${item.image}" alt="">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    ${item.customization ? `<span class="item-customization">${item.customization}</span>` : ''}
                    <div class="price">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <i class="fas fa-trash-alt remove-item" onclick="removeCartItem(${index})"></i>
            </div>
        `;
        cartItemsContainer.innerHTML += cartItemHTML;
    });

    // Animate badge update
    cartBadgeCount.style.display = 'flex';
    cartBadgeCount.textContent = itemCount;
    cartBadgeCount.style.animation = 'none';
    setTimeout(() => { cartBadgeCount.style.animation = 'bounceBadge 0.3s ease'; }, 10);

    // Dynamic price subtotal animation
    animateSubtotal(subtotal);
}

// Subtotal increment counter animation
function animateSubtotal(targetValue) {
    let startValue = parseFloat(cartSubtotalPrice.textContent) || 0;
    let duration = 400; // ms
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = Math.min((timestamp - startTime) / duration, 1);
        let currentValue = startValue + progress * (targetValue - startValue);
        cartSubtotalPrice.textContent = currentValue.toFixed(2);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }
    window.requestAnimationFrame(step);
}

// Modify cart item quantity
window.updateQuantity = function(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveAndRenderCart();
};

// Remove item from cart
window.removeCartItem = function(index) {
    cart.splice(index, 1);
    saveAndRenderCart();
};

// Add standard item to cart
function addStandardItem(id, name, price, image) {
    const existingIndex = cart.findIndex(item => item.id === id && !item.customization);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: parseFloat(price),
            image: image,
            quantity: 1,
            customization: null
        });
    }
    saveAndRenderCart();
}

// ==========================================
// FLYING PARTICLE ADD-TO-CART ANIMATION
// ==========================================
document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const box = btn.closest('.box');
        const id = box.getAttribute('data-id');
        const name = box.getAttribute('data-name');
        const price = box.getAttribute('data-price');
        const imgEl = box.querySelector('img');
        
        // Add to cart state
        addStandardItem(id, name, price, imgEl.getAttribute('src'));

        // Particle Flying Effect
        triggerFlyAnimation(imgEl, e.clientX, e.clientY);
    });
});

function triggerFlyAnimation(sourceImg, clientX, clientY) {
    const particle = document.createElement('div');
    particle.className = 'flying-particle';
    particle.style.backgroundImage = `url(${sourceImg.getAttribute('src')})`;
    particle.style.left = `${clientX - 20}px`;
    particle.style.top = `${clientY - 20}px`;
    document.body.appendChild(particle);

    const cartIcon = document.querySelector('#cart-btn');
    const rect = cartIcon.getBoundingClientRect();

    setTimeout(() => {
        particle.style.transform = `translate(${rect.left - clientX + 15}px, ${rect.top - clientY + 15}px) scale(0.1)`;
        particle.style.opacity = '0';
    }, 50);

    setTimeout(() => {
        particle.remove();
    }, 850);
}


// ==========================================
// SEARCH & CATEGORY FILTERING LOGIC
// ==========================================
const searchInput = document.querySelector('#menu-search');
const filterTabs = document.querySelectorAll('.filter-tab');
const menuBoxes = document.querySelectorAll('.menu .box-container .box');

let activeCategory = 'all';
let searchQuery = '';

function filterMenu() {
    menuBoxes.forEach(box => {
        const category = box.getAttribute('data-category');
        const name = box.getAttribute('data-name').toLowerCase();
        const desc = box.querySelector('p').textContent.toLowerCase();
        
        const categoryMatches = (activeCategory === 'all' || category === activeCategory);
        const searchMatches = (name.includes(searchQuery) || desc.includes(searchQuery));

        if (categoryMatches && searchMatches) {
            box.classList.remove('hidden');
        } else {
            box.classList.add('hidden');
        }
    });
}

// Category tabs click handler
filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCategory = tab.getAttribute('data-filter');
        filterMenu();
    });
});

// Search input keyup handler
searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.toLowerCase().trim();
    filterMenu();
});


// ==========================================
// "CRAFT YOUR COFFEE" STUDIO ENGINE
// ==========================================
const sizeOptions = document.querySelectorAll('#size-options .option-card');
const baseOptions = document.querySelectorAll('#base-options .option-card');
const milkOptions = document.querySelectorAll('#milk-options .option-card');
const syrupOptions = document.querySelectorAll('#syrup-options .option-card');
const toppingOptions = document.querySelectorAll('#topping-options .option-card');
const customPriceText = document.querySelector('#custom-coffee-price');
const addCustomBrewBtn = document.querySelector('#add-custom-brew-btn');

// Visual cup elements
const visualLiquid = document.querySelector('#visual-liquid');
const visualWhippedCream = document.querySelector('#visual-whipped-cream');
const visualSprinkles = document.querySelector('#visual-sprinkles');
const visualDrizzle = document.querySelector('#visual-drizzle');

let selection = {
    size: { value: 'small', price: 3.99 },
    base: { value: 'espresso', color: '#3d2314', hasmilk: false },
    milk: { value: 'none', price: 0.00 },
    syrup: { value: 'none', price: 0.00 },
    toppings: {}
};

// Size controls click listener
sizeOptions.forEach(card => {
    card.addEventListener('click', () => {
        sizeOptions.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        selection.size.value = card.getAttribute('data-value');
        selection.size.price = parseFloat(card.getAttribute('data-price'));
        
        updateStudio();
    });
});

// Base controls click listener
baseOptions.forEach(card => {
    card.addEventListener('click', () => {
        baseOptions.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        selection.base.value = card.getAttribute('data-value');
        selection.base.color = card.getAttribute('data-color');
        selection.base.hasmilk = card.getAttribute('data-hasmilk') === 'true';
        
        updateStudio();
    });
});

// Milk controls click listener
milkOptions.forEach(card => {
    card.addEventListener('click', () => {
        milkOptions.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        selection.milk.value = card.getAttribute('data-value');
        selection.milk.price = parseFloat(card.getAttribute('data-price'));
        
        updateStudio();
    });
});

// Syrup controls click listener
syrupOptions.forEach(card => {
    card.addEventListener('click', () => {
        syrupOptions.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        selection.syrup.value = card.getAttribute('data-value');
        selection.syrup.price = parseFloat(card.getAttribute('data-price'));
        
        updateStudio();
    });
});

// Topping controls toggle listener
toppingOptions.forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('active');
        const value = card.getAttribute('data-value');
        const price = parseFloat(card.getAttribute('data-price'));

        if (card.classList.contains('active')) {
            selection.toppings[value] = price;
        } else {
            delete selection.toppings[value];
        }
        
        updateStudio();
    });
});

// Recalculate price and update vector CSS coffee graphics
function updateStudio() {
    // 1. Calculate price
    let totalPrice = selection.size.price + selection.milk.price + selection.syrup.price;
    for (const topping in selection.toppings) {
        totalPrice += selection.toppings[topping];
    }
    customPriceText.textContent = totalPrice.toFixed(2);

    // 2. Liquid height by size
    let fillHeight = '40%';
    if (selection.size.value === 'medium') fillHeight = '65%';
    if (selection.size.value === 'large') fillHeight = '82%';
    visualLiquid.style.height = fillHeight;

    // 3. Liquid base color
    visualLiquid.style.backgroundColor = selection.base.color;

    // 4. Milk layer swirl
    if (selection.base.hasmilk || selection.milk.value !== 'none') {
        visualLiquid.classList.add('has-milk');
    } else {
        visualLiquid.classList.remove('has-milk');
    }

    // 5. Whipped cream topping toggle
    if (selection.toppings['whipped-cream']) {
        visualWhippedCream.classList.add('active');
    } else {
        visualWhippedCream.classList.remove('active');
    }

    // 6. Chocolate Drizzle
    if (selection.toppings['chocolate-drizzle']) {
        visualDrizzle.classList.add('active');
    } else {
        visualDrizzle.classList.remove('active');
    }

    // 7. Cinnamon Sprinkles
    if (selection.toppings['cinnamon-sprinkles']) {
        visualSprinkles.classList.add('active');
    } else {
        visualSprinkles.classList.remove('active');
    }
}

// Add Custom Craft Coffee item to Cart
addCustomBrewBtn.addEventListener('click', (e) => {
    // Generate beautiful custom recipe string
    let ingredients = [];
    ingredients.push(`${selection.size.value} base`);
    ingredients.push(selection.base.value);
    if (selection.milk.value !== 'none') ingredients.push(`${selection.milk.value.replace('-', ' ')}`);
    if (selection.syrup.value !== 'none') ingredients.push(`${selection.syrup.value} syrup`);
    
    let toppingsCount = 0;
    for (const topping in selection.toppings) {
        ingredients.push(topping.replace('-', ' '));
        toppingsCount++;
    }

    const recipeStr = ingredients.join(' • ');
    const customName = `Custom ${selection.size.value} ${selection.base.value}`;
    const finalPrice = parseFloat(customPriceText.textContent);
    const customId = `custom-${Date.now()}`;

    // Add to cart array
    cart.push({
        id: customId,
        name: customName,
        price: finalPrice,
        image: 'image/menu-3.png', // Cup-like visual reference
        quantity: 1,
        customization: recipeStr
    });

    saveAndRenderCart();

    // Trigger visual cart open and fly animation
    const container = document.querySelector('.coffee-cup-container');
    triggerFlyAnimation(container.querySelector('.cup-body'), e.clientX, e.clientY);
    setTimeout(() => { toggleCartDrawer(); }, 700);
});


// ==========================================
// INTERACTIVE RESERVATION SEATING MAP LOGIC
// ==========================================
const bookZoneDropdown = document.querySelector('#book-zone');
const bookDate = document.querySelector('#book-date');
const bookTime = document.querySelector('#book-time');
const seatingMapSection = document.querySelector('#seating-map-section');
const seatingGrid = document.querySelector('#seating-grid');
const selectedTableInput = document.querySelector('#selected-table-id');
const bookingForm = document.querySelector('#booking-form');

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
bookDate.min = today;

// Listen to seating triggers
bookZoneDropdown.addEventListener('change', generateSeatingMap);
bookDate.addEventListener('change', generateSeatingMap);
bookTime.addEventListener('change', generateSeatingMap);

// Simulate seating booking status dynamically based on seeded input dates
function generateSeatingMap() {
    const zone = bookZoneDropdown.value;
    const dateVal = bookDate.value;
    const timeVal = bookTime.value;

    if (!zone || !dateVal || !timeVal) {
        seatingMapSection.style.display = 'none';
        return;
    }

    seatingGrid.innerHTML = '';
    selectedTableInput.value = ''; // Reset selected state
    seatingMapSection.style.display = 'block';

    // Generates 8 seating slots
    for (let i = 1; i <= 8; i++) {
        // Pseudo-random seed generation to make seat occupation feel realistic and lively
        const seedValue = (dateVal.charCodeAt(dateVal.length - 1) + timeVal.charCodeAt(0) + zone.charCodeAt(0) + i) % 7;
        const isOccupied = seedValue < 3; // Occupy roughly ~40% of slots randomly

        const tableHTML = `
            <div class="dining-table ${isOccupied ? 'occupied' : 'available'}" data-table-id="${zone.toUpperCase()}-${i}" onclick="selectTable(this)">
                <i class="fas fa-chair"></i>
                <span>Table ${i}</span>
            </div>
        `;
        seatingGrid.innerHTML += tableHTML;
    }
}

// Select a seat trigger
window.selectTable = function(element) {
    if (element.classList.contains('occupied')) return;

    // Clear sibling selected states
    document.querySelectorAll('.dining-table').forEach(tbl => tbl.classList.remove('selected'));

    element.classList.add('selected');
    selectedTableInput.value = element.getAttribute('data-table-id');
};


// ==========================================
// AI BARISTA CHATBOT ("Bean") LOGIC ENGINE
// ==========================================
const chatBubble = document.querySelector('#chatbot-bubble');
const chatPanel = document.querySelector('#chatbot-panel');
const closeChat = document.querySelector('#close-chat');
const chatInput = document.querySelector('#chat-user-input');
const sendChatBtn = document.querySelector('#send-chat-btn');
const chatMessagesContainer = document.querySelector('#chatbot-messages-container');
const chatChipsContainer = document.querySelector('#chat-options-chips');

chatBubble.addEventListener('click', () => {
    chatPanel.classList.toggle('active');
    document.querySelector('#chatbot-unread').style.display = 'none';
});

closeChat.addEventListener('click', () => {
    chatPanel.classList.remove('active');
});

// Capture custom option chips clicks
document.querySelectorAll('.chat-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        processBotAction(action, btn.textContent);
    });
});

sendChatBtn.addEventListener('click', handleChatSendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChatSendMessage();
});

function handleChatSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';

    appendChatMessage(text, 'user');
    simulateBotTyping(text);
}

function appendChatMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;
    msg.innerHTML = text;
    chatMessagesContainer.appendChild(msg);

    // Scroll to bottom
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function appendBotRecommendationCard(name, price, img, id) {
    const card = document.createElement('div');
    card.className = 'chat-card';
    card.innerHTML = `
        <img src="${img}" alt="">
        <div class="chat-card-info">
            <h5>${name}</h5>
            <span>$${price}</span>
        </div>
        <div class="chat-card-add" onclick="addDrinkFromChat('${id}', '${name}', ${price}, '${img}', this)">
            <i class="fas fa-plus"></i>
        </div>
    `;
    chatMessagesContainer.appendChild(card);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

window.addDrinkFromChat = function(id, name, price, image, button) {
    addStandardItem(id, name, price, image);
    button.innerHTML = '<i class="fas fa-check" style="color: #2ecc71;"></i>';
    
    // Add flying bounce to shopping cart drawer indicator
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-plus"></i>';
    }, 1500);
};

// Process bot response flows
function processBotAction(action, labelText) {
    appendChatMessage(labelText, 'user');
    
    // Hide chips temporarily
    chatChipsContainer.style.display = 'none';
    appendTypingLoader();

    setTimeout(() => {
        removeTypingLoader();
        
        let responseHTML = '';
        if (action === 'recommend') {
            responseHTML = `Based on your mood, I highly recommend our premium house selections! 🌟 Try these:`;
            appendChatMessage(responseHTML, 'bot');
            
            // Append interactive chat item cards
            appendBotRecommendationCard("Caramel Macchiato", "5.99", "image/menu-2.png", "menu-2");
            appendBotRecommendationCard("Nitro Cold Brew", "6.49", "image/menu-4.png", "menu-4");
            appendBotRecommendationCard("Chocolate Lava Muffin", "4.49", "image/menu-6.png", "menu-6");
        } else if (action === 'faq') {
            responseHTML = `Here are some quick details for you! 📍<br><br>
                ⏱️ <strong>Operating Hours:</strong> 7:00 AM - 10:00 PM (Everyday)<br>
                📍 <strong>Location:</strong> Perú, Lima (Central Hub) & international branches in USA, France, Africa, and Japan.<br>
                📞 <strong>Direct Line:</strong> +123-456-7890<br>
                🥐 <strong>Freshness Guarantee:</strong> All pastries are baked fresh at 5:00 AM every single morning!`;
            appendChatMessage(responseHTML, 'bot');
        } else if (action === 'customizer') {
            responseHTML = `Our virtual <strong>Coffee Studio</strong> is super easy to use! 🎨☕<br><br>
                1. Scroll up to the <strong>"Coffee Studio"</strong> section.<br>
                2. Select your cup size (S, M, L).<br>
                3. Choose a base drink & customize your milk choice or syrups.<br>
                4. Toggle premium toppings (like whipped cream or cinnamon sprinkles) and see your cup compile in real-time!<br>
                5. Hit <strong>"Add Custom Brew"</strong> and our baristas will prepare it exactly to order!`;
            appendChatMessage(responseHTML, 'bot');
        }

        // Restore chips
        chatChipsContainer.style.display = 'flex';
    }, 1000);
}

// Pre-scripted responses based on conversational keywords
function simulateBotTyping(userInput) {
    appendTypingLoader();

    const query = userInput.toLowerCase();

    setTimeout(() => {
        removeTypingLoader();
        let reply = '';

        if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
            reply = `Hello! Always a pleasure to see a fellow coffee lover. 😊 How can I assist you today? Try clicking the quick actions below!`;
        } else if (query.includes('recommend') || query.includes('sweet') || query.includes('menu') || query.includes('drink')) {
            reply = `I would love to recommend something sweet! 🍩 Our <strong>Caramel Macchiato</strong> ($5.99) or our molten **Chocolate Lava Muffin** ($4.49) will satisfy your sweet tooth completely! <br><br>Click the '+' below to order instantly:`;
            appendChatMessage(reply, 'bot');
            appendBotRecommendationCard("Caramel Macchiato", "5.99", "image/menu-2.png", "menu-2");
            appendBotRecommendationCard("Chocolate Lava Muffin", "4.49", "image/menu-6.png", "menu-6");
            return;
        } else if (query.includes('strong') || query.includes('energy') || query.includes('wake')) {
            reply = `A strong wake-up call coming right up! ⚡ You need our **Espresso Classico** ($4.99). It is drawn from organic roasted Arabica beans, packing a robust coffee flavor.<br><br>Click the '+' to add to your order:`;
            appendChatMessage(reply, 'bot');
            appendBotRecommendationCard("Espresso Classico", "4.99", "image/menu-1.png", "menu-1");
            return;
        } else if (query.includes('hour') || query.includes('time') || query.includes('close') || query.includes('open')) {
            reply = `We open at <strong>7:00 AM</strong> and close at <strong>10:00 PM</strong> daily! Perfect for morning wake-up brews and late evening dessert wind-downs. ⏱️`;
        } else if (query.includes('custom') || query.includes('craft') || query.includes('make my own')) {
            reply = `Yes! You can craft your own espresso profiles at our virtual <strong>Coffee Studio</strong>! Scroll to the 'Coffee Studio' tab in our navbar to see the visual customizer. 🎨`;
        } else if (query.includes('location') || query.includes('find') || query.includes('address') || query.includes('branch')) {
            reply = `Our central store is located in **Lima, Perú**. We also have highly popular international branches in USA, France, Africa, and Japan! 🌍`;
        } else if (query.includes('book') || query.includes('reserve') || query.includes('table')) {
            reply = `Reserving a table is easy! 📅 Scroll to our <strong>"Booking"</strong> section, pick your preferred seating zone (Window, Cozy Fireplace, Patio, Bar), click your table on our interactive seating map, and we'll hold it for you!`;
        } else {
            reply = `I'm not quite sure I understand that query, but I'm learning! ☕ Try asking me about "recommending a coffee", "operating hours", "where to find us", or "custom brewing"!`;
        }

        appendChatMessage(reply, 'bot');
    }, 1200);
}

function appendTypingLoader() {
    const loader = document.createElement('div');
    loader.className = 'chat-msg bot typing-loader';
    loader.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatMessagesContainer.appendChild(loader);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function removeTypingLoader() {
    const loader = chatMessagesContainer.querySelector('.typing-loader');
    if (loader) loader.remove();
}


// ==========================================
// MODAL NOTIFICATIONS & POP-UP LAYOUTS
// ==========================================
const globalModalOverlay = document.querySelector('#global-modal-overlay');
const modalContentContainer = document.querySelector('#modal-content-container');

function showModal(contentHTML) {
    modalContentContainer.innerHTML = `
        <i class="fas fa-times close-modal" onclick="closeGlobalModal()"></i>
        ${contentHTML}
    `;
    globalModalOverlay.classList.add('active');
}

window.closeGlobalModal = function() {
    globalModalOverlay.classList.remove('active');
};

// Close modal on escape key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGlobalModal();
});


// ==========================================
// ORDER CHECKOUT FLOW (pulsing Live order tracker)
// ==========================================
const checkoutBtn = document.querySelector('#checkout-btn');

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;

    // 1. Generate digital receipt markup
    let receiptHTML = '';
    let grandTotal = 0;
    cart.forEach(item => {
        grandTotal += item.price * item.quantity;
        receiptHTML += `
            <div style="display: flex; justify-content: space-between; font-size: 1.4rem; padding: 0.5rem 0;">
                <span>${item.name} x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
    });

    const tax = grandTotal * 0.08;
    const finalAmount = grandTotal + tax;

    // 2. Render Checkout success & pulse Order Tracker
    const trackerMarkup = `
        <h2 style="font-size: 2.5rem; color: var(--main-color); margin-bottom: 1rem;">Order Placed Successfully! 🎉</h2>
        <p style="font-size: 1.5rem; color: var(--text-muted); margin-bottom: 3rem;">Our baristas are preparing your roasted goodness.</p>

        <!-- Checkout Receipt Summary -->
        <div style="background: rgba(120,120,120,0.05); border: .1rem solid rgba(120,120,120,0.1); border-radius: 1.5rem; padding: 2rem; margin-bottom: 3rem; text-align: left;">
            <h4 style="font-size: 1.6rem; color: var(--main-color); margin-bottom: 1rem; border-bottom: .1rem solid rgba(120,120,120,0.1); padding-bottom: 0.5rem;">Receipt Summary</h4>
            ${receiptHTML}
            <div style="border-top: .1rem dashed rgba(120,120,120,0.2); padding-top: 1rem; margin-top: 1rem; font-size: 1.4rem;">
                <div style="display: flex; justify-content: space-between;">
                    <span>VAT (8%):</span>
                    <span>$${tax.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 1.8rem; font-weight: 600; color: var(--text-color); margin-top: 0.5rem;">
                    <span>Total Paid:</span>
                    <span>$${finalAmount.toFixed(2)}</span>
                </div>
            </div>
        </div>

        <!-- Pulsing Tracker steps -->
        <div class="order-tracker">
            <div class="tracker-line-progress" id="tracker-progress"></div>
            
            <div class="tracker-step completed" id="step-1">
                <div class="step-icon"><i class="fas fa-clipboard-list"></i></div>
                <span>Received</span>
            </div>
            <div class="tracker-step" id="step-2">
                <div class="step-icon"><i class="fas fa-fire"></i></div>
                <span>Brewing</span>
            </div>
            <div class="tracker-step" id="step-3">
                <div class="step-icon"><i class="fas fa-motorcycle"></i></div>
                <span>Transit</span>
            </div>
            <div class="tracker-step" id="step-4">
                <div class="step-icon"><i class="fas fa-check-circle"></i></div>
                <span>Delivered</span>
            </div>
        </div>
    `;

    toggleCartDrawer(); // Close side drawer
    showModal(trackerMarkup);

    // 3. Reset Cart array completely
    cart = [];
    saveAndRenderCart();

    // 4. Trigger Tracker Step progress updates with timed visual offsets
    const progressBar = document.querySelector('#tracker-progress');
    const step2 = document.querySelector('#step-2');
    const step3 = document.querySelector('#step-3');
    const step4 = document.querySelector('#step-4');

    // Stage 1 -> Stage 2 (Brewing)
    setTimeout(() => {
        progressBar.style.width = '33%';
        step2.classList.add('active');
    }, 2000);

    // Stage 2 -> Stage 3 (Transit)
    setTimeout(() => {
        progressBar.style.width = '66%';
        step2.classList.remove('active');
        step2.classList.add('completed');
        step3.classList.add('active');
    }, 5500);

    // Stage 3 -> Stage 4 (Delivered)
    setTimeout(() => {
        progressBar.style.width = '100%';
        step3.classList.remove('active');
        step3.classList.add('completed');
        step4.classList.add('completed');
    }, 9000);
});


// ==========================================
// RESERVE TABLE DIGITAL TICKET GENERATOR
// ==========================================
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.querySelector('#book-name').value;
    const guests = document.querySelector('#book-guests').value;
    const zone = document.querySelector('#book-zone').value;
    const dateVal = document.querySelector('#book-date').value;
    const timeVal = document.querySelector('#book-time').value;
    const tableId = selectedTableInput.value;

    if (!tableId) {
        alert("Please pick your preferred available seat table on our seating chart map first! 🗺️ Chair icons highlight in copper brown.");
        return;
    }

    const zonesTextMap = {
        'window': 'Window View',
        'cozy': 'Cozy Fireplace',
        'bar': 'Bar Counter',
        'patio': 'Outdoor Patio'
    };

    const refNo = `RES-${Math.floor(100000 + Math.random() * 900000)}`;

    const ticketMarkup = `
        <h2 style="font-size: 2.5rem; color: var(--main-color); margin-bottom: 0.5rem;">Reservation Confirmed! 🥂</h2>
        <p style="font-size: 1.4rem; color: var(--text-muted); margin-bottom: 2rem;">Show your digital table pass to our staff at check-in.</p>

        <!-- Digital Ticket -->
        <div class="digital-ticket">
            <div class="ticket-header">
                <h4>COFFEE STATION RES</h4>
                <span class="ref-no">${refNo}</span>
            </div>
            <div class="ticket-body">
                <div>
                    <span>GUEST NAME</span>
                    <p>${name}</p>
                </div>
                <div>
                    <span>TABLE ID</span>
                    <p style="color: var(--accent-color); font-weight: 700;">${tableId}</p>
                </div>
                <div>
                    <span>DATE</span>
                    <p>${dateVal}</p>
                </div>
                <div>
                    <span>TIME</span>
                    <p>${timeVal}</p>
                </div>
                <div>
                    <span>GUESTS</span>
                    <p>${guests} Persons</p>
                </div>
                <div>
                    <span>DINING ZONE</span>
                    <p>${zonesTextMap[zone]}</p>
                </div>
            </div>
            <div class="ticket-footer">
                <div class="barcode"></div>
                <span>${refNo}</span>
            </div>
        </div>

        <button class="btn" onclick="window.print()" style="margin-top: 1rem;"><i class="fas fa-print" style="margin-right: .8rem;"></i>Print Table Pass</button>
    `;

    showModal(ticketMarkup);
    bookingForm.reset();
    seatingMapSection.style.display = 'none'; // Collapse map
});


// ==========================================
// BOOTSTRAP INITIAL RENDER STAGES
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Render stored cart items
    renderCart();

    // Trigger visual customizer calculations once
    updateStudio();
});