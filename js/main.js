// Progressivo: sem JS o site fica 100% visível; JS só adiciona menu mobile,
// animação de entrada e contadores.
document.documentElement.classList.add('js');

// F5 volta pro topo: só em RELOAD (navegação por âncora continua normal)
(function () {
  var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  var recarregou = nav ? nav.type === 'reload' : (performance.navigation && performance.navigation.type === 1);
  if (!recarregou) return;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  function topo() { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
  topo();
  window.addEventListener('pageshow', topo);
  window.addEventListener('load', function () { setTimeout(topo, 0); });
})();

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

// Chegou na loja: lista de entradas recentes gerada pelo vigia de NF-e
fetch('chegou.json')
  .then(function (r) { return r.ok ? r.json() : null; })
  .then(function (d) {
    if (!d || !d.itens || !d.itens.length) return;
    var ul = document.getElementById('chegouLista');
    var ZAP = 'https://wa.me/5583991708536?text=';
    d.itens.forEach(function (it) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = ZAP + encodeURIComponent(
        'Olá! Vi no site que chegou na loja: ' + it.nome + '. Tem disponível? Qual o preço?');
      a.target = '_blank';
      a.rel = 'noopener';
      if (it.foto) {
        var img = document.createElement('img');
        img.src = it.foto;
        img.alt = it.nome;
        img.loading = 'lazy';
        // se a foto sumir do repo, o card continua de pé só com o nome
        img.onerror = function () { img.remove(); };
        a.appendChild(img);
      }
      var nome = document.createElement('strong');
      nome.textContent = it.nome;
      a.appendChild(nome);
      if (it.data) {
        var p = it.data.split('-');
        var s = document.createElement('span');
        s.textContent = 'chegou ' + p[2] + '/' + p[1];
        a.appendChild(s);
      }
      li.appendChild(a);
      ul.appendChild(li);
    });
    document.getElementById('chegou').hidden = false;
  })
  .catch(function () {});

