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

function updatePagination(dataLength, itemsPerPage, currentPage, onPageChange) {
  const totalPages = Math.ceil(dataLength / itemsPerPage);
  const paginationContainer = document.getElementById('pagination-container');
  paginationContainer.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.className = 'page-button';
    if (i === currentPage) {
      pageButton.classList.add('active');
    }

    pageButton.addEventListener('click', () => {
      onPageChange(i);
    });

    paginationContainer.appendChild(pageButton);
  }
}

// Add the new 'calculateDistance' function
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d / 1.609344; // Convert distance to miles
}

function filterData(data, filters, page) {
  const itemsPerPage = 20;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return data
    .filter((vehicle) => {
      for (const key in filters) {
        if (filters[key]) {
          if (key === 'price' || key === 'mileage') {
            const [min, max] = filters[key].split('-').map(Number);
            const value = Number(vehicle[key]);

            if (value < min || value > max) {
              return false;
            }
          } else if (key === 'radius') {
            const consumerLat = filters.consumerLat;
            const consumerLon = filters.consumerLon;
            const dealerLat = vehicle.Latitude;
            const dealerLon = vehicle.Longitude;
            const distance = calculateDistance(
              consumerLat,
              consumerLon,
              dealerLat,
              dealerLon
            );

            if (distance > vehicle.Radius) {
              return false;
            }
          } else if (String(vehicle[key]) !== String(filters[key])) {
            return false;
          }
        }
      }
      return true;
    })
    .slice(startIndex, endIndex);
}

(async function () {
  try {
    await fetchData({ zip: '90210' }, 1);
  } catch (error) {
    console.error('Error:', error);
  }
})();

async function fetchData(filters = {}, page = 1) {
  const url = 'https://storage.googleapis.com/lotlinxdatabucket/master.json';
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }

  const jsonData = await response.json();
  const filteredData = filterData(jsonData, filters, page);

  // Log the keys of the first item in the JSON data array
  if (jsonData.length > 0) {
    console.log('JSON Data Keys:', Object.keys(jsonData[0]));
  } else {
    console.log('The JSON data array is empty.');
  }

  // Update the pagination container
  updatePagination(jsonData.length, 20, page, (newPage) => {
    fetchData(filters, newPage).catch((error) => {
      console.error('Error:', error);
    });
  });

  // Clear the inventory container before displaying the filtered data
  document.getElementById('inventory-container').innerHTML = '';

  // Use filteredData to populate your inventory results on the site
  displayInventory(filteredData);
}

function displayInventory(data) {
  const inventoryContainer = document.getElementById('inventory-container');

  data.forEach((vehicle) => {
    const inventoryItem = document.createElement('div');
    inventoryItem.className = 'inventory-item';

    const inventoryImage = document.createElement('img');
    inventoryImage.className = 'inventory-image';
    inventoryImage.src = vehicle.ImageUrls;

    const inventoryInfo = document.createElement('div');
    inventoryInfo.className = 'inventory-info';

    const inventoryTitle = document.createElement('p');
    inventoryTitle.className = 'inventory-title';
    inventoryTitle.textContent = `${vehicle.Year} ${vehicle.Make} ${vehicle.Model}`;

    const inventoryMileage = document.createElement('p');
    inventoryMileage.className = 'inventory-mileage';
    inventoryMileage.textContent = `Mileage: ${vehicle.Miles}`;

    const inventoryDealer = document.createElement('p');
    inventoryDealer.className = 'inventory-dealer';
    inventoryDealer.textContent = `Dealer: ${vehicle.DealerName}`;

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
    zip: zip,
    make: make,
    model: model,
    price: minPrice && maxPrice ? `${minPrice}-${maxPrice}` : undefined,
    mileage: minMileage && maxMileage ? `${minMileage}-${maxMileage}` : undefined,
  };

  fetchData(filters, 1).catch((error) => {
    console.error('Error:', error);
  });
});

fetchData().catch((error) => {
  console.error('Error:', error);
});
