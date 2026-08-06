const ticketForm = document.getElementById("ticketForm");

// ================================================================
// PASTE YOUR SUPABASE PROJECT URL AND ANON KEY HERE
// (both found in Project Settings > API)
// ================================================================
const SUPABASE_URL = "https://gvxbvtgerbbckzwslouz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2eGJ2dGdlcmJiY2t6d3Nsb3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NzQyMDUsImV4cCI6MjEwMTU1MDIwNX0.69dnoHSwbGWN7RcHjDmefOo7EyDaUCX2ZvuQtAd0mTM";

// Supabase's REST API needs these two headers on every request, so
// we keep them in one place instead of repeating them everywhere.
const SUPABASE_HEADERS = {
  "apikey": SUPABASE_KEY,
  "Authorization": "Bearer " + SUPABASE_KEY,
  "Content-Type": "application/json"
};

// ----------------------------------------------------------------
// Asks the database for the next ticket number. This calls a
// Postgres SEQUENCE on the backend (via an RPC function), which
// guarantees no two people ever get the same number - even if they
// submit at the exact same moment. The database handles that safely;
// we don't have to (and shouldn't try to) calculate it ourselves.
// ----------------------------------------------------------------
async function getNextTicketNumber() {
  const response = await fetch(
    SUPABASE_URL + "/rest/v1/rpc/get_next_ticket_number",
    {
      method: "POST",
      headers: SUPABASE_HEADERS,
      body: JSON.stringify({})
    }
  );

  if (!response.ok) {
    throw new Error("Could not reach the backend.");
  }

  return response.json(); // returns the next number, e.g. 43
}

// ----------------------------------------------------------------
// Inserts one new row into the "submissions" table.
// ----------------------------------------------------------------
async function saveSubmission(newSubmission) {
  const response = await fetch(SUPABASE_URL + "/rest/v1/submissions", {
    method: "POST",
    headers: SUPABASE_HEADERS,
    body: JSON.stringify({
      ticket_number: String(newSubmission.ticketNumber),
      first_name: newSubmission.firstName,
      last_name: newSubmission.lastName,
      email: newSubmission.email,
      agreed_to_promo: newSubmission.agreedToPromo
    })
  });

  if (!response.ok) {
    throw new Error("Backend returned an error: " + response.status);
  }
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

  const submitBtn = document.getElementById("submitBtn");
  const submitBtnText = document.getElementById("submitBtnText");

  submitBtn.disabled = true;
  submitBtn.classList.add("loading");
  submitBtnText.textContent = "Getting your number...";

  try {
    // 3. Ask the database for the next number (atomic - no duplicates
    //    possible even with simultaneous submissions)
    const ticketNumber = await getNextTicketNumber();

    // 4. Put it all together as one object
    const newSubmission = {
      ticketNumber: ticketNumber,
      firstName: firstName,
      lastName: lastName,
      email: email,
      agreedToPromo: document.getElementById("agreePromo").checked
    };

    // 5. Save it to Supabase
    await saveSubmission(newSubmission);

    // 6. Show the number on screen
    document.getElementById("ticketNumber").textContent = ticketNumber;
    document.getElementById("confirmName").textContent = firstName + " " + lastName;
    document.getElementById("confirmEmail2").textContent = email;
    document.getElementById("formCard").style.display = "none";
    document.getElementById("successCard").style.display = "block";

  } catch (err) {
    showError("Something went wrong saving your info. Please try again.");
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
    submitBtnText.textContent = "Get My Number";
  }

});

document.getElementById("againBtn").addEventListener("click", function () {
  ticketForm.reset();

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = false;
  submitBtn.classList.remove("loading");
  document.getElementById("submitBtnText").textContent = "Get My Number";

  document.getElementById("successCard").style.display = "none";
  document.getElementById("formCard").style.display = "block";
});