// Seletor de bomba (bombas.html): perguntas curtas -> indicação + WhatsApp já preenchido.
// Sem JS a caixa mostra o convite pro WhatsApp, então nada se perde.
(function () {
  var caixa = document.getElementById('seletorBomba');
  if (!caixa) return;

  var ZAP = 'https://wa.me/5583991708536?text=';
  // Alturas e vazões são as fichas do fabricante já publicadas na vitrine desta página.
  var BOMBAS = {
    ecco:    { nome: 'Anauger Ecco',               tag: '300 W · puxa até 50 metros',        altura: 50, vazao: 1400,  foto: 'img/bombas/anauger-ecco.jpg',              onde: '#bombas' },
    s5g:     { nome: 'Anauger Sappo 5G',           tag: '320 W · puxa até 60 metros',        altura: 60, vazao: 1500,  foto: 'img/bombas/anauger-sappo-5g.jpg',          onde: '#bombas' },
    s800:    { nome: 'Anauger Sappo 800 Extreme',  tag: '380 W · puxa até 70 metros',        altura: 70, vazao: 2200,  foto: 'img/bombas/anauger-sappo-800-extreme.jpg', onde: '#bombas' },
    s900:    { nome: 'Anauger Sappo 900 Extreme',  tag: '450 W · puxa até 85 metros',        altura: 85, vazao: 2400,  foto: 'img/bombas/anauger-sappo-900-extreme.jpg', onde: '#bombas' },
    cm60:    { nome: 'Ecobomba CM-60 1/2 cv',      tag: '220V · puxa até 17 metros',         altura: 17, vazao: 1620,  foto: 'img/bombas/ecobomba-cm60.jpg',             onde: '#superficie' },
    ferrari: { nome: 'Ferrari Acquapump 1/2 cv',   tag: '370 W · 220V · puxa até 22 metros', altura: 22, vazao: 1700,  foto: 'img/bombas/ferrari-acquapump-meio-cv.jpg', onde: '#superficie' },
    toyama:  { nome: 'Toyama TWP50SH-GII',         tag: 'Gasolina · 5,5 HP · 2 polegadas',   altura: 30, vazao: 36000, foto: 'img/bombas/toyama-twp50sh-gii.jpg',        onde: '#superficie' }
  };

  var PERGUNTAS = {
    origem: {
      titulo: 'De onde a água vai ser puxada?',
      opcoes: [
        { val: 'poco',       icone: 'ri-drop-line',       txt: 'Poço tubular ou poço profundo', sub: 'A bomba desce e fica dentro d\'água' },
        { val: 'superficie', icone: 'ri-water-flash-line', txt: 'Cisterna, açude, rio ou barreiro', sub: 'A bomba fica fora d\'água' },
        { val: 'naosei',     icone: 'ri-question-line',    txt: 'Não sei dizer' }
      ],
      proxima: function (v) { return v === 'poco' ? 'profundidade' : v === 'superficie' ? 'energia' : null; }
    },
    profundidade: {
      titulo: 'Qual a profundidade do poço, mais ou menos?',
      opcoes: [
        { val: '30',     icone: 'ri-arrow-down-line', txt: 'Até 30 metros' },
        { val: '50',     icone: 'ri-arrow-down-line', txt: 'De 30 a 50 metros' },
        { val: '70',     icone: 'ri-arrow-down-line', txt: 'De 50 a 70 metros' },
        { val: '85',     icone: 'ri-arrow-down-line', txt: 'Mais de 70 metros' },
        { val: 'naosei', icone: 'ri-question-line',   txt: 'Não sei a profundidade' }
      ],
      proxima: function (v) { return v === 'naosei' ? null : 'caixa'; }
    },
    caixa: {
      titulo: 'A caixa d\'água fica a que altura do chão?',
      opcoes: [
        { val: '5',  icone: 'ri-home-4-line',     txt: 'No telhado da casa', sub: 'Até uns 5 metros' },
        { val: '12', icone: 'ri-building-line',   txt: 'Em torre', sub: 'De 5 a 12 metros' },
        { val: '20', icone: 'ri-building-2-line', txt: 'Torre alta', sub: 'Mais de 12 metros' }
      ],
      proxima: function () { return 'uso'; }
    },
    uso: {
      titulo: 'Pra que você vai usar essa água?',
      opcoes: [
        { val: 'casa',      icone: 'ri-home-heart-line', txt: 'Só o consumo da casa' },
        { val: 'criacao',   icone: 'ri-bear-smile-line', txt: 'Casa e criação de animais' },
        { val: 'irrigacao', icone: 'ri-plant-line',      txt: 'Irrigação, horta ou pomar' }
      ],
      proxima: function () { return null; }
    },
    energia: {
      titulo: 'Tem energia elétrica no local da bomba?',
      opcoes: [
        { val: 'sim', icone: 'ri-flashlight-line',   txt: 'Tem energia (220V)' },
        { val: 'nao', icone: 'ri-gas-station-line',  txt: 'Não tem energia no local', sub: 'Aí a bomba tem que ser a gasolina' }
      ],
      proxima: function (v) { return v === 'sim' ? 'succao' : null; }
    },
    succao: {
      titulo: 'A água está a mais de 8 metros abaixo de onde a bomba vai ficar?',
      opcoes: [
        { val: 'nao',    icone: 'ri-checkbox-circle-line', txt: 'Não, é mais raso que isso' },
        { val: 'sim',    icone: 'ri-alert-line',           txt: 'Sim, é mais fundo' },
        { val: 'naosei', icone: 'ri-question-line',        txt: 'Não sei medir' }
      ],
      proxima: function (v) { return v === 'nao' ? 'recalque' : null; }
    },
    recalque: {
      titulo: 'Depois da bomba, até que altura a água precisa subir?',
      opcoes: [
        { val: '8',  icone: 'ri-home-4-line',     txt: 'Até 8 metros', sub: 'Casa térrea, caixa no telhado' },
        { val: '14', icone: 'ri-building-line',   txt: 'De 8 a 14 metros', sub: 'Torre' },
        { val: '22', icone: 'ri-building-2-line', txt: 'Mais de 14 metros' }
      ],
      proxima: function () { return 'uso'; }
    }
  };

  var USO_TXT = { casa: 'consumo da casa', criacao: 'casa e criação de animais', irrigacao: 'irrigação, horta ou pomar' };
  var USO_ATENDE = { casa: 'o consumo da casa', criacao: 'a casa e a criação de animais', irrigacao: 'a irrigação de horta ou pomar' };
  var respostas = {};
  var historico = [];
  var atual = 'origem';

  function totalPassos() {
    if (respostas.origem === 'superficie') return 5;
    return 4;
  }

  // Altura manométrica: o que a bomba precisa vencer, com 10% de folga pras perdas na tubulação.
  // As faixas já pegam o pior caso (topo da faixa), então a folga não precisa ser maior que isso.
  function comFolga(metros) { return Math.round(metros * 1.10); }

  // Estoque (bombas_estoque.json, gerado do DW todo dia). Usado SÓ pra escolher
  // entre as bombas que servem tecnicamente: a página nunca escreve "temos" nem
  // "esgotado", porque esse saldo é derivado e pode errar. Sem arquivo, arquivo
  // velho ou DW parado, o seletor decide como se ele não existisse.
  var estoque = null;

  function estoqueUtilizavel(d) {
    if (!d || !d.dw_ate || !d.disponivel) return false;
    var p = String(d.dw_ate).split('-');
    if (p.length !== 3) return false;
    var ate = new Date(+p[0], +p[1] - 1, +p[2]);
    if (isNaN(ate.getTime())) return false;
    return (Date.now() - ate.getTime()) / 86400000 <= 5;
  }

  fetch('bombas_estoque.json')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { if (estoqueUtilizavel(d)) estoque = d.disponivel; })
    .catch(function () {});

  function temNaLoja(chave) { return !!(estoque && estoque[chave]); }

  function primeiraQueAtende(ordem, alturaNecessaria, vazaoMinima) {
    var servem = ordem.filter(function (chave) {
      var b = BOMBAS[chave];
      return b.altura >= alturaNecessaria && b.vazao >= vazaoMinima;
    });
    if (!servem.length) return null;
    // Entre as que servem, prefere uma que a loja tenha hoje.
    for (var i = 0; i < servem.length; i++) {
      if (temNaLoja(servem[i])) return BOMBAS[servem[i]];
    }
    return BOMBAS[servem[0]];
  }

  function calcular() {
    var vazaoMin = respostas.uso === 'irrigacao' ? 2200 : respostas.uso === 'criacao' ? 1500 : 0;

    if (respostas.origem === 'naosei') {
      return { tipo: 'especial', motivo: 'A escolha muda bastante se a bomba fica dentro ou fora d\'água. Com uma foto do local a gente resolve isso em um minuto no WhatsApp.' };
    }

    if (respostas.origem === 'poco') {
      if (respostas.profundidade === 'naosei') {
        return { tipo: 'especial', motivo: 'A profundidade do poço é o dado que manda na escolha. Quem perfurou costuma ter essa informação, e a gente também ajuda a estimar pelo WhatsApp.' };
      }
      var prof = Number(respostas.profundidade);
      var cx = Number(respostas.caixa);
      var total = comFolga(prof + cx);
      var b = primeiraQueAtende(['ecco', 's5g', 's800', 's900'], total, vazaoMin);
      if (!b) {
        return { tipo: 'especial', total: total, motivo: 'Pelo que você respondeu, o serviço passa do que as submersas da vitrine alcançam. A gente trabalha também com bomba pra poço profundo de 4 polegadas, que não fica exposta no site.' };
      }
      var porques = [
        'Essa bomba vence até ' + b.altura + ' metros, então trabalha folgada no seu caso.',
        'Entrega até ' + b.vazao.toLocaleString('pt-BR') + ' litros por hora, que atende ' + USO_ATENDE[respostas.uso] + '.'
      ];
      // Quando o uso é que puxou pra cima, dizer isso: a altura sozinha pediria uma bomba menor.
      var soAltura = primeiraQueAtende(['ecco', 's5g', 's800', 's900'], total, 0);
      if (soAltura && soAltura !== b) {
        porques.push('Pela altura, uma bomba menor já daria conta. Quem pede essa aqui é a quantidade de água do seu uso.');
      }
      return {
        tipo: 'ok', bomba: b, total: total,
        conta: 'Poço de cerca de ' + prof + ' m mais caixa a ' + cx + ' m, com folga pras perdas na tubulação, dá por volta de <strong>' + total + ' metros</strong> de altura pra vencer.',
        porques: porques
      };
    }

    if (respostas.energia === 'nao') {
      return {
        tipo: 'ok', bomba: BOMBAS.toyama,
        conta: 'Sem energia elétrica no local, a saída é motobomba a <strong>gasolina</strong>.',
        porques: [
          'Motor 4 tempos a gasolina, não depende de rede elétrica nenhuma.',
          'Puxa muita água de uma vez, até 36 mil litros por hora, boa pra encher caixa e irrigar.',
          'O fabricante indica a linha H pra uso ocasional, não pra bombear o dia inteiro.'
        ]
      };
    }
    if (respostas.succao !== 'nao') {
      return { tipo: 'especial', motivo: 'Bomba de superfície não suga água a mais de uns 8 metros de profundidade, é limite de física, não de marca. Nesse caso o caminho costuma ser uma submersa ou uma bomba injetora, e aí precisamos conversar sobre o local.' };
    }

    var rec = Number(respostas.recalque);
    var totalSup = comFolga(5 + rec);
    var bs = primeiraQueAtende(['cm60', 'ferrari'], totalSup, vazaoMin);
    if (!bs) {
      var faltaAltura = totalSup > BOMBAS.ferrari.altura;
      return {
        tipo: 'especial', total: totalSup,
        motivo: faltaAltura
          ? 'Subir a água a essa altura passa do alcance das duas motobombas elétricas que estão na vitrine. Temos outras motobombas no balcão que não estão publicadas aqui.'
          : 'Pra irrigar de verdade a conta é de vazão, não de altura: as duas motobombas elétricas da vitrine dão conta de casa e horta pequena. Acima disso o caminho costuma ser a motobomba a gasolina, que puxa bem mais água, ou uma opção do balcão. Diga a área que você quer molhar que a gente acerta isso.'
      };
    }
    return {
      tipo: 'ok', bomba: bs, total: totalSup,
      conta: 'Somando a sucção e os ' + rec + ' m de subida, com folga pras perdas, dá por volta de <strong>' + totalSup + ' metros</strong> de altura pra vencer.',
      porques: [
        'Essa motobomba vence até ' + bs.altura + ' metros de altura total.',
        'Entrega até ' + bs.vazao.toLocaleString('pt-BR') + ' litros por hora, que atende ' + USO_ATENDE[respostas.uso] + '.',
        'Suga de até 8 metros de profundidade, dentro do que você respondeu.'
      ]
    };
  }

  function resumoRespostas() {
    var l = [];
    if (respostas.origem === 'poco') l.push('Poço tubular');
    if (respostas.origem === 'superficie') l.push('Cisterna, açude ou rio');
    if (respostas.origem === 'naosei') l.push('Ainda não sei de onde vem a água');
    if (respostas.profundidade && respostas.profundidade !== 'naosei') l.push('Profundidade: cerca de ' + respostas.profundidade + ' m');
    if (respostas.profundidade === 'naosei') l.push('Profundidade: não sei');
    if (respostas.caixa) l.push('Caixa d\'água a ' + respostas.caixa + ' m do chão');
    if (respostas.energia) l.push('Energia no local: ' + (respostas.energia === 'sim' ? 'tem 220V' : 'não tem'));
    if (respostas.succao) l.push('Água a mais de 8 m abaixo da bomba: ' + (respostas.succao === 'sim' ? 'sim' : respostas.succao === 'nao' ? 'não' : 'não sei'));
    if (respostas.recalque) l.push('Precisa subir até ' + respostas.recalque + ' m');
    if (respostas.uso) l.push('Uso: ' + USO_TXT[respostas.uso]);
    return l;
  }

  function linkZap(res) {
    var linhas = ['Olá! Usei o seletor de bombas do site. Respondi assim:'];
    linhas = linhas.concat(resumoRespostas().map(function (t) { return '- ' + t; }));
    if (res.tipo === 'ok') {
      linhas.push('O site indicou: ' + res.bomba.nome + '.');
      linhas.push('Quero saber o preço, se tem pronta entrega e se serve mesmo pro meu caso.');
    } else {
      linhas.push('O site disse que meu caso precisa de uma conversa. Podem me ajudar a escolher?');
    }
    return ZAP + encodeURIComponent(linhas.join('\n'));
  }

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function rolarPraCaixa() {
    if (historico.length) caixa.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function desenharPergunta() {
    var p = PERGUNTAS[atual];
    var passo = historico.length + 1;
    var pct = Math.round((passo - 1) / totalPassos() * 100);
    var html = '';
    html += '<div class="sel-progresso"><span style="width:' + pct + '%"></span></div>';
    html += '<p class="sel-passo">Pergunta ' + passo + ' de ' + totalPassos() + '</p>';
    html += '<h3 class="sel-pergunta">' + esc(p.titulo) + '</h3>';
    html += '<div class="sel-opcoes">';
    p.opcoes.forEach(function (o) {
      html += '<button type="button" class="sel-op" data-val="' + esc(o.val) + '">';
      html += '<i class="' + o.icone + '"></i><span><strong>' + esc(o.txt) + '</strong>';
      if (o.sub) html += '<small>' + esc(o.sub) + '</small>';
      html += '</span></button>';
    });
    html += '</div>';
    if (historico.length) html += '<button type="button" class="sel-voltar" data-voltar="1"><i class="ri-arrow-left-line"></i> Voltar</button>';
    caixa.innerHTML = html;
    rolarPraCaixa();
  }

  function desenharResultado() {
    var res = calcular();
    var html = '<div class="sel-progresso"><span style="width:100%"></span></div>';

    if (res.tipo === 'ok') {
      var b = res.bomba;
      html += '<div class="sel-res">';
      html += '<figure class="sel-res-foto"><img src="' + b.foto + '" alt="' + esc(b.nome) + '" loading="lazy"></figure>';
      html += '<div>';
      html += '<span class="sel-res-selo"><i class="ri-thumb-up-line"></i> Indicação pro que você respondeu</span>';
      html += '<h3>' + esc(b.nome) + '</h3>';
      html += '<p class="sel-res-tag">' + esc(b.tag) + '</p>';
      if (res.conta) html += '<p class="sel-conta">' + res.conta + '</p>';
      html += '<ul class="sel-porques">';
      res.porques.forEach(function (t) { html += '<li><i class="ri-check-line"></i> ' + esc(t) + '</li>'; });
      html += '</ul>';
      html += '<div class="sel-res-acoes">';
      html += '<a class="btn btn-zap" href="' + linkZap(res) + '" target="_blank" rel="noopener"><i class="ri-whatsapp-line"></i> Preço e disponibilidade</a>';
      html += '<a class="btn btn-amarelo" href="' + b.onde + '"><i class="ri-eye-line"></i> Ver a ficha</a>';
      html += '</div></div></div>';
    } else {
      html += '<span class="sel-res-selo"><i class="ri-chat-1-line"></i> Seu caso pede uma conversa</span>';
      html += '<h3 class="sel-pergunta">Melhor a gente ver isso junto</h3>';
      html += '<p class="sel-conta">' + esc(res.motivo) + '</p>';
      html += '<div class="sel-res-acoes">';
      html += '<a class="btn btn-zap" href="' + linkZap(res) + '" target="_blank" rel="noopener"><i class="ri-whatsapp-line"></i> Falar com a gente</a>';
      html += '</div>';
    }

    html += '<p class="sel-nota">Isso é um ponto de partida com base no que você respondeu, não um projeto hidráulico. O acerto final depende do nível da água no seu poço, da bitola do cano e da distância até a caixa. Chame a gente que a gente confere isso com você e diz na hora se o modelo está disponível.</p>';
    html += '<button type="button" class="sel-voltar" data-refazer="1"><i class="ri-refresh-line"></i> Refazer o teste</button>';
    caixa.innerHTML = html;
    rolarPraCaixa();

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'seletor_bomba',
      seletor_resultado: res.tipo === 'ok' ? res.bomba.nome : 'caso especial'
    });
  }

  caixa.addEventListener('click', function (e) {
    var refazer = e.target.closest('[data-refazer]');
    if (refazer) {
      respostas = {}; historico = []; atual = 'origem';
      desenharPergunta();
      return;
    }
    var voltar = e.target.closest('[data-voltar]');
    if (voltar) {
      atual = historico.pop();
      delete respostas[atual];
      desenharPergunta();
      return;
    }
    var op = e.target.closest('.sel-op');
    if (!op) return;
    var val = op.getAttribute('data-val');
    respostas[atual] = val;
    var prox = PERGUNTAS[atual].proxima(val);
    historico.push(atual);
    if (prox) { atual = prox; desenharPergunta(); } else { desenharResultado(); }
  });

  desenharPergunta();
})();

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

