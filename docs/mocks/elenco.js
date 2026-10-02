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
      id: '12',
      file: 'mocks/mock-12.js',
      title: 'Mock 12',
      sub: '50 domande · 18 quantitativa, 16 verbale, 16 data insights',
      minutes: 75,
      note: 'Focus su Data Insights: sufficienza dei dati, medie ponderate (anche mediana e Simpson), percentuali e valori assoluti, cause alternative.'
    }
  ];
  if (typeof module === 'object' && module.exports) module.exports = ELENCO;
  else root.MOCK_ELENCO = ELENCO;
})(typeof self !== 'undefined' ? self : this);
