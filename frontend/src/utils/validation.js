function hasValue(value) {
  return String(value || "").trim().length > 0;
}

function isPositiveAmount(value) {
  return Number(value) > 0;
}

export function validateLogin(values) {
  const errors = {};

  if (!hasValue(values.username)) {
    errors.username = "Username is required.";
  }

  if (!hasValue(values.password)) {
    errors.password = "Password is required.";
  }

  return errors;
}

export function validateRegistration(values) {
  const errors = {};

  if (!hasValue(values.fullName)) {
    errors.fullName = "Full name is required.";
  }

  if (!hasValue(values.username)) {
    errors.username = "Username is required.";
  }

  if (!hasValue(values.email)) {
    errors.email = "Email is required.";
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!hasValue(values.password)) {
    errors.password = "Password is required.";
  } else if (String(values.password).length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!hasValue(values.phoneNumber)) {
    errors.phoneNumber = "Phone number is required.";
  }

  if (!hasValue(values.occupation)) {
    errors.occupation = "Occupation is required.";
  }

  if (!hasValue(values.addressLine1)) {
    errors.addressLine1 = "Address line 1 is required.";
  }

  if (!hasValue(values.city)) {
    errors.city = "City is required.";
  }

  if (!hasValue(values.state)) {
    errors.state = "State is required.";
  }

  if (!hasValue(values.postalCode)) {
    errors.postalCode = "Postal code is required.";
  }

  if (!hasValue(values.country)) {
    errors.country = "Country is required.";
  }

  if (!hasValue(values.dateOfBirth)) {
    errors.dateOfBirth = "Date of birth is required.";
  } else if (new Date(values.dateOfBirth) >= new Date()) {
    errors.dateOfBirth = "Date of birth must be in the past.";
  }

  return errors;
}

export function validateAccount(values) {
  const errors = {};

  if (!hasValue(values.accountType)) {
    errors.accountType = "Account type is required.";
  }

  if (!isPositiveAmount(values.openingBalance)) {
    errors.openingBalance = "Opening balance must be greater than zero.";
  }

  return errors;
}

export function validateBalance(values) {
  const errors = {};

  if (!hasValue(values.accountNumber)) {
    errors.accountNumber = "Select an account.";
  }

  if (!isPositiveAmount(values.amount)) {
    errors.amount = "Amount must be greater than zero.";
  }

  return errors;
}

export function validateTransfer(values) {
  const errors = {};

  if (!hasValue(values.fromAccountId)) {
    errors.fromAccountId = "Select a source account.";
  }

  if (!hasValue(values.beneficiaryId)) {
    errors.beneficiaryId = "Select a beneficiary.";
  }

  if (!isPositiveAmount(values.amount)) {
    errors.amount = "Transfer amount must be greater than zero.";
  }

  if (!hasValue(values.currency)) {
    errors.currency = "Currency is required.";
  }

  if (!hasValue(values.remarks)) {
    errors.remarks = "Please provide transfer remarks.";
  }

  return errors;
}

export function validateBeneficiary(values) {
  const errors = {};

  if (!hasValue(values.nickname)) {
    errors.nickname = "Nickname is required.";
  }

  if (!hasValue(values.bankName)) {
    errors.bankName = "Bank name is required.";
  }

  if (!hasValue(values.accountNumber)) {
    errors.accountNumber = "Account number is required.";
  }

  return errors;
}
