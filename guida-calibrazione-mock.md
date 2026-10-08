# Guida di calibrazione per i nuovi mock Bocconi

Basata su 99 domande del mock ufficiale Bocconi (lauree magistrali), analizzate con soluzioni e risposte di Ale.
Uso: istruzioni per generare nuovi mock. Le domande ufficiali NON vanno copiate né parafrasate da vicino: si replicano struttura, difficoltà e trappole con contenuti nuovi.
Perché serve: i mock precedenti erano troppo facili (41,01/50 contro ~30/50 sulle ufficiali).

## 1. Come sono fatte davvero le domande
Distribuzione nel campione ufficiale: Q 35, DI 40, V 24 (il test vero è 18 Q / 16 V / 16 DI su 50).

### Quantitativa
- Catene di percentuali e prezzi (ristorante, spesa divisa, mobili, carburante con rimborso, sconti successivi): circa 14 su 35. Spesso le opzioni sono "circa X".
- Base della percentuale ("X% in più rispetto a Y" → si divide per Y). Esca fissa: la stessa differenza divisa per l'altro valore (300/1050 ≈ 29% invece di 300/750 = 40%).
- Combinatoria e probabilità: circa 8. Esempi di struttura: dadi (somma maggiore di un valore); prodotti con formati diversi per sottoinsiemi × un fattore finale; ordine dei gol con il primo gol fissato; numeri a cifre diverse con lo 0 tra le cifre; due domande in una ("scegli 5 su 8; partite 4 contro 4" → 56; 35); anagrammi con lettere ripetute e lettere fissate; estrazioni senza reinserimento con confronto tra combinazioni.
- Algebra e numeri: sistema 3×3 a parole, età, divisione proporzionale, media ponderata inversa, resti (pari, resto 1 su 5, resto 2 su 3, con un limite superiore), somma 1…n, crescita esponenziale (2¹⁰ ≈ 1000, risposte a parole come "poco più di un giorno"), calendario bisestile con giorni della settimana, notazione con lettere al posto delle cifre (alfabeto italiano: A = 0 … L = 9).
- 1 trabocchetto di ragionamento laterale: una corda appesa a una barca e la marea che sale → "Mai", perché la barca sale con l'acqua.
- Opzioni mascherate: formule (5!/(4!·2!), che non è nemmeno un intero), frazioni non semplificate (216/3 = 72).
- Dati superflui inseriti apposta.

### Data Insights
- Sufficienza dei dati (DS), 12 nel campione. I criteri A–D sono sempre uguali (A: basta una sola affermazione; B: servono entrambe; C: ciascuna basta da sola; D: servono altri dati), ma nella lista le lettere sono rimescolate (es. C, D, B, A). Tipi visti:
  - interi che possono essere negativi (g·f = 3 → serve f > 1 per chiudere) → B
  - vincoli che lasciano un intervallo di soluzioni (ore di domenica tra 6 e 8) → D
  - aree di due facce adiacenti + area di due facce opposte = terza faccia del parallelepipedo → B
  - tabella 2×2 nascosta (femmine/maschi × nati/non nati) → B
  - insiemi sovrapposti con percentuali di percentuali (pesce e vino bianco) → B
  - multiplo di 4 e di 6 → solo di mcm = 12, non di 24 → D
  - domande sì/no risolte con un limite ("P < 1/2?" → al massimo 15/45; "intervallo > 2?" → max − min ≥ a − d) → A
  - geometria: cerchi (somma delle aree + rapporto tra i raggi), circonferenza di centro O (x² + y² = r²)
  - una DS ufficiale ha affermazioni incompatibili tra loro (r = 5 e un punto che dà r² = 10), con risposta C: ogni affermazione va valutata da sola. Nei nuovi mock non replicarlo apposta.
