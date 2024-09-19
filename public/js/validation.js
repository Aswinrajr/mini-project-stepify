// public/js/validation.js

// Function to show toast notification
function showToast(message, type = "error") {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.classList.add(type); // Add error or success class based on the type

  toast.innerText = message;

  // Add toast to the document
  document.body.appendChild(toast);

  // Show the toast
  toast.classList.add("show");

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    document.body.removeChild(toast);
  }, 3000);
}

// Validation for form fields
function validateForm() {
  let valid = true;

  // Clear previous errors
  clearErrors();

  // Name validation (non-empty)
  const name = document.getElementById("name").value;
  if (name === "") {
    showToast("Name is required");
    valid = false;
  }

  // Mobile validation (exactly 10 digits)
  const mobile = document.getElementById("mobile").value;
  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(mobile)) {
    showToast("Mobile number must be 10 digits");
    valid = false;
  }

  // Email validation
  const email = document.getElementById("email").value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast("Invalid email format");
    valid = false;
  }

  // Password validation (at least 8 characters, including uppercase, lowercase, number, and symbol)
  const password = document.getElementById("password").value;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    showToast(
      "Password must be at least 8 characters, include uppercase, lowercase, number, and symbol"
    );
    valid = false;
  }

  return valid;
}

// Clear previous error messages
function clearErrors() {
  // Clear previous error toasts
  const toasts = document.querySelectorAll(".toast");
  toasts.forEach((toast) => document.body.removeChild(toast));
}

// Auto-remove message
function removeMessage() {
  const MessageElement = document.getElementById("message");
  if (MessageElement) {
    setTimeout(() => {
      MessageElement.style.display = "none";
    }, 2000);
  }
}

window.onload = removeMessage;
