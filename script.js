let growthChart, stateChart, typeChart, manufacturerChart;
const loading = document.getElementById('loading'); // Add this div in HTML

document.getElementById('csvFileInput').addEventListener('change', function(e){
    const file = e.target.files[0];
    if(!file) return;

    // Show loading message
    loading.style.display = 'block';

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results){
            let data = normalizeCSV(results.data);
            data = data.filter(row => Object.values(row).some(v => v !== ''));

            populateSummary(data);
            populateTable(data);
            renderCharts(data);

            // Hide loading message
            loading.style.display = 'none';
        },
        error: function(err){
            console.error("Error parsing CSV:", err);
            loading.style.display = 'none';
        }
    });
});

// Normalize headers
function normalizeCSV(data) {
    return data.map(row => {
        const newRow = {};
        for (let key in row) {
            const cleanKey = key.trim().toLowerCase();
            newRow[cleanKey] = row[key].trim();
        }
        return newRow;
    });
}

// Summary
function populateSummary(data) {
    document.getElementById('totalEVs').textContent = data.length;
    document.getElementById('uniqueCities').textContent = new Set(data.map(d => d.city)).size;
    document.getElementById('uniqueManufacturers').textContent = new Set(data.map(d => d.make)).size;
}

// Table
function populateTable(data) {
    const tbody = document.querySelector('#dataTable tbody');
    const thead = document.querySelector('#dataTable thead');
    tbody.innerHTML = '';
    thead.innerHTML = '';
    if(data.length === 0) return;

    const headers = Object.keys(data[0]);
    const trHead = document.createElement('tr');
    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h.charAt(0).toUpperCase() + h.slice(1);
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(h => {
            const td = document.createElement('td');
            td.textContent = row[h];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// Charts
function renderCharts(data) {
    if(growthChart) growthChart.destroy();
    if(stateChart) stateChart.destroy();
    if(typeChart) typeChart.destroy();
    if(manufacturerChart) manufacturerChart.destroy();

    // Growth
    const yearCounts = {};
    data.forEach(d => { if(d.year) yearCounts[d.year] = (yearCounts[d.year] || 0) + 1; });
    growthChart = new Chart(document.getElementById('growthChart').getContext('2d'), {
        type: 'line',
        data: { labels: Object.keys(yearCounts), datasets: [{ label: 'EV Growth Over Years', data: Object.values(yearCounts), borderColor: 'blue', backgroundColor: 'rgba(0,0,255,0.1)', fill: true, tension: 0.3 }] }
    });

    // State
    const stateCounts = {};
    data.forEach(d => { if(d.state) stateCounts[d.state] = (stateCounts[d.state] || 0) + 1; });
    stateChart = new Chart(document.getElementById('stateChart').getContext('2d'), {
        type: 'bar',
        data: { labels: Object.keys(stateCounts), datasets: [{ label: 'EVs by State', data: Object.values(stateCounts), backgroundColor: 'orange' }] }
    });

    // Type
    const typeCounts = {};
    data.forEach(d => { if(d['vehicle type']) typeCounts[d['vehicle type']] = (typeCounts[d['vehicle type']] || 0) + 1; });
    typeChart = new Chart(document.getElementById('typeChart').getContext('2d'), {
        type: 'doughnut',
        data: { labels: Object.keys(typeCounts), datasets: [{ label: 'EVs by Type', data: Object.values(typeCounts), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'] }] }
    });

    // Manufacturer
    const manufacturerCounts = {};
    data.forEach(d => { if(d.make) manufacturerCounts[d.make] = (manufacturerCounts[d.make] || 0) + 1; });
    manufacturerChart = new Chart(document.getElementById('manufacturerChart').getContext('2d'), {
        type: 'pie',
        data: { labels: Object.keys(manufacturerCounts), datasets: [{ label: 'EVs by Manufacturer', data: Object.values(manufacturerCounts), backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40'] }] }
    });
}
