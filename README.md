# Sorteat

Handling all the thinking, so you can focus on the eating. 

Sorteat è un prototipo interattivo ad alta fedeltà (high-fidelity prototype) sviluppato in **React**. 
Il progetto nasce come soluzione per ridurre gli sprechi alimentari. L'obiettivo dell'applicazione è dunque semplificare la vita condivisa tra coinquilini, famiglie, ma anche persone che vivono da sole, aiutandoli a gestire la dispensa, dividere la spesa e pianificare i pasti così da ridurre il carico cognitivo e aiutare l'utente ad avere tutto sempre tutto sotto mano.

---

## Funzionalità principali

L'applicazione è divisa in tre moduli principali profondamente interconnessi tra loro:

### 1. Inventario
- Gestione divisa per reparti: **Frigo, Dispensa e Freezer**.
- Tracciamento delle **date di scadenza** con alert visivi (semafori e widget) per i prodotti in scadenza.
- Gestione della **proprietà**: ogni prodotto è associato a un coinquilino specifico o alla "Casa" (condiviso).
- Funzione **"Chiedi in prestito"**: permette di richiedere una quantità specifica di un ingrediente a un coinquilino.

### 2. Spesa
- Lista della spesa unificata con filtri rapidi per vedere solo "i propri" prodotti.
- **Checkout intelligente**: un flusso a step che permette di rivedere le quantità, assegnare i proprietari, simulare la scansione dello scontrino e spostare automaticamente i prodotti nell'Inventario.

### 3. Cucina
- **Calendario settimanale** per organizzare pranzi e cene.
- **Creazione ricette**: inserimento degli ingredienti con controllo automatico della disponibilità.
- **Semaforo ingredienti**: il sistema ti dice subito se hai gli ingredienti, se devi comprarli (aggiungendoli alla spesa con un click) o se puoi chiederli a un coinquilino.

---

## Tecnologie utilizzate

Questo progetto è un prototipo frontend che utilizza dati mockati (salvati in locale tramite React Context API) per simulare un database reale.

- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS
- **Animazioni e Transizioni:** Framer Motion
- **Icone:** Lucide React
- **Notifiche (Toasts):** Sonner
- **State Management:** React Context API (`ProductsContext`, `WasteContext`)

---

## UX / UI Design & User Testing

Il design dell'applicazione è stato iterato e raffinato seguendo le **10 Euristiche di Nielsen** e testato tramite sessioni di **User Testing**.

---

## Autore
Progetto sviluppato da **Mariia Sarbash** come prototipo high-fidelity.