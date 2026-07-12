export const WHATSAPP_NUMBER = '2348101694302';
export const CONTACT_EMAIL = 'akpotohwoo@gmail.com';
export const waLink = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
export const WA_DEFAULT = waLink(
  "Hi Neku, I found your website. I'd like to talk about a project."
);

// GoatCounter code and Web3Forms access key are publishable by design (not
// secrets), so they're hard-coded here rather than in env/Sanity.
// GOATCOUNTER_CODE assumes the owner creates the free site at
// goatcounter.com with this exact code (PLAN.md Phase 8); until then the
// script 404s silently and no analytics are recorded.
export const GOATCOUNTER_CODE = 'nekumartins';

// [OWNER TODO] Replace with the real Web3Forms access key from
// https://web3forms.com — the form will not deliver submissions until
// this is a real key.
export const WEB3FORMS_ACCESS_KEY = 'REPLACE_WITH_WEB3FORMS_ACCESS_KEY';
