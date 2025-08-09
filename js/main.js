// =====================
//  DADOS (12 produtos)
// =====================
const PRODUTOS = [
  { id: 1, nome: "Mouse Gamer", preco: 99.90, img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400", categoria: "periféricos" },
  { id: 2, nome: "Teclado Mecânico", preco: 249.90, img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", categoria: "periféricos" },
  { id: 3, nome: "Headset USB", preco: 189.00, img: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400", categoria: "áudio" },
  { id: 4, nome: "Samsung Galaxy S24", preco: 8999.00, img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400", categoria: "acessórios" },
  { id: 5, nome: "Apple Watch Series 9", preco: 2799.00, img: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400", categoria: "computadores" },
  { id: 6, nome: "Teclado Mêcanico", preco: 799.00, img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400", categoria: "computadores" },
  { id: 7, nome: "Sony WH-1000XM5", preco: 2999.00, img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400", categoria: "armazenamento" },
  { id: 8, nome: "Dell XPS 13", preco: 7999.90, img: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400", categoria: "armazenamento" },
  { id: 9, nome: "iPhone 15 Pro", preco: 6299.00, img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400", categoria: "acessórios" },
  { id: 10, nome: "MacBook Air M2", preco: 10999.00, img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", categoria: "acessórios" },
  { id: 11, nome: "AirPods Pro", preco: 2299.00, img: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400", categoria: "acessórios" },
  { id: 12, nome: "Hub USB 4 portas", preco: 79.90, img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400", categoria: "acessórios" }
];

// =====================
//  VIEW HELPERS
// =====================
function cardProduto(p) {
  return `
    <li class="produto">
      <img
  src="${p.img}"
  alt="${p.nome}"
  loading="lazy"
  decoding="async"
  width="80" height="60"
  style="aspect-ratio: 4 / 3; object-fit: cover;"
>

      <h3>${p.nome}</h3>
      <p>${formatarPreco(p.preco)}</p>
      <button class="btn-add" data-id="${p.id}">Adicionar</button>
    </li>
  `;
}


function render(lista) {
  const ul = document.getElementById("lista-produtos");
  if (!ul) return;
  ul.innerHTML = lista.map(cardProduto).join("");
}

// =====================
//  ESTADO + PREFERÊNCIAS
// =====================
let termo = "";
let ordenacao = "none"; // none | asc | desc
let cat = "all";

const PREF_KEY = "techstorehoje:prefs";       // { q, sort, cat }
const CART_KEY = "techstorehoje:cart";        // array de {id, qty}
const COUNT_KEY = "techstorehoje:cartCount";   // número do badge
const SESSION_OK = "techstorehoje:sessionInit"; // marca 1ª visita da sessão

function savePrefs() {
  localStorage.setItem(PREF_KEY, JSON.stringify({ q: termo, sort: ordenacao, cat }));
}
function loadPrefs() {
  const raw = localStorage.getItem(PREF_KEY);
  if (!raw) return;
  const p = JSON.parse(raw);
  termo = p.q ?? "";
  ordenacao = p.sort ?? "none";
  cat = p.cat ?? "all";

  // refletir nos inputs
  const qEl = document.getElementById("q");
  const sortEl = document.getElementById("sort");
  const catEl = document.getElementById("cat");
  if (qEl) qEl.value = termo;
  if (sortEl) sortEl.value = ordenacao;
  if (catEl) catEl.value = cat;
}

// Força estado "limpo" só na primeira visita desta aba/janela
function resetIfFirstSession() {
  if (!sessionStorage.getItem(SESSION_OK)) {
    termo = "";
    ordenacao = "none";
    cat = "all";
    savePrefs();
    sessionStorage.setItem(SESSION_OK, "1");
  }
}

// =====================
//  FILTROS E ORDENAÇÃO
// =====================
function aplicarFiltros() {
  const empty = document.getElementById("empty");

  let lista = PRODUTOS
    .filter(p => p.nome.toLowerCase().includes(termo.toLowerCase()))
    .filter(p => (cat === "all" ? true : p.categoria === cat));

  if (ordenacao === "asc") lista.sort((a, b) => a.preco - b.preco);
  if (ordenacao === "desc") lista.sort((a, b) => b.preco - a.preco);

  render(lista);

  if (empty) {
    if (lista.length === 0) {
      empty.hidden = false;
      empty.textContent = "Não encontramos produtos para sua busca/filtragem.";
    } else {
      empty.hidden = true;
    }
  }
  savePrefs();
}

// =====================
//  CARRINHO (itens + qty)
// =====================
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) ?? []; }
  catch { return []; }
}
function setCart(list) {
  localStorage.setItem(CART_KEY, JSON.stringify(list));
  const count = list.reduce((s, i) => s + i.qty, 0);
  localStorage.setItem(COUNT_KEY, String(count));
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = String(count);
}
function addToCart(productId) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) item.qty += 1; else cart.push({ id: productId, qty: 1 });
  setCart(cart);
  renderCart(); // atualiza drawer se estiver aberto
}
function removeFromCart(productId) {
  const cart = getCart().filter(i => i.id !== productId);
  setCart(cart);
  renderCart();
}
function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) return removeFromCart(productId);
  setCart(cart);
  renderCart();
}
function clearCart() { setCart([]); renderCart(); }

function cartTotalBRL(list) {
  const total = list.reduce((s, i) => {
    const p = PRODUTOS.find(p => p.id === i.id);
    return s + (p ? p.preco * i.qty : 0);
  }, 0);
  return formatarPreco(total);
}
function renderCart() {
  const ul = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  const btnCheckout = document.querySelector(".drawer .primary");
  const cart = getCart();

  if (!ul || !totalEl) return; // se não existir drawer no HTML

  ul.innerHTML = cart.map(i => {
    const p = PRODUTOS.find(p => p.id === i.id);
    if (!p) return "";
    return `
      <li class="cart-item">
        <img src="${p.img}" alt="${p.nome}">
        <div>
          <h4>${p.nome}</h4>
          <div class="price">${formatarPreco(p.preco)} • qtd: ${i.qty}</div>
        </div>
        <div class="qty">
          <button class="dec" data-id="${p.id}">−</button>
          <button class="inc" data-id="${p.id}">+</button>
          <button class="rm"  data-id="${p.id}" title="Remover">✕</button>
        </div>
      </li>
    `;
  }).join("");

  totalEl.textContent = cartTotalBRL(cart);
  if (btnCheckout) btnCheckout.disabled = cart.length === 0;
}
function initCartUI() {
  // badge inicial
  const badge = document.getElementById("cart-count");
  const initial = Number(localStorage.getItem(COUNT_KEY) ?? 0);
  if (badge) badge.textContent = String(initial);

  // abrir/fechar drawer
  const drawer = document.getElementById("cart-drawer");
  const openBtn = document.getElementById("open-cart");
  const closeBtn = document.getElementById("close-cart");
  const overlay = document.getElementById("cart-overlay");
  const clearBtn = document.getElementById("clear-cart");

  function open() { drawer?.classList.add("open"); renderCart(); }
  function close() { drawer?.classList.remove("open"); }

  openBtn?.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  overlay?.addEventListener("click", close);
  clearBtn?.addEventListener("click", clearCart);

  // cliques dentro do carrinho
  document.getElementById("cart-items")?.addEventListener("click", (e) => {
    const id = Number(e.target.dataset.id);
    if (e.target.classList.contains("inc")) return changeQty(id, +1);
    if (e.target.classList.contains("dec")) return changeQty(id, -1);
    if (e.target.classList.contains("rm")) return removeFromCart(id);
  });

  // cliques nos cards (Adicionar)
  document.getElementById("lista-produtos")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add");
    if (!btn) return;
    addToCart(Number(btn.dataset.id));
  });
}

// =====================
//  INICIALIZAÇÃO
// =====================
document.addEventListener("DOMContentLoaded", () => {
  // carrega o que estava salvo
  loadPrefs();

  // garante "Todos + Ordenar + busca vazia" na 1ª visita desta aba
  resetIfFirstSession();

  // desenha lista já filtrando
  aplicarFiltros();

  // ativa carrinho/badge e delegações
  initCartUI();

  // inputs da toolbar
  const q = document.getElementById("q");
  const sort = document.getElementById("sort");
  const catSel = document.getElementById("cat");

  if (q) {
    q.addEventListener("input", debounce(() => {
      termo = q.value.trim();
      aplicarFiltros();
    }, 250));
  }
  if (sort) {
    sort.addEventListener("change", () => {
      ordenacao = sort.value;
      aplicarFiltros();
    });
  }
  if (catSel) {
    catSel.addEventListener("change", () => {
      cat = catSel.value;
      aplicarFiltros();
    });
  }
});


