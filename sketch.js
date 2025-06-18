let campoCorBase;
let campoCorDetalhe;
let cidadeCorBase;
let cidadeCorDetalhe;
let ceuCorDia; // O céu será sempre um azul claro
let estradaCor;
let luzSolCor;
let luzLuaCor; // A lua será um elemento visual sem transição noturna

let caminhaoX;
let caminhaoY;
let velocidadeCaminhao = 2.5; // Velocidade única e constante para todo o trajeto
let produtosNoCaminhao = false;
let produtosEntregues = 0;
let mensagemTempo;
let faseAtual = 0; // 0: campo (carregando), 1: estrada, 2: cidade (descarregando), 3: transformação, 4: cidade (voltando), 5: tela final

let transformacaoTimer = 0;
let bolhas = []; // Para a animação da transformação

// Cores para o caminhão (mais vibrantes e detalhadas)
let caminhaoCabineCor = [255, 60, 60]; // Vermelho vivo
let caminhaoCarroceriaCor = [160, 82, 45]; // Marrom terra rico
let caminhaoDetalheCor = [30, 30, 30]; // Preto para pneus, chassis e detalhes
let caminhaoVidroCor = [170, 200, 255, 220]; // Azul transparente para o vidro
let caminhaoParaChoqueCor = [100, 100, 100]; // Cinza escuro para o para-choque

function setup() {
  createCanvas(1100, 650); 
  
  // Cores do cenário
  campoCorBase = color(120, 210, 90); 
  campoCorDetalhe = color(90, 170, 60); 
  cidadeCorBase = color(160, 160, 180); 
  cidadeCorDetalhe = color(110, 110, 130); 
  ceuCorDia = color(135, 206, 255); 
  estradaCor = color(50, 50, 50); 
  luzSolCor = color(255, 240, 0); 
  luzLuaCor = color(200, 200, 255); 

  caminhaoX = -300; 
  caminhaoY = height * 0.77; 
  mensagemTempo = 0;
}

function draw() {
  // Se a fase for a tela final, desenha apenas a tela preta com a mensagem
  if (faseAtual === 5) {
    desenharTelaFinal();
    return; // Sai da função draw para não desenhar mais nada
  }

  // O céu é sempre azul claro
  background(ceuCorDia);

  // Sol e Lua (visíveis como elementos decorativos, sem transição dia/noite)
  fill(luzSolCor);
  ellipse(width * 0.15, 80, 100, 100); 
  
  fill(luzLuaCor);
  ellipse(width * 0.85, 80, 90, 90); 
  
  desenharNuvens();

  // Desenha o cenário dividido: Campo à esquerda, Cidade à direita
  desenharCampo();
  desenharCidade();

  // Desenha a estrada conectando Campo e Cidade
  desenharEstrada();

  // --- Caminhão ---
  desenharCaminhao();
  movimentarCaminhao();

  // --- Mensagens e Explicações ---
  exibirMensagens();

  // --- Animação de Transformação (quando o caminhão chega) ---
  if (faseAtual === 3) {
    animarTransformacao();
  }
}

function desenharNuvens() {
  fill(255, 255, 255, 230); 
  noStroke();
  // Nuvens mais orgânicas e agrupadas, com mais variedade de tamanho
  ellipse(width * 0.18, 100, 110, 75);
  ellipse(width * 0.26, 90, 100, 65);
  ellipse(width * 0.33, 105, 120, 80);

  ellipse(width * 0.58, 120, 120, 75);
  ellipse(width * 0.66, 110, 110, 70);
  ellipse(width * 0.78, 100, 130, 85);
  ellipse(width * 0.9, 95, 100, 60); 
}

