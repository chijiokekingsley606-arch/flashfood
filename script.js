let appDatabase = JSON.parse(localStorage.getItem("flashfood_p2p_core")) || [
  { id: 1, merchant: "Iya Basira Kitchen", item: "2 Packs of Amala, Gbegiri & Beef", originalPrice: 15.00, phone: "2348012345678", account: "2034567890", bank: "GTBank", wallet: 0, state: "Available", pin: null, buyer: "" },
  { id: 2, merchant: "Chicken Republic", item: "Crunchy Wings Combo & Chips", originalPrice: 20.00, phone: "2349087654321", account: "1012345678", bank: "Zenith Bank", wallet: 0, state: "Available", pin: null, buyer: "" }
];

let sessionUser = "";
let sessionRole = "";

function commitToStorage() {
  localStorage.setItem("flashfood_p2p_core", JSON.stringify(appDatabase));
}

function processPortalRouting() {
  const name = document.getElementById("user-name-input").value.trim();
  const role = document.getElementById("user-role-select").value;
  
  if (name === "") { return alert("Please type an active account title to connect!"); }
  
  sessionUser = name;
  sessionRole = role;
  
  document.getElementById("auth-view").classList.remove("active-view");
  
  if (sessionRole === "buyer") {
    document.body.className = "theme-buyer";
    document.getElementById("b-tag").innerText = sessionUser;
    document.getElementById("buyer-view").classList.add("active-view");
    buildBuyerMarketplaceDeck();
  } else {
    document.body.className = "theme-company";
    document.getElementById("c-tag").innerText = sessionUser;
    document.getElementById("company-view").classList.add("active-view");
    buildCompanyDashboardView();
  }
}

function exitToGateway() {
  document.body.className = "";
  document.getElementById("buyer-view").classList.remove("active-view");
  document.getElementById("company-view").classList.remove("active-view");
  document.getElementById("user-name-input").value = "";
  document.getElementById("auth-view").classList.add("active-view");
}

function buildBuyerMarketplaceDeck() {
  const deck = document.getElementById("buyer-render-deck");
  deck.innerHTML = "";
  
  appDatabase.forEach(deal => {
    let dealPriceUSD = deal.originalPrice * 0.30; 
    let cardStatus = deal.state;
    let badgeStyle = "background:rgba(255,255,255,0.1); color:#5eead4;";
    
    let actionBtnText = "I Have Made the Bank Transfer";
    let blockBtn = false;
    
    if (deal.state === "In Transit") { 
      badgeStyle = "background:rgba(56,189,248,0.1); color:#38bdf8;"; 
      actionBtnText = (deal.buyer === sessionUser) ? "🏍️ Dispatch Rider en Route" : "Reserved";
      blockBtn = true; 
    } else if (deal.state === "Settled") { 
      badgeStyle = "background:rgba(34,197,94,0.1); color:#22c55e;"; 
      actionBtnText = "Transaction Completed Safely ✅"; 
      blockBtn = true; 
    }
    
    let textMessage = encodeURIComponent(`Hello ${deal.merchant}, I am ${sessionUser}. I just made a transfer of $${dealPriceUSD.toFixed(2)} for the [${deal.item}]. Please confirm receipt!`);
    let whatsappLink = `https://wa.me{deal.phone}?text=${textMessage}`;

    let trackingMarkup = (deal.state === "In Transit" && deal.buyer === sessionUser)
      ? `<div class="track-box">
          <strong>📦 LOGISTICS RADAR ENGINE:</strong><br>
          Status: Rider picked up package.<br>
          📍 ETA: 12 mins to your destination.<br>
          🔒 YOUR SECURE ARRIVAL TOKEN: <strong>${deal.pin}</strong>
         </div>` : "";

    deck.innerHTML += `
      <div class="card-buyer">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <strong style="font-size:17px; color:#fff;">${deal.merchant}</strong>
          <span style="font-size:11px; font-weight:bold; padding:2px 8px; border-radius:10px; ${badgeStyle}">${cardStatus}</span>
        </div>
        <span style="font-size:14px; color:#cbd5e1; display:block; margin-bottom:10px;">${deal.item}</span>
        
        <div class="comm-row">
          <a class="btn-whatsapp" href="${whatsappLink}" target="_blank">📹 WhatsApp Proof Video</a>
          <a class="btn-call" href="tel:${deal.phone}">📞 Audio Call Merchant</a>
        </div>
        
        <div class="bank-badge">
          <span style="font-size:9px; color:#2dd4bf; font-weight:bold; display:block;">P2P DIRECT BANK LEDGER TARGET</span>
          🏦 Bank: <strong>${deal.bank}</strong> <br>
          🔢 Account: <strong>${deal.account}</strong> <br>
          💵 Exact Cost: <strong>$${dealPriceUSD.toFixed(2)}</strong>
        </div>
        
        <button class="btn" style="background:#16a34a;" ${blockBtn ? 'disabled' : ''} onclick="confirmP2PTransfer(${deal.id})">
          ${actionBtnText}
        </button>
        ${trackingMarkup}
      </div>
    `;
  });
}

