function displayInventory(data) {
  const inventoryContainer = document.getElementById('inventory-container');

  data.forEach((vehicle) => {
    const inventoryItem = document.createElement('div');
    inventoryItem.className = 'inventory-item';

    const inventoryImage = document.createElement('img');
    inventoryImage.className = 'inventory-image';
    inventoryImage.src = vehicle.image_url;

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
    inventoryDealer.textContent = `Dealer: ${vehicle.dealer_name}`;

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

async function fetchData() {
  const url = 'https://storage.googleapis.com/lotlinxdatabucket/master.json';
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }

  const jsonData = await response.json();
  console.log(jsonData);

  // Use jsonData to populate your inventory results on the site
  displayInventory(jsonData);
}

fetchData().catch((error) => {
  console.error('Error:', error);
});
