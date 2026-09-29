# bocconitest

Simulatore statico per il test Bocconi delle lauree magistrali.
Le regole del progetto sono in [`kit/CLAUDE.md`](kit/CLAUDE.md).

## Struttura

```
docs/                 il sito (è la cartella che GitHub Pages pubblica)
  index.html          home: elenco mock, andamento, storico, mini-mock, "rifai i miei errori"
  mock.html           motore unico: ?id=07 · ?mode=mini · ?mode=errori · ?rev=<tentativo>
  css/style.css       stile, ripreso da kit/modello/mock07.html
  js/engine.js        cronometro, schermate, punteggio, risultati, revisione, archivio
  js/charts.js        tabelle e grafici SVG riusabili (barre, linee, torta)
  mocks/elenco.js     elenco dei mock pubblicati
  mocks/mock-07.js    Mock 07 convertito dal file modello
tools/
  validate.js         validatore dei mock
  compare-mock07.js   confronto tra mock-07.js e il file modello
kit/                  materiale di partenza (sola lettura): brief, mock vecchi, archivio errori
```

## Comandi

```bash
node tools/validate.js docs/mocks/mock-07.js   # controlla un mock
node tools/compare-mock07.js                   # mock-07.js == kit/modello/mock07.html
node tools/check-math-10.js                    # ricalcola le risposte del Mock 10
node tools/check-novelty.js docs/mocks/mock-10.js  # somiglianze con le domande già presenti
npx http-server docs -p 8123                   # anteprima locale
```

Il sito funziona anche aprendo `docs/index.html` direttamente dal disco: niente
build, niente backend, nessuna dipendenza oltre ai font di Google Fonts (se non
sono raggiungibili il sito usa i font di sistema).

I risultati restano nel `localStorage` del browser, non vengono inviati da nessuna parte.