function buildCompanyDashboardView() {
  let combinedEarnings = 0;
  appDatabase.forEach(deal => {
    if (deal.merchant.toLowerCase() === sessionUser.toLowerCase()) {
      combinedEarnings += deal.wallet;
    }
  });
  document.getElementById("merchant-balance-label").innerText = `$${combinedEarnings.toFixed(2)}`;
}

function publishMerchantSurplusStream() {
  const name = document.getElementById("p-food-name").value.trim();
  const price = parseFloat(document.getElementById("p-food-price").value);
  const phone = document.getElementById("p-company-phone").value.trim();
  const acc = document.getElementById("p-bank-acc").value.trim();
  const bank = document.getElementById("p-bank-name").value.trim();
  
  if (name === "" || isNaN(price) || phone === "" || acc === "" || bank === "") {
    return alert("Please fill out your complete inventory parameters and banking credentials.");
  }
  
  let newFeedItem = {
    id: appDatabase.length + 1,
    merchant: sessionUser,
    item: name,
    originalPrice: price,
    phone: phone,
    account: acc,
    bank: bank,
    wallet: 0,
    state: "Available",
    pin: null,
    buyer: ""
  };
  
  appDatabase.push(newFeedItem);
  commitToStorage();
  
  document.getElementById("p-food-name").value = "";
  document.getElementById("p-food-price").value = "";
  document.getElementById("p-company-phone").value = "";
  document.getElementById("p-bank-acc").value = "";
  document.getElementById("p-bank-name").value = "";
  
  alert("🚀 Custom Inventory Core Broadcasted Successfully!");
  buildCompanyDashboardView();
}

function confirmP2PTransfer(id) {
  let target = appDatabase.find(d => d.id === id);
  if (target && target.state === "Available") {
    target.state = "In Transit"; 
    target.buyer = sessionUser;
    target.pin = Math.floor(1000 + Math.random() * 9000);
    commitToStorage();
    
    alert(`📢 ALERT BROADCASTED!\nOpen WhatsApp to share proof of payment.\nYour map tracker and 4-digit arrival gate pin are now active!`);
    buildBuyerMarketplaceDeck();
  }
}

function verifySecurePayoutTicket() {
  const entry = parseInt(document.getElementById("merchant-pin-entry").value);
  if (isNaN(entry)) { return alert("Please parse a valid numeric verification token."); }
  
  let processingMatch = appDatabase.find(f => 
    f.merchant.toLowerCase() === sessionUser.toLowerCase() && 
    f.pin === entry && 
    f.state === "In Transit"
  );
  
  if (processingMatch) {
    processingMatch.state = "Settled";
    let finalSalePrice = processingMatch.originalPrice * 0.30;
    processingMatch.wallet = finalSalePrice * 0.90;
    
    commitToStorage();
    document.getElementById("merchant-pin-entry").value = "";
    alert(`✅ CLEARANCE TRANSACTION APPROVED!\nCollection Token accepted. Dispatch complete.\n+$${processingMatch.wallet.toFixed(2)} added to store statement net earnings!`);
    buildCompanyDashboardView();
  } else {
    alert("❌ SECURITY ALERT: Payout token mismatch. Ensure transfer cleared or check pin string values.");
  }
}

function wipeLocalSystemDB() {
  localStorage.removeItem("flashfood_p2p_core");
  location.reload();
}
