'use client';

import { FC } from 'react';
import { useSurveillance } from '@/hooks/useSurveillance';
import { getRiskColor } from '@/lib/utils';
import { getPrivacyRiskDescription } from '@/lib/surveillance';

export const SurveillanceView: FC = () => {
  const { data, trackerView, loading } = useSurveillance();

  if (loading || !data || !trackerView) {
    return (
      <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const riskInfo = getPrivacyRiskDescription(data.trackingRisk);

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className={`p-6 bg-gradient-to-br from-${data.trackingRisk === 'high' ? 'red' : data.trackingRisk === 'medium' ? 'yellow' : 'green'}-900/20 to-transparent border border-${data.trackingRisk === 'high' ? 'red' : data.trackingRisk === 'medium' ? 'yellow' : 'green'}-500/30 rounded-xl`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className={`text-2xl font-bold ${riskInfo.color} mb-1`}>
              {riskInfo.title}
            </h3>
            <p className="text-gray-400">{riskInfo.description}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${getRiskColor(data.trackingRisk)}`}>
            <span className="font-semibold uppercase text-xs">
              {data.trackingRisk} Risk
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-zinc-950/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Exposed Transactions</p>
            <p className="text-2xl font-bold text-red-400">{data.exposedTransactions}</p>
          </div>
          <div className="p-4 bg-zinc-950/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Protected Transactions</p>
            <p className="text-2xl font-bold text-green-400">{data.protectedTransactions}</p>
          </div>
          <div className="p-4 bg-zinc-950/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Balance Status</p>
            <p className="text-lg font-bold">
              {data.balanceExposed ? (
                <span className="text-red-400">Exposed</span>
              ) : (
                <span className="text-green-400">Protected</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* What Trackers Can See */}
      <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>👁️</span>
          What Surveillance Tools Can See
        </h3>

        <div className="space-y-4">
          {/* Visible Transactions */}
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-400">Transaction History</span>
              <span className="text-xs text-red-400/70">{trackerView.visibleTransactions} visible</span>
            </div>
            <p className="text-xs text-gray-400">
              All your public transactions are indexed and can be analyzed for patterns.
            </p>
          </div>

          {/* Known Interactions */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-400">Known Interactions:</h4>
            {trackerView.knownInteractions.map((interaction: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                {interaction}
              </div>
            ))}
          </div>

          {/* Tracking Capabilities */}
          <div className="pt-4 border-t border-zinc-900">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Tracking Capabilities:</h4>
            <div className="grid gap-2">
              {trackerView.trackingCapabilities.map((capability: string, i: number) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-black rounded-lg">
                  <span className="text-red-500 mt-0.5">⚠️</span>
                  <span className="text-xs text-gray-400">{capability}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-amber-500/30 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>💡</span>
            Recommendations
          </h3>
          <div className="space-y-3">
            {data.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-zinc-950/50 rounded-lg">
                <span className="text-amber-500 mt-0.5">→</span>
                <span className="text-sm text-gray-300">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
