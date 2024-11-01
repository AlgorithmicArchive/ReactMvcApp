// formvalidations.js

// Validation functions

export function notEmpty(field, value) {
  if (value === "") {
    return "This field is required.";
  }
  return true;
}

export function onlyAlphabets(field, value) {
  if (!/^[A-Za-z .']+$/.test(value)) {
    return "Please use letters (a-z, A-Z) and special characters (. and ') only.";
  }
  return true;
}

export function onlyDigits(field, value) {
  if (!/^\d+$/.test(value)) {
    return "Please enter only digits.";
  }
  return true;
}

export function specificLength(field, value) {
  if (value.length !== field.maxLength) {
    return `This must be exactly ${field.maxLength} characters long.`;
  }
  return true;
}

export function isAgeGreaterThan(field, value) {
  const currentDate = new Date();
  const compareDate = new Date(
    currentDate.getFullYear() - field.maxLength,
    currentDate.getMonth(),
    currentDate.getDate()
  );
  const inputDate = new Date(value);

  if (inputDate > compareDate) {
    return `Age should be greater than ${field.maxLength}.`;
  }
  return true;
}

export function isEmailValid(field, value) {
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
    return "Invalid Email Address.";
  }
  return true;
}

export function isDateWithinRange(field, value) {
  const dateOfMarriage = new Date(value);
  const currentDate = new Date();

  const minDate = new Date(currentDate);
  minDate.setMonth(currentDate.getMonth() + parseInt(field.minLength));

  const maxDate = new Date(currentDate);
  maxDate.setMonth(currentDate.getMonth() + parseInt(field.maxLength));

  if (dateOfMarriage < minDate || dateOfMarriage > maxDate) {
    return `The date should be between ${field.minLength} to ${field.maxLength} months from current date.`;
  }
  return true;
}

export async function duplicateAccountNumber(field, value) {
  try {
    const res = await fetch(`/Base/IsDuplicateAccNo?accNo=${value}&applicationId=${field.applicationId}`);
    const data = await res.json();
    if (data.status) {
      return "Application with this account number already exists.";
    }
    return true;
  } catch (error) {
    console.error("Error in duplicateAccountNumber:", error);
    return "Validation failed due to a server error.";
  }
}

export async function validateFile(field, value) {
  try {
    const formData = new FormData();

    if (field.accept.includes(".jpg")) formData.append("fileType", "image");
    else if (field.accept.includes(".pdf")) formData.append("fileType", "pdf");

    formData.append("file", value);

    const res = await fetch("/Base/Validate", { method: "POST", body: formData });
    const data = await res.json();
    if (!data.isValid) {
      return data.errorMessage;
    }
    return true;
  } catch (error) {
    console.error("Error in validateFile:", error);
    return "File validation failed due to a server error.";
  }
}

// Transformation Function

export function CapitalizeAlphabets(field, value) {
  return value.toUpperCase();
}

export const runValidations = async (field, value) => {
  console.log(field,value);
  if (!Array.isArray(field.validationFunctions)) return true;

  for (const validationFn of field.validationFunctions) {
    console.log(validationFn);
    const fun = validationFunctionsList[validationFn];
    if (typeof fun !== "function") continue;

    try {
      const error = await fun(field, value || "");
      if (error !== true) return error;
    } catch (err) {
      return "Validation failed due to an unexpected error.";
    }
  }

  return true;
};

// Mapping of Validation Functions

export const validationFunctionsList = {
  notEmpty,
  onlyAlphabets,
  onlyDigits,
  specificLength,
  isAgeGreaterThan,
  isEmailValid,
  isDateWithinRange,
  duplicateAccountNumber,
  validateFile,
};
