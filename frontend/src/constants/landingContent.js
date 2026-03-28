export const landingImages = {
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD83T77Ac71QNmp0COJvFwcjDpjOf7HqJWII5nO_uqep4SuI5OUkHklv05svMmYhMXXYyzu4tklWVGnOVKJJ6ORnkmvyu8VHFrgvBs20Nq4HHsblnAlSEbx_37nSb2T5Z266N5w39iPKubSppZZYUz0XgoqOpLhVBAs4BpdhRaNqGFgNCCcxaWHjLHmnf_DNrCE0B7sDxXpC8WS2gFO5Sk4P-Lubpw1Bdk_mjVON1ZIvVMhYwLL4-lampTLaGXPz4rjf2Yc-lAdo0kO",
  heroPhone:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBiwYciTKRjys1Jayx8mczmCHbA5za9GNx02fMArrVKNIMoatI2dP70Vg_BB6V8E-FDDd6cC2_enk8jpRBV_ulwhCesP1onapIPwl3IT9UcWfg-64vimg1LabH_s9X3oiso7kNn6G7BlLB1EHuwp62iLuDSTSYgSsQhBxQY6sIIwNFSeNaToP8oTyEgfQcCekFFygaGiYNOPKvj5cRxUoIXgggPytn6DMRCMrWW0nsxR5ELaoEqNxL04RPglvghTTIwuYz_gkp9e4m1",
  integrityBuilding:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBYQwlKbbRvBBtUQEo1kFsG9lp4vwJ3NHj_vWxmi8B1e7L_m5lfM7wYFSiwNMtVsWPdAuEhNv1Rw0V1nPiDFA7QIjyEMiSTDDHqq8PAM7LUs0twDtvWaxDQ4mn9rOSh5BN3ctip91tgK1BfRxJhmFxT1v130oMSkJWSkjp13awh_CcFtGkPq4Yj4Ot7LGHMXW5TyFaBFfGEQ_yVO1Ot9xYI53qeTJUUFLTQaoQlcb_Xg_CjfigIPmzBVIf2glFocmc0J-uqnN18zEon",
  premiumCard:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCgvVGFWqhe4_ycA0Rzp8UCZoSqRr-67NTifKioigFLhY6XO_VVn8Sj-D_-3q_v6VAc4bTWl93J8zhQwIDZkFTJyGCGqrM1SuteZ6UgAB2E2MVpbGGgTC3jGC6PTTi_BUWs9HxY8YneLO4nKLta9BjNKe8cNqg2alkIF1SS4zCg_vlvs8OV5YH1Mx-PQ9QzK_Pey21ppsJDddCAJEgbhgFQTzk8xjg-I0ccdDPKY2pCJ9VCFMaI3mTIorMmBC7lJ0Y76t_eOAjrxIcn"
};

export const landingNavItems = ["Dashboard", "Accounts", "Transfers", "Investments"];

export const landingFeatureCards = [
  {
    id: "secure-assets",
    variant: "wide",
    title: "Secure Assets",
    description:
      "Multi-layer encryption and cold-storage protocols designed by industry experts to keep your capital unreachable by unauthorized entities.",
    tags: ["Biometric Lock", "256-bit Encryption"]
  },
  {
    id: "quick-transfers",
    variant: "dark",
    title: "Quick Transfers",
    description:
      "Execute global transactions in seconds. Our liquid rail system ensures your money moves at the speed of your intent."
  },
  {
    id: "smart-analytics",
    variant: "standard",
    title: "Smart Analytics",
    description:
      "Real-time portfolio monitoring with AI-driven insights that forecast trends and optimize your savings yield automatically."
  },
  {
    id: "institutional-integrity",
    variant: "split",
    title: "Institutional Integrity",
    description:
      "We operate with the transparency of an open ledger and the discretion of a private Swiss bank. Every action is logged and verifiable by you.",
    image: landingImages.integrityBuilding
  }
];

export const landingSteps = [
  {
    id: "register",
    number: "1",
    title: "Register",
    description: "Create your secure vault account in under 2 minutes with basic information."
  },
  {
    id: "kyc",
    number: "2",
    title: "KYC Verification",
    description:
      "Our automated biometric verification system confirms your identity in real-time."
  },
  {
    id: "start-banking",
    number: "3",
    title: "Start Banking",
    description:
      "Deposit funds and start growing your assets with our proprietary tools.",
    highlighted: true
  }
];

export const landingFooterColumns = [
  {
    title: "Company",
    links: ["About Us", "Careers", "Press", "Security"]
  },
  {
    title: "Product",
    links: ["Personal Accounts", "Business Suite", "Investments", "Credit"]
  },
  {
    title: "Support",
    links: ["Help Center", "Contact Us", "Status"]
  }
];

export const landingFooterPolicies = ["Privacy Policy", "Terms of Service", "Cookie Settings"];