// ---------------------------------------------------------------------------
// Calendario da consciencia: destaque do mes na home + marcacao em consciencia.html
//
// Regra de projeto: o conteudo de verdade e ESTATICO no HTML (consciencia.html
// traz os 12 meses escritos, e a home traz um texto neutro que e verdadeiro o ano
// inteiro). Este bloco so faz o DESTAQUE do mes corrente. Sem JS, as duas paginas
// continuam corretas, so nao destacam. Quem vira o mes e o new Date(): nao ha
// manutencao mensal nem robo envolvido.
//
// Os textos curtos daqui sao TEASER. O texto longo de cada mes vive em
// consciencia.html. Ao mexer num, conferir o outro.
// ---------------------------------------------------------------------------
var CAMPANHAS_MES = {
  1:  { nome: "Janeiro Branco",      cor: "#7a8b99",  corTxt: "#657684",  corClara: "#82929f", 
       faixaFundo: "#7f909d",  faixaTinta: "#152a17",  icone: "ri-mental-health-line",   tema: "Saúde mental e cuidado com a própria cabeça.", apoio: true },
  2:  { nome: "Fevereiro Roxo",      cor: "#6a3d9a",  corTxt: "#6a3d9a",  corClara: "#a580cd", 
       faixaFundo: "#6a3d9a",  faixaTinta: "#ffffff",  icone: "ri-empathize-line",       tema: "Lúpus, Alzheimer e fibromialgia." },
  3:  { nome: "Março Lilás",         cor: "#9c4dcc",  corTxt: "#9c4dcc",  corClara: "#b478d8", 
       faixaFundo: "#9c4dcc",  faixaTinta: "#ffffff",  icone: "ri-women-line",           tema: "Prevenção do câncer do colo do útero." },
  4:  { nome: "Abril Verde",         cor: "#2e7d32",  corTxt: "#2e7d32",  corClara: "#3da542", 
       faixaFundo: "#2e7d32",  faixaTinta: "#ffffff",  icone: "ri-shield-check-line",    tema: "Saúde e segurança no trabalho." },
  5:  { nome: "Maio Amarelo",        cor: "#c9960c",  corTxt: "#956f09",  corClara: "#c9960c", 
       faixaFundo: "#c9960c",  faixaTinta: "#152a17",  icone: "ri-roadster-line",        tema: "Segurança no trânsito e redução de acidentes." },
  6:  { nome: "Junho Verde",         cor: "#0f7b4f",  corTxt: "#0f7b4f",  corClara: "#14a66b", 
       faixaFundo: "#0f7b4f",  faixaTinta: "#ffffff",  icone: "ri-leaf-line",            tema: "Meio ambiente e educação ambiental." },
  7:  { nome: "Julho Dourado",       cor: "#c8860a",  corTxt: "#9e6a08",  corClara: "#c8860a", 
       faixaFundo: "#c8860a",  faixaTinta: "#152a17",  icone: "ri-bear-smile-line",      tema: "Saúde dos animais e prevenção de zoonoses." },
  8:  { nome: "Agosto Dourado",      cor: "#a97c1a",  corTxt: "#966e17",  corClara: "#b9881d", 
       faixaFundo: "#b7861c",  faixaTinta: "#152a17",  icone: "ri-heart-2-line",         tema: "Aleitamento materno e apoio a quem amamenta." },
  9:  { nome: "Setembro Amarelo",    cor: "#e6a700",  corTxt: "#966d00",  corClara: "#e6a700", 
       faixaFundo: "#e6a700",  faixaTinta: "#152a17",  icone: "ri-heart-pulse-line",     tema: "Valorização da vida e prevenção do suicídio.", apoio: true },
  10: { nome: "Outubro Rosa",        cor: "#d63384",  corTxt: "#d52f81",  corClara: "#e066a3", 
       faixaFundo: "#d52f81",  faixaTinta: "#ffffff",  icone: "ri-hand-heart-line",      tema: "Prevenção e diagnóstico precoce do câncer de mama." },
  11: { nome: "Novembro Azul",       cor: "#1565c0",  corTxt: "#1565c0",  corClara: "#4693eb", 
       faixaFundo: "#1565c0",  faixaTinta: "#ffffff",  icone: "ri-men-line",             tema: "Saúde do homem e câncer de próstata." },
  12: { nome: "Dezembro Vermelho",   cor: "#c62828",  corTxt: "#c62828",  corClara: "#e16c6c", 
       faixaFundo: "#c62828",  faixaTinta: "#ffffff",  icone: "ri-test-tube-line",       tema: "Prevenção do HIV, da aids e de outras infecções sexualmente transmissíveis." }
};