function desenharCampo() {
  // Chão do campo com colinas sutis e textura
  fill(campoCorBase);
  beginShape();
  vertex(0, height);
  vertex(0, height * 0.62);
  bezierVertex(width * 0.2, height * 0.58, width * 0.42, height * 0.68, width / 2, height * 0.63); 
  vertex(width / 2, height);
  endShape(CLOSE);

  // Detalhes de grama/textura no campo
  for (let i = 0; i < 50; i++) {
    let x = random(0, width / 2);
    let y = random(height * 0.65, height);
    let size = random(3, 8);
    fill(lerpColor(campoCorBase, campoCorDetalhe, random(0.2, 0.8)));
    ellipse(x, y, size, size * 0.5); 
  }

  // Árvores com mais detalhes e textura
  desenharArvore(width * 0.1, height * 0.68, 40, 100);
  desenharArvore(width * 0.32, height * 0.72, 35, 90);
  desenharArvore(width * 0.04, height * 0.78, 30, 80);

  // Plantações (linhas mais organizadas e com efeito de profundidade)
  noStroke();
  let numRows = 10;
  let rowHeight = 30;
  for (let j = 0; j < numRows; j++) {
    for (let i = 0; i < 12; i++) {
      fill(lerpColor(campoCorBase, campoCorDetalhe, j / numRows + 0.1));
      let rectWidth = 18 - j; 
      let rectHeight = 45 - j * 2;
      rect(width * 0.05 + i * (rectWidth + 5) + j * 2, height * 0.8 + j * rowHeight, rectWidth, rectHeight);
    }
  }

  // Pequenos "alimentos" no campo (visíveis antes da carga)
  if (!produtosNoCaminhao && faseAtual === 0) {
    // Maçãs (vermelhas)
    fill(220, 50, 50);
    ellipse(width * 0.18, height * 0.88, 25, 25);
    // Cenouras (laranja, em forma de cone)
    fill(255, 140, 0);
    triangle(width * 0.24, height * 0.9, width * 0.26, height * 0.9, width * 0.25, height * 0.84);
    // Cachos de uva (verde, com pequenas bolinhas)
    fill(100, 200, 50);
    ellipse(width * 0.38, height * 0.92, 10, 10);
    ellipse(width * 0.39, height * 0.94, 10, 10);
    ellipse(width * 0.37, height * 0.94, 10, 10);
    ellipse(width * 0.38, height * 0.96, 10, 10);
    // Abacaxi (amarelo com textura)
    fill(255, 200, 0);
    rect(width * 0.1, height * 0.92, 20, 30, 5);
    fill(campoCorDetalhe); 
    triangle(width * 0.1, height * 0.92, width * 0.12, height * 0.90, width * 0.13, height * 0.92);
    triangle(width * 0.11, height * 0.90, width * 0.13, height * 0.88, width * 0.14, height * 0.90);
  }

  // Celeiro mais elaborado e detalhado
  fill(180, 100, 50); 
  rect(width * 0.05, height * 0.55, 140, 100); 
  fill(130, 70, 30); 
  beginShape();
  vertex(width * 0.05, height * 0.55);
  vertex(width * 0.05 + 140, height * 0.55);
  vertex(width * 0.05 + 70, height * 0.43); 
  endShape(CLOSE);
  fill(150, 80, 40); 
  line(width * 0.05 + 70, height * 0.43, width * 0.05 + 10, height * 0.55);
  line(width * 0.05 + 70, height * 0.43, width * 0.05 + 130, height * 0.55);

  fill(70); 
  rect(width * 0.09, height * 0.62, 30, 60);
  rect(width * 0.13, height * 0.62, 30, 60);
  fill(120); 
  rect(width * 0.18, height * 0.58, 25, 25);
  fill(50); 
  rect(width * 0.12, height * 0.68, 5, 10);
}

function desenharArvore(x, y, troncoLargura, troncoAltura) {
  fill(100, 80, 50); 
  rect(x, y, troncoLargura, troncoAltura);
  fill(campoCorDetalhe); 
  ellipse(x + troncoLargura / 2, y, troncoLargura * 4, troncoAltura * 1.5); 
  ellipse(x + troncoLargura / 2 - 30, y + 20, troncoLargura * 3.5, troncoAltura * 1.3);
  ellipse(x + troncoLargura / 2 + 30, y + 15, troncoLargura * 3.8, troncoAltura * 1.4);

  // Pequenas maçãs nas árvores
  fill(255, 0, 0);
  ellipse(x + troncoLargura / 2 - 10, y + 20, 8, 8);
  ellipse(x + troncoLargura / 2 + 15, y + 30, 8, 8);
}

