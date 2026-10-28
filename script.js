// Grab things from the page
const form = document.getElementById("calc-form");
const result = document.getElementById("result");
const modeWinsBtn = document.getElementById("mode-wins");
const modeLossesBtn = document.getElementById("mode-losses");
const fieldTarget = document.getElementById("field-target");
const fieldMin = document.getElementById("field-min");
const subtitle = document.querySelector(".subtitle");

// Which mode we are in: "wins" or "losses"
let mode = "wins";

// ---------- Math ----------

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

// Work out how many losses in a row you can take and still stay at or above the minimum
function calculateLossesAllowed(total, currentRate, minRate) {
  const currentWins = (total * currentRate) / 100;
  const min = minRate / 100;

  // Wins stay the same, so we need: currentWins / (total + losses) >= min
  const losses = currentWins / min - total;

  // Round tiny decimal errors away first, then round down
  return Math.floor(Number(losses.toFixed(6)));
}

// ---------- Validation ----------

// Checks that apply to both modes. Returns an error message, or "" if fine
function validateBasics(totalText, currentText, otherText) {
  // Empty fields
  if (totalText.trim() === "" || currentText.trim() === "" || otherText.trim() === "") {
    return "Please fill in all three fields.";
  }

  const total = parseFloat(totalText);
  const currentRate = parseFloat(currentText);
  const otherRate = parseFloat(otherText);

  // Not a number
  if (isNaN(total) || isNaN(currentRate) || isNaN(otherRate)) {
    return "Please enter numbers only.";
  }

  // Negative numbers
  if (total < 0 || currentRate < 0 || otherRate < 0) {
    return "Numbers can't be negative.";
  }

  // Total matches must be a whole number above 0
  if (total === 0 || !Number.isInteger(total)) {
    return "Total matches must be a whole number greater than 0.";
  }

  // Rates above 100
  if (currentRate > 100 || otherRate > 100) {
    return "Win rates can't be higher than 100%.";
  }

  return "";
}

// Wins mode checks
function validateWinsInputs(totalText, currentText, targetText) {
  const basicError = validateBasics(totalText, currentText, targetText);
  if (basicError !== "") {
    return basicError;
  }

  const currentRate = parseFloat(currentText);
  const targetRate = parseFloat(targetText);

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

// Losses mode checks
function validateLossesInputs(totalText, currentText, minText) {
  const basicError = validateBasics(totalText, currentText, minText);
  if (basicError !== "") {
    return basicError;
  }

  const currentRate = parseFloat(currentText);
  const minRate = parseFloat(minText);

  // A minimum of 0% means you could lose forever
  if (minRate === 0) {
    return "Your lowest win rate must be greater than 0%.";
  }

  // Minimum must be lower than current
  if (minRate >= currentRate) {
    return "Your lowest win rate must be lower than your current win rate (" + currentRate + "%).";
  }

  return "";
}

// ---------- Showing results ----------

// Show an error message in the result box
function showError(message) {
  result.textContent = message;
  result.className = "result error";
}

// Show the wins needed result with the big number and extra stats
function showWinsResult(total, currentRate, targetRate, wins) {
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

// Show the losses allowed result with the big number and extra stats
function showLossesResult(total, currentRate, minRate, losses) {
  // Wins you already have (rounded to a whole match)
  const currentWins = Math.round((total * currentRate) / 100);
  const currentLosses = total - currentWins;

  // Everything after the losses
  const newTotal = total + losses;
  const newLosses = currentLosses + losses;
  const newRate = ((total * currentRate) / 100) / newTotal * 100;

  const lossWord = losses === 1 ? "loss" : "losses";

  result.className = "result success";
  result.innerHTML =
    '<p class="result-label">You can afford</p>' +
    '<p class="result-big">' + losses.toLocaleString() + " " + lossWord + " in a row</p>" +
    '<p class="result-sub">and still stay at ' + minRate + "% or higher</p>" +
    '<ul class="stats">' +
      "<li><span>Matches after losses</span><strong>" + newTotal.toLocaleString() + "</strong></li>" +
      "<li><span>Final record</span><strong>" + currentWins.toLocaleString() + "W - " + newLosses.toLocaleString() + "L</strong></li>" +
      "<li><span>New win rate</span><strong>" + newRate.toFixed(2) + "%</strong></li>" +
    "</ul>";
}

// ---------- Mode toggle ----------

function setMode(newMode) {
  mode = newMode;
  const isWins = mode === "wins";

  // Highlight the active button
  modeWinsBtn.classList.toggle("active", isWins);
  modeLossesBtn.classList.toggle("active", !isWins);
  modeWinsBtn.setAttribute("aria-pressed", isWins);
  modeLossesBtn.setAttribute("aria-pressed", !isWins);

  // Show the right third field
  fieldTarget.hidden = !isWins;
  fieldMin.hidden = isWins;

  // Update the subtitle
  subtitle.textContent = isWins
    ? "See how many wins in a row you need to reach your target win rate."
    : "See how many losses in a row you can take before your win rate drops too low.";

  // Clear the old result
  result.textContent = "";
  result.className = "result";
}

modeWinsBtn.addEventListener("click", function () {
  setMode("wins");
});

modeLossesBtn.addEventListener("click", function () {
  setMode("losses");
});

// ---------- Form ----------

form.addEventListener("submit", function (event) {
  // Stop the page from reloading
  event.preventDefault();

  // Read the raw text from the inputs
  const totalText = document.getElementById("total-matches").value;
  const currentText = document.getElementById("current-rate").value;

  if (mode === "wins") {
    const targetText = document.getElementById("target-rate").value;

    const error = validateWinsInputs(totalText, currentText, targetText);
    if (error !== "") {
      showError(error);
      return;
    }

    const total = parseFloat(totalText);
    const currentRate = parseFloat(currentText);
    const targetRate = parseFloat(targetText);
    const wins = calculateWinsNeeded(total, currentRate, targetRate);

    showWinsResult(total, currentRate, targetRate, wins);
  } else {
    const minText = document.getElementById("min-rate").value;

    const error = validateLossesInputs(totalText, currentText, minText);
    if (error !== "") {
      showError(error);
      return;
    }

    const total = parseFloat(totalText);
    const currentRate = parseFloat(currentText);
    const minRate = parseFloat(minText);
    const losses = calculateLossesAllowed(total, currentRate, minRate);

    showLossesResult(total, currentRate, minRate, losses);
  }
});