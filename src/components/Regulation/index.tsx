import React, { useState, useEffect } from 'react';
import { Header } from '@aragon/ui';

import {
  getCouponPremium,
  getTotalCoupons, getTotalCouponsUnderlying,
  getPoolTotalClaimable, getPoolTotalRewarded, getTokenBalance,
  getTokenTotalSupply, getTotalBonded, getTotalDebt, getTotalRedeemable, getTotalStaged,
} from '../../utils/infura';
import {EXED, EXEDS, UNI} from "../../constants/tokens";
import {toTokenUnitsBN} from "../../utils/number";
import BigNumber from "bignumber.js";
import RegulationHeader from "./Header";
import RegulationHistory from "./RegulationHistory";
import IconHeader from "../common/IconHeader";
import {getLegacyPoolAddress, getPoolAddress} from "../../utils/pool";

const ONE_COUPON = new BigNumber(10).pow(18);

function Regulation({ user }: {user: string}) {

  const [totalSupply, setTotalSupply] = useState(new BigNumber(0));
  const [totalBonded, setTotalBonded] = useState(new BigNumber(0));
  const [totalStaged, setTotalStaged] = useState(new BigNumber(0));
  const [totalRedeemable, setTotalRedeemable] = useState(new BigNumber(0));
  const [poolLiquidity, setPoolLiquidity] = useState(new BigNumber(0));
  const [poolTotalRewarded, setPoolTotalRewarded] = useState(new BigNumber(0));
  const [poolTotalClaimable, setPoolTotalClaimable] = useState(new BigNumber(0));
  const [legacyPoolTotalRewarded, setLegacyPoolTotalRewarded] = useState(new BigNumber(0));
  const [legacyPoolTotalClaimable, setLegacyPoolTotalClaimable] = useState(new BigNumber(0));
  const [totalDebt, setTotalDebt] = useState(new BigNumber(0));
  const [totalCoupons, setTotalCoupons] = useState(new BigNumber(0));
  const [totalCouponsUnderlying, setTotalCouponsUnderlying] = useState(new BigNumber(0));
  const [couponPremium, setCouponPremium] = useState(new BigNumber(0));

  useEffect(() => {
    let isCancelled = false;

    async function updateUserInfo() {
      const poolAddress = await getPoolAddress();
      const legacyPoolAddress = getLegacyPoolAddress(poolAddress);

      const [
        totalSupplyStr,
        totalBondedStr, totalStagedStr, totalRedeemableStr,
        poolLiquidityStr, poolTotalRewardedStr, poolTotalClaimableStr,
        legacyPoolTotalRewardedStr, legacyPoolTotalClaimableStr,
        totalDebtStr, totalCouponsStr, totalCouponsUnderlyingStr
      ] = await Promise.all([
        getTokenTotalSupply(EXED.addr),

        getTotalBonded(EXEDS.addr),
        getTotalStaged(EXEDS.addr),
        getTotalRedeemable(EXEDS.addr),

        getTokenBalance(EXED.addr, UNI.addr),
        getPoolTotalRewarded(poolAddress),
        getPoolTotalClaimable(poolAddress),

        getPoolTotalRewarded(legacyPoolAddress),
        getPoolTotalClaimable(legacyPoolAddress),

        getTotalDebt(EXEDS.addr),
        getTotalCoupons(EXEDS.addr),
        getTotalCouponsUnderlying(EXEDS.addr),
      ]);

      if (!isCancelled) {
        setTotalSupply(toTokenUnitsBN(totalSupplyStr, EXED.decimals));

        setTotalBonded(toTokenUnitsBN(totalBondedStr, EXED.decimals));
        setTotalStaged(toTokenUnitsBN(totalStagedStr, EXED.decimals));
        setTotalRedeemable(toTokenUnitsBN(totalRedeemableStr, EXED.decimals));

        setPoolLiquidity(toTokenUnitsBN(poolLiquidityStr, EXED.decimals));
        setPoolTotalRewarded(toTokenUnitsBN(poolTotalRewardedStr, EXED.decimals));
        setPoolTotalClaimable(toTokenUnitsBN(poolTotalClaimableStr, EXED.decimals));

        setLegacyPoolTotalRewarded(toTokenUnitsBN(legacyPoolTotalRewardedStr, EXED.decimals));
        setLegacyPoolTotalClaimable(toTokenUnitsBN(legacyPoolTotalClaimableStr, EXED.decimals));

        setTotalDebt(toTokenUnitsBN(totalDebtStr, EXED.decimals));
        setTotalCoupons(toTokenUnitsBN(totalCouponsStr, EXED.decimals));
        setTotalCouponsUnderlying(toTokenUnitsBN(totalCouponsUnderlyingStr, EXED.decimals));

        if (new BigNumber(totalDebtStr).isGreaterThan(ONE_COUPON)) {
          const couponPremiumStr = await getCouponPremium(EXEDS.addr, ONE_COUPON)
          setCouponPremium(toTokenUnitsBN(couponPremiumStr, EXED.decimals));
        } else {
          setCouponPremium(new BigNumber(0));
        }
      }
    }
    updateUserInfo();
    const id = setInterval(updateUserInfo, 15000);

    // eslint-disable-next-line consistent-return
    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [user]);

  return (
    <>
      <IconHeader icon={<i className="fas fa-chart-area"/>} text="Supply Regulation"/>

      <RegulationHeader
        totalSupply={totalSupply}

        totalBonded={totalBonded}
        totalStaged={totalStaged}
        totalRedeemable={totalRedeemable}

        poolLiquidity={poolLiquidity}
        poolRewarded={poolTotalRewarded}
        poolClaimable={poolTotalClaimable}

        legacyPoolRewarded={legacyPoolTotalRewarded}
        legacyPoolClaimable={legacyPoolTotalClaimable}

        totalDebt={totalDebt}
        totalCoupons={totalCoupons}
        totalCouponsUnderlying={totalCouponsUnderlying}
        couponPremium={couponPremium}
      />

      <Header primary="Regulation History" />

      <RegulationHistory
        user={user}
      />
    </>
  );
}

export default Regulation;
