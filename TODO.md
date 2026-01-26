# TODO: Fix Errors in companyModel.ts and companyController.ts

## companyModel.ts Fixes
- [x] Add missing comma after `role: "admin"` in the interface
- [x] Standardize interface punctuation (change semicolons to commas)
- [x] Add `timestamps: true` to the schema

## companyController.ts Fixes
- [x] Correct typo: `existingComapny` to `existingCompany`
- [x] Add missing `await` in `bcrypt.compare` in `companyLogIn`
- [x] Fix query in `verifyEmailOTP`: change `{ email }` to `{ companyEmail }`
- [x] Fix `updateProfile`: update field names to match model (`fullName` -> `companyName`, `address` -> `companyAddress`, `phoneNumber` -> `companyPhone`)
- [x] Standardize JWT token payload to use `companyId`
- [x] Fix typos in response messages (e.g., "regitration succesfull" -> "registration successful")
- [x] Ensure consistent support email addresses
- [x] Set OTP fields to `null` instead of `undefined!`
