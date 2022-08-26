let openRequest = indexedDB.open("myDatabase");
let db;

openRequest.addEventListener("success", function () {
  db = openRequest.result;
  console.log("Succesfully Connected");
});

openRequest.addEventListener("upgradeneeded", function () {
  // triggers if the client had no database
  // ...perform initialization...
  console.log("db upgraded OR initalisation in db ");
  db = openRequest.result;

  db.createObjectStore("video", { keyPath: "id" });
  db.createObjectStore("image", { keyPath: "id" });
});

openRequest.onerror = () => {
  console.log("Error", openRequest.error);
};
