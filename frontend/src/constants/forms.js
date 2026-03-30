export const initialRegisterForm = {
  username: "",
  email: "",
  password: "",
  fullName: "",
  phoneNumber: "",
  gender: "OTHER",
  occupation: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  dateOfBirth: ""
};

export const initialLoginForm = {
  username: "",
  password: ""
};

export const initialAccountForm = {
  accountType: "SAVINGS",
  openingBalance: "1000.00"
};

export const initialTransferForm = {
  fromAccountId: "",
  beneficiaryId: "",
  amount: "100.00",
  currency: "USD",
  remarks: "",
  channel: "WEB"
};

export const initialBeneficiaryForm = {
  nickname: "",
  bankName: "Internal Bank",
  accountNumber: ""
};

export const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" }
];

export const accountTypeOptions = [
  { value: "SAVINGS", label: "Savings" },
  { value: "CURRENT", label: "Current" }
];

export const kycStatusOptions = [
  { value: "VERIFIED", label: "Verify" },
  { value: "PENDING", label: "Mark pending" },
  { value: "REJECTED", label: "Reject" }
];
