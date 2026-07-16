// Progressivo: sem JS o site fica 100% visível; JS só adiciona menu mobile,
// animação de entrada e contadores.
document.documentElement.classList.add('js');

// Menu mobile
var btn = document.getElementById('menuBtn');
var menu = document.getElementById('menu');
btn.addEventListener('click', function () {
  var aberto = menu.classList.toggle('aberto');
  btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
});
menu.addEventListener('click', function (e) {
  if (e.target.tagName === 'A') menu.classList.remove('aberto');
});

// Orçamento rápido: monta a mensagem estruturada e abre o WhatsApp
var orcForm = document.getElementById('orcForm');
if (orcForm) {
  orcForm.addEventListener('submit', function (e) {
    e.preventDefault();
    function v(id) {
      var el = document.getElementById(id);
      return el ? el.value.trim() : '';
    }
    var linhas = ['Olá! Quero um orçamento. Vi no site:'];
    if (v('orcCategoria')) linhas.push('Categoria: ' + v('orcCategoria'));
    if (v('orcProduto')) linhas.push('Produto: ' + v('orcProduto'));
    if (v('orcQtd')) linhas.push('Quantidade: ' + v('orcQtd'));
    if (v('orcNome')) linhas.push('Nome: ' + v('orcNome'));
    if (v('orcCidade')) linhas.push('Cidade: ' + v('orcCidade'));
    window.open('https://wa.me/5583991708536?text=' + encodeURIComponent(linhas.join('\n')), '_blank', 'noopener');
  });
}

// Animação de entrada nas seções
if ('IntersectionObserver' in window) {
  var alvos = document.querySelectorAll('.card, .serv, .info, .sobre-txt, .sobre-foto, .galeria img, .stat');
  alvos.forEach(function (el) { el.classList.add('anim'); });
  var io = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('visivel');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });
  alvos.forEach(function (el) { io.observe(el); });

  // Contadores: o valor real já está no HTML; a animação só roda por cima
  var contadores = document.querySelectorAll('[data-conta]');
  var ioNum = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (en) {
      if (!en.isIntersecting) return;
      ioNum.unobserve(en.target);
      var el = en.target;
      var fim = parseInt(el.getAttribute('data-conta'), 10);
      var sufixo = el.getAttribute('data-sufixo') || '';
      var inicio = performance.now();
      var dur = 1200;
      function passo(agora) {
        var t = Math.min((agora - inicio) / dur, 1);
        var val = Math.round(fim * (1 - Math.pow(1 - t, 3)));
        el.textContent = val.toLocaleString('pt-BR') + sufixo;
        if (t < 1) requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    });
  }, { threshold: 0.6 });
  contadores.forEach(function (el) { ioNum.observe(el); });
}
