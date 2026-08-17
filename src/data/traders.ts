export interface Trader {
  name: string;
  handle: string;
  wallet: string;
  avatar: string;
  pnl7d: number;
  pnl30d: number;
  trades: number;
  winrate: number;
}

const KOL_IMG = (file: string) => `https://kolexplorer.com/img/${file}`;

export const TRADERS: Trader[] = [
  { name: "Cented", handle: "flipski77", wallet: "CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o", avatar: KOL_IMG("Cented.jpg"), pnl7d: 218200, pnl30d: 821213, trades: 12921, winrate: 60.7 },
  { name: "Cupsey", handle: "Cupseyy", wallet: "2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f", avatar: KOL_IMG("Cupsey.jpg"), pnl7d: 72800, pnl30d: 432094, trades: 34916, winrate: 54.3 },
  { name: "Theo", handle: "theonomix", wallet: "Bi4rd5FH5bYEN8scZ7wevxNZyNmKHdaBcvewdPFxYdLt", avatar: KOL_IMG("theo-1769696283.jpg"), pnl7d: 63100, pnl30d: 434184, trades: 4627, winrate: 50.1 },
  { name: "decu", handle: "notdecu", wallet: "4vw54BmAogeRV3vPKWyFet5yf8DTLcREzdSzx4rw9Ud9", avatar: KOL_IMG("decu-1770170944.jpg"), pnl7d: 46200, pnl30d: 305392, trades: 3887, winrate: 62.8 },
  { name: "Tdmilky", handle: "tdmilky", wallet: "CEUA7zVoDRqRYoeHTP58UHU6TR8yvtVbeLrX1dppqoXJ", avatar: KOL_IMG("tdmilky-1770145150.jpg"), pnl7d: 38000, pnl30d: 133312, trades: 6171, winrate: 45.5 },
  { name: "Trunoest", handle: "trunoest", wallet: "ardinRsN1mNYVeoJWTBsWeYeXvuR9UUDGMsCDKpb6AT", avatar: KOL_IMG("trunoest.jpg"), pnl7d: 22100, pnl30d: 163556, trades: 1926, winrate: 59.8 },
  { name: "Limfork", handle: "limfork", wallet: "BQVz7fQ1WsQmSTMY3umdPEPPTm1sdcBcX9sP7o6kPRmB", avatar: KOL_IMG("limfork-1768329388.jpg"), pnl7d: 21100, pnl30d: 93298, trades: 10916, winrate: 43 },
  { name: "cap", handle: "cap100x", wallet: "CAPn1yH4oSywsxGU456jfgTrSSUidf9jgeAnHceNUJdw", avatar: KOL_IMG("cap-1768332038.webp"), pnl7d: 19300, pnl30d: 234523, trades: 13498, winrate: 41.1 },
  { name: "Jason", handle: "slidrrz", wallet: "ACTbvbNm5qTLuofNRPxFPMtHAAtdH1CtzhCZatYHy831", avatar: KOL_IMG("jason-1768332323.jpg"), pnl7d: 15800, pnl30d: 29820, trades: 21126, winrate: 38.7 },
  { name: "Milito", handle: "fnmilito", wallet: "EeXvxkcGqMDZeTaVeawzxm9mbzZwqDUMmfG3bF7uzumH", avatar: KOL_IMG("milito-1768580300.jpg"), pnl7d: 14200, pnl30d: 63871, trades: 18723, winrate: 36.8 },
  { name: "Log", handle: "Log100x", wallet: "2pUUZYtokRgDV2YzL6M5pjb1jyoHE367yU1sdQ7ac3ea", avatar: KOL_IMG("Log.jpg"), pnl7d: 13800, pnl30d: 33478, trades: 4194, winrate: 37.3 },
  { name: "Radiance", handle: "radiancebrr", wallet: "FAicXNV5FVqtfbpn4Zccs71XcfGeyxBSGbqLDyDJZjke", avatar: KOL_IMG("Radiance.jpg"), pnl7d: 12800, pnl30d: 85928, trades: 1613, winrate: 48.3 },
  { name: "Stigman", handle: "stigman__", wallet: "8fsKLLtvKNanL4ginCaiRS6UfeemY11rSf8U8fN1dJw4", avatar: KOL_IMG("stigman.jpg"), pnl7d: 8200, pnl30d: 25003, trades: 1835, winrate: 26.5 },
  { name: "Clown", handle: "clowntrenches", wallet: "EDXHdSFdadFbYFFjxPXBqMe1kCEDFqpPu552uvp48HR8", avatar: KOL_IMG("clown.jpg"), pnl7d: 7700, pnl30d: 40572, trades: 3335, winrate: 41.2 },
  { name: "Iceman", handle: "77aez", wallet: "DVMkhiQe1D8yenuEgsW44NjRn9LfVQjGEpZcez5x7Mff", avatar: KOL_IMG("iceman-1770177928.jpg"), pnl7d: 5600, pnl30d: 50436, trades: 3057, winrate: 48 },
  { name: "Sebastian", handle: "Saint_pablo123", wallet: "3BLjRcxWGtR7WRshJ3hL25U3RjWr5Ud98wMcczQqk4Ei", avatar: KOL_IMG("Sebastian.jpg"), pnl7d: 4800, pnl30d: 69515, trades: 776, winrate: 46.7 },
  { name: "Colercooks", handle: "ColerCooks", wallet: "99xnE2zEFi8YhmKDaikc1EvH6ELTQJppnqUwMzmpLXrs", avatar: KOL_IMG("coler-1768530086.jpg"), pnl7d: 1300, pnl30d: 26908, trades: 3816, winrate: 39.3 },
  { name: "Chester", handle: "chestererer", wallet: "PMJA8UQDyWTFw2Smhyp9jGA6aTaP7jKHR7BPudrgyYN", avatar: KOL_IMG("chester-1768331112.jpg"), pnl7d: 572, pnl30d: 45139, trades: 4732, winrate: 41.2 },
  { name: "casino", handle: "casino616", wallet: "8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR", avatar: KOL_IMG("casino-1768995941.jpg"), pnl7d: -7100, pnl30d: 45777, trades: 298, winrate: 28.5 },
  { name: "ducky", handle: "zxduckyxz", wallet: "ADC1QV9raLnGGDbnWdnsxazeZ4Tsiho4vrWadYswA2ph", avatar: KOL_IMG("Ducky.jpg"), pnl7d: -3600, pnl30d: 8206, trades: 775, winrate: 47.5 },
  { name: "omar", handle: "maghrrebi", wallet: "Dgehc8YMv6dHsiPJVoumvq4pSBkMVvrTgTUg7wdcYJPJ", avatar: KOL_IMG("omar-1768653272.jpg"), pnl7d: -3600, pnl30d: 13552, trades: 3011, winrate: 35.2 },
  { name: "Dali", handle: "SolanaDali", wallet: "CvNiezB8hofusHCKqu8irJ6t2FKY7VjzpSckofMzk5mB", avatar: KOL_IMG("Dali.jpg"), pnl7d: -5700, pnl30d: -12296, trades: 1587, winrate: 40.1 },
];

export const shortWallet = (wallet: string) =>
  wallet.length > 10 ? `${wallet.slice(0, 4)}…${wallet.slice(-4)}` : wallet;
