# FocalFit: Simulador Multi-Formato com Área de Interesse

Ferramenta visual desenvolvida para equipes de design avaliarem instantaneamente o comportamento e enquadramento de imagens em seis formatos publicitários e digitais chave (1920x1080, 1080x1080, 300x600, 750x90, 320x100 e 970x250), garantindo que a área focal de interesse permaneça 100% visível sem qualquer distorção.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> As decisões de usabilidade e escopo acordadas na etapa anterior foram incorporadas ao projeto. Revise o resumo abaixo antes de prosseguir com a implementação.

- **Fluxo de Exportação**: Confirmado como **apenas visualização comparativa sem download**, mantendo o foco total na agilidade de inspeção em tempo real.
- **Interação por Formato**: Confirmado como **arrastar livremente com o mouse (pan)** para ajuste fino em cada formato individual.
- **Layout de Exibição**: Confirmado como **feed vertical com rolagem contínua de todos os formatos**, permitindo uma comparação sequencial fluida com a imagem original fixada ou em painel dedicado.
- **Regra de Área de Interesse & Fundo Branco**:
  - Quando nenhuma imagem estiver carregada, cada formato exibirá uma tela branca sólida com borda sutil e dimensões indicativas.
  - Ao definir uma área de interesse na imagem original, o algoritmo calculará automaticamente a escala mínima necessária para que o retângulo focal esteja 100% contido dentro da área visível de cada um dos 6 formatos, sem corte da zona de interesse e sem esticar a proporção da imagem.

---

### 1. Overview & Core Concept

- **O que a ferramenta faz**: Permite que designers façam upload de uma imagem (JPG, PNG, WebP) ou usem amostras de teste, definam visualmente um retângulo de interesse (safe zone / foco prioritário) sobre a imagem original, e vejam imediatamente em um feed vertical como a composição se adapta aos 6 formatos padronizados do mercado.
- **Público-alvo**: Designers gráficos, diretores de arte e profissionais de marketing digital que criam campanhas multicanal e precisam validar se logotipos, rostos ou textos chave ficarão cortados em banners verticais, horizontais ou quadrados.
- **Valor Principal**: Elimina a necessidade de abrir múltiplos mockups ou pranchetas manuais no Photoshop/Figma para checar se a área crítica cabe em todos os formatos de mídia.

---

### 2. User Experience & Visual Design

#### A. Fluxo de Uso
1. **Upload & Seleção Inicial**:
   - Área de drag-and-drop limpa no topo ou barra lateral expansível com opção de carregar arquivo local ou escolher fotos de demonstração realistas (ex.: campanha publicitária, produto, retrato editorial).
2. **Editor da Área de Interesse (Safe Zone Selector)**:
   - Visualização da imagem original com uma caixa delimitadora interativa (bounding box ajustável com guias de recorte, redimensionamento pelos cantos e arrasto central).
   - Indicação em tempo real de coordenadas percentuais e proporção da área focal.
3. **Feed Vertical de Formatos**:
   - Cada formato é renderizado em um container proporcional com título claro das dimensões (`1920×1080`, `1080×1080`, `300×600`, `750×90`, `320×100`, `970×250`).
   - Se nenhuma imagem estiver carregada: fundo branco sólido e limpo com identificação do formato.
   - Com imagem carregada: a imagem é posicionada automaticamente centrando a área de interesse e garantindo sua visibilidade integral.
   - O designer pode clicar e arrastar diretamente dentro de qualquer formato individual para explorar ajustes manuais de composição (com cursor estilizado `grab` / `grabbing`).
   - Opção de exibir/ocultar overlay da área de interesse em cada banner (para checagem de alinhamento) e botão de reset de posição individual por formato.

#### B. Identidade Visual & Tema
- **Direção Estética**: Utilitário de estúdio moderno, minimalista e focado no conteúdo (Dark slate e neutral surfaces para permitir contraste ideal com qualquer imagem avaliada).
- **Tipografia**: `Plus Jakarta Sans` para títulos e controles de interface, acompanhado de `JetBrains Mono` / `tabular-nums` para exibição de dimensões em pixels e coordenadas.
- **Paleta de Cores**:
  - Canvas de trabalho: Fundo neutro suave (`#0F172A` / `#020617` ou modo claro clean contrastante `#F8FAFC`).
  - Banners vazios: Fundo branco sólido `#FFFFFF` com bordas sutis `#E2E8F0`.
  - Destaque da Área de Interesse: Contorno âmbar / ciano vibrante com preenchimento semitransparente suave (`border-amber-400 bg-amber-400/10`).
- **Disciplina Anti-Slop**:
  - Sem badges tipo pílula decorativas; metadados exibidos em texto tipográfico limpo com separadores (`1920 × 1080 px · 16:9 Landscape`).
  - Sem métricas falsas ou dashboards artificiais. Apenas ferramentas reais de design gráfico.

---

### 3. Key Product Decisions & Trade-Offs

