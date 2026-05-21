export function validateRequiredFields(values, fields) {
  const errors = {};

  fields.forEach((field) => {
    if (!String(values[field] || "").trim()) {
      errors[field] = "This field is required.";
    }
  });

  return errors;
}

export function isValidEmail(email = "") {
  return /\S+@\S+\.\S+/.test(email);
}

export function isValidPhone(phone = "") {
  return /^[0-9]{10}$/.test(phone.replace(/\D/g, ""));
}
