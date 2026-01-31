import { Connection, PublicKey } from '@solana/web3.js';
import { SurveillanceData, PrivacyScore } from '@/types';
import { connection } from './solana';
import { calculatePrivacyScore } from './utils';

/**
 * Surveillance Detection and Privacy Scoring
 * Analyzes wallet exposure to various tracking methods
 */

export class SurveillanceMonitor {
  private connection: Connection;

  constructor(customConnection?: Connection) {
    this.connection = customConnection || connection;
  }

  /**
   * Analyze wallet for surveillance exposure
   */
  async analyzeSurveillance(walletAddress: PublicKey): Promise<SurveillanceData> {
    try {
      // Get protected transaction counts from localStorage
      // Stealth transfers (Privacy Cash ZK-SNARKs)
      const stealthTxKey = `stealth_tx_${walletAddress.toBase58()}`;
      const stealthTransactions = parseInt(localStorage.getItem(stealthTxKey) || '0', 10);

      // Mixer transfers (MagicBlock TEE)
      const mixerTxKey = `mixer_tx_${walletAddress.toBase58()}`;
      const mixerTransactions = parseInt(localStorage.getItem(mixerTxKey) || '0', 10);

      // Total protected transactions
      const protectedTransactions = stealthTransactions + mixerTransactions;

      // Exposed transactions are tracked separately (public transfers without privacy)
      // Note: We can't derive this from totalTransactions - protectedTransactions because
      // protected transactions also appear on-chain (they're just privacy-enhanced)
      const exposedTxKey = `exposed_tx_${walletAddress.toBase58()}`;
      let exposedTransactions = parseInt(localStorage.getItem(exposedTxKey) || '0', 10);

      // Initialize exposed transactions for first-time users
      // If no counters exist yet, assume all historical on-chain txs are exposed
      const initializedKey = `surveillance_initialized_${walletAddress.toBase58()}`;
      if (!localStorage.getItem(initializedKey)) {
        const signatures = await this.connection.getSignaturesForAddress(walletAddress, {
          limit: 100,
        });
        // All historical transactions are considered exposed since they weren't protected by Shieldlane
        exposedTransactions = signatures.length;
        localStorage.setItem(exposedTxKey, exposedTransactions.toString());
        localStorage.setItem(initializedKey, 'true');
      }

      // Calculate exposure ratio
      const totalPrivacyActivity = exposedTransactions + protectedTransactions;
      const exposureRatio = totalPrivacyActivity > 0 ? exposedTransactions / totalPrivacyActivity : 1;

      // Determine tracking risk
      let trackingRisk: 'low' | 'medium' | 'high';
      if (exposureRatio < 0.3) trackingRisk = 'low';
      else if (exposureRatio < 0.7) trackingRisk = 'medium';
      else trackingRisk = 'high';

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        exposedTransactions,
        protectedTransactions,
        trackingRisk
      );

      return {
        walletAddress: walletAddress.toBase58(),
        exposedTransactions,
        protectedTransactions,
        balanceExposed: protectedTransactions === 0, // Balance exposed if no privacy protection
        trackingRisk,
        recommendations,
      };
    } catch (error) {
      console.error('Error analyzing surveillance:', error);
      return {
        walletAddress: walletAddress.toBase58(),
        exposedTransactions: 0,
        protectedTransactions: 0,
        balanceExposed: true,
        trackingRisk: 'high',
        recommendations: ['Unable to analyze wallet'],
      };
    }
  }

  /**
   * Calculate comprehensive privacy score
   */
  async calculatePrivacyScore(
    walletAddress: PublicKey,
    privacyCashCoverage: number = 0, // 0-100 percentage
    usesMagicBlockMixer: boolean = false
  ): Promise<PrivacyScore> {
    try {
      const surveillance = await this.analyzeSurveillance(walletAddress);

      const score = calculatePrivacyScore(
        surveillance.protectedTransactions,
        surveillance.exposedTransactions + surveillance.protectedTransactions,
        privacyCashCoverage,
        usesMagicBlockMixer
      );

      const exposedDataPoints = this.identifyExposedData(surveillance);

      // Get individual transaction counts for accurate descriptions
      const stealthTxKey = `stealth_tx_${walletAddress.toBase58()}`;
      const stealthTxCount = parseInt(localStorage.getItem(stealthTxKey) || '0', 10);
      const mixerTxKey = `mixer_tx_${walletAddress.toBase58()}`;
      const mixerTxCount = parseInt(localStorage.getItem(mixerTxKey) || '0', 10);

      const protectedDataPoints = this.identifyProtectedData(
        privacyCashCoverage > 0,
        usesMagicBlockMixer,
        stealthTxCount,
        mixerTxCount
      );

      return {
        score,
        exposedDataPoints,
        protectedDataPoints,
        recommendations: this.generateEnhancedRecommendations(
          privacyCashCoverage,
          usesMagicBlockMixer,
          surveillance.trackingRisk
        ),
      };
    } catch (error) {
      console.error('Error calculating privacy score:', error);
      return {
        score: 0,
        exposedDataPoints: ['Unable to calculate'],
        protectedDataPoints: [],
        recommendations: [],
      };
    }
  }

  /**
   * Generate privacy recommendations
   */
  private generateRecommendations(
    exposed: number,
    protectedCount: number,
    risk: 'low' | 'medium' | 'high'
  ): string[] {
    const recommendations: string[] = [];

    if (risk === 'high') {
      recommendations.push('Immediately start using Privacy Cash to shield your balance');
      recommendations.push('Use Stealth Mode for all future transactions');
      recommendations.push('Consider creating a new wallet for sensitive operations');
    } else if (risk === 'medium') {
      recommendations.push('Increase usage of privacy-preserving transactions');
      recommendations.push('Shield more of your balance in privacy pools');
    } else {
      recommendations.push('Continue using privacy features regularly');
      recommendations.push('Monitor your privacy score monthly');
    }

    if (exposed > 50) {
      recommendations.push('Your transaction history is highly exposed to trackers');
    }

    if (protectedCount === 0) {
      recommendations.push('Start by depositing to Privacy Cash pool');
    }

    return recommendations;
  }

  /**
   * Identify exposed data points
   */
  private identifyExposedData(surveillance: SurveillanceData): string[] {
    const exposed: string[] = [];

    if (surveillance.balanceExposed) {
      exposed.push('Current wallet balance visible on block explorer');
    }

    if (surveillance.exposedTransactions > 0) {
      exposed.push(`${surveillance.exposedTransactions} public transactions visible`);
      exposed.push('Transaction amounts are publicly visible');
      exposed.push('Sender and recipient addresses are linked');
      exposed.push('Transaction timestamps are public');
    }

    if (surveillance.trackingRisk === 'high') {
      exposed.push('Wallet activity can be clustered and analyzed');
      exposed.push('Vulnerable to front-running attacks');
      exposed.push('Trading patterns are detectable');
    }

    return exposed;
  }

  /**
   * Identify protected data points
   */
  private identifyProtectedData(
    hasPrivateBalance: boolean,
    usesMagicBlockMixer: boolean,
    stealthTxCount: number,
    mixerTxCount: number
  ): string[] {
    const protectedData: string[] = [];

    if (hasPrivateBalance) {
      protectedData.push('Portion of balance hidden in privacy pool');
      protectedData.push('True holdings are obfuscated');
    }

    if (usesMagicBlockMixer) {
      protectedData.push('MagicBlock TEE Mixer adds untraceable layer');
      protectedData.push('TEE execution hides transaction patterns');
    }

    // Stealth transfers (Privacy Cash ZK-SNARKs)
    if (stealthTxCount > 0) {
      protectedData.push(`${stealthTxCount} transaction${stealthTxCount > 1 ? 's' : ''} protected with ZK proofs`);
    }

    // Mixer transfers (MagicBlock TEE)
    if (mixerTxCount > 0) {
      protectedData.push(`${mixerTxCount} transaction${mixerTxCount > 1 ? 's' : ''} secured with MagicBlock TEE`);
    }

    if (stealthTxCount > 0 || mixerTxCount > 0) {
      protectedData.push('Deposit-withdrawal links are broken');
      protectedData.push('Anonymity set provides plausible deniability');
    }

    return protectedData;
  }

  /**
   * Generate enhanced privacy recommendations
   */
  private generateEnhancedRecommendations(
    privacyCashCoverage: number,
    usesMagicBlockMixer: boolean,
    risk: 'low' | 'medium' | 'high'
  ): string[] {
    const recommendations: string[] = [];

    // Privacy Cash recommendations
    if (privacyCashCoverage === 0) {
      recommendations.push('Start by depositing to Privacy Cash pool');
    } else if (privacyCashCoverage < 50) {
      recommendations.push(`Increase Privacy Cash coverage (currently ${privacyCashCoverage.toFixed(0)}%)`);
    }

    // MagicBlock Mixer recommendations
    if (!usesMagicBlockMixer) {
      recommendations.push('Use MagicBlock Mixer for maximum privacy and untraceable transfers');
    }

    // Risk-based recommendations
    if (risk === 'high') {
      recommendations.push('Immediately increase privacy protection - your activity is highly exposed');
      recommendations.push('Consider creating a new wallet for sensitive operations');
    } else if (risk === 'medium') {
      recommendations.push('Use Stealth Mode for all future transactions');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue using privacy features regularly');
      recommendations.push('Monitor your privacy score monthly');
    }

    return recommendations;
  }
}

