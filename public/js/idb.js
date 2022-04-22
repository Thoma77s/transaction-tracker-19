let db;
const request = indexedDB.open('transaction_record', 1);

request.onunpradedneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('new_record', { autoIncrement: true });
};


request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
     uploadRecord();
  }
};

request.onerror = function(event) {
  console.log(event.target.errorCode);
};


function saveRecord(record) {
  const transaction = db.transaction(['new_record'], 'readwrite');

  const transactionObjectStore = transaction.objectStore('new_record');

  transactionObjectStore.add(record);
};

function uploadRecord () {
  const transaction = db.transaction(['new_record'], 'readwrite');

  const transactionObjectStore = transaction.objectStore('new_record');

  const getAll = transactionObjectStore.getAll();

  getAll.onsuccess = function() {

    if (getAll.result.length > 0) {
      fetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(['new_record'], 'readwrite');

          const transactionObjectStore = transaction.objectStore('new_record');

          transactionObjectStore.clear();

          alert('All saved transactions have been submitted');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', uploadRecord);