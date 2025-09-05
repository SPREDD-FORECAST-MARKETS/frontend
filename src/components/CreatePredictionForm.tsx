import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { uploadFile } from "../apis/files";
import { createMarket } from "../apis/market";
import { getAccessToken } from "@privy-io/react-auth";
import { useCreateMarket } from "../hooks/useCreateMarket";
import React from "react";
import { useSwitchChain } from "wagmi";
import { base } from "viem/chains";
import type { FormData } from "../lib/interface";
import { UTCTimeHelpers } from "../utils/helpers";
import AppleTimePicker from "./AppleTimePicker";

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
  "Politics",
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
  const [, setMarketContractAddress] = useState<
    string | null
  >(null);
  const [, setMarketId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedEndTimeUTC, setConfirmedEndTimeUTC] = useState<number | null>(
    null
  );

  // Dropdown and search state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { switchChain } = useSwitchChain();
  const { createMarket: createSmartContractMarket, marketAddress: hookMarketAddress, marketId: hookMarketId } =
    useCreateMarket();

  // Remove the useWaitForTransactionReceipt since the hook handles it
  // const { data: receipt } = useWaitForTransactionReceipt({
  //   hash: contractHash,
  // });

  // Filter and sort categories alphabetically based on search term
  const filteredCategories = AVAILABLE_CATEGORIES
    .filter((category) => category.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

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
    
    // Keep dropdown open and clear search to show all categories again
    setSearchTerm("");
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

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      setTimeout(() => {
        const searchInput = document.getElementById("category-search");
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
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

    await switchChain({ chainId: base.id });

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

      // Create smart contract market
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

  // Simplified useEffect that uses data from the hook
  useEffect(() => {
    // Use the marketAddress and marketId from the hook when they become available
    if (hookMarketAddress && hookMarketId && confirmedEndTimeUTC) {
      setMarketContractAddress(hookMarketAddress);
      setMarketId(hookMarketId);
      
      // Store in database
      const handleDatabaseStorage = async () => {
        try {
          const dbDateString = new Date(confirmedEndTimeUTC * 1000).toISOString();

          console.log("Storing in database:");
          console.log("UTC timestamp from contract:", confirmedEndTimeUTC);
          console.log("ISO string for DB:", dbDateString);
          console.log("Market contract:", hookMarketAddress);
          console.log("Market ID:", hookMarketId);

          const authToken = await getAccessToken();
          const [, status] = await createMarket(
            authToken!,
            formData.title,
            formData.resolutionCriteria,
            formData.description,
            dbDateString,
            uploadedImageUrl ||
              "https://rrgzufevhpeypfviivan.supabase.co/storage/v1/object/public/spreadd/market/1750689653867_photo_5103127210662931859_y.jpg",
            hookMarketAddress,
            hookMarketId,
            formData.tags || null
          );

          if (status === -1) {
            error("Failed to create Prediction in database!", 3);
            return;
          }

          success("Prediction created successfully!");

          // Reset form state
          setImagePreview(null);
          setMarketContractAddress(null);
          setMarketId(null);
          setConfirmedEndTimeUTC(null);

          // Reset form data
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
    }
  }, [hookMarketAddress, hookMarketId, confirmedEndTimeUTC]);

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
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-6 md:py-10 px-3 sm:px-4 md:px-6 lg:px-8 text-white min-h-screen">
      <div className="flex justify-between items-start mb-6">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-gray-400 hover:text-orange-500 transition-colors duration-300 text-xs sm:text-sm uppercase tracking-wide"
        >
          <span className="text-lg">←</span> Go Back
        </Link>
      </div>

      <div className="mb-6 md:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-500 mb-2 tracking-tight">
          Create Prediction
        </h1>
        <p className="text-sm text-gray-400">
          Set up a new prediction market for the community
        </p>
      </div>

      <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-zinc-800 relative overflow-visible">

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
        >
          {/* LEFT COLUMN */}
          <div className="space-y-5">
            <div>
              <label
                htmlFor="title"
                className="block text-gray-300 font-medium mb-2 text-sm"
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
                className="w-full bg-[#111] border border-zinc-800 rounded-lg px-4 py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600/50 transition-all duration-300 shadow-inner"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-gray-300 font-medium mb-2 text-sm"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Provide detailed information about this prediction"
                className="w-full bg-[#111] border border-zinc-800 rounded-lg px-4 py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600/50 transition-all duration-300 shadow-inner resize-none"
              />
            </div>

            <div>
              <label
                htmlFor="resolutionCriteria"
                className="block text-gray-300 font-medium mb-2 text-sm"
              >
                Resolution Criteria
              </label>
              <textarea
                id="resolutionCriteria"
                name="resolutionCriteria"
                value={formData.resolutionCriteria}
                onChange={handleInputChange}
                rows={2}
                placeholder="Explain clearly how this prediction will be resolved"
                className="w-full bg-[#111] border border-zinc-800 rounded-lg px-4 py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600/50 transition-all duration-300 shadow-inner resize-none"
              />
            </div>

          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-gray-300 font-medium mb-2 text-sm">
                Market Categories
              </label>

              {/* Selected Categories Display */}
              {formData.tags && formData.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-600/20 to-orange-700/20 border border-orange-600/30 text-orange-300 px-2 py-1 rounded-md text-xs font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(tag)}
                        className="text-orange-400 hover:text-orange-200 transition-colors"
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
                  className="w-full bg-[#111] border border-zinc-800 rounded-lg px-4 py-3 text-left text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-orange-600/50 transition-all duration-300 shadow-inner flex items-center justify-between hover:border-orange-600/50"
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
                    className={`w-4 h-4 transition-transform duration-200 ${
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
                  <div className="absolute z-10 w-full mt-1 bg-[#111] border border-zinc-800 rounded-lg shadow-xl max-h-64 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-zinc-800 bg-[#0a0a0a]">
                      <div className="relative">
                        <svg
                          className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
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
                          id="category-search"
                          type="text"
                          placeholder="Search categories..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                          className="w-full bg-[#111] border border-zinc-700 rounded-md pl-8 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-600/50 focus:border-orange-600/50 transition-all duration-200"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    {/* Categories List */}
                    <div className="max-h-44 overflow-y-auto category-dropdown-scroll">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => {
                          const isSelected = formData.tags?.includes(category);
                          return (
                            <button
                              key={category}
                              type="button"
                              onClick={() => handleCategorySelect(category)}
                              className={`w-full px-3 py-2 text-left text-sm transition-all duration-200 flex items-center justify-between hover:bg-zinc-800/50 ${
                                isSelected
                                  ? "bg-orange-600/10 text-orange-300 border-r-2 border-orange-600"
                                  : "text-gray-300 hover:text-white"
                              }`}
                            >
                              <span>{category}</span>
                              {isSelected && (
                                <svg
                                  className="w-3.5 h-3.5 text-orange-500"
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
                        <div className="px-3 py-2 text-gray-400 text-center text-sm">
                          No categories found for "{searchTerm}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2 text-sm">
                Upload Image
              </label>
              <div
                className={`border-2 border-dashed ${
                  imagePreview ? "border-green-500" : "border-zinc-800"
                } rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:border-orange-600 transition-all duration-300 bg-[#111]`}
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-32 sm:max-h-48 mx-auto rounded-lg object-cover ring-2 ring-orange-600/20"
                  />
                ) : (
                  <p className="text-gray-400 text-sm sm:text-base">
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

            <AppleTimePicker
              date={formData.endDate}
              time={formData.endTime}
              onDateChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
              onTimeChange={(time) => setFormData(prev => ({ ...prev, endTime: time }))}
              timezone={UTCTimeHelpers.getUserTimezone()}
              required
            />
          </div>
        </form>

        <div className="mt-6 sm:mt-8">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-br from-orange-600 to-orange-700 shadow-orange-500/20 p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-orange-500/40 hover:scale-[1.01] hover:from-orange-500 hover:to-orange-600 text-white font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePredictionForm;