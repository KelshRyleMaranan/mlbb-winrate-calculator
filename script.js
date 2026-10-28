// Grab the form from the page
const form = document.getElementById("calc-form");

// Stop the page from reloading when the form is submitted
form.addEventListener("submit", function (event) {
  event.preventDefault();
  console.log("Calculate clicked! Logic coming in the next commit.");
});