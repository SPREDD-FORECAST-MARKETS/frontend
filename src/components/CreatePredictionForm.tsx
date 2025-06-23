import { useEffect, useState } from "react";
import { FiInfo, FiCalendar } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { uploadFile } from "../apis/files";
import { createMarket } from "../apis/market";
import { getAccessToken } from "@privy-io/react-auth";
import { useCreateMarket, useInitializeMarket } from "../hooks/useCreateMarket";
import React from "react";
import { toISO8601 } from "../utils/helpers";
import { useSwitchChain, useWaitForTransactionReceipt } from "wagmi";
import { decodeEventLog, parseAbiItem } from "viem";
import { baseSepolia } from "viem/chains";
import { useUsdtToken } from "../hooks/useToken";
import { CONTRACT_ADDRESSES } from "../utils/wagmiConfig";

interface FormData {
  title: string;
  options: string[];
  resolutionCriteria: string;
  marketCategory: string[];
  endDate: number | string;
  endTime: number | string;
  image?: File;
  description: string;
  initialLiquidity: string;
  createOnChain: boolean;
}

const MAX_IMAGE_SIZE = 1024 * 1024;

const CreatePredictionForm = () => {
  const { error, success } = useToast();

  const [formData, setFormData] = useState<FormData>({
    title: "Will Bitcoin reach $100k by June 10th?",
    options: ["Yes", "No"],
    description: "Bitcoin price prediction market",
    resolutionCriteria: "Based on CoinGecko price data",
    marketCategory: ["Crypto"],
    endDate: "2025-08-06",
    endTime: "14:00",
    initialLiquidity: "10",
    createOnChain: true,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [marketContractAddress, setMarketContractAddress] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setHasInitialized] = useState(false);

  const { switchChain } = useSwitchChain();

  const { createMarket: createSmartContractMarket, hash: contractHash } =
    useCreateMarket();

  const { data: receipt } = useWaitForTransactionReceipt({
    hash: contractHash,
  });
  const marketCreatedEvent = parseAbiItem(
    "event MarketCreated(bytes32 indexed marketId, address indexed marketContract, address indexed owner, address token, string question, string optionA, string optionB, uint256 endTime)"
  );

  const { initializeMarket } = useInitializeMarket();
  const { approve } = useUsdtToken();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "marketCategory") {
      setFormData((prev) => ({
        ...prev,
        marketCategory: value.split(",").map((cat) => cat.trim()),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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

    await switchChain({ chainId: baseSepolia.id });

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      const now = new Date();
      const durationDays = Math.ceil(
        (endDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log(durationDays);

      // Step 1: Create smart contract market
      await createSmartContractMarket(
        formData.title,
        formData.options[0],
        formData.options[1],
        endDateTime.getTime() / 1000
      );

      // Note: Market initialization will be handled by the useEffect when contractHash is available
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      error("Failed to create prediction");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (marketContractAddress === null) return;

    const handleMarketInitialization = async () => {
      try {
        await approve({
          tokenAddress: CONTRACT_ADDRESSES.token as `0x${string}`,
          spender: marketContractAddress as `0x${string}`,
          usdAmount: parseFloat(formData.initialLiquidity),
          decimals: 6,
        });
      } catch {
        error("Couldn't approve USDT token");
        return;
      }

      try {
        await initializeMarket(
          marketContractAddress as `0x${string}`,
          formData.initialLiquidity
        );

        const dateStr = toISO8601(
          String(formData.endDate),
          String(formData.endTime)
        );

        const authToken = await getAccessToken();
        const [, status] = await createMarket(
          authToken!,
          formData.title,
          formData.resolutionCriteria,
          formData.description,
          dateStr || 0,
          uploadedImageUrl ||
            "https://rrgzufevhpeypfviivan.supabase.co/storage/v1/object/public/spreadd/market/1750689653867_photo_5103127210662931859_y.jpg",
          marketContractAddress
        );

        if (status === -1) {
          error("Failed to create Prediction!", 3);
          return;
        }

        success("Prediction created successfully!");
        setImagePreview(null);
        setHasInitialized(false);
        success("Market initialization transaction submitted!");
      } catch (err) {
        console.error("Error initializing market:", err);
        error("Failed to initialize market");
      }
    };

    handleMarketInitialization();
  }, [marketContractAddress]);

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
          setMarketContractAddress(marketContract);
          break;
        }
      } catch (err) {
        // Not a MarketCreated log
        console.log("error occurred: ", err);
        setMarketContractAddress(null);
      }
    }
  }, [receipt]);

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 sm:px-0">
      <div className="text-center mb-6">
        <Link
          to="/"
          className="text-gray-400 hover:text-gray-200 transition-colors duration-200 text-sm uppercase tracking-wider"
        >
          [ Go Back ]
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-5 sm:p-6">
          <h2 className="text-2xl font-bold text-white mb-7 text-center">
            Create Prediction
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label
                htmlFor="title"
                className="block text-gray-400 font-medium mb-2 text-sm uppercase tracking-wider"
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
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                required
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="description"
                className="block text-gray-400 font-medium mb-2 text-sm uppercase tracking-wider"
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
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="resolutionCriteria"
                className="block text-gray-400 font-medium mb-2 text-sm uppercase tracking-wider"
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
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="marketCategory"
                className="block text-gray-400 font-medium mb-2 text-sm uppercase tracking-wider"
              >
                Market Category
              </label>
              <textarea
                id="marketCategory"
                name="marketCategory"
                value={formData.marketCategory.join(", ")}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter categories separated by commas (e.g., Sports, Politics)"
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="initialLiquidity"
                className="block text-gray-400 font-medium mb-2 text-sm uppercase tracking-wider"
              >
                Initial Liquidity (USDT)
              </label>
              <input
                type="number"
                id="initialLiquidity"
                name="initialLiquidity"
                value={formData.initialLiquidity}
                onChange={handleInputChange}
                step="0.001"
                min="0.001"
                placeholder="Enter initial liquidity amount"
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-400 font-medium mb-2 text-sm uppercase tracking-wider">
                Upload Image
              </label>
              <div
                className={`border-2 border-dashed ${
                  imagePreview ? "border-green-500" : "border-gray-700"
                } rounded-md p-5 sm:p-6 text-center cursor-pointer hover:border-orange-500 transition-colors duration-200`}
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                {imagePreview ? (
                  <div className="flex justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-40 rounded object-cover max-w-full h-auto"
                    />
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    <p>Drag and drop photo or click to upload (max 1MB)</p>
                  </div>
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

            <div className="mb-6">
              <div className="flex items-center">
                <label className="block text-gray-400 font-medium mb-2 text-sm uppercase tracking-wider">
                  End Time
                </label>
                <button
                  type="button"
                  className="ml-2 text-gray-500 hover:text-orange-500 transition-colors duration-200"
                  title="Help"
                >
                  <FiInfo size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 appearance-none"
                    required
                  />
                  <label
                    htmlFor="endDate"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  >
                    <FiCalendar
                      className="text-gray-500 hover:text-orange-500 transition-colors duration-200"
                      size={18}
                    />
                  </label>
                </div>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 appearance-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 text-lg mb-4"
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePredictionForm;
