import { Link } from "react-router-dom";

const TermsConditions = () => {
  return (
    <div className="min-h-screen text-white" id="top">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-orange-400">
            Terms of Use
          </h1>
          <p className="text-gray-400 text-lg">Effective Date: July 4, 2025</p>
          <div className="mt-4 text-gray-300">
            <p>
              <strong>Platform:</strong> Spredd Markets ("Spredd", "we", "our",
              "us")
            </p>
            <p>
              <strong>Website: </strong>
              <Link
                to="https://spredd.markets"
                target="_blank"
                className="hover:underline text-blue-500 "
              >
                https://spredd.markets
              </Link>
            </p>
            <p>
              <strong>Network:</strong> Built on Base, powered by $SPRDD token
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4 text-orange-400">
            1. Acceptance of Terms
          </h2>
          <p className="mb-6 leading-relaxed">
            By accessing or using Spredd Markets, including our website,
            protocol, testnet, or mobile platform, you agree to these Terms of
            Use ("Terms"), our Privacy Policy, and any other applicable
            policies. If you do not agree, you may not use Spredd.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-orange-400">
            2. Eligibility
          </h2>
          <p className="mb-4">To use Spredd Markets, you must:</p>
          <ul className="mb-6 space-y-1">
            <li>
              Be at least 18 years of age (or the age of legal majority in your
              jurisdiction)
            </li>
            <li>
              Not be located in or a resident of any jurisdiction where the use
              of Spredd would violate applicable laws (e.g. sanctioned
              jurisdictions)
            </li>
            <li>
              Comply with all applicable local, state, and federal laws when
              using the platform
            </li>
          </ul>

          <h2 className="text-2xl font-bold mb-4 text-orange-400">
            3. Platform Overview
          </h2>
          <p className="mb-4">
            Spredd is a decentralized forecasting protocol where users:
          </p>
          <ul className="mb-4 space-y-1">
            <li>Create and participate in YES/NO markets</li>
            <li>
              Earn non-transferable Forecast Points (FP) based on prediction
              accuracy
            </li>
            <li>Unlock Soulbound NFTs (SBTs) based on platform activity</li>
            <li>
              Engage with Autonomous Forecasting & Creator Agents (AI models)
            </li>
            <li>
              Use the $SPRDD token for market creation, staking, governance, and
              access
            </li>
          </ul>
          <p className="mb-6 font-medium">
            Spredd does not offer financial advice or investment services.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-orange-400">
            4. Testnet Use (No Financial Risk)
          </h2>
          <p className="mb-4">
            During testnet, all forecasts are risk-free. No real assets are used
            or lost. Users earn Forecast Points and Soulbound NFTs as
            non-monetary rewards to demonstrate skill and build reputation.
          </p>
          <p className="mb-6 font-medium">
            Testnet participation does not entitle users to any guaranteed
            financial benefit or token distribution.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-orange-400">
            5. Mainnet Use (Real Value Forecasting)
          </h2>
          <p className="mb-4">Upon mainnet launch:</p>
          <ul className="mb-4 space-y-1">
            <li>Market creation may require a fee (e.g., $3 USDT or $SPRDD)</li>
            <li>Users may place forecasts with value</li>
            <li>
              Platform rewards may include $SPRDD or other tokens, based on
              skill and results
            </li>
          </ul>
          <p className="mb-6">
            Forecasting on Spredd is not gambling. It is skill-based, and
            rewards are distributed based on measurable forecasting accuracy.
            However, if you choose to use real value, you do so at your own
            risk.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-orange-400">
            6. User Conduct
          </h2>
          <p className="mb-4">You agree to:</p>
          <ul className="mb-4 space-y-1">
            <li>Use Spredd for lawful and intended purposes only</li>
            <li>Not manipulate or spam markets</li>
            <li>Not create malicious or misleading forecasts</li>
            <li>Not impersonate others or use bots for exploitation</li>
            <li>
              Not interfere with the protocol, AI agents, or infrastructure
            </li>
          </ul>
          <p className="mb-6">
            Violations may result in removal from leaderboards, revoked access,
            or platform bans.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-orange-400">
            7. Intellectual Property
          </h2>
          <p className="mb-6">
            All original content, logos, agents, code, and design are the
            property of Spredd or its contributors. Forecast market ideas
            submitted by users may be public, reused, or featured without
            compensation.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-orange-400">
            8. Soulbound NFTs (SBTs)
          </h2>
          <p className="mb-4">
            Soulbound NFTs are non-transferable digital badges issued based on
            user achievements. These do not represent financial value or
            ownership in Spredd. They may be used for:
          </p>
          <ul className="mb-4 space-y-1">
            <li>Gating access to features</li>
            <li>On-chain identity</li>
            <li>DAO voting eligibility</li>
          </ul>
          <p className="mb-6">
            We reserve the right to revoke or update any SBT as needed to
            preserve protocol integrity.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-orange-400">
            9. $SPRDD Token Disclaimer
          </h2>
          <p className="mb-4">
            $SPRDD is a utility token. Holding it does not entitle you to
            profits, dividends, or equity. $SPRDD is used to:
          </p>
          <ul className="mb-4 space-y-1">
            <li>Pay for market creation</li>
            <li>Access forecasting tools</li>
            <li>Participate in DAO governance</li>
          </ul>
          <p className="mb-6">
            The price and availability of $SPRDD may vary. We do not guarantee
            its performance or liquidity. Using $SPRDD is entirely at your
            discretion and risk.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-orange-400">
            10. Jurisdictional Disclaimer
          </h2>
          <p className="mb-4">
            Spredd is designed for educational and entertainment purposes only.
            It is not intended for use in jurisdictions where prediction
            markets, staking, or digital assets are restricted.
          </p>
          <p className="mb-6">
            Users are solely responsible for complying with their local
            regulations. Spredd disclaims liability for any legal consequences
            related to your use of the platform.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-orange-400">
            11. Changes to Terms
          </h2>
          <p className="mb-6">
            We may update these Terms from time to time. Your continued use of
            the platform constitutes acceptance of the revised Terms. We will
            make reasonable efforts to notify users of material changes.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-orange-400">
            12. Contact Us
          </h2>
          <p className="mb-4">For questions or concerns, contact:</p>
          <p className="mb-2">
            📩 <strong className="text-orange-400">hello@spredd.markets</strong>
          </p>
          <p className="mb-6">
            📍 <strong>Discord:</strong>{" "}
            <Link
              to="https://discord.gg/rwVYSE28bP"
              className="text-orange-400 hover:underline"
            >
              https://discord.gg/rwVYSE28bP
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
