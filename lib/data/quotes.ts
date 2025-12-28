export interface Quote {
    text: string;
    author: string;
}

export const STOIC_QUOTES: Quote[] = [
    { text: "Du har makt över ditt sinne – inte över yttre händelser. Inse detta, och du finner styrka.", author: "Marcus Aurelius" },
    { text: "Hindret i vägen blir vägen.", author: "Marcus Aurelius" },
    { text: "Slösa inte mer tid på att diskutera hur en god människa bör vara. Var en.", author: "Marcus Aurelius" },
    { text: "Det du undviker tränar dig mindre än det du möter.", author: "Stoisk princip" },
    { text: "Om det inte är rätt, gör det inte. Om det inte är sant, säg det inte.", author: "Marcus Aurelius" },
    { text: "Smärta är varken god eller ond. Det är ditt omdöme som gör den till något av det.", author: "Epiktetos" },
    { text: "Ingen blir stark av tur. Styrka byggs av prövning.", author: "Stoisk parafras" },
    { text: "Du lider mer i fantasin än i verkligheten.", author: "Seneca" },
    { text: "Det är inte sakerna som stör oss, utan vår syn på dem.", author: "Epiktetos" },
    { text: "Acceptera det som händer som om du själv hade valt det.", author: "Marcus Aurelius" },
    { text: "Disciplin är frihetens pris.", author: "Stoisk princip" },
    { text: "Var hård mot dig själv, mild mot andra.", author: "Stoisk parafras" },
    { text: "Svårigheten visar vad människan är gjord av.", author: "Marcus Aurelius" },
    { text: "Ingen dag är förlorad om du handlat i enlighet med ditt förnuft.", author: "Stoisk princip" },
    { text: "Det du gör om och om igen formar vem du blir.", author: "Aristoteles" },
    { text: "Vänta inte på motivation. Handla enligt plikt.", author: "Stoisk parafras" },
    { text: "Ödet leder den villige och släpar den ovillige.", author: "Seneca" },
    { text: "Du behöver inte ett enklare liv. Du behöver ett starkare sinne.", author: "Stoisk parafras" },
    { text: "Gör det som ligger framför dig, utan klagan.", author: "Marcus Aurelius" },
    { text: "Självbehärskning är den högsta formen av makt.", author: "Stoisk princip" }
];

export const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * STOIC_QUOTES.length);
    return STOIC_QUOTES[randomIndex];
};
