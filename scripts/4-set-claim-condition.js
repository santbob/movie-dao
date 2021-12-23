import sdk from './1-initialize-sdk.js';

const bundleDropModule = sdk.getBundleDropModule("  ");

(
  async () => {
    try {
      const claimConditionFactory = bundleDropModule.getClaimConditionFactory();
      // specify condition
      claimConditionFactory.newClaimPhase({
        startTime: new Date(),
        maxQuantity: 50_000,
        maxQuantityPerTransaction: 1,
      });

      await bundleDropModule.setClaimCondition(0, claimConditionFactory);
      console.log("✅ Sucessfully set claim condition!");
    } catch (error) {
      console.log("Failed to set claim condition", error);
      process.exit(1);
    }
  }
)();