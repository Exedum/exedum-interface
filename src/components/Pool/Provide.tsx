import React, { useState } from 'react';
import {
  Box, Button, IconArrowUp, IconCirclePlus
} from '@aragon/ui';
import BigNumber from 'bignumber.js';
import {
  BalanceBlock, MaxButton, PriceSection,
} from '../common/index';
import {approve, providePool} from '../../utils/web3';
import {isPos, toBaseUnitBN, toTokenUnitsBN} from '../../utils/number';
import {EXED, USDC} from "../../constants/tokens";
import {MAX_UINT256} from "../../constants/values";
import BigNumberInput from "../common/BigNumberInput";

type ProvideProps = {
  poolAddress: string,
  user: string,
  rewarded: BigNumber,
  pairBalanceESD: BigNumber,
  pairBalanceUSDC: BigNumber,
  userUSDCBalance: BigNumber,
  userUSDCAllowance: BigNumber,
  status: number,
};

function Provide({
  poolAddress, user, rewarded, pairBalanceESD, pairBalanceUSDC, userUSDCBalance, userUSDCAllowance, status
}: ProvideProps) {
  const [provideAmount, setProvideAmount] = useState(new BigNumber(0));
  const [usdcAmount, setUsdcAmount] = useState(new BigNumber(0));

  const USDCToESDRatio = pairBalanceUSDC.isZero() ? new BigNumber(1) : pairBalanceUSDC.div(pairBalanceESD);

  const onChangeAmountESD = (amountESD) => {
    if (!amountESD) {
      setProvideAmount(new BigNumber(0));
      setUsdcAmount(new BigNumber(0));
      return;
    }

    const amountESDBN = new BigNumber(amountESD)
    setProvideAmount(amountESDBN);

    const amountESDBU = toBaseUnitBN(amountESDBN, EXED.decimals);
    const newAmountUSDC = toTokenUnitsBN(
      amountESDBU.multipliedBy(USDCToESDRatio).integerValue(BigNumber.ROUND_FLOOR),
      EXED.decimals);
    setUsdcAmount(newAmountUSDC);
  };

  return (
    <div className='card'>
      <div className='card-body'>
        {userUSDCAllowance.comparedTo(MAX_UINT256.dividedBy(2)) > 0 ?
          <div style={{display: 'flex', flexWrap: 'wrap'}}>
            {/* total rewarded */}
            <div style={{flexBasis: '32%'}}>
              <BalanceBlock asset="Rewarded" balance={rewarded} suffix={"EXED"} />
            </div>
            <div style={{flexBasis: '33%'}}>
              <BalanceBlock asset="USDC Balance" balance={userUSDCBalance} suffix={"USDC"} />
            </div>
            <div style={{flexBasis: '2%'}}/>
            {/* Provide liquidity using Pool rewards */}
            <div style={{flexBasis: '33%', paddingTop: '2%'}}>
              <div style={{display: 'flex'}}>
                <div style={{width: '60%', minWidth: '6em'}}>
                  <>
                    <BigNumberInput
                      adornment="EXED"
                      value={provideAmount}
                      setter={onChangeAmountESD}
                      disabled={status === 1}
                    />
                    <PriceSection label="Requires " amt={usdcAmount} symbol=" USDC"/>
                    <MaxButton
                      onClick={() => {
                        onChangeAmountESD(rewarded);
                      }}
                    />
                  </>
                </div>
                <div style={{width: '40%', minWidth: '6em'}}>
                  <Button
                  className="btn btn-primary"
                    wide
                    icon={<IconArrowUp/>}
                    label="Provide"
                    onClick={() => {
                      providePool(
                        poolAddress,
                        toBaseUnitBN(provideAmount, EXED.decimals),
                        (hash) => setProvideAmount(new BigNumber(0))
                      );
                    }}
                    disabled={poolAddress === '' || status !== 0 || !isPos(provideAmount) || usdcAmount.isGreaterThan(userUSDCBalance)}
                  />
                </div>
              </div>
            </div>
          </div>
          :
          <div style={{display: 'flex', flexWrap: 'wrap'}}>
            {/* total rewarded */}
            <div style={{flexBasis: '32%'}}>
              <BalanceBlock asset="Rewarded" balance={rewarded} suffix={"EXED"} />
            </div>
            <div style={{flexBasis: '33%'}}>
              <BalanceBlock asset="USDC Balance" balance={userUSDCBalance} suffix={"USDC"} />
            </div>
            <div style={{flexBasis: '2%'}}/>
            {/* Approve Pool to spend USDC */}
            <div style={{flexBasis: '33%', paddingTop: '2%'}}>
              <Button
              className="btn btn-primary"
                wide
                icon={<IconCirclePlus/>}
                label="Approve"
                onClick={() => {
                  approve(USDC.addr, poolAddress);
                }}
                disabled={poolAddress === '' || user === ''}
              />
            </div>
          </div>
        }
        <div style={{width: '100%', paddingTop: '2%', textAlign: 'center'}}>
          <span style={{ opacity: 0.5 }}> Zap your rewards directly to LP by providing more USDC </span>
        </div>
      </div>
    </div>
  );
}

export default Provide;
