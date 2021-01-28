import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import BigNumber from 'bignumber.js';
import {
  getBalanceBonded,
  getBalanceOfStaged, getFluidUntil, getLockedUntil,
  getStatusOf, getTokenAllowance,
  getTokenBalance, getTokenTotalSupply,
} from '../../utils/infura';
import {EXED, EXEDS} from "../../constants/tokens";
import {DAO_EXIT_LOCKUP_EPOCHS} from "../../constants/values";
import { toTokenUnitsBN } from '../../utils/number';

import AccountPageHeader from "./Header";
import WithdrawDeposit from "./WithdrawDeposit";
import BondUnbond from "./BondUnbond";
import IconHeader from "../common/IconHeader";
import {getPoolAddress} from "../../utils/pool";
import {DollarPool2} from "../../constants/contracts";

function Wallet({ user }: {user: string}) {
  const { override } = useParams();
  if (override) {
    user = override;
  }

  const [userESDBalance, setUserESDBalance] = useState(new BigNumber(0));
  const [userESDAllowance, setUserESDAllowance] = useState(new BigNumber(0));
  const [userESDSBalance, setUserESDSBalance] = useState(new BigNumber(0));
  const [totalESDSSupply, setTotalESDSSupply] = useState(new BigNumber(0));
  const [userStagedBalance, setUserStagedBalance] = useState(new BigNumber(0));
  const [userBondedBalance, setUserBondedBalance] = useState(new BigNumber(0));
  const [userStatus, setUserStatus] = useState(0);
  const [userStatusUnlocked, setUserStatusUnlocked] = useState(0);
  const [lockup, setLockup] = useState(0);

  //Update User balances
  useEffect(() => {
    if (user === '') {
      setUserESDBalance(new BigNumber(0));
      setUserESDAllowance(new BigNumber(0));
      setUserESDSBalance(new BigNumber(0));
      setTotalESDSSupply(new BigNumber(0));
      setUserStagedBalance(new BigNumber(0));
      setUserBondedBalance(new BigNumber(0));
      setUserStatus(0);
      return;
    }
    let isCancelled = false;

    async function updateUserInfo() {
      const [
        esdBalance, esdAllowance, esdsBalance, esdsSupply, stagedBalance, bondedBalance, status, poolAddress,
        fluidUntilStr, lockedUntilStr
      ] = await Promise.all([
        getTokenBalance(EXED.addr, user),
        getTokenAllowance(EXED.addr, user, EXEDS.addr),
        getTokenBalance(EXEDS.addr, user),
        getTokenTotalSupply(EXEDS.addr),
        getBalanceOfStaged(EXEDS.addr, user),
        getBalanceBonded(EXEDS.addr, user),
        getStatusOf(EXEDS.addr, user),
        getPoolAddress(),

        getFluidUntil(EXEDS.addr, user),
        getLockedUntil(EXEDS.addr, user),
      ]);

      const userESDBalance = toTokenUnitsBN(esdBalance, EXED.decimals);
      const userESDSBalance = toTokenUnitsBN(esdsBalance, EXEDS.decimals);
      const totalESDSSupply = toTokenUnitsBN(esdsSupply, EXEDS.decimals);
      const userStagedBalance = toTokenUnitsBN(stagedBalance, EXEDS.decimals);
      const userBondedBalance = toTokenUnitsBN(bondedBalance, EXEDS.decimals);
      const userStatus = parseInt(status, 10);
      const fluidUntil = parseInt(fluidUntilStr, 10);
      const lockedUntil = parseInt(lockedUntilStr, 10);

      if (!isCancelled) {
        setUserESDBalance(new BigNumber(userESDBalance));
        setUserESDAllowance(new BigNumber(esdAllowance));
        setUserESDSBalance(new BigNumber(userESDSBalance));
        setTotalESDSSupply(new BigNumber(totalESDSSupply));
        setUserStagedBalance(new BigNumber(userStagedBalance));
        setUserBondedBalance(new BigNumber(userBondedBalance));
        setUserStatus(userStatus);
        setUserStatusUnlocked(Math.max(fluidUntil, lockedUntil))
        setLockup(poolAddress === DollarPool2 ? DAO_EXIT_LOCKUP_EPOCHS : 1);
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
      <IconHeader icon={<i className="fas fa-dot-circle"/>} text="DAO"/>

      <AccountPageHeader
        accountESDBalance={userESDBalance}
        accountESDSBalance={userESDSBalance}
        totalESDSSupply={totalESDSSupply}
        accountStagedBalance={userStagedBalance}
        accountBondedBalance={userBondedBalance}
        accountStatus={userStatus}
        unlocked={userStatusUnlocked}
      />

      <WithdrawDeposit
        user={user}
        balance={userESDBalance}
        allowance={userESDAllowance}
        stagedBalance={userStagedBalance}
        status={userStatus}
      />

      <BondUnbond
        staged={userStagedBalance}
        bonded={userBondedBalance}
        status={userStatus}
        lockup={lockup}
      />
    </>
  );
}

export default Wallet;
