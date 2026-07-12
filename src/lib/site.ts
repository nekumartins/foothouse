export const WHATSAPP_NUMBER = '2348101694302';
export const CONTACT_EMAIL = 'akpotohwoo@gmail.com';
export const waLink = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
export const WA_DEFAULT = waLink(
  "Hi Neku, I found your website. I'd like to talk about a project."
);
