import React, {useEffect, useState} from 'react';
import {
  DataView, Button, IconCirclePlus, IconRefresh, IconCheck, IconLock
} from '@aragon/ui';

import {
  getBatchBalanceOfCoupons, getBatchBalanceOfCouponsUnderlying,
  getBatchCouponsExpiration, getCouponEpochs
} from '../../utils/infura';
import {EXED, EXEDS} from "../../constants/tokens";
import {formatBN, toBaseUnitBN, toTokenUnitsBN} from "../../utils/number";
import BigNumber from "bignumber.js";
import { redeemCoupons, migrateCoupons } from "../../utils/web3";

type PurchaseHistoryProps = {
  user: string,
  hideRedeemed: boolean,
  totalRedeemable: BigNumber
};

function PurchaseHistory({
  user, hideRedeemed, totalRedeemable
}: PurchaseHistoryProps) {
  const [epochs, setEpochs] = useState([]);
  const [page, setPage] = useState(0)
  const [initialized, setInitialized] = useState(false)

  //Update User balances
  useEffect(() => {
    if (user === '') return;
    let isCancelled = false;

    async function updateUserInfo() {
      const epochsFromEvents = await getCouponEpochs(EXEDS.addr, user);
      const epochNumbers = epochsFromEvents.map(e => parseInt(e.epoch));
      const balanceOfCouponsPremium = await getBatchBalanceOfCoupons(EXEDS.addr, user, epochNumbers);
      const balanceOfCouponsPrincipal = await getBatchBalanceOfCouponsUnderlying(EXEDS.addr, user, epochNumbers);
      const couponsExpirations = await getBatchCouponsExpiration(EXEDS.addr, epochNumbers);

      const couponEpochs = epochsFromEvents.map((epoch, i) => {
        epoch.principal = new BigNumber(balanceOfCouponsPrincipal[i]);
        epoch.premium = new BigNumber(balanceOfCouponsPremium[i]);
        epoch.expiration = couponsExpirations[i];
        return epoch;
      });

      if (!isCancelled) {
        // @ts-ignore
        setEpochs(couponEpochs);
        setInitialized(true);
      }
    }
    updateUserInfo();
    const id = setInterval(updateUserInfo, 15000);

    // eslint-disable-next-line consistent-return
    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [user, totalRedeemable]);

  return (
    <DataView
      fields={['Epoch', 'Purchased', 'Principal', 'Premium', 'Expires', '']}
      status={ initialized ? 'default' : 'loading' }
      // @ts-ignore
      entries={hideRedeemed ? epochs.filter((epoch) => !epoch.principal.isZero() || !epoch.premium.isZero()) : epochs}
      entriesPerPage={10}
      page={page}
      onPageChange={setPage}
      renderEntry={(epoch) => [
        epoch.epoch.toString(),
        formatBN(toTokenUnitsBN(epoch.coupons, EXED.decimals), 2),
        formatBN(toTokenUnitsBN(epoch.principal, EXED.decimals), 2),
        formatBN(toTokenUnitsBN(epoch.premium, EXED.decimals), 2),
        epoch.expiration.toString(),
        <CouponAction coupon={epoch} totalRedeemable={totalRedeemable} />
      ]}
    />
  );
}

type CouponActionProps = {
  coupon: any,
  totalRedeemable: BigNumber
}

function CouponAction({coupon, totalRedeemable}:CouponActionProps) {

  return (
    <>
    {/* pre-EIP-16 style coupons */
     coupon.principal.isZero() && !coupon.premium.isZero() ?
      <Button
      className="btn btn-primary"
        icon={<IconRefresh />}
        label="Migrate"
        onClick={() => migrateCoupons(EXEDS.addr, coupon.epoch)}
      />
      /* already redeemed coupons */
      : coupon.principal.isZero() ?
      <Button
      className="btn btn-primary"
        icon={<IconCheck />}
        label="Redeemed"
        disabled={true}
      />
      /* redeemable coupons */
      :
      <Button
      className="btn btn-primary"
        icon={totalRedeemable.isZero() ? <IconLock /> : <IconCirclePlus />}
        label="Redeem"
        onClick={() => redeemCoupons(
          EXEDS.addr,
          coupon.epoch,
          coupon.principal.isGreaterThan(toBaseUnitBN(totalRedeemable, EXED.decimals))
            ? toBaseUnitBN(totalRedeemable, EXED.decimals)
            : coupon.principal
        )}
        disabled={totalRedeemable.isZero()}
      />
    }
    </>
  );
}

export default PurchaseHistory;
