async function loadCompanyDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    document.getElementById("company-card").innerText =
      "ID-ul companiei lipsește din URL.";
    return;
  }

  try {
    const response = await fetch(
      `https://api.peviitor.ro/v6/firme/qsearch/?q=${encodeURIComponent(id)}`
    );

    if (!response.ok) {
      throw new Error(`Cod răspuns: ${response.status}`);
    }

    const data = await response.json();

    const company =
      data.docs && Array.isArray(data.docs) && data.docs.length > 0
        ? data.docs[0]
        : null;

    if (!company) {
      document.getElementById("company-card").innerText =
        "Compania nu a fost găsită.";
      return;
    }

    const companyName = Array.isArray(company.denumire)
      ? company.denumire[0]
      : company.denumire || "--";

    const cui = company.cui || "--";
    const codStare = company.cod_stare || "--";
    const codStareFormat = codStare.toString().replace(/,/g, " ");
    const regComert = company.cod_inmatriculare || "--";
    const euid = company.euid || "--";
    const adresa = Array.isArray(company.adresa_completa)
      ? company.adresa_completa[0]
      : company.adresa_completa || "--";
    const localitate = Array.isArray(company.localitate)
      ? company.localitate[0]
      : company.localitate || "--";
    const judet = Array.isArray(company.judet)
      ? company.judet[0]
      : company.judet || "--";
    const brands = Array.isArray(company.brands)
      ? company.brands[0]
      : company.brands || "--";
    const email = Array.isArray(company.email)
      ? company.email[0]
      : company.email || "--";
    const scraper = Array.isArray(company.scraper)
      ? company.scraper[0]
      : company.scraper || "--";
    const website = Array.isArray(company.website)
      ? company.website
      : company.website
      ? [company.website]
      : [];

    const htmlContent = `
       <div class="company-heading f-col separator">
         <h2 id="company-name">${companyName}</h2>
         <a href="index.html" id="backButton">Înapoi la rezultate</a>
       </div>

       <div class="company-status f-row separator">
         <p>Stare firmă: <span class=${
           codStare.includes(1048) ? "green" : "red"
         }>${codStare.includes(1048) ? "Funcționare" : "Inactivă"}</span></p>
       </div>

       <div class="company-details f-col">
         <div class="company-details-heading">
           <h3>Informații generale</h3>
           <p id="company-summary">
             Codul fiscal al firmei <span id="company-name-inline">${companyName}</span> este <span id="company-cui-inline">${cui}</span>.
           </p>
         </div>

         <div class="company-details-data separator">
           <div class="code-field">
             <h4>CUI:</h4>
             <p>
               <span id="company-cui">${cui}</span>
               <button class="copy-btn" data-copy="${cui}" title="Copiază CUI">📋</button>
             </p>
           </div>

           <div class="code-field">
             <h4>Cod Stare:</h4>
             <p id="company-cod-stare">${codStareFormat}</p>
           </div>

           <div class="code-field">
             <h4>Reg. Comerțului:</h4>
             <p>
               <span id="company-reg">${regComert}</span>
               <button class="copy-btn" data-copy="${regComert}" title="Copiază cod">📋</button>
             </p>
           </div>

           <div class="code-field">
             <h4>EUID:</h4>
             <p>
               <span id="company-euid">${euid}</span>
               <button class="copy-btn" data-copy="${euid}" title="Copiază EUID">📋</button>
             </p>
           </div>

           <div class="code-field">
             <h4>Brand:</h4>
             <p id="company-localitate">${brands}</p>
           </div>
           

           </div>
           
           <div class="company-details-heading"> 
           <h3>Date de contact</h3>
           <p id="company-address">${adresa}</p>
           </div>
           <div class="company-details-data separator"> 
           <div class="code-field">
             <h4>Județ:</h4>
             <p id="company-judet">${judet}</p>
           </div>

           <div class="code-field">
             <h4>Localitate:</h4>
             <p id="company-localitate">${localitate}</p>
           </div>

           <div class="code-field">
              <h4>Email:</h4>
              ${
                email === "--"
                  ? `<p id="company-email">--</p>`
                  : `
                    <p>
                      <a href="mailto:${email}" id="company-email">${email}</a>
                      <button class="copy-btn" data-copy="${email}" title="Copiază email">📋</button>
                    </p>
                    `
              }
            </div>
           
           <div class="company-website">
             <h4>Website</h4>
             ${
               website.length > 0
                 ? website
                     .map(
                       (site, index) => `
                         <div class="website-entry">
                           <a href="${site}" target="_blank" class="company-website-link">${site}</a>
                           <button class="copy-btn" data-copy="${site}" title="Copiază link">📋</button>
                         </div>
                       `
                     )
                     .join("")
                 : "--"
             }
           </div>
         </div>

         <div class="company-details-heading"> 
           <h3>Alte informații</h3>
         </div>
         <div class="company-details-data"> 
           <div class="code-field">
             <h4>Link scraper:</h4>
              ${
                scraper === "--"
                  ? `<p id="company-scraper">--</p>`
                  : `
                    <p>
                      <a href="${scraper}" target="_blank" id="company-scraper">${scraper}</a>
                      <button class="copy-btn" data-copy="${scraper}" title="Copiază scraper">📋</button>
                    </p>
                    `
              }
           </div>
         </div>
       </div>
    `;

    document.getElementById("company-card").innerHTML = htmlContent;

    // Copy buttons logic
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const text = btn.getAttribute("data-copy");
        try {
          await navigator.clipboard.writeText(text);

          const original = btn.innerHTML;
          btn.innerHTML = "✅";
          btn.disabled = true;
          setTimeout(() => {
            btn.innerHTML = original;
            btn.disabled = false;
          }, 1500);
        } catch (err) {
          console.error("Copiere eșuată:", err);
        }
      });
    });
  } catch (error) {
    console.error("Eroare la încărcarea companiei:", error);
    document.getElementById("company-card").innerText =
      "Eroare la încărcarea companiei.";
  }
}

loadCompanyDetails();
