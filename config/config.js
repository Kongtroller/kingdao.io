// /config\config.js

const config = {
  // REQUIRED
  appName: "KingDAO.io",
  // Short description for SEO tags
  appDescription: "KingDAO Hub",
  // Domain (no https://, no trailing slash)
  domainName: "kingdao.io",

  // Project-specific settings
  title: "KingDAO Hub",
  description: "Web3 dashboard for Kong NFT holders",

  NFTcontract: '0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328',
  
  website: "https://kingdao.io",
  openSea: "https://opensea.io/collection/konginvestment",
  openSeaAssetLink: "",
  x: "https://x.com/KongsDAO",
  discord: "https://discord.gg/FWKbnY5Bc6",
  whitelistCSV: "",

  exploreLinks: [
    {
      label: "DAO Voting",
      href: "https://snapshot.org/#/kongsdao.eth"
    },
    {
      label: "Contract",
      href: "https://etherscan.io/address/0x6e3a2e08a88186f41ecd90e0683d9ca0983a4328"
    },
    {
      label: "Polygon Gnosis Safe",
      href: "https://polygonscan.com/address/0x6df15Bf2aa8C57C6eb4A5C4Faaf53FA8795C59a0"
    },
    {
      label: "Ethereum Gnosis Safe",
      href: "https://etherscan.io/address/0xde27cbE0DdfaDF1C8C27fC8e43f7e713DD1B23cF"
    },
    {
      label: "Whitepaper",
      href: "https://docs.google.com/document/d/17md5LfWQX7TeMTQke43fVjAlztr3lyBiSP_gFdCxnt8/edit?usp=sharing"
    }
  ],

  email: {
    supportEmail: "contact@kingdao.io",
    // Forward replies to support email here
    forwardRepliesTo: "contact@kingdao.io",
  },
};

export default config;
