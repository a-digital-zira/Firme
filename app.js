const API_URL = 'https://api.peviitor.ro/v6/firme/search/'; // Verify correct endpoint

async function fetchCompanies(searchTerm) {
    try {
        const response = await fetch(`${API_URL}?search=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

function displayResults(companies) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';

    if (!companies || companies.length === 0) {
        container.innerHTML = '<div class="company-card">No results found</div>';
        return;
    }

    companies.forEach(company => {
        const card = document.createElement('div');
        card.className = 'company-card';
        card.innerHTML = `
            <h3>${company.name || 'Unnamed Company'}</h3>
            ${company.location ? `<p>Location: ${company.location}</p>` : ''}
            ${company.description ? `<p>${company.description}</p>` : ''}
        `;
        container.appendChild(card);
    });
}

document.getElementById('searchBtn').addEventListener('click', async () => {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (!searchTerm) return;

    const results = await fetchCompanies(searchTerm);
    displayResults(results);
});
