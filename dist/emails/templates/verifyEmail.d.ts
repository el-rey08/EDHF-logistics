interface VerifyEmailOTPProps {
    userName: string;
    appName: string;
    otpCode: string;
    expiryTime: string;
    supportEmail: string;
    currentYear: number;
}
export declare const verifyEmailOTPTemplate: ({ userName, appName, otpCode, expiryTime, supportEmail, currentYear, }: VerifyEmailOTPProps) => string;
export {};
