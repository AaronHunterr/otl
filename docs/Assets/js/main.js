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

async function calculateDistance(zip1, zip2) {
  try {
    const response1 = await axios.get(`https://api.zippopotam.us/us/${zip1}`);
    const response2 = await axios.get(`https://api.zippopotam.us/us/${zip2}`);

    const lat1 = response1.data.places[0].latitude;
    const lon1 = response1.data.places[0].longitude;
    const lat2 = response2.data.places[0].latitude;
    const lon2 = response2.data.places[0].longitude;

    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km

    return d * 0.621371; // Convert to miles
  } catch (error) {
    console.error('Error calculating distance:', error);
    return Number.MAX_VALUE;
  }
}
async function isVehicleWithinRadius(zip1, zip2, radius) {
  const distance = await calculateDistance(zip1, zip2);
  return distance <= radius;
}

async function filterData(data, filters, page) {
  const itemsPerPage = 20;

  // Map data to an array of promises that resolve to true or false
  const filterPromises = data.map(async (vehicle) => {
    for (const key in filters) {
      if (filters[key]) {
        if (key === 'price' || key === 'mileage') {
          const [min, max] = filters[key].split('-').map(Number);
          const value = Number(vehicle[key]);

          if (value < min || value > max) {
            return false;
          }
        } else if (key === 'zip') {
          const withinRadius = await isVehicleWithinRadius(
            filters.zip,
            vehicle.DealerZip,
            filters.radius
          );

          if (!withinRadius) {
            return false;
          }
        } else if (String(vehicle[key]) !== String(filters[key])) {
          return false;
        }
      }
    }
    return true;
  });

  // Wait for all filter promises to resolve
  const filterResults = await Promise.all(filterPromises);

  // Filter data based on filterResults
  const filteredData = data.filter((_, index) => filterResults[index]);

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return filteredData.slice(startIndex, endIndex);
}

async function fetchData({ zip, ...filters } = {}, page = 1) {
  const url = 'https://storage.googleapis.com/lotlinxdatabucket/master.json';
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }

  const jsonData = await response.json();
  console.log('Fetched Data:', jsonData);

  if (zip) {
    const zipData = await fetch(`https://api.zippopotam.us/us/${zip}`)
      .then((res) => res.json())
      .catch((error) => {
        console.error('Error fetching zip data:', error);
      });

    if (zipData && zipData.places && zipData.places[0]) {
      filters.consumerLat = parseFloat(zipData.places[0].latitude);
      filters.consumerLon = parseFloat(zipData.places[0].longitude);
    }
  }

  const filteredData = await filterData(jsonData, filters, page);
  console.log('Filtered Data:', filteredData);

  if (jsonData.length > 0) {
    console.log('JSON Data Keys:', Object.keys(jsonData[0]));
  } else {
    console.log('The JSON data array is empty.');
  }

  const paginatedData = filteredData.slice((page - 1) * 20, page * 20);

  updatePagination(filteredData.length, 20, page, (newPage) => {
    fetchData(filters, newPage).catch((error) => {
      console.error('Error:', error);
    });
  });

  document.getElementById('inventory-container').innerHTML = '';

  displayInventory(paginatedData);
}

function displayInventory(data) {
  console.log('Displaying Data:', data);
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

  console.log('Applied Filters:', filters); // This line should now work correctly

  fetchData(filters, 1).catch((error) => {
    console.error('Error:', error);
  });
});

fetchData().catch((error) => {
console.error('Error:', error);
});
