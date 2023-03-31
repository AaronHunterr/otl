function createDealerMap(dealers) {
  const dealerMap = new Map();
  dealers.forEach(dealer => dealerMap.set(dealer.DealerID, dealer));
  return dealerMap;
}

function displayInventory(inventory, dealerMap) {
  const inventoryContainer = document.getElementById('inventory-container');

  inventory.forEach(vehicle => {
    const dealer = dealerMap.get(vehicle.DealerID);

    const vehicleCard = document.createElement('div');
    vehicleCard.classList.add('vehicle-card');

    const vehicleTitle = document.createElement('h3');
    vehicleTitle.textContent = `${vehicle.Year} ${vehicle.Make} ${vehicle.Model}`;
    vehicleCard.appendChild(vehicleTitle);

    const vehicleImg = document.createElement('img');
    vehicleImg.src = vehicle.Images.split('|')[0];
    vehicleCard.appendChild(vehicleImg);

    const vehicleMileage = document.createElement('p');
    vehicleMileage.textContent = `Mileage: ${vehicle.Mileage}`;
    vehicleCard.appendChild(vehicleMileage);

    const dealerInfo = document.createElement('p');
    dealerInfo.textContent = `Dealer: ${dealer.Name}, ${dealer.City}, ${dealer.State}`;
    vehicleCard.appendChild(dealerInfo);

    const viewDetailsBtn = document.createElement('button');
    viewDetailsBtn.textContent = 'View Details';
    viewDetailsBtn.onclick = () => {
      // Implement vehicle display page navigation here
    };
    vehicleCard.appendChild(viewDetailsBtn);

    inventoryContainer.appendChild(vehicleCard);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  Promise.all([
    fetch('https://dl.dropboxusercontent.com/s/8oke8b9sz8lvo57/dtcinventory.csv').then(response => response.text()),
    fetch('https://dl.dropboxusercontent.com/s/qy1r1of8z1pf5iu/dtcdealers.csv').then(response => response.text())
  ])
    .then(([csvInventoryData, csvDealerData]) => {
      const dealerMap = createDealerMap(Papa.parse(csvDealerData, {header: true, skipEmptyLines: true, dynamicTyping: true}).data);
      const parsedInventoryData = Papa.parse(csvInventoryData, {header: true, skipEmptyLines: true, dynamicTyping: true});
      displayInventory(parsedInventoryData.data, dealerMap);
    })
    .catch(error => console.error('Error fetching CSV:', error));
});
