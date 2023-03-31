function fetchDealerData() {
  return fetch('https://drive.google.com/file/d/1JqDNyIr6WLmqKCPagBNPrF6GT7eoPCpk/export?format=csv')
    .then(response => response.text())
    .then(csvData => {
      const parsedData = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
      });
      return parsedData.data;
    });
}

function createDealerMap(dealerData) {
  const dealerMap = new Map();
  dealerData.forEach(dealer => dealerMap.set(dealer.DealerID, dealer));
  return dealerMap;
}

function displayInventory(data, dealerMap) {
  const inventoryContainer = document.getElementById('inventory-container');
  const inventoryItemTemplate = document.getElementById('inventory-item');

  data.forEach(row => {
    const dealer = dealerMap.get(row.DealerID);
    if (dealer) {
      const inventoryItem = inventoryItemTemplate.content.cloneNode(true);
      inventoryItem.querySelector('.inventory-image').src = `http://img.leaddelivery.net/images/${row.VIN}/Main/1.jpg?s=YOUR_SELLER_ID`;
      inventoryItem.querySelector('.inventory-title').textContent = `${row.Year} ${row.Make} ${row.Model}`;
      inventoryItem.querySelector('.inventory-mileage').textContent = `Mileage: ${row.Mileage}`;
      inventoryItem.querySelector('.inventory-dealer').textContent = `Dealer: ${dealer.Name}`;
      inventoryItem.querySelector('.inventory-detail').addEventListener('click', () => {
        // Implement the logic to display the vehicle detail page
      });

      inventoryContainer.appendChild(inventoryItem);
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  Promise.all([
    fetch('https://drive.google.com/file/d/1UCcOQfsuiu5OJWjiN7i1Z59CzHlwATum/export?format=csv').then(response => response.text()),
    fetchDealerData()
  ])
    .then(([csvInventoryData, dealerData]) => {
      const dealerMap = createDealerMap(dealerData);
      const parsedInventoryData = Papa.parse(csvInventoryData, {header: true, skipEmptyLines: true, dynamicTyping: true});
      displayInventory(parsedInventoryData.data, dealerMap);
    })
    .catch(error => console.error('Error fetching CSV:', error));
});