function desenharCidade() {
  // Chão da cidade
  fill(cidadeCorBase);
  rect(width / 2, height * 0.3, width / 2, height * 0.7);

  // Prédios com mais textura, variação de altura e janelas vibrantes
  desenharPredio(width * 0.53, height * 0.35, 95, 220, true);
  desenharPredio(width * 0.65, height * 0.2, 110, 300, false);
  desenharPredio(width * 0.78, height * 0.4, 85, 190, true);
  desenharPredio(width * 0.9, height * 0.25, 95, 270, false);
  desenharPredio(width * 0.58, height * 0.45, 70, 160, true); 

  // Fábrica/Mercado aprimorada e mais detalhada
  fill(200, 180, 180); 
  rect(width * 0.7, height * 0.6, 220, 130); 
  fill(120, 120, 120); 
  rect(width * 0.7, height * 0.58, 220, 28); 
  fill(80, 80, 80); 
  rect(width * 0.78, height * 0.45, 40, 80);
  fill(60, 60, 60); 
  rect(width * 0.75, height * 0.65, 60, 80);
  fill(255, 255, 180); 
  rect(width * 0.76, height * 0.67, 50, 60);
  textSize(18);
  fill(0);
  textStyle(BOLD);
  text("FÁBRICA / MERCADO", width * 0.81, height * 0.62);
  textStyle(NORMAL);
}

function desenharPredio(x, y, largura, altura, iluminado) {
  fill(cidadeCorDetalhe);
  rect(x, y, largura, altura);
  
  // Adiciona algumas linhas para simular textura e divisões
  stroke(cidadeCorBase);
  strokeWeight(1.5);
  for (let i = 1; i < altura / 25; i++) {
    line(x, y + i * 25, x + largura, y + i * 25);
  }
  noStroke();

  // Janelas com mais brilho
  for (let j = 0; j < floor(altura / 35); j++) { 
    for (let i = 0; i < floor(largura / 35); i++) {
      if (i % 2 === 0 && j % 2 === 0 && iluminado) { 
        fill(255, 255, 180, 240); 
      } else {
        fill(200, 200, 230, 200); 
      }
      rect(x + 8 + i * 30, y + 8 + j * 30, 20, 25); 
    }
  }
}

function desenharEstrada() {
  fill(estradaCor); 
  rect(0, height * 0.8, width, 90); 

  // Faixas da estrada com perspectiva e mais vivas
  stroke(255, 255, 50); 
  strokeWeight(6); 
  for (let i = 0; i < width; i += 120) { 
    line(i, height * 0.83, i + 80, height * 0.83);
  }
  noStroke();
  
  // Acostamento/Calçada com detalhe
  fill(90, 90, 90);
  rect(0, height * 0.8 + 90, width, 18); 
  fill(70, 70, 70); 
  rect(0, height * 0.8 + 90, width, 5);
}

