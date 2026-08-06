const ticketForm = document.getElementById("ticketForm");

// ================================================================
// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
// (the one you got after "Deploy > New deployment > Web app")
// ================================================================
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbyuzFx_u2cHxcrJDgMrGEjjE2c-bZZXZ5NWUkyvnHTaiuHvPOvF1z6MxnixxPL083V0/exec";

// ----------------------------------------------------------------
// Fetches just the list of ticket numbers already used (as strings),
// by calling doGet() on the Apps Script backend.
// ----------------------------------------------------------------
async function getExistingNumbers() {
  const response = await fetch(BACKEND_URL);
  return response.json();
}

// ----------------------------------------------------------------
// Sends one new submission to the Apps Script backend, which appends
// it as a new row in the Google Sheet (calls doPost() over there).
//
// Note: Content-Type is "text/plain" on purpose, NOT "application/json".
// Apps Script Web Apps don't handle the CORS "preflight" request that
// browsers send before a real application/json POST, so this is the
// standard workaround - the server still reads it as JSON either way.
// ----------------------------------------------------------------
async function saveSubmission(newSubmission) {
  await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(newSubmission)
  });
}

function generateUniqueNumber(existingNumbers) {
  let num;
  do {
    num = Math.floor(100000 + Math.random() * 900000);
  } while (existingNumbers.includes(String(num)));

  return num;
}

function showError(message) {
  const errorBox = document.getElementById("errorMsg");
  errorBox.textContent = message;
  errorBox.classList.add("show");
}

function clearError() {
  document.getElementById("errorMsg").classList.remove("show");
}

ticketForm.addEventListener("submit", async function (e) {
  e.preventDefault(); // stop the page from reloading

  // (by the time we get here, the browser has ALREADY checked every
  // "required" field is filled in, and that email/confirmEmail both
  // look like real email addresses - if not, it blocked submit and
  // showed its own message, and this code never runs)

  clearError();

  // 1. Read what the person typed in
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const confirmEmail = document.getElementById("confirmEmail").value;

  // 2. One thing the browser CAN'T check on its own: do the two
  //    email fields actually match each other?
  if (email.toLowerCase() !== confirmEmail.toLowerCase()) {
    showError("Emails don't match. Please check and try again.");
    return;
  }

  try {
    // 3. Ask the backend which numbers are already used, then
    //    generate one that isn't
    const existingNumbers = await getExistingNumbers();
    const ticketNumber = generateUniqueNumber(existingNumbers);

    // 4. Put it all together as one object
    const newSubmission = {
      ticketNumber: ticketNumber,
      firstName: firstName,
      lastName: lastName,
      email: email,
      agreedToPromo: document.getElementById("agreePromo").checked
    };

    // 5. Save it to the Google Sheet
    await saveSubmission(newSubmission);

    // 6. Show the number on screen
    document.getElementById("ticketNumber").textContent = ticketNumber;
    document.getElementById("formCard").style.display = "none";
    document.getElementById("successCard").style.display = "block";

  } catch (err) {
    showError("Something went wrong saving your info. Please try again.");
  }

});

document.getElementById("againBtn").addEventListener("click", function () {
  ticketForm.reset();
  document.getElementById("successCard").style.display = "none";
  document.getElementById("formCard").style.display = "block";
});