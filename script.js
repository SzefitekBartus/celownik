// script.js (zmodyfikowany do komunikacji z Node.js)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addCrosshairForm');
    const gallery = document.querySelector('.crosshair-gallery');
    const defaultImage = 'https://i.imgur.com/2s3OrS7.png'; // Domyślny obrazek, jeśli nie dodasz swojego

    // --- Główna funkcja do wyświetlania celowników (pobiera z API) ---
    const renderCrosshairs = async () => {
        try {
            const response = await fetch('/api/crosshairs'); // Endpoint do pobierania celowników
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const crosshairs = await response.json();
            gallery.innerHTML = ''; // Czyścimy galerię przed ponownym załadowaniem

            if (crosshairs.length === 0) {
                gallery.innerHTML = '<p style="text-align: center; width: 100%;">Nie masz jeszcze żadnych zapisanych celowników. Użyj formularza, aby dodać pierwszy!</p>';
                return;
            }

            crosshairs.forEach((crosshair) => {
                const card = document.createElement('div');
                card.className = 'crosshair-card';
                card.dataset.id = crosshair._id; // Używamy ID z serwera

                card.innerHTML = `
                    <h2 class="card-title">${escapeHTML(crosshair.title)}</h2>
                    <img src="${crosshair.image}" alt="Podgląd celownika" class="crosshair-image">
                    <div class="code-container">
                        <pre><code>${escapeHTML(crosshair.code)}</code></pre>
                        <div>
                            <button class="copy-btn">Kopiuj kod</button>
                            <button class="delete-btn">Usuń</button>
                        </div>
                    </div>
                `;
                gallery.appendChild(card);
            });

            addEventListeners(); // Dodajemy nasłuchiwanie na przyciski po wyrenderowaniu
        } catch (error) {
            console.error('Błąd podczas ładowania celowników:', error);
            gallery.innerHTML = '<p style="text-align: center; width: 100%; color: red;">Nie udało się załadować celowników. Spróbuj ponownie później.</p>';
        }
    };

    // --- Funkcja do dodawania obsługi przycisków ---
    const addEventListeners = () => {
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', handleCopy);
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDelete);
        });
    };

    // --- Obsługa kopiowania kodu (bez zmian) ---
    const handleCopy = (e) => {
        const codeElement = e.target.closest('.code-container').querySelector('pre code');
        navigator.clipboard.writeText(codeElement.innerText).then(() => {
            const originalText = e.target.innerText;
            e.target.innerText = 'Skopiowano!';
            setTimeout(() => { e.target.innerText = originalText; }, 2000);
        });
    };

    // --- Obsługa usuwania celownika (wysyła żądanie DELETE do API) ---
    const handleDelete = async (e) => {
        if (confirm('Czy na pewno chcesz usunąć ten celownik?')) {
            const card = e.target.closest('.crosshair-card');
            const crosshairId = card.dataset.id; // Pobieramy ID z serwera

            try {
                const response = await fetch(`/api/crosshairs/${crosshairId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                renderCrosshairs(); // Renderujemy listę od nowa po usunięciu
            } catch (error) {
                console.error('Błąd podczas usuwania celownika:', error);
                alert('Nie udało się usunąć celownika.');
            }
        }
    };

    // --- Obsługa formularza dodawania (wysyła dane do API) ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('crosshairTitle').value;
        const code = document.getElementById('crosshairCode').value;
        const imageFile = document.getElementById('crosshairImage').files[0];

        const formData = new FormData(); // Używamy FormData do wysyłania plików
        formData.append('title', title);
        formData.append('code', code);
        if (imageFile) {
            formData.append('image', imageFile); // Dodajemy plik, jeśli istnieje
        } else {
            formData.append('image', defaultImage); // Wysyłamy domyślny URL, jeśli brak pliku
        }

        try {
            const response = await fetch('/api/crosshairs', {
                method: 'POST',
                body: formData, // FormData automatycznie ustawia Content-Type na multipart/form-data
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            renderCrosshairs();
            form.reset();
        } catch (error) {
            console.error('Błąd podczas dodawania celownika:', error);
            alert('Nie udało się dodać celownika.');
        }
    });

    // --- Funkcja zabezpieczająca przed wstrzykiwaniem HTML (bez zmian) ---
    const escapeHTML = (str) => {
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(str));
        return p.innerHTML;
    };

    // --- Pierwsze załadowanie strony ---
    renderCrosshairs();
});