- **Cálculo de Enquadramento Automático (Fit-contain da Safe Zone)**:
  - *Abordagem*: Dado um formato com dimensões $(W_f, H_f)$ e uma área de interesse na imagem original com dimensões $(w_i, h_i)$, a imagem original inteira tem dimensões $(W_{orig}, H_{orig})$. Para garantir que $(w_i, h_i)$ esteja 100% contida dentro do viewport do formato sem corte, a escala mínima da imagem é calculada de forma que tanto a largura quanto a altura da safe zone caibam no formato. Ao mesmo tempo, se a imagem precisar preencher o formato (`cover` contextual), a escala é equilibrada para nunca cortar a área de interesse.
  - *Por que*: Cumpre com exatidão a regra de não distorcer a proporção e manter a área de interesse sempre íntegra.
- **Pan Interativo Livre (Arrasto por Formato)**:
  - *Abordagem*: Transformação CSS com coordenadas relativas `(translateX, translateY)` preservadas no estado de cada banner. O usuário pode arrastar suavemente com o mouse ou pointer events.
  - *Por que*: Resposta instantânea a 60fps sem sobrecarga computacional.
- **Feed Vertical Contínuo**:
  - *Abordagem*: Disposição em coluna central com scroll suave e barra de ferramentas flutuante para troca rápida de imagem, toggle das guias da safe zone e reset geral.
  - *Por que*: Solicitado diretamente pelo usuário, permitindo analisar todos os formatos de uma só vez rolando a página.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            App (Root State)                                 │
│  - imageSrc, naturalWidth, naturalHeight                                    │
│  - safeZone: { x, y, width, height } (percentual relativo 0..100)           │
│  - perFormatOffsets: Record<formatId, { x, y }>                             │
│  - showSafeZoneGuides: boolean                                              │
└───────────────────────┬─────────────────────────────────────────────────────┘
                        │
         ┌──────────────┴───────────────┐
         ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────────────────────┐
│   SafeZoneEditor (Modal /    │ │          FormatFeed (Vertical List)        │
│      Sticky Top Panel)       │ │                                            │
│ - Canvas/SVG Interactive Box │ │ ┌────────────────────────────────────────┐ │
│ - Handles para redimensionar │ │ │ FormatCard: 1920x1080 (16:9)           │ │
│ - Arrastar área focal        │ │ │ - Safe Zone Fit Transform Math         │ │
│ - Preset de foco rápido      │ │ │ - Interactive Pan Drag Handlers        │ │
└──────────────────────────────┘ │ │ - Reset Individual Position            │ │
                                 │ └────────────────────────────────────────┘ │
                                 │ ┌────────────────────────────────────────┐ │
                                 │ │ FormatCard: 1080x1080 (1:1)            │ │
                                 │ └────────────────────────────────────────┘ │
                                 │ ┌────────────────────────────────────────┐ │
                                 │ │ FormatCard: 300x600 (Half Page)        │ │
                                 │ └────────────────────────────────────────┘ │
                                 │ ┌────────────────────────────────────────┐ │
                                 │ │ FormatCard: 750x90 (Banner)            │ │
                                 │ └────────────────────────────────────────┘ │
                                 │ ┌────────────────────────────────────────┐ │
                                 │ │ FormatCard: 320x100 (Mobile Banner)    │ │
                                 │ └────────────────────────────────────────┘ │
                                 │ ┌────────────────────────────────────────┐ │
                                 │ │ FormatCard: 970x250 (Billboard)        │ │
                                 │ └────────────────────────────────────────┘ │
                                 └────────────────────────────────────────────┘
```

#### Especificação dos 6 Formatos Obrigatórios
1. `1920 × 1080` (Landscape 16:9 / Full HD)
2. `1080 × 1080` (Square 1:1 / Feed Social)
3. `300 × 600` (Skyscraper vertical / Half Page)
4. `750 × 90` (Super Leaderboard / Mobile Banner)
5. `320 × 100` (Large Mobile Banner)
6. `970 × 250` (Billboard IAB)

#### Matemática de Escala e Enquadramento da Safe Zone
- Definida a caixa de interesse em percentuais normalizados da imagem: $X_0, Y_0, W_{sz}, H_{sz} \in [0, 1]$.
- No formato de destino $(W_f, H_f)$:
  - Para não distorcer a imagem original de proporção $R_i = W_{orig} / H_{orig}$, a escala $S$ é calculada de modo que a caixa de interesse caiba inteiramente dentro de $(W_f, H_f)$:
    $$S \cdot W_{orig} \cdot W_{sz} \le W_f \quad \text{e} \quad S \cdot H_{orig} \cdot H_{sz} \le H_f$$
  - Para preencher o formato sem deixar vácuo quando a imagem permite, ou centralizar a área de interesse com precisão matemática:
    $$Center_{sz} = (X_0 + W_{sz}/2, \; Y_0 + H_{sz}/2)$$
  - O offset de centralização automática alinha o centro da área de interesse com o centro do formato, e os limites são respeitados.
  - O usuário tem liberdade de arrastar (pan) a imagem individualmente para o enquadramento desejado.
