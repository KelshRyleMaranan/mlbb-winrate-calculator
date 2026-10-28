// Grab the form and result box from the page
const form = document.getElementById("calc-form");
const result = document.getElementById("result");

// Work out how many wins in a row are needed
function calculateWinsNeeded(total, currentRate, targetRate) {
  // Turn percentages into decimals (52.5 becomes 0.525)
  const current = currentRate / 100;
  const target = targetRate / 100;

  const currentWins = total * current;
  const winsNeeded = (target * total - currentWins) / (1 - target);

  // Round tiny decimal errors away first, then round up
  return Math.ceil(Number(winsNeeded.toFixed(6)));
}

// Check the inputs. Returns an error message, or "" if everything is fine
function validateInputs(totalText, currentText, targetText) {
  // Empty fields
  if (totalText.trim() === "" || currentText.trim() === "" || targetText.trim() === "") {
    return "Please fill in all three fields.";
  }

  const total = parseFloat(totalText);
  const currentRate = parseFloat(currentText);
  const targetRate = parseFloat(targetText);

  // Not a number
  if (isNaN(total) || isNaN(currentRate) || isNaN(targetRate)) {
    return "Please enter numbers only.";
  }

  // Negative numbers
  if (total < 0 || currentRate < 0 || targetRate < 0) {
    return "Numbers can't be negative.";
  }

  // Total matches must be a whole number above 0
  if (total === 0 || !Number.isInteger(total)) {
    return "Total matches must be a whole number greater than 0.";
  }

  // Rates above 100
  if (currentRate > 100 || targetRate > 100) {
    return "Win rates can't be higher than 100%.";
  }

  // Target of 100%
  if (targetRate === 100) {
    return "A 100% win rate isn't reachable if you've ever lost a match. Try 99% or lower.";
  }

  // Target must be higher than current
  if (targetRate <= currentRate) {
    return "Your target must be higher than your current win rate (" + currentRate + "%).";
  }

  return "";
}

// Show an error message in the result box
function showError(message) {
  result.textContent = message;
  result.className = "result error";
}

// Show the full result with the big number and extra stats
function showResult(total, currentRate, targetRate, wins) {
  // Wins you already have (rounded to a whole match)
  const currentWins = Math.round((total * currentRate) / 100);
  const currentLosses = total - currentWins;

  // Everything after the streak
  const newTotal = total + wins;
  const newWins = currentWins + wins;
  const newRate = ((total * currentRate) / 100 + wins) / newTotal * 100;

  const winWord = wins === 1 ? "win" : "wins";

  result.className = "result success";
  result.innerHTML =
    '<p class="result-label">You need</p>' +
    '<p class="result-big">' + wins.toLocaleString() + " " + winWord + " in a row</p>" +
    '<p class="result-sub">to reach ' + targetRate + "% win rate</p>" +
    '<ul class="stats">' +
      "<li><span>Matches after streak</span><strong>" + newTotal.toLocaleString() + "</strong></li>" +
      "<li><span>Final record</span><strong>" + newWins.toLocaleString() + "W - " + currentLosses.toLocaleString() + "L</strong></li>" +
      "<li><span>New win rate</span><strong>" + newRate.toFixed(2) + "%</strong></li>" +
    "</ul>";
}

form.addEventListener("submit", function (event) {
  // Stop the page from reloading
  event.preventDefault();

  // Read the raw text from the three inputs
  const totalText = document.getElementById("total-matches").value;
  const currentText = document.getElementById("current-rate").value;
  const targetText = document.getElementById("target-rate").value;

  // Validate first
  const error = validateInputs(totalText, currentText, targetText);
  if (error !== "") {
    showError(error);
    return;
  }

  // All good, so calculate
  const total = parseFloat(totalText);
  const currentRate = parseFloat(currentText);
  const targetRate = parseFloat(targetText);
  const wins = calculateWinsNeeded(total, currentRate, targetRate);

  showResult(total, currentRate, targetRate, wins);
});