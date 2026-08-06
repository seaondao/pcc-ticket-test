const ticketForm = document.getElementById("ticketForm");

// ================================================================
// This is the ONE function you'll need to change later, once a
// real backend/database is decided. Everything else can stay
// exactly the same - it just calls this function and doesn't
// care HOW or WHERE the data actually gets saved.
// ================================================================
function saveSubmission(newSubmission) {
  const saved = localStorage.getItem("submissions");
  const allSubmissions = saved ? JSON.parse(saved) : [];

  allSubmissions.push(newSubmission);
  localStorage.setItem("submissions", JSON.stringify(allSubmissions));
}

// Also needed by generateTicketNumber() below, to check which
// numbers are already used - so it reads the same way for now.
function getAllSubmissions() {
  const saved = localStorage.getItem("submissions");
  return saved ? JSON.parse(saved) : [];
}

function generateUniqueNumber(existingNumbers) {
  let num;
  do {
    num = Math.floor(100000 + Math.random() * 900000);
  } while (existingNumbers.includes(num));

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

ticketForm.addEventListener("submit", function (e) {
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

  // 3. Make a random 6-digit number that isn't already used
  const allSubmissions = getAllSubmissions();
  const existingNumbers = allSubmissions.map(sub => sub.ticketNumber);
  const ticketNumber = generateUniqueNumber(existingNumbers);

  // 4. Put it all together as one object
  const newSubmission = {
    ticketNumber: ticketNumber,
    firstName: firstName,
    lastName: lastName,
    email: email,
    agreedToPromo: document.getElementById("agreePromo").checked
  };

  // 5. Save it (today: localStorage. later: maybe a real backend)
  saveSubmission(newSubmission);

  // 6. Show the number on screen
  document.getElementById("ticketNumber").textContent = ticketNumber;
  document.getElementById("formCard").style.display = "none";
  document.getElementById("successCard").style.display = "block";

});