const input = document.getElementById("searchInput");
const form = document.getElementById("customForm");
const container = document.getElementById("firmDetailsContainer");
const checkboxNoWebsite = document.getElementById("noWebsite");
const checkboxHasWebsite = document.getElementById("hasWebsite");
const filterHeader = document.querySelector(".right-header");
const filterContainer = document.querySelector(".active-filters");
const clearFiltersBtn = document.getElementById("clearFilters");

let allCompanies = [];
let currentPage = 1;
let rowsPerPage = 20;
let totalPages = 1;

// Submit form
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const searchValue = input.value.trim();
  localStorage.setItem("lastSearch", searchValue);
  currentPage = 1; // Reset to page 1 on new search
  await searchCompany(searchValue, currentPage, rowsPerPage);
});

// Load saved search on page load
window.addEventListener("DOMContentLoaded", async () => {
  const savedSearch = localStorage.getItem("lastSearch") || "";
  input.value = savedSearch;
  await searchCompany(savedSearch, currentPage, rowsPerPage);
});

// Company search with pagination
async function searchCompany(query = "", page = 1, rows = 20) {
  try {
    const actualQuery = query.trim() || "a";
    const response = await fetch(
      `https://api.peviitor.ro/v6/firme/qsearch/?q=${encodeURIComponent(
        actualQuery
      )}&page=${page}&rows=${rows}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Check if data.docs is an array
    if (!data.docs || !Array.isArray(data.docs)) {
      container.innerHTML = "<em>Eroare la încărcare date: răspuns invalid de la server.</em>";
      return;
    }

    // Update pagination info
    totalPages = data.pagination?.total_pages || 1;

    allCompanies = data.docs.sort((a, b) =>
      (a.denumire[0] || "").localeCompare(b.denumire[0] || "")
    );

    renderCompanies(applyFilters(allCompanies));
    updatePaginationControls();
  } catch (error) {
    console.error("Căutarea a eșuat:", error);
    container.innerHTML = "<em>Eroare la încărcare date: nu s-a putut conecta la server.</em>";
  }
}

// Exclusive filters
checkboxNoWebsite.addEventListener("change", () => {
  if (checkboxNoWebsite.checked) checkboxHasWebsite.checked = false;
  renderCompanies(applyFilters(allCompanies));
  updateActiveFiltersUI();
});

checkboxHasWebsite.addEventListener("change", () => {
  if (checkboxHasWebsite.checked) checkboxNoWebsite.checked = false;
  renderCompanies(applyFilters(allCompanies));
  updateActiveFiltersUI();
});

// Apply filters
function applyFilters(companies) {
  // Website filtering disabled due to missing website field in API
  if (checkboxNoWebsite.checked || checkboxHasWebsite.checked) {
    console.warn("Website filtering is disabled due to missing website data in API.");
    // Optionally, show a UI message:
    // container.innerHTML = "<em>Filtrarea după website este dezactivată temporar.</em>";
    return companies;
  }
  return companies;

  // If API adds a website field (e.g., website_url), uncomment and update:
  /*
  if (checkboxNoWebsite.checked) {
    return companies.filter(
      (company) => !company.website_url || company.website_url.length === 0
    );
  }
  if (checkboxHasWebsite.checked) {
    return companies.filter(
      (company) => company.website_url && company.website_url.length > 0
    );
  }
  return companies;
  */
}

// Render companies
function renderCompanies(companies) {
  container.innerHTML = "";

  if (companies.length === 0) {
    container.innerHTML = "<em>Nicio firmă găsită.</em>";
    return;
  }

  companies.forEach((company) => {
    const codStare = company.cod_stare || [];
    const codStareFormatat = Array.isArray(codStare)
      ? codStare.join(", ")
      : codStare.toString();

    container.innerHTML += `
      <div class="company-details f-col">
        <ul>
          <li class="${codStare.includes(1048) ? "valid" : "invalid"}">
            <h2>${company.denumire?.[0] || "Fără denumire"}</h2>
          </li>
        </ul>
        <div class="f-row company-address">
          <div class="f-col company-col">
            <h4>Localitate:</h4>
            <p>${company.localitate?.[0] || "Nespecificat"}</p>
          </div>
          <div class="f-col company-col">
            <h4>Județ:</h4>
            <p>${company.judet?.[0] || "Nespecificat"}</p>
          </div>
          <div class="f-col company-col">
            <h4>Cod stare:</h4>
            <p>${codStareFormatat || "Nespecificat"}</p>
          </div>
        </div>
        <a href="companie.html?id=${encodeURIComponent(
          company.id || ""
        )}" class="hover-anim company-link">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            class="search-icon"
            focusable="false"
            role="img"
            aria-hidden="true"
            style="
              position: absolute;
              top: 50%;
              left: 9px;
              transform: translateY(-50%);
            "
          >
            <path
              class="euiIcon__fillSecondary"
              d="M11.63 8h7.38v2h-7.38z"
            ></path>
            <path d="M7 8h3.19v2H7z"></path>
            <path class="euiIcon__fillSecondary" d="M7 16h7.38v2H7z"></path>
            <path d="M15.81 16H19v2h-3.19zM7 12h9v2H7z"></path>
            <path
              d="M13 0C5.82 0 0 5.82 0 13s5.82 13 13 13 13-5.82 13-13A13 13 0 0013 0zm0 24C6.925 24 2 19.075 2 13S6.925 2 13 2s11 4.925 11 11-4.925 11-11 11zM22.581 23.993l1.414-1.414 7.708 7.708-1.414 1.414z"
            ></path>
          </svg>
          Vezi toate informațiile
        </a>
      </div>
    `;
  });
}

// Filter behavior
filterHeader.style.display = "none";

// Active filter update
function updateActiveFiltersUI() {
  filterContainer.innerHTML = "";

  let filters = [];

  if (checkboxHasWebsite.checked) {
    filters.push({
      label: "Firme cu Website",
      id: "hasWebsite",
    });
  }

  if (checkboxNoWebsite.checked) {
    filters.push({
      label: "Firme fără Website",
      id: "noWebsite",
    });
  }

  filters.forEach((filter) => {
    const span = document.createElement("span");
    span.classList.add("active-filter");
    span.innerHTML = `
      ${filter.label}
      <button data-id="${filter.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.12 5.7a1 1 0 0 0-1.41 1.42L10.59 12l-4.88 4.88a1 1 0 1 0 1.41 1.41L12 13.41l4.88 4.88a1 1 0 0 0 1.42-1.41L13.41 12l4.88-4.88a1 1 0 0 0 0-1.41z"/>
        </svg>
      </button>
    `;
    filterContainer.appendChild(span);
  });

  filterHeader.style.display = filters.length > 0 ? "flex" : "none";
}

// Individual filter close button
filterContainer.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const id = e.target.getAttribute("data-id");
    if (id === "hasWebsite") checkboxHasWebsite.checked = false;
    if (id === "noWebsite") checkboxNoWebsite.checked = false;
    renderCompanies(applyFilters(allCompanies));
    updateActiveFiltersUI();
  }
});

// Remove all filters
clearFiltersBtn.addEventListener("click", () => {
  checkboxHasWebsite.checked = false;
  checkboxNoWebsite.checked = false;
  updateActiveFiltersUI();
  renderCompanies(applyFilters(allCompanies));
});

// Pagination controls
function updatePaginationControls() {
  // Remove existing pagination controls
  let paginationContainer = document.getElementById("paginationContainer");
  if (!paginationContainer) {
    paginationContainer = document.createElement("div");
    paginationContainer.id = "paginationContainer";
    container.insertAdjacentElement("afterend", paginationContainer);
  }

  paginationContainer.innerHTML = `
    <div style="margin-top: 20px; text-align: center;">
      <button id="prevPage" ${currentPage === 1 ? "disabled" : ""}>Previous</button>
      <span>Page ${currentPage} of ${totalPages}</span>
      <button id="nextPage" ${currentPage === totalPages ? "disabled" : ""}>Next</button>
    </div>
  `;

  // Add event listeners for pagination buttons
  const prevButton = document.getElementById("prevPage");
  const nextButton = document.getElementById("nextPage");

  if (prevButton) {
    prevButton.addEventListener("click", async () => {
      if (currentPage > 1) {
        currentPage--;
        await searchCompany(input.value.trim(), currentPage, rowsPerPage);
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", async () => {
      if (currentPage < totalPages) {
        currentPage++;
        await searchCompany(input.value.trim(), currentPage, rowsPerPage);
      }
    });
  }
}
