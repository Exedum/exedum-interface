import React, { useState, useEffect } from 'react';
import { Header } from '@aragon/ui';

import {
  getImplementation,
  getStatusOf,
  getTokenBalance,
  getTokenTotalSupply,
} from '../../utils/infura';
import {EXEDS} from "../../constants/tokens";
import {toTokenUnitsBN} from "../../utils/number";
import BigNumber from "bignumber.js";
import GovernanceHeader from "./Header";
import ProposeCandidate from "./ProposeCandidate";
import CandidateHistory from "./CandidateHistory";
import IconHeader from "../common/IconHeader";
import {canPropose} from "../../utils/gov";

function Governance({ user }: {user: string}) {

  const [stake, setStake] = useState(new BigNumber(0));
  const [totalStake, setTotalStake] = useState(new BigNumber(0));
  const [userStatus, setUserStatus] = useState(0);
  const [implementation, setImplementation] = useState("0x");

  useEffect(() => {
    if (user === '') {
      setStake(new BigNumber(0));
      setUserStatus(0);
      return;
    }
    let isCancelled = false;

    async function updateUserInfo() {
      const [statusStr, stakeStr] = await Promise.all([
        getStatusOf(EXEDS.addr, user),
        getTokenBalance(EXEDS.addr, user),
      ]);

      if (!isCancelled) {
        setStake(toTokenUnitsBN(stakeStr, EXEDS.decimals));
        setUserStatus(parseInt(statusStr, 10));
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

  useEffect(() => {
    let isCancelled = false;

    async function updateUserInfo() {
      const [totalStakeStr, implementationStr] = await Promise.all([
        getTokenTotalSupply(EXEDS.addr),
        getImplementation(EXEDS.addr),
      ]);

      if (!isCancelled) {
        setTotalStake(toTokenUnitsBN(totalStakeStr, EXEDS.decimals));
        setImplementation(implementationStr)
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
      <IconHeader icon={<i className="fas fa-poll"/>} text="Governance"/>

      <GovernanceHeader
        stake={stake}
        totalStake={totalStake}
        accountStatus={userStatus}
        implementation={implementation}
      />

      {
        canPropose(stake, totalStake) ?
          <>
            <Header primary="Propose Candidate"/>
            <ProposeCandidate
              user={user}
              stake={stake}
              totalStake={totalStake}
              accountStatus={userStatus}
            />
          </>
          :
          ''
      }

      <Header primary="Candidate History" />

      <CandidateHistory user={user}/>
    </>
  );
}

export default Governance;
