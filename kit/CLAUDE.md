# Simulatore test Bocconi magistrale — brief per Claude Code

Questo file lo leggi all'inizio di ogni sessione. Contiene le regole del test, le regole per scrivere i mock e le specifiche del sito. Se una richiesta in chat contraddice questo file, vale la richiesta in chat; se qualcosa qui ti sembra sbagliato o ambiguo, dimmelo invece di indovinare.

## Chi sono e a cosa serve

Studente di economia a Ca' Foscari, preparo il test online Bocconi per le lauree magistrali (candidati italiani, a.a. 2027-28). Prossima prova: 24 ottobre 2026; ultimo giorno utile per il I round: 1 novembre 2026. Primo tentativo ufficiale (21/07/2026): 32,92/50 — Quantitativa 11,25/18, Verbale 12,42/16, Data Insights 9,25/16; 35 giuste, 7 omesse, 8 sbagliate. Il punto debole è Data Insights, poi Quantitativa.

Il repository serve a costruire un **sito statico di simulazioni interattive**: tanti mock nuovi, fedeli al test vero, con correzione automatica e storico dei risultati.

## Il test vero (fonte: sito ufficiale Bocconi)

- 50 domande a risposta multipla in 75 minuti: 18 Quantitativa (Q), 16 Ragionamento verbale (V), 16 Data Insights (DI), mescolate per area e difficoltà.
- Q: aritmetica e algebra di base, relazioni tra dati numerici.
- V: brani brevi o affermazioni; deduzioni e implicazioni; affermazioni supportate, contraddette o non giustificate dal testo.
- DI: tabelle, grafici, problemi con informazioni parziali; calcoli e sufficienza dei dati.
- Punteggio: +1 giusta, 0 omessa, sbagliata −0,25 sulle domande a 4 opzioni e −0,33 su quelle a 3 (la ripartizione non è confermata ufficialmente: usala come ipotesi). Soglia minima 15/50.
- 3 domande per schermata; si va solo avanti, una schermata chiusa non si riapre.
- Niente calcolatrice: una penna e 2 fogli A4.
- Anche nella versione italiana alcune domande possono essere in inglese.

## I miei pattern d'errore (priorità nella scelta delle domande)

Nel campo `patt` usa esattamente queste etichette quando la domanda colpisce uno dei miei pattern:

1. `Falso vs Non deducibile` — contraddizione esplicita vs il testo semplicemente non ne parla.
2. `Rapporti vs valori assoluti`
3. `Cause alternative` — nel ragionamento causale.
4. `Media ponderata vs semplice`
5. `Sufficienza dei dati` — capire quando i dati non bastano.

Per le altre domande usa un'etichetta breve e descrittiva (es. `Percentuali composte`, `Combinazioni vs permutazioni`).

L'archivio completo dei miei 62 errori (mock 1–7) è in `materiali/pdf-originali/Archivio_errori_mock_Bocconi_soluzioni_e_risposte_originali.pdf` (i testi dei quesiti sono screenshot: leggili come immagini) e, solo per soluzioni e risposte date, in `materiali/archivio-errori/*.txt`. Consultalo prima di scrivere un mock nuovo: ti dice che tipo di trappola mi frega davvero.

## Regole per ogni mock nuovo (da 50 domande)

