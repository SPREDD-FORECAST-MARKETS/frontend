import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { uploadFile } from "../apis/files";
import { createMarket } from "../apis/market";
import { getAccessToken } from "@privy-io/react-auth";
import { useCreateMarket } from "../hooks/useCreateMarket";
import React from "react";
import { useSwitchChain, useWaitForTransactionReceipt } from "wagmi";
import { decodeEventLog, parseAbiItem } from "viem";
import { baseSepolia } from "viem/chains";
import type { FormData } from "../lib/interface";
import { UTCTimeHelpers } from "../utils/helpers";

const MAX_IMAGE_SIZE = 1024 * 1024;

// Predefined categories
const AVAILABLE_CATEGORIES = [
  "NBA",
  "Technology",
  "Science Breakthroughs",
  "Bitcoin",
  "Sports",
  "AI",
  "Crypto",
  "Business",
  "Economy",
  "Entertainment",
  "Health",
  "Environment",
  "Science",
  "Travel",
  "Food",
  "Fashion",
  "Lifestyle",
  "Finance",
  "Real Estate",
  "Automotive",
  "Gaming",
  "Music",
  "Art",
  "Photography",
  "Forecasting",
  "E-sports",
];

const CreatePredictionForm = () => {
  const { error, success } = useToast();

  const [formData, setFormData] = useState<FormData>({
    title: "Will Bitcoin reach $100k by June 10th?",
    options: ["Yes", "No"],
    description: "Bitcoin price prediction market",
    resolutionCriteria: "Based on CoinGecko price data",
    tags: ["Crypto"],
    endDate: "",
    endTime: "",
    createOnChain: true,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [marketContractAddress, setMarketContractAddress] = useState<
    string | null
  >(null);
  const [marketId, setMarketId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedEndTimeUTC, setConfirmedEndTimeUTC] = useState<number | null>(
    null
  );

  // Dropdown and search state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { switchChain } = useSwitchChain();
  const { createMarket: createSmartContractMarket, hash: contractHash } =
    useCreateMarket();

  const { data: receipt } = useWaitForTransactionReceipt({
    hash: contractHash,
  });

  const marketCreatedEvent = parseAbiItem(
    "event MarketCreated(bytes32 indexed marketId, address indexed marketContract, address indexed owner, address token, string question, string optionA, string optionB, uint256 endTime)"
  );

  // Filter categories based on search term
  const filteredCategories = AVAILABLE_CATEGORIES.filter((category) =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setFormData((prev) => {
      const currentTags = prev.tags || [];
      if (currentTags.includes(category)) {
        // Remove if already selected
        return {
          ...prev,
          tags: currentTags.filter((tag) => tag !== category),
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          tags: [...currentTags, category],
        };
      }
    });
  };

  // Remove individual category
  const handleRemoveCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((tag) => tag !== category),
    }));
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search when dropdown closes
  const handleDropdownToggle = () => {
    if (isDropdownOpen) {
      setSearchTerm(""); // Clear search when closing
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        error("Image size must be less than 1MB");
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const [imageUrl, status] = await uploadFile(file, "market");

      if (status === -1 || imageUrl === null) {
        error("Image upload Failed!", 2);
        return;
      }

      setUploadedImageUrl(imageUrl);
      success("Image uploaded successfully");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await switchChain({ chainId: baseSepolia.id });

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Validate the input time
      const validation = UTCTimeHelpers.validateFutureTime(
        formData.endDate,
        formData.endTime
      );
      if (!validation.isValid) {
        error(validation.error!);
        return;
      }

      const endTimeUTC = UTCTimeHelpers.toUTCTimestamp(
        formData.endDate,
        formData.endTime
      );

      setConfirmedEndTimeUTC(endTimeUTC);

      console.log("Creating market with endTimeUTC:", endTimeUTC);

      // Create smart contract market - no token approval or initialization needed
      await createSmartContractMarket(
        formData.title,
        formData.options[0],
        formData.options[1],
        endTimeUTC
      );
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      error("Failed to create prediction");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle market creation success and database storage
  useEffect(() => {
    if (!marketContractAddress || !marketId || !confirmedEndTimeUTC) return;

    const handleDatabaseStorage = async () => {
      try {
        const dbDateString = new Date(confirmedEndTimeUTC * 1000).toISOString();

        console.log("Storing in database:");
        console.log("UTC timestamp from contract:", confirmedEndTimeUTC);
        console.log("ISO string for DB:", dbDateString);

        const authToken = await getAccessToken();
        const [, status] = await createMarket(
          authToken!,
          formData.title,
          formData.resolutionCriteria,
          formData.description,
          dbDateString,
          uploadedImageUrl ||
            "https://rrgzufevhpeypfviivan.supabase.co/storage/v1/object/public/spreadd/market/1750689653867_photo_5103127210662931859_y.jpg",
          marketContractAddress,
          marketId,
          formData.tags || null
        );

        if (status === -1) {
          error("Failed to create Prediction!", 3);
          return;
        }

        success("Prediction created successfully!");

        // Reset form state
        setImagePreview(null);
        setMarketContractAddress(null);
        setMarketId(null);
        setConfirmedEndTimeUTC(null);

        // Optionally reset form data
        setFormData({
          title: "",
          options: ["Yes", "No"],
          description: "",
          resolutionCriteria: "",
          tags: [],
          endDate: "",
          endTime: "",
          createOnChain: true,
        });
      } catch (err) {
        console.error("Error storing market in database:", err);
        error("Market created on blockchain but failed to store in database");
      }
    };

    handleDatabaseStorage();
  }, [marketContractAddress, marketId, confirmedEndTimeUTC]);

  // Parse transaction receipt for market creation event
  useEffect(() => {
    if (!receipt?.logs) return;

    for (const log of receipt.logs) {
      try {
        const parsed = decodeEventLog({
          abi: [marketCreatedEvent],
          data: log.data,
          topics: log.topics,
        });

        if (parsed.eventName === "MarketCreated") {
          const marketContract = parsed.args.marketContract;
          const marketId = parsed.args.marketId;
          const contractEndTime = parsed.args.endTime;

          setMarketContractAddress(marketContract);
          setMarketId(marketId);

          // Verify timestamp consistency
          if (
            confirmedEndTimeUTC &&
            Number(contractEndTime) !== confirmedEndTimeUTC
          ) {
            console.warn("Timestamp mismatch!", {
              stored: confirmedEndTimeUTC,
              contract: Number(contractEndTime),
            });
          }

          success("Market created on blockchain successfully!");
          break;
        }
      } catch (error: any) {
        console.error("Error parsing MarketCreated event:", error);
      }
    }
  }, [receipt, confirmedEndTimeUTC]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById("category-dropdown");
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchTerm(""); // Clear search when clicking outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-6 lg:px-12 text-white min-h-screen">
      <div className="flex justify-end mb-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors duration-300 text-sm uppercase tracking-wide"
        >
          <span className="text-xl">←</span> Go Back
        </Link>
      </div>

      <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-2xl shadow-xl p-8 sm:p-10 md:p-12 border border-zinc-800">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-700 mb-10 text-center font-serif tracking-tight">
          Create Prediction
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-10"
        >
          {/* LEFT COLUMN */}
          <div className="space-y-8">
            <div>
              <label
                htmlFor="title"
                className="block text-gray-400 font-medium mb-3 text-xs uppercase tracking-wider"
              >
                Event Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a clear, specific title"
                className="w-full bg-[#111] border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600/50 transition-all duration-300 shadow-inner"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-gray-400 font-medium mb-3 text-xs uppercase tracking-wider"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Provide detailed information about this prediction"
                className="w-full bg-[#111] border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600/50 transition-all duration-300 shadow-inner resize-none"
              />
            </div>

            <div>
              <label
                htmlFor="resolutionCriteria"
                className="block text-gray-400 font-medium mb-3 text-xs uppercase tracking-wider"
              >
                Resolution Criteria
              </label>
              <textarea
                id="resolutionCriteria"
                name="resolutionCriteria"
                value={formData.resolutionCriteria}
                onChange={handleInputChange}
                rows={3}
                placeholder="Explain clearly how this prediction will be resolved"
                className="w-full bg-[#111] border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600/50 transition-all duration-300 shadow-inner resize-none"
              />
            </div>

            {/* Enhanced Category Selection with Search */}
            <div>
              <label className="block text-gray-400 font-medium mb-3 text-xs uppercase tracking-wider">
                Market Categories
              </label>

              {/* Selected Categories Display */}
              {formData.tags && formData.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600/20 to-orange-700/20 border border-orange-600/30 text-orange-300 px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(tag)}
                        className="ml-1 text-orange-400 hover:text-orange-200 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Dropdown */}
              <div className="relative" id="category-dropdown">
                <button
                  type="button"
                  onClick={handleDropdownToggle}
                  className="w-full bg-[#111] border border-zinc-800 rounded-xl px-5 py-4 text-left text-white focus:outline-none focus:ring-2 focus:ring-orange-600/50 transition-all duration-300 shadow-inner flex items-center justify-between hover:border-orange-600/50"
                >
                  <span
                    className={
                      formData.tags?.length ? "text-white" : "text-gray-500"
                    }
                  >
                    {formData.tags?.length
                      ? `${formData.tags.length} categories selected`
                      : "Select categories"}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-[#111] border border-zinc-800 rounded-xl shadow-xl max-h-72 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-zinc-800 bg-[#0a0a0a]">
                      <div className="relative">
                        <svg
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search categories..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                          className="w-full bg-[#111] border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-600/50 focus:border-orange-600/50 transition-all duration-200"
                          onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
                        />
                      </div>
                    </div>

                    {/* Categories List */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => {
                          const isSelected = formData.tags?.includes(category);
                          return (
                            <button
                              key={category}
                              type="button"
                              onClick={() => handleCategorySelect(category)}
                              className={`w-full px-5 py-3 text-left transition-all duration-200 flex items-center justify-between hover:bg-zinc-800/50 ${
                                isSelected
                                  ? "bg-orange-600/10 text-orange-300 border-r-2 border-orange-600"
                                  : "text-gray-300 hover:text-white"
                              }`}
                            >
                              <span>{category}</span>
                              {isSelected && (
                                <svg
                                  className="w-4 h-4 text-orange-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-5 py-3 text-gray-400 text-center">
                          No categories found for "{searchTerm}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            <div>
              <label className="block text-gray-400 font-medium mb-3 text-xs uppercase tracking-wider">
                Upload Image
              </label>
              <div
                className={`border-2 border-dashed ${
                  imagePreview ? "border-green-500" : "border-zinc-800"
                } rounded-2xl p-8 text-center cursor-pointer hover:border-orange-600 transition-all duration-300 bg-[#111]`}
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-56 mx-auto rounded-2xl object-cover ring-2 ring-orange-600/20"
                  />
                ) : (
                  <p className="text-gray-400 text-base">
                    Drag & drop or click (max 1MB)
                  </p>
                )}
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-medium mb-3 text-xs uppercase tracking-wider">
                End Time (Your Local Time: {UTCTimeHelpers.getUserTimezone()})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full bg-[#111] border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600/50 transition-all duration-300 shadow-inner"
                  style={{ colorScheme: "dark" }}
                  required
                />
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full bg-[#111] border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600/50 transition-all duration-300 shadow-inner"
                  style={{ colorScheme: "dark" }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-br from-orange-600 to-orange-700 shadow-orange-500/20 p-4 rounded-xl transition-all duration-300 hover:shadow-orange-500/40 hover:scale-105 hover:from-orange-500 hover:to-orange-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePredictionForm;
