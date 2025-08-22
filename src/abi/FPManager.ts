export const FP_MANAGER_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_topK",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_rewardToken",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "OwnableUnauthorized",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ReentrancyGuardReentrantCall",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			}
		],
		"name": "SafeERC20FailedOperation",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "week",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address[]",
				"name": "traders",
				"type": "address[]"
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "amounts",
				"type": "uint256[]"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "total",
				"type": "uint256"
			}
		],
		"name": "BackdatedRewardsDistributed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "contractAddr",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "authorized",
				"type": "bool"
			}
		],
		"name": "ContractAuthorized",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "fpAmount",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "marketId",
				"type": "bytes32"
			}
		],
		"name": "CreatorFPAwarded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "manager",
				"type": "address"
			}
		],
		"name": "LeaderboardManagerSet",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "prevOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnerUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256[10]",
				"name": "newPercentages",
				"type": "uint256[10]"
			}
		],
		"name": "RewardPercentagesUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "fpAmount",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "marketId",
				"type": "bytes32"
			}
		],
		"name": "TraderFPAwarded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "week",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address[]",
				"name": "traders",
				"type": "address[]"
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "rewardAmounts",
				"type": "uint256[]"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalDistributed",
				"type": "uint256"
			}
		],
		"name": "TraderRewardsDistributed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "week",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "participantCount",
				"type": "uint256"
			}
		],
		"name": "WeekEnded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "week",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address[]",
				"name": "topTraders",
				"type": "address[]"
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "traderFP",
				"type": "uint256[]"
			},
			{
				"indexed": false,
				"internalType": "address[]",
				"name": "topCreators",
				"type": "address[]"
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "creatorFP",
				"type": "uint256[]"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "submitter",
				"type": "address"
			}
		],
		"name": "WeeklyLeaderboardSubmitted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newWeek",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "WeeklyReset",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "week",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalPool",
				"type": "uint256"
			}
		],
		"name": "WeeklyRewardPoolUpdated",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "CREATOR_BASE_FP",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "CREATOR_VOLUME_MULTIPLIER",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "FINALIZATION_DEADLINE",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MAX_CORRECTNESS_MULTIPLIER",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MAX_EARLY_BONUS",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MAX_MARKET_SIZE_WEIGHT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MIN_CORRECTNESS_MULTIPLIER",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MIN_EARLY_BONUS",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MIN_MARKET_SIZE_WEIGHT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "PRECISION",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "WEEK_DURATION",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "authorizedContracts",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_creator",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "_marketId",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "_marketVolume",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_tradeCount",
				"type": "uint256"
			}
		],
		"name": "awardCreatorFP",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "_marketId",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "_marketVolume",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_userPositionTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_marketCreationTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_marketDuration",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_correctSideLiquidity",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_totalLiquidity",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_userPositionSize",
				"type": "uint256"
			}
		],
		"name": "awardTraderFP",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "contributeToRewardPool",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "currentCreators",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "currentTraders",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "currentWeek",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_week",
				"type": "uint256"
			}
		],
		"name": "emergencyFinalizeWeek",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "emergencyWithdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "forceWeeklyReset",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCurrentRewardPoolStatus",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "currentPool",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "contractBalance",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "rewardTokenAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "weeklyDistributed",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCurrentWeekInfo",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "week",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "tradersCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "creatorsCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "topKSetting",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "currentRewardPool",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getCurrentWeekUserFP",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "traderFP",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "creatorFP",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalWeeklyFP",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPendingWeeks",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "pendingWeeks",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "rewardPools",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getRewardPercentages",
		"outputs": [
			{
				"internalType": "uint256[10]",
				"name": "",
				"type": "uint256[10]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTotalUndistributedRewards",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "total",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_trader",
				"type": "address"
			}
		],
		"name": "getTraderRewardInfo",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "totalEarned",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "currentWeekFP",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "currentWeekRank",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "potentialReward",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getUserAllTimeFP",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "totalTraderFP_",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalCreatorFP_",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "grandTotalFP",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalRewardsEarned_",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_week",
				"type": "uint256"
			}
		],
		"name": "getUserWeeklyFP",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "traderFP",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "creatorFP",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalWeeklyFP",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_week",
				"type": "uint256"
			}
		],
		"name": "getWeekEndTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_week",
				"type": "uint256"
			}
		],
		"name": "getWeeklyWinners",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "topTraders",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "traderFP",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "traderRewards",
				"type": "uint256[]"
			},
			{
				"internalType": "address[]",
				"name": "topCreators",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "creatorFP",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256",
				"name": "totalDistributed",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "historicalCreatorFP",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "historicalTraderFP",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isTrackedCreator",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isTrackedTrader",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "leaderboardManager",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_week",
				"type": "uint256"
			},
			{
				"internalType": "address[]",
				"name": "_winners",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "_amounts",
				"type": "uint256[]"
			}
		],
		"name": "manualRewardDistribution",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_marketVolume",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_tradeCount",
				"type": "uint256"
			}
		],
		"name": "previewCreatorFP",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "totalFP",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "baseFP",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "volumeBonus",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "activityBonus",
				"type": "uint256"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_marketVolume",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_userPositionTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_marketCreationTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_marketDuration",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_correctSideLiquidity",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_totalLiquidity",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_userPositionSize",
				"type": "uint256"
			}
		],
		"name": "previewTraderFP",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "totalFP",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "marketSizeWeight",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "earlyBonus",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "correctnessMultiplier",
				"type": "uint256"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "rewardPercentages",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "rewardToken",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_contract",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "_authorized",
				"type": "bool"
			}
		],
		"name": "setAuthorizedContract",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_manager",
				"type": "address"
			}
		],
		"name": "setLeaderboardManager",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newOwner",
				"type": "address"
			}
		],
		"name": "setOwner",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256[10]",
				"name": "_percentages",
				"type": "uint256[10]"
			}
		],
		"name": "setRewardPercentages",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_spreddFactory",
				"type": "address"
			}
		],
		"name": "setSpreddFactory",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "spreddFactory",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256[]",
				"name": "_weeks",
				"type": "uint256[]"
			},
			{
				"internalType": "address[][]",
				"name": "_topTraders",
				"type": "address[][]"
			},
			{
				"internalType": "uint256[][]",
				"name": "_traderFP",
				"type": "uint256[][]"
			},
			{
				"internalType": "address[][]",
				"name": "_topCreators",
				"type": "address[][]"
			},
			{
				"internalType": "uint256[][]",
				"name": "_creatorFP",
				"type": "uint256[][]"
			}
		],
		"name": "submitMultipleWeeks",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_week",
				"type": "uint256"
			},
			{
				"internalType": "address[]",
				"name": "_topTraders",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "_traderFP",
				"type": "uint256[]"
			},
			{
				"internalType": "address[]",
				"name": "_topCreators",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "_creatorFP",
				"type": "uint256[]"
			}
		],
		"name": "submitWeeklyLeaderboard",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "topK",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "totalCreatorFP",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "totalRewardsEarned",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "totalTraderFP",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "weekStartTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "weekStatus",
		"outputs": [
			{
				"internalType": "enum WeeklyForecastPointManager.WeekStatus",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "weeklyCreatorFP",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "weeklyRewardPoolDistributed",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "weeklyRewardPools",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "weeklyRewardsDistributed",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "weeklyTopCreators",
		"outputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "fpPoints",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "weeklyTopTraders",
		"outputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "fpPoints",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "weeklyTraderFP",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "weeklyTraderRewards",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]