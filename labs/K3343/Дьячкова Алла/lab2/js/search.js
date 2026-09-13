const API = "http://localhost:3000";

function sortResults(results, sortValue) {
    if (!sortValue) return results;
    const [field, order] = sortValue.split("_");

    return [...results].sort((a, b) => {
        const valA = Number(a[field]);
        const valB = Number(b[field]);
        return order === "Asc" ? valA - valB : valB - valA;
    });
}

function buildSearchParams() {
    const titleSearch = document.getElementById('titleSearch').value;
    const location = document.getElementById("location")?.value.trim();
    const propertyType = document.getElementById("propertyType")?.value;
    const minPrice = document.getElementById("minPrice")?.value;
    const maxPrice = document.getElementById("maxPrice")?.value;
    const checkboxes = document.querySelectorAll("input[type='checkbox']:checked");
    const selectedValues = Array.from(checkboxes).map(cb => cb.value);

    const sortBy = document.getElementById("sortBy")?.value;  // how to sort

    const params = new URLSearchParams();
    if (titleSearch) params.append("title_like", titleSearch);
    if (location) params.append("location_like", location);       // partial match
    if (propertyType) params.append("propertyType", propertyType);             // exact match
    if (minPrice) params.append("price_gte", minPrice); // price >= minPrice
    if (maxPrice) params.append("price_lte", maxPrice); // price <= maxPrice
    if (selectedValues.length > 0) {
        selectedValues.forEach(value => {
            params.append("roomCount", value);
        });
    }
    return [params, sortBy];
}

async function updateResults() {
    const [params, sortBy] = buildSearchParams();
    const searchResultsDiv = document.getElementById("searchResults");
    searchResultsDiv.innerHTML = "<p>...</p>";

    try {
        const res = await fetch(`${API}/properties?${params.toString()}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        let results = await res.json();

        searchResultsDiv.innerHTML = "";

        if (results.length === 0) {
            searchResultsDiv.innerHTML = "<p>Ничего не найдено.</p>";
            return;
        }
        results = sortResults(results, sortBy);
        results.forEach(property => {
            const propertyElement = document.createElement("div");
            propertyElement.classList.add("card", "mb-3");
            propertyElement.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title"><a href="property.html?id=${property.id}">${property.title}</a></h5>
                    <p class="card-text"><strong>Цена:</strong> ${property.price} ₽/мес</p>
                    <p class="card-text"><strong>Расположение:</strong> ${property.location}</p>
                </div>
            `;
            searchResultsDiv.appendChild(propertyElement);
        });

    } catch (err) {
        console.error("Search failed:", err);
        searchResultsDiv.innerHTML = "<p>Ошибка при загрузке данных.</p>";
    }
};


var priceRangeSlider = document.getElementById('priceRangeSlider');
noUiSlider.create(priceRangeSlider, {
    start: [15000, 55000],
    connect: true,
    range: {
        'min': 0,
        'max': 200000
    }
});

priceRangeSlider.noUiSlider.on('update', function (values, handle) {
    document.getElementById('minPrice').value = Math.round(values[0]);
    document.getElementById('maxPrice').value = Math.round(values[1]);
});

document.getElementById("searchForm").addEventListener("submit", function (event) {
    event.preventDefault();
    updateResults();
});

document.addEventListener('DOMContentLoaded', updateResults);