- 18 Q, 16 V, 16 DI in ordine mescolato; difficoltà mescolata, circa 1/4 difficili.
- Q: percentuali, rapporti, medie, equazioni, lavoro/velocità, problemi a parole; probabilità e combinatoria elementari; geometria quasi assente.
- V: vero/falso/non deducibile, deduzioni, rafforza/indebolisce, assunzioni, cause.
- DI: tabelle e grafici **originali** (dati inventati ma coerenti) + sufficienza dei dati. Grafici in SVG inline, leggibili su telefono, in tema chiaro e scuro.
- 2–3 domande in inglese.
- Tutto risolvibile a mano in ~1,5 minuti medi: numeri puliti, niente conti da calcolatrice.
- 4 opzioni (A–D); 3 opzioni per vero/falso/non deducibile. Chiave bilanciata, senza sequenze riconoscibili (mai più di 3 lettere uguali di fila).
- **Domande sempre nuove.** Non riprendere né riformulare domande già presenti in `materiali/` o nei mock già pubblicati nel sito (neanche cambiando solo i numeri). Prima di scrivere, scorri i mock esistenti.
- Almeno 1/3 delle domande colpisce uno dei miei 5 pattern d'errore.
- Ogni domanda ha: soluzione breve (via rapida a mano), trappola (l'errore tipico), etichetta di pattern.

### Controllo qualità (obbligatorio prima di pubblicare un mock)

1. Risolvi ogni domanda da zero senza guardare la chiave; se la tua risposta non coincide con la chiave, correggi o sostituisci la domanda.
2. Una sola opzione corretta per domanda.
3. Nel verbale, la risposta poggia su una frase precisa del brano (citala nella soluzione).
4. Nella sufficienza dei dati, le due informazioni non si contraddicono tra loro e ciascuna è coerente con la domanda.
5. Verifica **con il codice** tutti i conti di Q e DI (script in `tools/`): i numeri dei grafici devono coincidere con quelli usati nelle soluzioni.
6. Esegui il validatore (vedi sotto) e correggi finché passa.
7. Se una domanda resta dubbia, sostituiscila. Meglio un mock con una domanda in meno di revisione che una chiave sbagliata.

## Specifiche del sito

### Tecnologia
- Sito **statico**: HTML, CSS e JavaScript puro, nessun framework, nessun passaggio di build, nessun backend. Deve funzionare anche aprendo i file in locale.
- Tutto il sito sta nella cartella `docs/` (così GitHub Pages pubblica solo quella e non la cartella `materiali/`).
- Font e librerie solo da CDN affidabili (Google Fonts va bene); niente dipendenze superflue.

### Modello di partenza
`modello/mock07.html` è il Mock 07 che ho già usato: **stile, schermate da 3, cronometro, copertina, pagina dei risultati e schema dati delle domande vanno ripresi da lì**. Lo schema di una domanda è:

```js
{ n: 1, area: 'Q' | 'V' | 'DI', diff: 'facile' | 'media' | 'difficile',
  lang: 'it' | 'en',            // aggiungi questo campo
  stem: '...', passage?: '...', claim?: '...', asset?: '...html/svg...',
  opts: ['...', '...', '...', '...'], ans: 0,   // 0 = A
  sol: 'via rapida', trap: 'trappola tipica', patt: 'etichetta pattern' }
```

### Struttura dei file
```
docs/
  index.html            home: elenco mock, stato (da fare / fatto + punteggio), link alle modalità
  mock.html             motore unico: mock.html?id=08 carica docs/mocks/mock-08.js
  css/style.css         stile preso da mock07.html
  js/engine.js          cronometro, schermate, punteggio, risultati, revisione
  js/charts.js          funzioni riusabili per grafici SVG (barre, barre raggruppate, linee, torta, tabelle)
  mocks/mock-07.js      Mock 07 convertito dal file modello
  mocks/mock-08.js ...  mock nuovi, uno per file
tools/
  validate.js           validatore dei mock (node tools/validate.js docs/mocks/mock-08.js)
  check-math.*          verifiche numeriche per i singoli mock
materiali/              solo lettura: mock vecchi e archivio errori (NON pubblicati)
```

### Funzioni del sito
1. **Mock completo**: 50 domande, 75 minuti, schermate da 3, niente ritorno indietro, checkpoint di tempo (domanda 15 ≈ 22', 30 ≈ 45', 45 ≈ 67'), avviso se si passa alla schermata successiva con risposte vuote.
2. **Risultati**: punteggio con penalità (−0,25 su 4 opzioni, −0,33 su 3), totale e per area; giuste / omesse / sbagliate; tempo per schermata; errori raggruppati per pattern (pattern → numeri di domanda).
3. **Revisione**: domanda per domanda, con la mia risposta, quella giusta, la via rapida e la trappola.
4. **Esporta**: un pulsante che copia un riepilogo in testo (mock, risposte, tempi, punteggio per area, errori per pattern) da incollare in chat con Claude per l'analisi.
5. **Storico**: risultati salvati nel browser (localStorage, con try/catch) e grafico dell'andamento dei punteggi per area nella home.
6. **Mini-mock**: 9 o 15 domande pescate dai mock pubblicati, filtrabili per area e per pattern; tempo = 1,5 min × numero di domande.
7. **Rifai i miei errori**: ripropone le domande del sito che ho sbagliato o omesso nei tentativi precedenti.

### Validatore (`tools/validate.js`)
Deve fallire se: le domande non sono 50; la ripartizione non è 18/16/16; un `ans` è fuori range; le domande vero/falso/non deducibile non hanno 3 opzioni o le altre non ne hanno 4; ci sono più di 3 risposte uguali di fila; una lettera compare meno del 18% o più del 32% delle volte (sulle domande a 4 opzioni); le domande in inglese non sono 2 o 3; meno di 17 domande hanno come `patt` una delle 5 etichette dei miei pattern; manca `sol`, `trap` o `patt`; due domande hanno lo stesso testo.

### Qualità del sito
- Funziona su telefono (larghezza 360 px, niente scorrimento orizzontale) e su computer; tema chiaro e scuro.
- Prima di dire che hai finito, apri le pagine con Playwright (Chromium è già installato nell'ambiente), fai un mock di prova rispondendo a caso, controlla punteggio e revisione, e guarda gli screenshot.

## Come lavorare
- Una sessione = un compito (il sito, oppure un mock nuovo). Committa a fine compito con un messaggio chiaro.
- Scrivi in italiano, linguaggio semplice. Se non sei sicuro di una soluzione o di una regola del test, dillo.
- Non modificare nulla in `materiali/`.
