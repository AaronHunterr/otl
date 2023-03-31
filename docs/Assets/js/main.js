function createDealerMap(dealers) {
  const dealerMap = new Map();
  dealers.forEach(dealer => dealerMap.set(dealer.DealerID, dealer));
  return dealerMap;
}

const vehiclesPerPage = 10;
let currentPage = 1;

function displayInventoryPage(inventory, dealerMap, page) {
  const inventoryContainer = document.getElementById('inventory-container');
  inventoryContainer.innerHTML = '';

  const startIndex = (page - 1) * vehiclesPerPage;
  const endIndex = startIndex + vehiclesPerPage;

  for (let i = startIndex; i < endIndex && i < inventory.length; i++) {
    const vehicle = inventory[i];
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
  }
}

function setupPagination(inventory, dealerMap) {
  const totalPages = Math.ceil(inventory.length / vehiclesPerPage);

  const paginationContainer = document.getElementById('pagination-container');
  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Previous';
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      displayInventoryPage(inventory, dealerMap, currentPage);
    }
  };
  paginationContainer.appendChild(prevBtn);

  const pageInfo = document.createElement('span');
  pageInfo.id = 'page-info';
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  paginationContainer.appendChild(pageInfo);

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayInventoryPage(inventory, dealerMap, currentPage);
    }
  };
  paginationContainer.appendChild(nextBtn);
}

document.addEventListener('DOMContentLoaded', function() {
  Promise.all([
    fetch('https://dl.dropboxusercontent.com/s/8oke8b9sz8lvo57/dtcinventory.csv').then(response => response.text()),
    fetch('https://dl.dropboxusercontent.com/s/qy1r1of8z1pf5iu/dtcdealers.csv').then(response => response.text())
  ])
  .then(([csvInventoryData, csvDealerData]) => {
    const dealerMap = createDealerMap(Papa.parse(csvDealerData, {header: true, skipEmptyLines: true, dynamicTyping: true}).data);
    const parsedInventoryData = Papa.parse(csvInventoryData, {header: true, skipEmptyLines: true, dynamicTyping: true});

displayInventoryPage(parsedInventoryData.data, dealerMap, currentPage);
setupPagination(parsedInventoryData.data, dealerMap);
})
.catch(error => console.error('Error fetching CSV:', error));
});
