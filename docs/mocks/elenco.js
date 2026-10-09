/* =======================================================================
   elenco.js — elenco dei mock pubblicati nel sito.
   Aggiungendo un mock nuovo basta aggiungere una riga qui.
   ======================================================================= */
(function (root) {
  var ELENCO = [
    {
      id: '07',
      file: 'mocks/mock-07.js',
      title: 'Mock 07',
      sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
      minutes: 75,
      note: 'Ripreso dal file modello: è la simulazione già usata.'
    },
    {
      id: '08',
      file: 'mocks/mock-08.js',
      title: 'Mock 08',
      sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
      minutes: 75,
      note: 'Creato fuori dal repository e convertito nel formato del sito.'
    },
    {
      id: '09',
      file: 'mocks/mock-09.js',
      title: 'Mock 09',
      sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
      minutes: 75,
      note: 'Focus su Data Insights e sui cinque pattern d\'errore.'
    },
    {
      id: '10',
      file: 'mocks/mock-10.js',
      title: 'Mock 10',
      sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
      minutes: 75,
      note: 'Focus su Data Insights: sufficienza dei dati, quote e valori assoluti, medie ponderate.'
    },
    {
      id: '11',
      file: 'mocks/mock-11.js',
      title: 'Mock 11',
      sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
      minutes: 75,
      note: 'Focus su Data Insights: istogramma, grafico a due assi, rette da prolungare, tabelle da ricostruire, sufficienza dei dati.'
    },
    {
      id: '13',
      file: 'mocks/mock-13.js',
      title: 'Mock 13',
      sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
      minutes: 75,
      note: 'Focus su Data Insights: tabelle con dati mancanti, grafici da leggere con cautela (asse troncato, livelli e variazioni), sufficienza dei dati, medie ponderate.'
    },
    {
      id: '12',
      file: 'mocks/mock-12.js',
      title: 'Mock 12',
      sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
      minutes: 75,
      note: 'Focus su Data Insights: sufficienza dei dati, medie ponderate (anche mediana e Simpson), percentuali e valori assoluti, cause alternative.'
    },
    {
      id: '14',
      file: 'mocks/mock-14.js',
      title: 'Mock 14',
      sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
      minutes: 75,
      note: 'Calibrato sulla difficoltà del test ufficiale: più passaggi per domanda, opzioni-esca mascherate, sufficienza dei dati con criteri A–D rimescolati, tabelle con percentuali di riga e celle mancanti, brani economici con numeri.'
    },
    {
      id: '15',
      file: 'mocks/mock-15.js',
      title: 'Mock 15',
      sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
      minutes: 75,
      note: 'Più difficile del Mock 14 in Quantitativa e Verbale: percentuali a più livelli, miscele, medie ponderate inverse, lavoro con cambio a metà, combinatoria con vincoli, brani da 120–200 parole con modali e opzioni quasi tutte plausibili. Data Insights allo stesso livello del Mock 14.'
    },
    {
      id: '16',
      file: 'mocks/mock-16.js',
      title: 'Mock 16',
      sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
      minutes: 75,
      note: 'Più difficile del Mock 14 in Quantitativa e Verbale: percentuali a più livelli e condizionate, miscele, media ponderata inversa a tre sedi, lavoro con cambio a metà, combinatoria con vincoli, sistema con interi, brani da 120–200 parole con modali e opzioni quasi tutte plausibili. Data Insights allo stesso livello del Mock 14.'
    },
    {
      id: '17',
      file: 'mocks/mock-17.js',
      title: 'Mock 17',
      sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
      minutes: 75,
      note: 'Livello del Mock 15: basi delle percentuali e listino dallo scontato con IVA, lavoro con cambio a metà, resti e congruenze, probabilità condizionata, brani con modali e opzioni quasi tutte plausibili. Data Insights come il Mock 14, con proposizioni «sicuramente vere/false» e sufficienza dei dati.'
    },
    {
      id: '18',
      file: 'mocks/mock-18.js',
      title: 'Mock 18',
      sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
      minutes: 75,
      note: 'Livello del Mock 15: promozioni e basi delle percentuali, lavoro con cambio a metà, velocità media su tratti diseguali, resti, combinatoria con vincoli, brani con modali e opzioni quasi tutte plausibili. Data Insights come il Mock 14, con proposizioni «sicuramente vere/false», sufficienza dei dati e medie ponderate.'
    },
    {
      id: '19',
      file: 'mocks/mock-19.js',
      title: 'Mock 19',
      sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
      minutes: 75,
      note: 'Tutto in italiano, livello del Mock 15: basi delle percentuali e listino dallo scontato, lavoro con cambio a metà, resti e congruenze, combinatoria con vincoli, brani con modali e opzioni quasi tutte plausibili. Data Insights come il Mock 14, con proposizioni «sicuramente vere/false», sufficienza dei dati e tabelle con percentuali di riga.'
    }
  ];
  if (typeof module === 'object' && module.exports) module.exports = ELENCO;
  else root.MOCK_ELENCO = ELENCO;
})(typeof self !== 'undefined' ? self : this);
