import type {
  TrendingMarketsData,
  MarketCard,
  TrendingTagsData,
  LeaderBoardTableData,
} from "./interface";
import { ArrowUpRight } from "lucide-react";

export const trendingMarkets: TrendingMarketsData[] = [
  {
    id: 1,
    icon: "src/assets/arsenal.jpeg",
    title: "NBA Championship 2025: Who will win?",
    value: "$2,430,782",
  },
  {
    id: 2,
    icon: "src/assets/trump.jpeg",
    title: "AI breakthrough: Will GPT-5 release in 2025?",
    value: "$1,872,345",
  },
  {
    id: 3,
    icon: "src/assets/putin.jpeg",
    title: "Major tech merger prediction for 2025",
    value: "$965,214",
  },
  {
    id: 4,
    icon: "src/assets/dollar.jpeg",
    title: "Will the US Dollar fall below 1.00?",
    value: "$758,490",
  },
];

export const leaderBoard = [
  {
    id: 1,
    avatar: "src/assets/person.jpeg",
    username: "Diddy",
    value: "$24,568",
  },
  {
    id: 2,
    avatar: "src/assets/person.jpeg",
    username: "El_adsin",
    value: "$18,342",
  },
  {
    id: 3,
    avatar: "src/assets/person.jpeg",
    username: "TBFDude",
    value: "$15,785",
  },
  {
    id: 4,
    avatar: "src/assets/person.jpeg",
    username: "mudi",
    value: "$12,430",
  },
];

export const marketCards: MarketCard[] = [
  {
    id: "1",
    title: "NBA Champion 2025",
    icon: "src/assets/arsenal.jpeg",
    description: "Predict which team will win the 2025 NBA Championship.",
    volume: "$2.4M Vol.",
    createdAt: new Date("2024-08-01T10:00:00Z"),
    closingAt: new Date("2025-06-01T10:00:00Z"),
    creatorName: "Smith Whales",
  },
  {
    id: "2",
    title: "Apple Market Cap Prediction 2025",
    icon: "src/assets/romania.png",
    description:
      "Forecast whether Apple's market cap will reach $4 trillion by the end of 2025.",
    volume: "$1.8M Vol.",
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
    volume: "$965K Vol.",
    closingAt: new Date("2025-06-01T10:00:00Z"),
    createdAt: new Date("2023-10-01"),
    creatorName: "Tech Analyst",
  },
  {
    id: "4",
    title: "Fed decision in June?",
    icon: "src/assets/romania.png",
    description:
      "Speculate on whether the Federal Reserve will raise interest rates in June.",
    volume: "$758K Vol.",
    timeframe: "Monthly",
    closingAt: new Date("2025-06-01T10:00:00Z"),
    createdAt: new Date("2023-10-01"),
    creatorName: "Developer Jim",
  },
  {
    id: "5",
    title: "Next major tech acquisition",
    icon: "src/assets/south_korea.png",
    description:
      "Which major tech company will make the next significant acquisition in 2025?",
    volume: "$542K Vol.",
    closingAt: new Date("2025-06-01T10:00:00Z"),
    createdAt: new Date("2023-10-01"),
    creatorName: "John Doe",
  },
  {
    id: "6",
    title: "2025 PGA Champion",
    icon: "src/assets/arsenal.jpeg",
    description:
      "Place your forecast on the winner of the 2025 PGA Championship.",
    volume: "$320K Vol.",
    createdAt: new Date("2023-10-01"),
    closingAt: new Date("2025-06-01T10:00:00Z"),
    creatorName: "Ryan Reynolds",
  },
];

export const tags: TrendingTagsData[] = [
  { id: 1, name: "Top", icon: { component: ArrowUpRight, size: 14 } },
  { id: 2, name: "NBA", icon: null },
  { id: 3, name: "Technology", icon: null },
  { id: 4, name: "Science Breakthroughs", icon: null },
  { id: 5, name: "Bitcoin", icon: null },
  { id: 6, name: "Sports", icon: null },
  { id: 7, name: "AI", icon: null },
  { id: 8, name: "Crypto", icon: null },
  { id: 9, name: "Business", icon: null },
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
  { id: 29, name: "Forecasting", icon: null },
  { id: 30, name: "E-sports", icon: null },
];

export const userProfile = {
  id: "1",
  username: "SwiftWhale368",
  displayName: "Swift Whale",
  bio: "Hey I am SwiftWhale368 and I love Bango",
  avatar: "https://i.imgur.com/8Km9tLL.png",
  walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  transactions: [
    {
      id: "1",
      date: "2024-01-1",
      amount: "$100",
      type: "forecast",
      status: "completed",
    },
    {
      id: "2",
      date: "2024-01-2",
      amount: "$75",
      type: "forecast",
      status: "completed",
    },
    {
      id: "3",
      date: "2024-01-3",
      amount: "$200",
      type: "deposit",
      status: "completed",
    },
    {
      id: "4",
      date: "2024-01-4",
      amount: "$45",
      type: "reward",
      status: "completed",
    },
    {
      id: "5",
      date: "2024-01-5",
      amount: "$120",
      type: "forecast",
      status: "pending",
    },
  ],
};

export const leaderboardData: LeaderBoardTableData[] = [
  {
    id: 1,
    name: "Charles Riley",
    avatar: "src/assets/person.jpeg",
    points: 188,
    accuracy: "92%",
    winStreak: 14,
    reward: "$250",
  },
  {
    id: 2,
    name: "Gerald Wells",
    avatar: "src/assets/person.jpeg",
    points: 180,
    accuracy: "89%",
    winStreak: 12,
    reward: "$150",
  },
  {
    id: 3,
    name: "Barbara Ross",
    avatar: "src/assets/person.jpeg",
    points: 127,
    accuracy: "78%",
    winStreak: 8,
    reward: "$100",
  },
  {
    id: 4,
    name: "Heather Burns",
    avatar: "src/assets/person.jpeg",
    points: 107,
    accuracy: "73%",
    winStreak: 5,
    reward: "$75",
  }

];
