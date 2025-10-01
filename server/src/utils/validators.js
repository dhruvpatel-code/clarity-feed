//Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

//Password validation (min 8 chars, at least 1 letter and 1 number)
function isValidPassword(password) {
  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number",
    };
  }

  return { valid: true };
}

//Sanitize user input 
function sanitizeInput(input){
    if (typeof input != 'string') return input;
    return input.trim();
}

module.exports = {
  isValidEmail,
  isValidPassword,
  sanitizeInput
};