function desenharCaminhao() {
  push();
  translate(caminhaoX, caminhaoY);

  // Rodas (mais detalhadas e robustas)
  fill(caminhaoDetalheCor); 
  ellipse(0, 25, 50, 50); 
  ellipse(70, 25, 50, 50); 
  ellipse(150, 20, 45, 45); 
  
  // Aro da roda
  fill(180); 
  ellipse(0, 25, 30, 30);
  ellipse(70, 25, 30, 30);
  ellipse(150, 20, 27, 27);
  // Centro da roda
  fill(50);
  ellipse(0, 25, 10, 10);
  ellipse(70, 25, 10, 10);
  ellipse(150, 20, 9, 9);


  // Chassis
  fill(caminhaoDetalheCor);
  rect(-60, 15, 230, 20); 

  // Carroceria (caixa de carga com efeito 3D proeminente)
  fill(caminhaoCarroceriaCor);
  rect(-60, -50, 150, 80); 
  fill(caminhaoCarroceriaCor[0] + 20, caminhaoCarroceriaCor[1] + 20, caminhaoCarroceriaCor[2] + 20); 
  rect(-60, -50, 15, 80); 
  fill(caminhaoCarroceriaCor[0] - 20, caminhaoCarroceriaCor[1] - 20, caminhaoCarroceriaCor[2] - 20); 
  rect(80, -50, 15, 80); 

  // Detalhes da caixa (linhas para simular tábuas e dobradiças)
  stroke(caminhaoCarroceriaCor[0] * 0.7, caminhaoCarroceriaCor[1] * 0.7, caminhaoCarroceriaCor[2] * 0.7);
  strokeWeight(2.5);
  line(-60, -25, 95, -25);
  line(-60, 0, 95, 0);
  noStroke();
  fill(caminhaoDetalheCor); 
  rect(-65, -30, 5, 10);
  rect(-65, -5, 5, 10);
  rect(95, -30, 5, 10);
  rect(95, -5, 5, 10);


  // Cabine
  fill(caminhaoCabineCor);
  rect(90, -45, 85, 65); 
  rect(120, -65, 55, 30); 

  // Para-brisa (mais detalhado e reflexivo)
  fill(caminhaoVidroCor);
  rect(125, -60, 45, 40);
  stroke(0); 
  strokeWeight(2);
  line(125, -60, 125, -20);
  line(170, -60, 170, -20);
  line(125, -60, 170, -60);
  line(125, -20, 170, -20);
  noStroke();
  fill(255, 255, 255, 80); 
  triangle(125, -60, 170, -60, 170, -40);

  // Faróis e lanternas com brilho
  fill(255, 255, 180); 
  ellipse(175, 5, 22, 15); 
  fill(255, 0, 0); 
  ellipse(-65, 5, 15, 12); 

  // Para-choque dianteiro
  fill(caminhaoParaChoqueCor);
  rect(165, 10, 25, 25);
  fill(200); 
  rect(168, 13, 19, 5);


  // Se o caminhão estiver carregado, desenha "alimentos/frutas" dentro da caixa
  if (produtosNoCaminhao) {
    // Frutas e vegetais mais reconhecíveis e bem desenhadas
    // Maçãs (vermelhas com brilho)
    fill(255, 50, 50);
    ellipse(-20, -30, 25, 25);
    fill(255, 255, 255, 100); ellipse(-15, -35, 5, 5); 
    ellipse(10, -15, 25, 25);
    fill(255, 255, 255, 100); ellipse(15, -20, 5, 5); 

    // Cenouras (laranja vibrante, em forma de cone com folhas)
    fill(255, 140, 0);
    triangle(40, -40, 55, -40, 47.5, -20);
    fill(campoCorDetalhe); triangle(45, -45, 50, -45, 47.5, -40); 
    triangle(70, -25, 85, -25, 77.5, -5);
    fill(campoCorDetalhe); triangle(75, -30, 80, -30, 77.5, -25); 

    // Cachos de uva (roxas e verdes, com pequenas bolinhas)
    fill(150, 0, 150); 
    ellipse(0, -5, 15, 15); ellipse(-5, 0, 15, 15); ellipse(5, 0, 15, 15); ellipse(0, 5, 15, 15);
    fill(100, 200, 50); 
    ellipse(30, -5, 15, 15); ellipse(25, 0, 15, 15); ellipse(35, 0, 15, 15); ellipse(30, 5, 15, 15);
    
    // Milho (amarelo com textura)
    fill(255, 255, 0);
    rect(-40, -10, 20, 40, 5); 
    fill(200, 200, 0); 
    for(let k=0; k<5; k++) {
      line(-40, -10 + k*8, -20, -10 + k*8);
    }
    
    // Alface (verde, com formato orgânico)
    fill(80, 180, 60);
    beginShape();
    vertex(-10, -40); bezierVertex(-5, -45, 5, -45, 10, -40);
    bezierVertex(15, -35, 15, -25, 10, -20);
    bezierVertex(5, -15, -5, -15, -10, -20);
    bezierVertex(-15, -25, -15, -35, -10, -40);
    endShape(CLOSE);
  }

  pop();
}

