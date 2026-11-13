// One number for calls and WhatsApp (confirmed by Global TVS).
export const PHONE = '+917619375566'
export const PHONE_DISPLAY = '+91 7619 37 5566'

// WhatsApp chat link with a message already typed in
export const wa = (text) => `https://wa.me/${PHONE.replace('+', '')}?text=${encodeURIComponent(text)}`