(function () {
  var mes = new Date().getMonth() + 1;
  var dados = CAMPANHAS_MES[mes];
  if (!dados) return;

  // (a) consciencia.html: marca o card do mes e leva ele pro topo da grade
  var grade = document.getElementById('calGrid');
  if (grade) {
    var card = grade.querySelector('[data-mes="' + mes + '"]');
    if (card && !card.querySelector('.mes-selo')) {
      card.classList.add('atual');
      // o selo nasce aqui, e nao nos 12 cards do HTML: sem JS nao ha "mes
      // corrente" nenhum, entao nao faz sentido 12 selos escondidos no fonte
      var selo = document.createElement('span');
      selo.className = 'mes-selo';
      selo.textContent = 'Estamos aqui';
      card.insertBefore(selo, card.firstChild);
      grade.insertBefore(card, grade.firstChild);
    }
  }

  function poeTxt(id, txt) {
    var el = document.getElementById(id);
    if (el && txt) el.textContent = txt;
  }

  // (b) home: a faixa do topo, antes do banner. Nao depende dos teasers: usa
  // nome e tema, que vem do mesmo gerador dos cards, entao nao ha o que divergir.
  var fx = document.getElementById('faixaMes');
  if (fx) {
    fx.style.setProperty('--fm-fundo', dados.faixaFundo || dados.cor);
    fx.style.setProperty('--fm-tinta', dados.faixaTinta || '#ffffff');
    poeTxt('fmNome', dados.nome);
    poeTxt('fmTxt', dados.tema);
    var fi = document.getElementById('fmIcone');
    if (fi) fi.className = dados.icone;
    // atribuicao, nao so "desesconde": assim o estado fica certo mesmo se este
    // bloco rodar duas vezes na mesma pagina (foi como uma previa minha mentiu)
    var f188 = document.getElementById('fm188');
    if (f188) f188.hidden = !dados.apoio;
  }

  // (c) home: troca o bloco neutro pelo destaque do mes corrente
  var dm = document.getElementById('dmCard');
  if (!dm) return;
  var teaser = dm.querySelector('#dmTeaser');
  if (!teaser) return;                       // sem os teasers no HTML, fica o neutro
  var meu = teaser.querySelector('[data-mes="' + mes + '"]');
  if (!meu) return;                          // mes sem teaser escrito: fica o neutro

  var poe = poeTxt;
  dm.style.setProperty('--cor-mes', dados.cor);
  dm.style.setProperty('--cor-mes-txt', dados.corTxt || dados.cor);
  poe('dmRotulo', 'Campanha deste mês');
  poe('dmTitulo', dados.nome);
  poe('dmTexto', meu.textContent.trim());
  var ic = document.getElementById('dmIcone');
  if (ic) ic.className = dados.icone;
  var apoio = document.getElementById('dmApoio');
  if (apoio) apoio.hidden = !dados.apoio;
})();