/**
 * Simulate what surveillance tools can see
 */
export const simulateTrackerView = async (
  walletAddress: PublicKey
): Promise<{
  visibleBalance: number;
  visibleTransactions: number;
  knownInteractions: string[];
  trackingCapabilities: string[];
}> => {
  try {
    const balance = await connection.getBalance(walletAddress);
    const signatures = await connection.getSignaturesForAddress(walletAddress, { limit: 10 });

    return {
      visibleBalance: balance,
      visibleTransactions: signatures.length,
      knownInteractions: [
        'All transaction partners visible',
        'Transaction amounts visible',
        'Timing patterns visible',
      ],
      trackingCapabilities: [
        'Wallet clustering (linking multiple addresses)',
        'Transaction graph analysis',
        'Balance tracking over time',
        'Front-running detection',
        'MEV extraction opportunities',
      ],
    };
  } catch (error) {
    console.error('Error simulating tracker view:', error);
    return {
      visibleBalance: 0,
      visibleTransactions: 0,
      knownInteractions: [],
      trackingCapabilities: [],
    };
  }
};

/**
 * Get privacy risk level description
 */
export const getPrivacyRiskDescription = (
  risk: 'low' | 'medium' | 'high'
): { title: string; description: string; color: string } => {
  switch (risk) {
    case 'low':
      return {
        title: 'Low Risk',
        description: 'Your privacy is well protected. Continue current practices.',
        color: 'text-green-500',
      };
    case 'medium':
      return {
        title: 'Medium Risk',
        description: 'Some exposure detected. Consider increasing privacy measures.',
        color: 'text-yellow-500',
      };
    case 'high':
      return {
        title: 'High Risk',
        description: 'Significant exposure detected. Immediate action recommended.',
        color: 'text-red-500',
      };
  }
};

// Export singleton
export const surveillanceMonitor = new SurveillanceMonitor();
