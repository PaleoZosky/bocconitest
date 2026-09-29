# Prompt da incollare in Claude Code

## Sessione 1 — costruire il sito (incolla questo come primo messaggio)

Leggi CLAUDE.md e guarda modello/mock07.html. Costruisci il sito descritto in CLAUDE.md dentro docs/:
1. estrai stile e motore da mock07.html in docs/css/style.css e docs/js/engine.js;
2. converti il Mock 07 in docs/mocks/mock-07.js (stesse domande, aggiungi il campo lang) e controlla che si comporti come l'originale;
3. crea la home, lo storico, la revisione, l'esportazione, il mini-mock e "rifai i miei errori";
4. scrivi tools/validate.js e fallo girare sul Mock 07 (se il Mock 07 non passa qualche regola, dimmi quale invece di modificarlo);
5. prova tutto con Playwright su telefono e computer, poi committa.
Non creare mock nuovi in questa sessione. Alla fine dimmi in poche righe cosa funziona e cosa no.

## Sessione 2 e seguenti — un mock nuovo per sessione

Crea il Mock 08 seguendo le regole di CLAUDE.md. Prima leggi l'archivio errori e scorri i mock in materiali/ e in docs/mocks/ per non ripetere nulla. Punta soprattutto su Data Insights e sui miei 5 pattern d'errore. Fai il controllo qualità completo (risolvi tutto da zero, verifica i conti con il codice, validatore) e aggiungi il mock alla home. Alla fine dimmi quali domande hai sostituito durante il controllo e perché.

(Per i successivi cambia solo il numero: Mock 09, Mock 10…)

## Varianti utili

- "Crea un mock solo Data Insights da 30 domande, stesso formato, 45 minuti."
- "Ho fatto il Mock 08, ecco l'esportazione: [incolla]. Crea il Mock 09 calibrato sugli errori di questo tentativo."
- "Controlla di nuovo il Mock 09 come se fossi un revisore esterno: risolvi ogni domanda senza guardare la chiave e segnalami tutto ciò che è dubbio."