- Tabelle "DATI | PROPOSIZIONI A–D": circa 9. Consegna "sicuramente vera/e" OPPURE "sicuramente falsa/e" (alternate); opzioni a combinazione ("Solo la A", "Sia la A sia la D"). Contenuti: rapporti (giocatori per allenatore), medie di ore, logica (implicazione inversa, "unicamente", "almeno", "la maggior parte", assegnazione per esclusione: 4 ripiani e 4 generi), vincoli di minimo e massimo (l'area più piccola è 80 m² → nessuna area può misurare 70).
- Grafici (torta, linea, barre, variazioni mese su mese) + 2–3 informazioni extra → più passaggi: ricavare il totale da un dato assoluto, lavorare per differenza (calo totale del 20% − cali noti = calo cercato), ricostruire una serie dalle variazioni partendo da un mese noto e combinarla con un'altra grandezza che cresce a scatti, ripartire una fetta con un rapporto (1 : 2 : 1).
- Tabelle con affermazioni da verificare: somme di bienni, "metà", "doppio", "almeno un terzo" con numeri vicini apposta (2 × 43,7 = 87,4 contro 89,8); "in modo costante" smentito da un solo anno; percentuali di riga o di colonna che non danno conteggi; celle mancanti risolvibili con un rapporto (5 : 4 : 3) usando i totali di riga e di colonna come vincoli; retribuzioni lineari (fisso + per pezzo) confrontate a più livelli di vendita; opzione "Nessuna delle altre risposte è corretta", a volte giusta.

### Verbale
- Vero/falso/non ricavabile a 3 opzioni, con la motivazione dentro l'opzione ("falsa, poiché contraddice un'affermazione contenuta nel brano o da esso deducibile"; "non ricavabile dal testo, poiché non ci sono abbastanza informazioni"; "vera, poiché è contenuta nel brano o da esso deducibile"): circa 8. Regole viste:
  - una causa che il brano non dà → non ricavabile (non falsa)
  - un dettaglio contraddetto, anche tramite il lessico (i cerusici, cioè chi curava i feriti, avevano le botteghe ai margini, non al centro) → falsa
  - un esempio concreto coerente con la descrizione generale ("sarebbe possibile trovare spazi verdi che fanno infiltrare l'acqua") → vera
  - una soglia numerica (78% → "più della metà") → vera
  - una cifra incompatibile (1 donna su 7 contro "70%") → falsa
- Comprensione di brani reali, spesso economici e pieni di numeri (mutui, PAC e biologico, subprime, inflazione 2021, istruzione e occupazione, divario salariale): circa 8, con 4 opzioni. Esche:
  - nesso causale inventato tra due dati del brano
  - periodo spostato ("primi 9 mesi" → "gennaio–giugno") o data spostata ("dal 2014" riferito alla cosa sbagliata)
  - ambito spostato ("9% del budget sanitario" → "9% della spesa pubblica")
  - previsione trasformata in obbligo, percentuale invertita
  - assoluti ("soltanto", "certezza")
  - termine tecnico frainteso ("domanda" di lavoro scambiata per il problema degli stipendi)
  - formato "quale NON è corretta"
- Rafforza/indebolisce: circa 6. Risposte giuste viste: causa alternativa (nuove tasse sugli alcolici; nuova concorrenza invece del calo dei consumi); selezione o causalità inversa (aiuta gli altri solo chi sta già bene); dato parziale (tane dei castori solo nella metà degli argini esondati); condizione sufficiente ("in Paesi molto simili basta il 4%") contro l'esca necessaria ("in Paesi lontani serve almeno il 5%"); effetto collaterale che colpisce la conclusione (business dei diplomi a costi proibitivi). Esche: affermazioni che rafforzano, soluzioni pratiche irrilevanti, generalizzazioni ad altri Paesi, dati numerici che non toccano la conclusione.
- Applicare una regola (irretroattività della legge penale) con esche sui modali ("non può essere punito / non può essere assolto / deve essere punito").
- "Quale fattore, se noto, influirebbe sulla correttezza dell'affermazione": serve il dato che verifica la parola chiave ("costantemente" → i trimestri precedenti).
- Nessuna delle 99 domande era in inglese, ma il sito ufficiale dice che può capitare: tenerne 2–3 per mock.

## 2. Livello di difficoltà da replicare
- Anche le domande "facili" hanno 2–3 passaggi; le difficili 4–5 (tabella con celle mancanti, DS con tabella 2×2, grafico delle variazioni + ore di studio).
- I numeri restano puliti (risultati interi o "circa"): la difficoltà sta nella struttura e nelle esche, non nei conti.
- Ogni esca corrisponde a un errore tipico preciso: base sbagliata, riga Totale, ÷2 dimenticato, 4 · 6 al posto del mcm, causa inventata.
- Mix di tempi: circa 1/3 domande da 30–60 secondi, 1/2 da 1,5–2 minuti, 1/6 da 3 minuti o più.

## 3. Profilo di Ale sulle 99 ufficiali
- Risultato: 66 giuste, 24 sbagliate, 9 omesse o non visibili. Con −0,25 sono circa 60 punti su 99, cioè circa 30 su 50.
- Errori per area: Quantitativa 3 su 35 (forte); Data Insights 14 su circa 37 risposte (debole); Verbale 7 su 24 (medio).
- Errori per pattern (24):
  - Sufficienza dei dati: 8 su 12 DS. Più spesso risponde "servono altri dati" quando bastano (5 volte, di cui 2 sì/no risolvibili con un limite); a volte crede che basti un'affermazione quando non basta (3 volte, inclusa 4 · 6 al posto del mcm).
  - Rapporti, percentuali, medie: 5 (confronto di rapporti invertito, "doppio" con numeri vicini, media ponderata con pesi invertiti, base della percentuale, percentuali di riga lette come conteggi).
  - Ragionamento verbale: 4 (causa inventata accettata, necessario vs sufficiente, indebolire scegliendo un dato irrilevante, termine economico frainteso).
  - Vero/falso/non ricavabile: 3 (causa non detta presa per vera; esempio concreto preso per non ricavabile; dettaglio contraddetto preso per non ricavabile).
  - Dati/proposizioni: 2 (consegna "falsa" letta come "vera"; proposizione logica non vista accanto a quelle numeriche).
  - Altro: combinatoria con vincolo sul primo evento; riga sbagliata in tabella.

## 4. Ricetta per un mock da 50 (18 Q / 16 V / 16 DI)
### Quantitativa (18)
- 6 catene di percentuali o prezzi (2 con base "rispetto a", 2 con opzioni "circa", 1 con un dato superfluo)
- 1 media ponderata inversa
- 4 combinatoria/probabilità (1 con vincolo, 1 con lettere ripetute, 1 senza reinserimento, 1 a doppia risposta)
- 2 algebra (sistema 3×3 o età/proporzionale)
- 2 numeri (resti, mcm o somma 1…n)
- 1 calendario o crescita esponenziale
- 1 trabocchetto di ragionamento laterale
- 1 con "non determinabile" tra le opzioni (a volte giusta, a volte esca)

### Verbale (16)
- 5 vero/falso/non ricavabile (almeno 2 false, almeno 1 vera da esempio concreto, almeno 1 non ricavabile da causa non detta)
- 5 comprensioni di brani economico-finanziari con numeri (almeno 1 "NON è corretta", almeno 1 termine tecnico)
- 4 rafforza/indebolisce (almeno 1 necessario vs sufficiente, 1 causa alternativa, 1 selezione/causalità inversa)
- 1 applicazione di una regola
- 1 "quale fattore, se noto, influirebbe"

### Data Insights (16)
- 6 DS (almeno 2 sì/no risolte con un limite, 1 geometrica, 1 con tabella 2×2 o insiemi sovrapposti, 1 D con un intervallo di soluzioni, 1 C; chiave A–D bilanciata, lettere rimescolate nella lista)
- 4 dati/proposizioni (2 "sicuramente vera/e", 2 "sicuramente falsa/e"; almeno 1 con una proposizione logica)
- 3 grafici con informazioni extra a 3–4 passaggi
- 3 tabelle con affermazioni (almeno 1 con percentuali di riga, 1 con "Nessuna delle altre", 1 con celle mancanti o confronto "doppio/metà" con numeri vicini)

In più: 2–3 domande in inglese distribuite tra le aree; almeno 1/3 delle domande sui punti deboli della sezione 3.

## 5. Controllo qualità
- Risolvere ogni domanda da zero senza guardare la chiave e verificare i conti con uno script.
- Una sola opzione corretta per domanda.
- Nel verbale la risposta deve poggiare su una frase precisa del brano.
- Nelle DS controllare ogni affermazione da sola e poi insieme alle altre.
- Se una domanda resta dubbia, sostituirla.
