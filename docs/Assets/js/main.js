// Add this code at the beginning of your JavaScript code
document.getElementById('min-price').addEventListener('input', (event) => {
  document.getElementById('min-price-display').textContent = event.target.value;
});

document.getElementById('max-price').addEventListener('input', (event) => {
  document.getElementById('max-price-display').textContent = event.target.value;
});

document.getElementById('min-mileage').addEventListener('input', (event) => {
  document.getElementById('min-mileage-display').textContent = event.target.value;
});

document.getElementById('max-mileage').addEventListener('input', (event) => {
  document.getElementById('max-mileage-display').textContent = event.target.value;
});

// ... other code ...
function filterData(data, filters) {
  return data.filter((vehicle) => {
    for (const key in filters) {
      if (filters[key]) {
        if (key === 'price' || key === 'mileage') {
          const [min, max] = filters[key].split('-').map(Number);
          const value = Number(vehicle[key]);

          if (value < min || value > max) {
            return false;
          }
        } else if (String(vehicle[key]) !== String(filters[key])) {
          return false;
        }
      }
    }
    return true;
  });
}
(async function () {
  try {
    await fetchData({ zip: '90210' });
  } catch (error) {
    console.error('Error:', error);
  }
})();
function displayInventory(data) {
  const inventoryContainer = document.getElementById('inventory-container');

  data.forEach((vehicle) => {
    const inventoryItem = document.createElement('div');
    inventoryItem.className = 'inventory-item';

    const inventoryImage = document.createElement('img');
    inventoryImage.className = 'inventory-image';
    inventoryImage.src = vehicle.image_urls;

    const inventoryInfo = document.createElement('div');
    inventoryInfo.className = 'inventory-info';

    const inventoryTitle = document.createElement('p');
    inventoryTitle.className = 'inventory-title';
    inventoryTitle.textContent = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

    const inventoryMileage = document.createElement('p');
    inventoryMileage.className = 'inventory-mileage';
    inventoryMileage.textContent = `Mileage: ${vehicle.mileage}`;

    const inventoryDealer = document.createElement('p');
    inventoryDealer.className = 'inventory-dealer';
    inventoryDealer.textContent = `Dealer: ${vehicle.dealername}`;

    const inventoryDetail = document.createElement('button');
    inventoryDetail.className = 'inventory-detail';
    inventoryDetail.textContent = 'View Details';

    inventoryInfo.appendChild(inventoryTitle);
    inventoryInfo.appendChild(inventoryMileage);
    inventoryInfo.appendChild(inventoryDealer);
    inventoryInfo.appendChild(inventoryDetail);

    inventoryItem.appendChild(inventoryImage);
    inventoryItem.appendChild(inventoryInfo);

    inventoryContainer.appendChild(inventoryItem);
  });
}
document.getElementById('search-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const zip = document.getElementById('zip').value;
  const make = document.getElementById('make').value;
  const model = document.getElementById('model').value;
  const minPrice = document.getElementById('min-price').value;
  const maxPrice = document.getElementById('max-price').value;
  const minMileage = document.getElementById('min-mileage').value;
  const maxMileage = document.getElementById('max-mileage').value;

  const filters = {
    zip,
    make,
    model,
    price: minPrice && maxPrice ? `${minPrice}-${maxPrice}` : undefined,
    mileage: minMileage && maxMileage ? `${minMileage}-${maxMileage}` : undefined,
  };

  fetchData(filters).catch((error) => {
    console.error('Error:', error);
  });
});

async function fetchData(filters = {}) {
  const url = 'https://storage.googleapis.com/lotlinxdatabucket/master.json';
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }

  const jsonData = await response.json();
  console.log(jsonData);

  // Filter data based on the filters provided
  const filteredData = filterData(jsonData, filters);

  // Clear the inventory container before displaying the filtered data
  document.getElementById('inventory-container').innerHTML = '';

  // Use filteredData to populate your inventory results on the site
  displayInventory(filteredData);
}

fetchData().catch((error) => {
  console.error('Error:', error);
});
