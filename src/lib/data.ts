import type {
  TrendingMarketsData,
  MarketCard,
  TrendingTagsData,
} from "./interface";
import { ArrowUpRight } from "lucide-react";

export const trendingMarkets: TrendingMarketsData[] = [
  {
    id: 1,
    icon: "src/assets/arsenal.jpeg",
    title: "Sporting CP vs Arsenal: Who will win?",
    value: "$69,230,902.00",
  },
  {
    id: 2,
    icon: "src/assets/trump.jpeg",
    title: "Who will be Trump's next commission?",
    value: "$69,230,902.00",
  },
  {
    id: 3,
    icon: "src/assets/putin.jpeg",
    title: "Where will Putin launch Russia's next?",
    value: "$69,230,902.00",
  },
  {
    id: 4,
    icon: "src/assets/dollar.jpeg",
    title: "Will the US Dollar fall below 1.00?",
    value: "$69,230,902.00",
  },
];

export const leaderBoard = [
  {
    id: 1,
    avatar: "src/assets/person.jpeg",
    username: "DKindBrady",
    value: "$17,230,902.00",
  },
  {
    id: 2,
    avatar: "src/assets/person.jpeg",
    username: "SGURU",
    value: "$10,230,902.00",
  },
  {
    id: 3,
    avatar: "src/assets/person.jpeg",
    username: "TBFDude",
    value: "$9,230,902.00",
  },
  {
    id: 4,
    avatar: "src/assets/person.jpeg",
    username: "DKindBrady",
    value: "$7,230,902.00",
  },
];

export const marketCards: MarketCard[] = [
  {
    id: "1",
    title: "NBA Champion",
    icon: "src/assets/arsenal.jpeg",
    description: "Predict which team will win the 2025 NBA Championship.",
    volume: "$2b Vol.",
    createdAt: new Date("2024-08-01T10:00:00Z"),
    closingAt: new Date("2025-06-01T10:00:00Z"),
    creatorName: "Smith Whales",
  },
  {
    id: "2",
    title: "Romania Presidential Election Winner",
    icon: "src/assets/romania.png",
    description:
      "Forecast the outcome of Romania's upcoming presidential election.",
    volume: "$216m Vol.",
    createdAt: new Date("2023-10-01"),
    closingAt: new Date("2025-06-01T10:00:00Z"),

    creatorName: "David Beckham",
  },
  {
    id: "3",
    title: "US recession in 2025?",
    icon: "src/assets/trump.jpeg",
    description: "Will the US economy enter a recession during the year 2025?",
    buyOptions: ["Yes", "No"],
    volume: "$5m Vol.",
    closingAt: new Date("2025-06-01T10:00:00Z"),

    createdAt: new Date("2023-10-01"),
    creatorName: "Trump Tatya",
  },
  {
    id: "4",
    title: "Fed decision in June?",
    icon: "src/assets/romania.png",
    description:
      "Speculate on whether the Federal Reserve will raise interest rates in June.",
    volume: "$12m Vol.",
    timeframe: "Monthly",
    closingAt: new Date("2025-06-01T10:00:00Z"),

    createdAt: new Date("2023-10-01"),
    creatorName: "Developer Jim",
  },
  {
    id: "5",
    title: "Next president of South Korea?",
    icon: "src/assets/south_korea.png",
    description:
      "Choose who you believe will become the next President of South Korea.",
    volume: "$120m Vol.",
    closingAt: new Date("2025-06-01T10:00:00Z"),

    createdAt: new Date("2023-10-01"),
    creatorName: "John Doe",
  },
  {
    id: "6",
    title: "2025 PGA Champion",
    icon: "src/assets/arsenal.jpeg",
    description: "Place your bets on the winner of the 2025 PGA Championship.",
    volume: "$1m Vol.",
    createdAt: new Date("2023-10-01"),
    closingAt: new Date("2025-06-01T10:00:00Z"),

    creatorName: "Ryan Reynolds",
  },
];

export const tags: TrendingTagsData[] = [
  { id: 1, name: "Top", icon: { component: ArrowUpRight, size: 14 } },
  { id: 2, name: "UCL", icon: null },
  { id: 3, name: "Trump", icon: null },
  { id: 4, name: "Russia vs Ukraine", icon: null },
  { id: 5, name: "Bitcoin", icon: null },
  { id: 6, name: "Arsenal", icon: null },
  { id: 7, name: "AI", icon: null },
  { id: 8, name: "Crypto", icon: null },
  { id: 9, name: "Politics", icon: null },
  { id: 10, name: "Economy", icon: null },
  { id: 11, name: "Sports", icon: null },
  { id: 12, name: "Entertainment", icon: null },
  { id: 13, name: "Health", icon: null },
  { id: 14, name: "Environment", icon: null },
  { id: 15, name: "Technology", icon: null },
  { id: 16, name: "Science", icon: null },
  { id: 17, name: "Travel", icon: null },
  { id: 18, name: "Food", icon: null },
  { id: 19, name: "Fashion", icon: null },
  { id: 20, name: "Lifestyle", icon: null },
  { id: 21, name: "Business", icon: null },
  { id: 22, name: "Finance", icon: null },
  { id: 23, name: "Real Estate", icon: null },
  { id: 24, name: "Automotive", icon: null },
  { id: 25, name: "Gaming", icon: null },
  { id: 26, name: "Music", icon: null },
  { id: 27, name: "Art", icon: null },
  { id: 28, name: "Photography", icon: null },
  { id: 29, name: "Sports Betting", icon: null },
  { id: 30, name: "E-sports", icon: null },
];


export const userProfile = {
  id : '1',
  username : 'SwiftWhale368',
  displayName : 'Swift Whale',
  bio : 'Hey I am SwiftWhale368 and I love Bango',
  avatar : 'https://i.imgur.com/8Km9tLL.png',
  walletAddress : '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  transactions : [
    { id: '1', date: '2024-01-1', amount: '$100.00', type: 'buy', status: 'completed' },
    { id: '2', date: '2024-01-2', amount: '$100.00', type: 'sell', status: 'completed' },
    { id: '3', date: '2024-01-3', amount: '$100.00', type: 'deposit', status: 'completed' },
    { id: '4', date: '2024-01-4', amount: '$75.50', type: 'reward', status: 'completed' },
    { id: '5', date: '2024-01-5', amount: '$210.25', type: 'buy', status: 'pending' },
  ]
}