function movimentarCaminhao() {
  // Caminhão sempre se move na mesma velocidade constante
  if (faseAtual === 0) { // Caminhão se aproximando para carregar no campo
    caminhaoX += velocidadeCaminhao;
    if (caminhaoX >= width * 0.15) { // Ponto de parada no campo
      if (frameCount - mensagemTempo > 200) { // Tempo para carregar
        produtosNoCaminhao = true;
        mensagemTempo = frameCount;
        faseAtual = 1;
      }
    }
  } else if (faseAtual === 1) { // Caminhão na estrada (viajando para a cidade)
    caminhaoX += velocidadeCaminhao; // Mesma velocidade
    if (caminhaoX > width * 0.7) { // Chega na cidade
      faseAtual = 2;
      produtosNoCaminhao = false; // "Descarregou"
      produtosEntregues++;
      mensagemTempo = frameCount;
    }
  } else if (faseAtual === 2) { // Caminhão na cidade (descarregando/aguardando transformação)
    if (frameCount - mensagemTempo > 150) { // Tempo para descarregar
      faseAtual = 3;
      mensagemTempo = frameCount;
    }
  } else if (faseAtual === 3) { // Animação de transformação acontecendo
    if (frameCount - mensagemTempo > 300) { // Tempo da transformação
      faseAtual = 4; // Caminhão começa a voltar
      mensagemTempo = frameCount;
    }
  } else if (faseAtual === 4) { // Caminhão voltando para o campo
    caminhaoX -= velocidadeCaminhao; // Mesma velocidade de volta
    if (caminhaoX < -300) { // Volta para fora da tela
      // Após 3 jornadas completas, transiciona para a tela final
      if (produtosEntregues >= 3) { // Define o número de jornadas para ir para a tela final
        faseAtual = 5;
      } else {
        faseAtual = 0; // Reinicia o ciclo
        mensagemTempo = frameCount;
      }
    }
  }
}

function exibirMensagens() {
  fill(0);
  textAlign(CENTER, TOP);
  textStyle(BOLD);

  // Mensagens específicas para cada fase (exceto durante o movimento do caminhão)
  if (faseAtual === 0) { // No campo, antes de carregar
    textSize(28);
    if (caminhaoX < width * 0.15) {
      text("O Campo: Coração do Brasil, Origem da Vida!", width / 2, 25);
    } else {
      text("Da Terra Farta, Colhemos o Futuro que Nos Alimenta!", width / 2, 25);
    }
  } else if (faseAtual === 2) { // Na cidade, descarregando
    textSize(28);
    text("Na Cidade: Onde a Inovação Transforma e Valoriza o Campo!", width / 2, 25);
    textSize(22);
    textStyle(NORMAL);
    text("Matérias-primas se encontram com a tecnologia, gerando novos produtos e oportunidades.", width / 2, 65);
  } else if (faseAtual === 3) { // Durante a transformação
    textSize(28);
    text("A Magia da Transformação: Do Frescor do Campo ao Produto Final!", width / 2, 25);
    textSize(22);
    textStyle(NORMAL);
    text("Cada grão e cada fruta se reinventam, unindo trabalho, ciência e criatividade.", width / 2, 65);
  }

  // Mensagem "Festejando a conexão campo-cidade" sempre visível (exceto na tela final)
  if (faseAtual !== 5) {
    textSize(24);
    fill(50); // Uma cor escura para bom contraste com o céu claro
    textAlign(CENTER, TOP); 
    textStyle(BOLD);
    text("FESTEJANDO A CONEXÃO CAMPO-CIDADE", width / 2, 10); 
  }
  
  // Contador de ciclos (apenas nas fases de animação principal)
  if (faseAtual !== 5) {
    textSize(20);
    fill(50);
    textAlign(LEFT, BOTTOM);
    textStyle(NORMAL);
    text("Jornadas completas: " + produtosEntregues, 25, height - 60);
  }
}

