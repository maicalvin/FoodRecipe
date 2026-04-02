(function() {
    const QUOTE_TARGET_COUNT = 150;

    const openings = [
        "Healthy cooking",
        "Fresh ingredients",
        "Quick meals",
        "Colorful plates",
        "Balanced portions",
        "Mindful eating",
        "Home kitchens",
        "Simple prep",
        "Smart seasoning",
        "Clean proteins",
        "Leafy greens",
        "Whole foods",
        "Hydration habits",
        "Small daily steps",
        "Nourishing choices"
    ];

    const middles = [
        "turn",
        "make",
        "keep",
        "help",
        "bring",
        "guide",
        "fuel",
        "lift",
        "support",
        "shape"
    ];

    const endings = [
        "every weeknight into a win",
        "your energy last longer",
        "your body feel stronger",
        "fast dinners feel effortless",
        "every bite count",
        "wellness taste amazing",
        "your routine easier to follow",
        "healthy habits stick",
        "your plate brighter and better",
        "your goals easier to reach"
    ];

    function titleCase(input) {
        return input.charAt(0).toUpperCase() + input.slice(1);
    }

    function buildQuotes() {
        const quotes = [];

        for (let i = 0; i < openings.length && quotes.length < QUOTE_TARGET_COUNT; i++) {
            for (let j = 0; j < middles.length && quotes.length < QUOTE_TARGET_COUNT; j++) {
                for (let k = 0; k < endings.length && quotes.length < QUOTE_TARGET_COUNT; k++) {
                    const quote = titleCase(`${openings[i]} ${middles[j]} ${endings[k]}.`);
                    quotes.push(quote);
                }
            }
        }

        return quotes;
    }

    function renderTicker() {
        const track = document.getElementById("quoteTickerTrack");
        if (!track) return;

        const quotes = buildQuotes();
        const quoteText = quotes.map((quote) => `<span class="quote-ticker__item">${quote}</span>`).join("");

        // Duplicate content for smooth looping animation.
        track.innerHTML = `<div class="quote-ticker__segment">${quoteText}</div><div class="quote-ticker__segment" aria-hidden="true">${quoteText}</div>`;
    }

    document.addEventListener("DOMContentLoaded", renderTicker);
})();
