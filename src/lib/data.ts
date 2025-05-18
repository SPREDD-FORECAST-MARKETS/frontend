import type { TrendingMarketsData,MarketCard } from "./interface";

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
      options: [
        { name: "Oklahoma City Thunder", percentage: "42%" },
        { name: "New York Knicks", percentage: "19%" },
        { name: "Minnesota Timberwolves", percentage: "17%" }
      ],
      volume: "$2b Vol."
    },
    {
      id: "2",
      title: "Romania Presidential Election Winner",
      icon: "src/assets/romania.png",
      options: [
        { name: "Nicuşor Dan", percentage: "65%" },
        { name: "George Simion", percentage: "36%" }
      ],
      volume: "$216m Vol."
    },
    {
      id: "3",
      title: "US recession in 2025?",
      icon: "src/assets/trump.jpeg",
      chance: "38%",
      buyOptions: ["Yes", "No"],
      volume: "$5m Vol."
    },
    {
      id: "4",
      title: "Fed decision in June?",
      icon: "src/assets/romania.png",
      options: [
        { name: "50+ bps decrease", percentage: "1%" },
        { name: "25 bps decrease", percentage: "10%" },
        { name: "No change", percentage: "89%" }
      ],
      volume: "$12m Vol.",
      timeframe: "Monthly"
    },
    {
      id: "5",
      title: "Next president of South Korea?",
      icon: "src/assets/south_korea.png",
      options: [
        { name: "Lee Jae-myung", percentage: "90%" },
        { name: "Kim Moon-soo", percentage: "6%" },
        { name: "Lee Jin-seok", percentage: "3%" }
      ],
      volume: "$120m Vol."
    },
    {
      id: "6",
      title: "2025 PGA Champion",
      icon: "src/assets/arsenal.jpeg",
      options: [
        { name: "Scottie Scheffler", percentage: "79%" },
        { name: "Alex Noren", percentage: "5%" },
        { name: "Jon Rahm", percentage: "4%" }
      ],
      volume: "$1m Vol."
    }
  ];