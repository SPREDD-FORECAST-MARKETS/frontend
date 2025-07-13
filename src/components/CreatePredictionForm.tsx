import { useEffect, useState } from "react";
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
import type { FormData } from "../lib/interface";

const MAX_IMAGE_SIZE = 1024 * 1024;

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
    initialLiquidity: "10",
    createOnChain: true,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [marketContractAddress, setMarketContractAddress] = useState<
    string | null
  >(null);
  const [marketId, setMarketId] = useState<string | null>(null);
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

    if (name === "tags") {
      setFormData((prev) => ({
        ...prev,
        tags: value.split(",").map((cat) => cat.trim()),
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
      const durationSeconds = Math.floor(
        (endDateTime.getTime() - now.getTime()) / 1000
      );

      await createSmartContractMarket(
        formData.title,
        formData.options[0],
        formData.options[1],
        durationSeconds
      );
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
          marketContractAddress,
          marketId || "",
          formData.tags || null
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
          const marketId = parsed.args.marketId;
          setMarketId(marketId);
          success("Market created successfully!");

          break;
        }
      } catch (err) {
        // Not a MarketCreated log
        setMarketContractAddress(null);
      }
    }
  }, [receipt]);

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

    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* LEFT COLUMN */}
      <div className="space-y-8">
        <div>
          <label htmlFor="title" className="block text-gray-400 font-medium mb-3 text-xs uppercase tracking-wider">
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
          <label htmlFor="description" className="block text-gray-400 font-medium mb-3 text-xs uppercase tracking-wider">
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
          <label htmlFor="resolutionCriteria" className="block text-gray-400 font-medium mb-3 text-xs uppercase tracking-wider">
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

        <div>
          <label htmlFor="tags" className="block text-gray-400 font-medium mb-3 text-xs uppercase tracking-wider">
            Market Category
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={(formData.tags ?? []).join(", ")}
            onChange={handleInputChange}
            placeholder="e.g. Crypto, Sports"
            className="w-full bg-[#111] border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600/50 transition-all duration-300 shadow-inner"
          />
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-8">
        <div>
          <label className="block text-gray-400 font-medium mb-3 text-xs uppercase tracking-wider">
            Upload Image
          </label>
          <div
            className={`border-2 border-dashed ${imagePreview ? "border-green-500" : "border-zinc-800"} rounded-2xl p-8 text-center cursor-pointer hover:border-orange-600 transition-all duration-300 bg-[#111]`}
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-h-56 mx-auto rounded-2xl object-cover ring-2 ring-orange-600/20" />
            ) : (
              <p className="text-gray-400 text-base">Drag & drop or click (max 1MB)</p>
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
            End Time {/* here we can add country like endtime in (Asia/Tokyo) */}
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

        <div>
          <label htmlFor="initialLiquidity" className="block text-gray-400 font-medium mb-3 text-xs uppercase tracking-wider">
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
            className="w-full bg-[#111] border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600/50 transition-all duration-300 shadow-inner"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-br from-orange-600 to-orange-700 shadow-orange-500/20 p-4 rounded-xl transition-all duration-300 hover:shadow-orange-500/40 hover:scale-105 hover:from-orange-500 hover:to-orange-600 text-white font-bold"
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
