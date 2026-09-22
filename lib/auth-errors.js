"use strict";
/**
 * Maps Supabase auth errors to safe, user-friendly messages.
 * Never surfaces raw error details to the browser.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendlyAuthError = friendlyAuthError;
/** Rate limits include a retry hint; surface the exact time when possible. */
function rateLimitMessage(message) {
    var isoMatch = message.match(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/);
    if (isoMatch) {
        var retryAt = new Date(isoMatch[0]);
        if (!Number.isNaN(retryAt.getTime())) {
            var time = retryAt.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
            });
            return "Too many attempts. Please try again after ".concat(time, ".");
        }
    }
    var secondsMatch = message.match(/after (\d+) seconds?/i);
    if (secondsMatch) {
        return "Too many attempts. Please try again in ".concat(secondsMatch[1], " seconds.");
    }
    return "Too many attempts. Please wait a minute and try again.";
}
/** Message for the email-send quota specifically (verified live response:
 *  {"code":429,"error_code":"over_email_send_rate_limit","msg":"email rate limit exceeded"}).
 *  This quota is project-wide and hourly — "wait a minute" would be wrong. */
function emailSendLimitMessage() {
    return "Too many confirmation emails have been requested. Email sending is limited per hour, so please try again in up to an hour. If you already created an account, you can simply log in instead.";
}
function friendlyAuthError(code, message) {
    var m = message.toLowerCase();
    var c = code !== null && code !== void 0 ? code : "";
    // The email-send quota is a different, much longer window than generic
    // request throttling — give it its own accurate message.
    if (c === "over_email_send_rate_limit" || m.includes("email rate limit")) {
        return emailSendLimitMessage();
    }
    if (c === "over_request_rate_limit" || m.includes("rate limit")) {
        return rateLimitMessage(message);
    }
    if (m.includes("invalid login credentials") || c === "invalid_credentials") {
        return "Incorrect email or password.";
    }
    if (m.includes("email not confirmed") || c === "email_not_confirmed") {
        return "Please confirm your email first — check your inbox for the verification link.";
    }
    if (m.includes("already registered") || m.includes("already exists") || c === "user_already_exists") {
        return "An account with this email already exists. Try logging in instead.";
    }
    if (m.includes("valid email") || m.includes("invalid email")) {
        return "Enter a valid email address.";
    }
    return "Something went wrong. Please try again.";
}