function animarTransformacao() {
  // Fumaça mais densa e dinâmica na chaminé
  fill(200, 200, 200, 200); 
  ellipse(width * 0.78 + 20, height * 0.45 - 30, 50, 50);
  ellipse(width * 0.78 + 35, height * 0.45 - 65, 45, 45);
  ellipse(width * 0.78 + 45, height * 0.45 - 100, 40, 40);

  // Bolhas de transformação mais vibrantes e variadas
  transformacaoTimer++;
  if (transformacaoTimer % 8 === 0 && bolhas.length < 40) { 
    bolhas.push(new BolhaTransformacao(width * 0.7 + 110, height * 0.65));
  }

  for (let i = bolhas.length - 1; i >= 0; i--) {
    bolhas[i].mover();
    bolhas[i].mostrar();
    if (bolhas[i].sumiu()) {
      bolhas.splice(i, 1);
    }
  }

  // Exemplo de produto final mais visível e variado
  if (frameCount - mensagemTempo > 220) { 
    // Pão (mais detalhado)
    fill(210, 150, 90); 
    rect(width * 0.7 + 30, height * 0.75, 70, 55, 8); 
    fill(0);
    textSize(16);
    textStyle(BOLD);
    text("PÃO", width * 0.7 + 65, height * 0.77 + 30);

    // Suco (caixa de suco)
    fill(255, 120, 0, 220); 
    rect(width * 0.7 + 120, height * 0.75, 40, 60);
    fill(0);
    textSize(16);
    textStyle(BOLD);
    text("SUCO", width * 0.7 + 140, height * 0.77 + 30);

    // Leite (caixa de leite)
    fill(240, 240, 240, 220); 
    rect(width * 0.7 + 180, height * 0.75, 35, 60);
    fill(0);
    textSize(16);
    textStyle(BOLD);
    text("LEITE", width * 0.7 + 197, height * 0.77 + 30);
    textStyle(NORMAL);
  }
}

// Classe para as bolhas de transformação
class BolhaTransformacao {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tamanho = random(25, 50); 
    this.velocidadeY = random(2.0, 4.0); 
    this.velocidadeX = random(-2.5, 2.5); 
    this.alpha = 255;
    // Cores mais variadas e brilhantes para as bolhas
    this.cor = color(random(120, 255), random(100, 220), random(80, 200), this.alpha);
    this.forma = floor(random(3)); 
  }

  mover() {
    this.y -= this.velocidadeY;
    this.x += this.velocidadeX;
    this.alpha -= 8; 
    this.cor = color(red(this.cor), green(this.cor), blue(this.cor), this.alpha);
  }

  mostrar() {
    fill(this.cor);
    noStroke();
    if (this.forma === 0) {
      ellipse(this.x, this.y, this.tamanho, this.tamanho);
    } else if (this.forma === 1) {
      rect(this.x - this.tamanho / 2, this.y - this.tamanho / 2, this.tamanho, this.tamanho);
    } else {
      triangle(this.x, this.y - this.tamanho / 2,
               this.x - this.tamanho / 2, this.y + this.tamanho / 2,
               this.x + this.tamanho / 2, this.y + this.tamanho / 2);
    }
  }

  sumiu() {
    return this.alpha < 0;
  }
}

function desenharTelaFinal() {
  background(0); // Tela preta
  fill(255); // Cor do texto branca
  textAlign(CENTER, CENTER);
  textStyle(BOLD);

  // Mensagem sobre a importância do campo e da cidade (texto menor)
  textSize(24); // Tamanho um pouco menor para a mensagem
  text("O CAMPO, ESSENCIAL, PRODUZ A VIDA QUE NOS NUTRE.", width / 2, height * 0.4);
  text("A CIDADE, COM TECNOLOGIA, TRANSFORMA E VALORIZA.", width / 2, height * 0.5);

  // Agradecimento em destaque
  textSize(45); // Tamanho maior para o agradecimento
  fill(255, 220, 0); // Amarelo vibrante
  text("OBRIGADO PELA ATENÇÃO!", width / 2, height * 0.75);
}