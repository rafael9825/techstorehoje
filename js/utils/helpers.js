function formatarPreco(valor){ return `R$ ${valor.toFixed(2).replace('.', ',')}`; }
function debounce(fn, delay=250){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), delay); }; }


