/* =======================================================================
   Mock 07 — convertito da modello/mock07.html senza cambiare le domande.
   Unica differenza di contenuto: il campo `lang` ('it' | 'en') sostituisce
   il vecchio flag `en:true`.
   Schema di una domanda:
     { n, area:'Q'|'V'|'DI', diff:'facile'|'media'|'difficile', lang:'it'|'en',
       stem, passage?, claim?, asset?, ds?, opts:[...], ans, sol, trap, patt }
   ======================================================================= */
(function (root, factory) {
  var C = (typeof module === 'object' && module.exports) ? require('../js/charts.js') : root.Charts;
  var mock = factory(C);
  if (typeof module === 'object' && module.exports) module.exports = mock;
  else { root.MOCKS = root.MOCKS || {}; root.MOCKS[mock.id] = mock; }
})(typeof self !== 'undefined' ? self : this, function (C) {
'use strict';

/* ----------------------- asset: tabelle e grafici ----------------------- */

const TAB_RICAVI = C.table({
  caption: 'Ricavi per area geografica (milioni di €)',
  head: ['Area', '2024', '2025'],
  rows: [['Nord', 400, 480], ['Centro', 200, 240], ['Sud', 150, 180], ['Isole', 50, 100]],
  foot: ['Totale', 800, '1.000']
});

const TAB_CORSI = C.table({
  caption: 'Esiti dell\'esame finale, sessione di giugno',
  head: ['Corso', 'Iscritti', 'Promossi'],
  rows: [['Corso A', 200, '60%'], ['Corso B', 150, '80%'], ['Corso C', 50, '40%']]
});

const BARRE = C.bars({
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  series: [
    { name: 'Alfa', values: [120, 150, 180, 150], style: 'fill' },
    { name: 'Beta', values: [80, 100, 140, 200], style: 'outline' }
  ],
  max: 200, unit: 'unità',
  aria: 'Vendite trimestrali dei prodotti Alfa e Beta'
});

const LINEA = C.line({
  labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'],
  series: [{ values: [100, 104, 107, 108, 108, 110] }],
  lo: 98, hi: 112, gridFrom: 100, gridTo: 110, gridStep: 5,
  title: 'indice (gennaio = 100)',
  aria: 'Indice dei prezzi da gennaio a giugno'
});

const TORTA = C.pie({
  data: [['Affitto', 40], ['Cibo', 25], ['Altro', 20], ['Trasporti', 15]],
  title: 'Spesa mensile: 2.000 €',
  aria: 'Ripartizione percentuale della spesa mensile'
});

const ds = C.ds;
const DSOPTS = C.DSOPTS;
const DSOPTS_EN = C.DSOPTS_EN;
const VFN = C.VFN;

/* ----------------------------- le 50 domande ---------------------------- */
/* area: Q = quantitativa, V = verbale, DI = data insights
   ans = indice della risposta corretta (0 = A) */

const QUESTIONS = [
{n:1,area:'Q',diff:'facile',lang:'it',
 stem:`Il prezzo di un articolo aumenta del 25% e successivamente viene ridotto del 20%. Rispetto al prezzo iniziale, il prezzo finale è:`,
 opts:['inferiore del 5%','uguale','superiore del 4%','superiore del 5%'],ans:1,
 sol:'1,25 × 0,80 = 1,00: il 20% viene tolto da una base più alta, quindi i due effetti si annullano esattamente.',
 trap:'Sommare le percentuali (+25 − 20 = +5%). Le variazioni percentuali si moltiplicano, non si sommano.',
 patt:'Percentuali composte'},

{n:2,area:'V',diff:'media',lang:'it',
 passage:`Nel 2025 il Comune ha installato 200 nuove rastrelliere per biciclette. Nello stesso anno i furti di bicicletta denunciati sono aumentati del 12%. Il comando di polizia locale dichiara di non aver analizzato né la distribuzione dei furti per zona né l'andamento del numero di biciclette in circolazione.`,
 claim:`L'installazione delle rastrelliere ha causato l'aumento dei furti.`,
 stem:'',opts:VFN,ans:2,
 sol:'Il brano riporta solo una coincidenza temporale e dichiara esplicitamente di non aver esaminato le spiegazioni alternative (più biciclette in circolazione, concentrazione per zona). Non conferma e non smentisce: non deducibile.',
 trap:'Rispondere "Falsa" perché il nesso sembra assurdo. Il testo non lo nega: semplicemente non lo verifica.',
 patt:'Falso vs Non deducibile'},

{n:3,area:'DI',diff:'media',lang:'it',asset:TAB_RICAVI,
 stem:`Quale area registra la crescita percentuale più alta dal 2024 al 2025?`,
 opts:['Nord','Centro','Sud','Isole'],ans:3,
 sol:'Isole: 50 → 100, cioè +100%. Nord, Centro e Sud crescono tutte del 20%.',
 trap:'Scegliere il Nord perché ha l\'aumento più grande in valore assoluto (+80), che però è la domanda sbagliata.',
 patt:'Rapporti vs valori assoluti'},

{n:4,area:'Q',diff:'facile',lang:'it',
 stem:`Una pompa riempie una vasca in 6 ore, un'altra in 12 ore. Lavorando insieme, in quanto tempo la riempiono?`,
 opts:['3 ore','4 ore','4 ore e 30 minuti','9 ore'],ans:1,
 sol:'Si sommano le velocità, non i tempi: 1/6 + 1/12 = 3/12 = 1/4 di vasca all\'ora → 4 ore.',
 trap:'Fare la media dei due tempi (9 ore). Insieme devono impiegare meno della più veloce da sola.',
 patt:'Lavoro e tassi'},

{n:5,area:'DI',diff:'facile',lang:'it',ds:true,
 stem:ds('Qual è il prezzo unitario del prodotto X?',
   '12 unità del prodotto X costano complessivamente 96 €.',
   'Il prezzo unitario del prodotto X è aumentato del 20% rispetto all\'anno scorso.'),
 opts:DSOPTS,ans:0,
 sol:'(1) dà 96/12 = 8 €. (2) fornisce solo una variazione percentuale, senza il livello di partenza: da sola non determina nulla.',
 trap:'Cercare comunque di usare entrambe. Se una basta da sola, la risposta non è C.',
 patt:'Sufficienza dei dati'},

{n:6,area:'V',diff:'media',lang:'it',
 stem:`Nessun membro del club di scacchi frequenta il corso di nuoto. Alcuni studenti del terzo anno frequentano il corso di nuoto. Quale conclusione segue necessariamente?`,
 opts:['Alcuni studenti del terzo anno non sono membri del club di scacchi.',
       'Nessuno studente del terzo anno è membro del club di scacchi.',
       'Tutti i membri del club di scacchi sono studenti del terzo anno.',
       'Alcuni membri del club di scacchi frequentano il corso di nuoto.'],ans:0,
 sol:'Gli studenti del terzo anno che nuotano non possono stare nel club: di quelli almeno si sa che non ne fanno parte, cioè "alcuni non sono".',
 trap:'La risposta B ("nessuno") è troppo forte: gli altri studenti del terzo anno, che non nuotano, potrebbero benissimo essere nel club.',
 patt:'Quantificatori: alcuni vs tutti'},

{n:7,area:'Q',diff:'media',lang:'it',
 stem:`In una classe di 30 studenti, i 12 maschi hanno una media di 24 e le 18 femmine una media di 27. Qual è la media della classe?`,
 opts:['25,5','25,8','26,0','26,2'],ans:1,
 sol:'(12 × 24 + 18 × 27) / 30 = (288 + 486) / 30 = 774/30 = 25,8.',
 trap:'Media semplice (24 + 27)/2 = 25,5. I gruppi hanno numerosità diverse, quindi i pesi contano.',
 patt:'Media ponderata vs semplice'},

{n:8,area:'Q',diff:'media',lang:'it',
 stem:`Dopo uno sconto del 15% un articolo costa 68 €. Qual era il prezzo di listino?`,
 opts:['76,50 €','78,20 €','80 €','82 €'],ans:2,
 sol:'68 è l\'85% del listino: 68 / 0,85 = 80 €.',
 trap:'Aggiungere il 15% a 68 (= 78,20 €). La percentuale va calcolata sulla base di partenza, che è il listino, non il prezzo scontato.',
 patt:'Base della percentuale'},

{n:9,area:'V',diff:'facile',lang:'it',
 passage:`Il regolamento prevede che la biblioteca resti aperta dalle 9 alle 20 dal lunedì al venerdì e dalle 9 alle 14 il sabato. La domenica resta chiusa.`,
 claim:`La biblioteca è aperta almeno fino alle 14 in tutti i giorni della settimana.`,
 stem:'',opts:VFN,ans:1,
 sol:'La domenica è chiusa e il brano lo dice esplicitamente: l\'affermazione è contraddetta dal testo, quindi falsa.',
 trap:'Rispondere "non deducibile" perché la domenica sembra un caso a parte: il testo la nomina, quindi l\'informazione c\'è.',
 patt:'Falso vs Non deducibile'},

{n:10,area:'DI',diff:'facile',lang:'it',asset:BARRE,
 stem:`Considerando l'intero anno, quale prodotto ha venduto di più e di quanto?`,
 opts:['Alfa, 80 unità in più','Alfa, 40 unità in più','Beta, 80 unità in più','I due prodotti hanno venduto la stessa quantità'],ans:0,
 sol:'Alfa: 120 + 150 + 180 + 150 = 600. Beta: 80 + 100 + 140 + 200 = 520. Differenza 80.',
 trap:'Guardare solo il quarto trimestre, dove Beta supera Alfa, e generalizzare all\'anno.',
 patt:'Lettura del grafico: totale vs ultimo periodo'},

{n:11,area:'V',diff:'difficile',lang:'it',
 stem:`Uno studio rileva che le città con più chilometri di piste ciclabili hanno una quota minore di abitanti obesi. Gli autori concludono che le piste ciclabili riducono l'obesità. Quale delle seguenti, se vera, indebolisce di più la conclusione?`,
 opts:['Costruire piste ciclabili richiede investimenti elevati.',
       'In alcune città le piste ciclabili sono usate soprattutto nel fine settimana.',
       'Negli ultimi dieci anni i chilometri di piste ciclabili sono aumentati in quasi tutte le città.',
       'Le città che costruiscono piste ciclabili hanno anche redditi medi più alti e maggiore offerta di cibo fresco.'],ans:3,
 sol:'D introduce una causa comune: il reddito spiega sia le piste sia la minore obesità, e la correlazione resta senza alcun nesso causale.',
 trap:'A e B sembrano critiche ma non toccano il legame causale: il costo è irrilevante e un uso parziale non esclude l\'effetto.',
 patt:'Cause alternative'},

{n:12,area:'Q',diff:'media',lang:'it',
 stem:`Si lanciano due dadi a sei facce. Qual è la probabilità che la somma sia 9?`,
 opts:['1/9','5/36','1/6','2/9'],ans:0,
 sol:'I casi favorevoli sono (3,6), (4,5), (5,4), (6,3): 4 su 36 = 1/9.',
 trap:'Contare solo le coppie non ordinate {3,6} e {4,5} (2/36). Con due dadi distinti l\'ordine conta.',
 patt:'Probabilità: casi ordinati'},

{n:13,area:'Q',diff:'media',lang:'it',
 stem:`Il negozio A controlla 200 pezzi e ne trova difettosi il 4%. Il negozio B ne controlla 600 e ne trova difettosi il 2%. Quanti pezzi difettosi in totale?`,
 opts:['20','24','32','48'],ans:0,
 sol:'A: 4% di 200 = 8. B: 2% di 600 = 12. Totale 20.',
 trap:'Mediare le percentuali: (4 + 2)/2 = 3% di 800 = 24. Le percentuali vanno pesate con le rispettive basi.',
 patt:'Media ponderata vs semplice'},

{n:14,area:'DI',diff:'media',lang:'it',asset:TAB_CORSI,
 stem:`Qual è la percentuale di promossi sul totale degli iscritti ai tre corsi?`,
 opts:['58%','60%','62%','65%'],ans:3,
 sol:'Promossi: 120 + 120 + 20 = 260 su 400 iscritti = 65%.',
 trap:'Media semplice delle tre percentuali (60 + 80 + 40)/3 = 60%: ignora che i corsi hanno numerosità molto diverse.',
 patt:'Media ponderata vs semplice'},

{n:15,area:'V',diff:'difficile',lang:'it',
 passage:`Tutti i dipendenti che superano il corso avanzato ricevono il bonus di fine anno.`,
 claim:`Marta ha ricevuto il bonus, quindi ha superato il corso avanzato.`,
 stem:'',opts:VFN,ans:2,
 sol:'La regola dice che superare il corso basta per ottenere il bonus, non che sia l\'unica strada. Il bonus potrebbe spettare anche per altri motivi: non deducibile.',
 trap:'Leggere "tutti quelli che superano ricevono" come "solo quelli che superano ricevono": è la conversione indebita di una condizione sufficiente in necessaria.',
 patt:'Condizione sufficiente vs necessaria'},

{n:16,area:'V',diff:'media',lang:'it',
 stem:`Il Comune intende ridurre il traffico in centro raddoppiando le tariffe dei parcheggi. Su quale assunzione si basa principalmente il piano?`,
 opts:['I parcheggi del centro sono oggi gratuiti.',
       'Il trasporto pubblico è il mezzo più usato in città.',
       'Una quota rilevante di automobilisti, di fronte a tariffe più alte, rinuncia all\'auto o al viaggio.',
       'Il traffico è il problema più grave della città.'],ans:2,
 sol:'Il piano funziona solo se la domanda reagisce al prezzo. Se nessuno cambiasse comportamento, le tariffe salirebbero e il traffico resterebbe identico.',
 trap:'A non serve (le tariffe raddoppiano, quindi esistono già); D riguarda l\'opportunità del piano, non il suo funzionamento.',
 patt:'Assunzione implicita'},

{n:17,area:'Q',diff:'facile',lang:'it',
 stem:`In un parcheggio ci sono solo auto (4 ruote) e moto (2 ruote): in tutto 30 veicoli e 100 ruote. Quante sono le moto?`,
 opts:['10','15','20','25'],ans:0,
 sol:'Se tutti fossero auto le ruote sarebbero 120: ogni moto ne toglie 2, quindi (120 − 100)/2 = 10 moto.',
 trap:'Risolvere a occhio con 15 e 15, che darebbe 90 ruote.',
 patt:'Sistema lineare a parole'},

{n:18,area:'DI',diff:'facile',lang:'it',asset:TORTA,
 stem:`Quanto spende la famiglia per i trasporti in un mese?`,
 opts:['150 €','200 €','250 €','300 €'],ans:3,
 sol:'15% di 2.000 € = 300 €.',
 trap:'Confondere la fetta "Altro" (20%) con quella dei trasporti (15%).',
 patt:'Lettura di quote su un totale'},

{n:19,area:'Q',diff:'difficile',lang:'it',
 stem:`Una soluzione di 20 litri contiene il 30% di alcol. Quanti litri di acqua pura vanno aggiunti per portare la concentrazione al 24%?`,
 opts:['4','5','6','8'],ans:1,
 sol:'L\'alcol resta 6 litri e cambia solo il totale: 6/(20 + x) = 0,24 → 20 + x = 25 → x = 5.',
 trap:'Applicare il calo di 6 punti percentuali al volume (6% di 20 = 1,2). Il numeratore è fisso, si muove il denominatore.',
 patt:'Rapporti vs valori assoluti'},

{n:20,area:'DI',diff:'difficile',lang:'it',ds:true,
 stem:ds('Qual è il prezzo di una felpa?',
   '3 magliette e 2 felpe costano 130 €.',
   '6 magliette e 4 felpe costano 260 €.'),
 opts:DSOPTS,ans:3,
 sol:'La (2) è esattamente la (1) moltiplicata per 2: non aggiunge nulla. Restano due incognite e una sola equazione indipendente, quindi infinite soluzioni.',
 trap:'Contare due equazioni e concludere che il sistema si risolve: vanno verificate indipendenti.',
 patt:'Sufficienza dei dati'},

{n:21,area:'V',diff:'media',lang:'it',
 passage:`Nel 2025 il museo ha registrato 120.000 visitatori, il 20% in più rispetto al 2024.`,
 claim:`Nel 2024 i visitatori del museo sono stati 100.000.`,
 stem:'',opts:VFN,ans:0,
 sol:'120.000 = 1,20 × visitatori 2024 → 120.000 / 1,20 = 100.000. L\'affermazione segue dai dati: vera.',
 trap:'Togliere il 20% da 120.000 (= 96.000) e dichiarare falsa l\'affermazione. Il 20% va calcolato sul 2024, non sul 2025.',
 patt:'Base della percentuale'},

{n:22,area:'Q',diff:'media',lang:'it',
 stem:`Un'auto percorre l'andata a 60 km/h e il ritorno, sullo stesso percorso, a 40 km/h. Qual è la velocità media sull'intero viaggio?`,
 opts:['48 km/h','50 km/h','52 km/h','54 km/h'],ans:0,
 sol:'Con 120 km per tratta: 2 ore all\'andata e 3 al ritorno, cioè 240 km in 5 ore = 48 km/h.',
 trap:'Media semplice (60 + 40)/2 = 50. La media va pesata sui tempi, e si viaggia più a lungo alla velocità bassa.',
 patt:'Media ponderata vs semplice'},

{n:23,area:'V',diff:'media',lang:'it',
 stem:`Dopo l'introduzione dello smart working la produttività media dell'azienda è cresciuta del 7%. Il direttore conclude che lo smart working ha aumentato la produttività. Quale informazione rafforza di più la conclusione?`,
 opts:['I dipendenti dichiarano di essere più soddisfatti.',
       'I costi degli uffici sono diminuiti.',
       'Il numero di dipendenti è rimasto stabile nel periodo.',
       'Un reparto rimasto interamente in presenza, con le stesse mansioni e gli stessi incentivi, non ha registrato alcun aumento.'],ans:3,
 sol:'D è un gruppo di controllo: esclude che l\'aumento derivi da fattori comuni a tutta l\'azienda (mercato, incentivi, stagionalità).',
 trap:'A misura la soddisfazione, non la produttività; B è un risparmio di costi, che è un\'altra cosa.',
 patt:'Cause alternative'},

{n:24,area:'DI',diff:'media',lang:'it',asset:LINEA,
 stem:`In quale mese si registra l'aumento maggiore rispetto al mese precedente?`,
 opts:['Febbraio','Marzo','Maggio','Giugno'],ans:0,
 sol:'Variazioni mensili: +4, +3, +1, 0, +2. La più grande è quella di febbraio.',
 trap:'Indicare giugno, che ha il livello più alto. La domanda chiede la variazione, non il livello.',
 patt:'Livello vs variazione'},

{n:25,area:'DI',diff:'difficile',lang:'it',asset:TAB_RICAVI,
 stem:`Come cambia la quota del Nord sul totale tra il 2024 e il 2025?`,
 opts:['Aumenta di 2 punti percentuali','Diminuisce di 2 punti percentuali','Resta invariata','Diminuisce di 5 punti percentuali'],ans:1,
 sol:'400/800 = 50% nel 2024; 480/1.000 = 48% nel 2025 → −2 punti percentuali.',
 trap:'Dedurre che la quota sale perché i ricavi del Nord crescono (+20%). La quota dipende anche dal totale, cresciuto del 25%.',
 patt:'Rapporti vs valori assoluti'},

{n:26,area:'Q',diff:'media',lang:'en',
 stem:`A worker is paid 15 € per hour for the first 40 hours of the week and 22.50 € per hour for each additional hour. Last week she earned 780 €. How many hours did she work?`,
 opts:['44','46','48','50'],ans:2,
 sol:'40 × 15 = 600 €; restano 180 €; 180 / 22,50 = 8 ore extra → 48 ore in totale.',
 trap:'Dividere 780 per 15 (= 52 ore), applicando la tariffa base a tutte le ore.',
 patt:'Tariffe a scaglioni'},

{n:27,area:'V',diff:'facile',lang:'it',
 passage:`Il rapporto osserva che nella maggior parte dei venti paesi analizzati l'inflazione è scesa nel 2025; in tre di essi è invece aumentata.`,
 claim:`Nel 2025 l'inflazione è scesa in tutti i paesi analizzati.`,
 stem:'',opts:VFN,ans:1,
 sol:'Il testo indica esplicitamente tre paesi in cui è aumentata: l\'affermazione è contraddetta.',
 trap:'"La maggior parte" non è "tutti"; qui però il testo va oltre e nomina le eccezioni, quindi si può dire falsa e non solo non deducibile.',
 patt:'Quantificatori: alcuni vs tutti'},

{n:28,area:'Q',diff:'media',lang:'it',
 stem:`Un'eredità è divisa tra tre fratelli in parti proporzionali a 2, 3 e 5. Chi riceve di più prende 6.000 € in più di chi riceve di meno. A quanto ammonta l'eredità?`,
 opts:['12.000 €','18.000 €','20.000 €','24.000 €'],ans:2,
 sol:'La differenza vale 5 − 2 = 3 parti = 6.000 €, quindi una parte è 2.000 €. Il totale è 10 parti = 20.000 €.',
 trap:'Prendere 6.000 € come valore di una parte e concludere 60.000, oppure sommare solo 2 + 5.',
 patt:'Rapporti vs valori assoluti'},

{n:29,area:'DI',diff:'media',lang:'en',ds:true,
 stem:ds('What is the percentage increase in the price of the product?',
   'The price increased by 12 € in absolute terms.',
   'The price went from 60 € to 72 €.'),
 opts:DSOPTS_EN,ans:1,
 sol:'Una variazione percentuale richiede la base di partenza. La (2) la fornisce: 12/60 = 20%. La (1) dà solo l\'aumento assoluto.',
 trap:'Pensare che la (1) serva comunque: è già contenuta nella (2).',
 patt:'Rapporti vs valori assoluti'},

{n:30,area:'V',diff:'media',lang:'it',
 stem:`Cinque squadre A, B, C, D, E si classificano in cinque posizioni diverse. B è davanti a C; D è dietro a C; A è davanti a B. Non ci sono altre informazioni. Quale affermazione è necessariamente vera?`,
 opts:['C è davanti a D.','A è prima.','E è ultima.','B è seconda.'],ans:0,
 sol:'I vincoli danno la catena A < B < C < D, quindi C precede sempre D. E non è vincolata e può inserirsi in qualsiasi posizione.',
 trap:'Dimenticare E: se E è prima, A non è prima e B non è seconda.',
 patt:'Vincoli logici: elemento libero'},

{n:31,area:'V',diff:'difficile',lang:'it',
 passage:`Nell'ultimo anno le vendite online del negozio sono cresciute del 40%, mentre le vendite totali (online più punto vendita fisico) sono cresciute del 5%.`,
 claim:`Le vendite del punto vendita fisico sono cresciute di più del 40%.`,
 stem:'',opts:VFN,ans:1,
 sol:'La crescita totale è una media ponderata delle due crescite. Se entrambe superassero il 40%, anche il totale supererebbe il 40%: invece è 5%. L\'affermazione è quindi impossibile, cioè falsa.',
 trap:'Rispondere "non deducibile" perché mancano i valori assoluti. Non servono: la logica della media ponderata basta a escludere il caso.',
 patt:'Falso vs Non deducibile'},

{n:32,area:'Q',diff:'difficile',lang:'it',
 stem:`Il numero di iscritti a un corso cresce del 20%. Nello stesso periodo la quota di donne passa dal 40% al 45% del totale. Di quanto varia il numero di donne iscritte?`,
 opts:['+5%','+12,5%','+27%','+35%'],ans:3,
 sol:'Con 100 iscritti iniziali: 40 donne. Dopo: 120 iscritti, il 45% è 54 donne. 54/40 = 1,35 → +35%.',
 trap:'Leggere i 5 punti percentuali di differenza (45 − 40) come una crescita del 5%: sono punti di quota, non variazione del numero.',
 patt:'Rapporti vs valori assoluti'},

{n:33,area:'DI',diff:'media',lang:'it',asset:BARRE,
 stem:`Di quanto crescono le vendite del prodotto Beta dal primo al quarto trimestre?`,
 opts:['+120%','+150%','+200%','+250%'],ans:1,
 sol:'Da 80 a 200: l\'aumento è 120, su una base di 80 → 120/80 = +150%.',
 trap:'Calcolare 200/80 = 2,5 e leggerlo come +250%. Quello è il rapporto tra i due valori, non la variazione.',
 patt:'Rapporti vs valori assoluti'},

{n:34,area:'Q',diff:'facile',lang:'it',
 stem:`In quanti modi si può scegliere un comitato di 3 persone da un gruppo di 8?`,
 opts:['24','56','112','336'],ans:1,
 sol:'C(8,3) = (8 × 7 × 6)/(3 × 2 × 1) = 336/6 = 56.',
 trap:'Fermarsi a 8 × 7 × 6 = 336, che conta anche l\'ordine: in un comitato l\'ordine non conta.',
 patt:'Combinazioni vs permutazioni'},

{n:35,area:'DI',diff:'facile',lang:'it',ds:true,
 stem:ds('Qual è il fatturato 2025 dell\'azienda?',
   'Nel 2025 il fatturato è cresciuto del 25% rispetto al 2024.',
   'Nel 2024 il fatturato è stato di 800.000 €.'),
 opts:DSOPTS,ans:2,
 sol:'Serve la base più la variazione: 800.000 × 1,25 = 1.000.000 €. Da sole, nessuna delle due determina il valore.',
 trap:'Dare per scontato che il dato 2024 basti: senza la variazione non dice nulla sul 2025.',
 patt:'Sufficienza dei dati'},

{n:36,area:'V',diff:'media',lang:'en',
 stem:`The company reports that employees who attend the optional training program are promoted twice as often as those who do not. Which of the following, if true, most weakens the claim that the program improves promotion chances?`,
 opts:['Employees already rated as high performers are far more likely to enrol in the program.',
       'The program lasts only three days.',
       'Some managers have never attended the program.',
       'The program was introduced two years ago.'],ans:0,
 sol:'È autoselezione: chi si iscrive è già il candidato più promettente, quindi sarebbe stato promosso comunque. La correlazione resta, il nesso causale no.',
 trap:'B e C sembrano critiche al programma ma non spiegano la differenza nei tassi di promozione.',
 patt:'Cause alternative'},

{n:37,area:'Q',diff:'media',lang:'it',
 stem:`Oggi Marco ha il triplo degli anni di Luca. Tra 10 anni ne avrà il doppio. Quanti anni ha Marco oggi?`,
 opts:['20','24','27','30'],ans:3,
 sol:'Con L gli anni di Luca: 3L + 10 = 2(L + 10) → 3L + 10 = 2L + 20 → L = 10, quindi Marco ne ha 30.',
 trap:'Aggiungere 10 anni a uno solo dei due: passa il tempo per entrambi.',
 patt:'Equazione a parole'},

{n:38,area:'V',diff:'media',lang:'it',
 stem:`Regola della catena: in ogni negozio, se il fatturato mensile supera 50.000 €, il responsabile riceve un premio. A marzo il responsabile del negozio di Padova non ha ricevuto il premio. Cosa se ne deduce?`,
 opts:['Il fatturato di marzo a Padova ha superato 50.000 €.',
       'Il fatturato di marzo a Padova non ha superato 50.000 €.',
       'Il negozio di Padova ha chiuso marzo in perdita.',
       'Nessun responsabile della catena ha ricevuto il premio a marzo.'],ans:1,
 sol:'Contrapposta: se "fatturato > 50.000 → premio" è vera, allora "niente premio → fatturato ≤ 50.000".',
 trap:'C confonde fatturato e utile: sono due grandezze diverse e il testo parla solo di fatturato.',
 patt:'Condizionale e contrapposta'},

{n:39,area:'DI',diff:'difficile',lang:'it',asset:TORTA,
 stem:`Se la spesa totale mensile sale a 2.500 € mentre l'affitto resta invariato in euro, quale sarà la quota dell'affitto?`,
 opts:['25%','32%','36%','40%'],ans:1,
 sol:'Affitto = 40% di 2.000 = 800 €. Sulla nuova spesa: 800/2.500 = 32%.',
 trap:'Lasciare la quota al 40% perché "l\'affitto non è cambiato": in euro no, ma la quota dipende dal totale.',
 patt:'Rapporti vs valori assoluti'},

{n:40,area:'DI',diff:'difficile',lang:'it',asset:TAB_CORSI,
 stem:`Quale corso ha il maggior numero di promossi?`,
 opts:['Corso A','Corso B','Corso A e Corso B, a pari merito','Corso C'],ans:2,
 sol:'A: 60% di 200 = 120. B: 80% di 150 = 120. C: 40% di 50 = 20. A e B pareggiano.',
 trap:'Scegliere B perché ha la percentuale di promossi più alta: la percentuale è calcolata su una base più piccola.',
 patt:'Rapporti vs valori assoluti'},

{n:41,area:'Q',diff:'facile',lang:'it',
 stem:`Un capitale di 2.000 € è investito al 10% annuo con interesse composto. Quanto vale dopo 2 anni?`,
 opts:['2.400 €','2.410 €','2.420 €','2.440 €'],ans:2,
 sol:'2.000 × 1,1 = 2.200; 2.200 × 1,1 = 2.420 €.',
 trap:'2.400 € è l\'interesse semplice (200 + 200): il secondo anno il 10% si calcola su 2.200, non su 2.000.',
 patt:'Percentuali composte'},

{n:42,area:'V',diff:'media',lang:'it',
 passage:`Al concorso sono ammessi solo i candidati che possiedono sia una laurea magistrale sia almeno 24 mesi di esperienza. Giulia ha 30 mesi di esperienza ed è stata ammessa al concorso.`,
 claim:`Giulia possiede una laurea magistrale.`,
 stem:'',opts:VFN,ans:0,
 sol:'"Solo se" rende entrambi i requisiti necessari: essendo ammessa, Giulia li soddisfa entrambi. Vera.',
 trap:'Rispondere "non deducibile" perché il testo non lo dice in modo diretto. Attenzione al confronto con il quesito 15: lì la condizione era sufficiente, qui è necessaria.',
 patt:'Condizione sufficiente vs necessaria'},

{n:43,area:'Q',diff:'media',lang:'it',
 stem:`Un rubinetto versa 12 litri al minuto in una vasca da 240 litri, mentre una falla ne fa uscire 4 litri ogni 30 secondi. In quanti minuti la vasca si riempie?`,
 opts:['20','30','40','60'],ans:3,
 sol:'La falla perde 8 litri al minuto. Flusso netto = 12 − 8 = 4 L/min → 240/4 = 60 minuti.',
 trap:'Leggere la falla come 4 L/min e ottenere 240/8 = 30. Le due unità di tempo sono diverse.',
 patt:'Unità di misura e tassi'},

{n:44,area:'V',diff:'media',lang:'it',
 stem:`In una città il limite di velocità in centro è stato abbassato a 30 km/h e nell'anno successivo gli incidenti sono calati del 18%. Quale informazione indebolisce di più la tesi che il limite abbia causato il calo?`,
 opts:['Nello stesso anno il traffico complessivo è calato del 20% per la chiusura di un grande stabilimento.',
       'Alcuni automobilisti non rispettano il nuovo limite.',
       'Il calo è stato più marcato nelle strade più larghe.',
       'Il nuovo limite è segnalato da cartelli ben visibili.'],ans:0,
 sol:'Meno veicoli in strada producono meno incidenti a prescindere dal limite: è una causa alternativa che spiega da sola il calo.',
 trap:'B sembra una critica, ma se gli incidenti calano nonostante qualche trasgressore la tesi ne esce semmai rafforzata.',
 patt:'Cause alternative'},

{n:45,area:'DI',diff:'difficile',lang:'it',ds:true,
 stem:ds('Marco ha più di 30 anni?',
   'L\'età di Marco, in anni compiuti, è un multiplo di 7.',
   'Marco ha più di 25 anni e meno di 40.'),
 opts:DSOPTS,ans:3,
 sol:'Insieme restano due possibilità: 28 e 35. Una sta sotto i 30, l\'altra sopra: la domanda resta senza risposta certa.',
 trap:'Fermarsi quando le due informazioni restringono molto il campo e concludere C. Restringere non è determinare.',
 patt:'Sufficienza dei dati'},

{n:46,area:'DI',diff:'facile',lang:'it',asset:TAB_RICAVI,
 stem:`Quale area contribuisce di più all'aumento del totale in valore assoluto?`,
 opts:['Centro','Nord','Sud','Isole'],ans:1,
 sol:'Aumenti: Nord +80, Isole +50, Centro +40, Sud +30. Il Nord è il contributo maggiore.',
 trap:'Scegliere le Isole perché hanno la crescita percentuale più alta (+100%): partono però da una base molto piccola.',
 patt:'Rapporti vs valori assoluti'},

{n:47,area:'Q',diff:'facile',lang:'it',
 stem:`Se 3x − 7 = 2x + 5, quanto vale x² − 4?`,
 opts:['32','136','140','144'],ans:2,
 sol:'3x − 2x = 5 + 7 → x = 12. Quindi 144 − 4 = 140.',
 trap:'Fermarsi a x² = 144 senza sottrarre 4.',
 patt:'Equazione di primo grado'},

{n:48,area:'V',diff:'difficile',lang:'it',
 passage:`Il rapporto precisa che i ritardi nelle consegne non sono necessariamente dovuti alla carenza di autisti.`,
 claim:`La carenza di autisti non ha contribuito ai ritardi.`,
 stem:'',opts:VFN,ans:2,
 sol:'"Non necessariamente X" lascia aperta la possibilità di X: il testo nega che la carenza sia l\'unica spiegazione, non che abbia avuto un ruolo. Non deducibile.',
 trap:'Leggere la frase come un\'esclusione e rispondere "Vera". Non necessariamente X ≠ necessariamente non X.',
 patt:'Falso vs Non deducibile'},

{n:49,area:'Q',diff:'media',lang:'it',
 stem:`Il 40% degli studenti di una scuola pratica uno sport; tra questi, il 25% gioca a calcio. I calciatori sono 30. Quanti studenti ha la scuola?`,
 opts:['120','200','250','300'],ans:3,
 sol:'I calciatori sono il 25% del 40%, cioè il 10% del totale. Se il 10% vale 30, il totale è 300.',
 trap:'Fare 30/0,25 = 120 e fermarsi: quello è il numero di studenti che praticano sport, non il totale.',
 patt:'Percentuali annidate'},

{n:50,area:'DI',diff:'difficile',lang:'it',ds:true,
 stem:ds('Il reparto A ha un tasso di pezzi difettosi più alto del reparto B?',
   'Il reparto A ha prodotto 20 pezzi difettosi, il reparto B ne ha prodotti 15.',
   'Il reparto A ha prodotto 500 pezzi in totale, il reparto B 250.'),
 opts:DSOPTS,ans:2,
 sol:'Insieme: A 20/500 = 4%, B 15/250 = 6%. La risposta è "no", ma è una risposta certa, quindi sufficienti. Da sole non bastano né i difettosi né i totali.',
 trap:'Con la sola (1) concludere "sì" perché 20 > 15: sono valori assoluti, il tasso richiede anche il denominatore.',
 patt:'Rapporti vs valori assoluti'}
];

return {
  id: '07',
  title: 'Mock 07',
  sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
  minutes: 75,
  note: 'Prima simulazione del sito, ripresa dal file modello.',
  questions: QUESTIONS
};
});
