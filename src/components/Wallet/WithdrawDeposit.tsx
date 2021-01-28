import React, { useState } from 'react';
import {
  Box, Button, IconCirclePlus, IconCircleMinus, IconLock
} from '@aragon/ui';
import BigNumber from 'bignumber.js';
import {
  BalanceBlock, MaxButton,
} from '../common/index';
import {approve, deposit, withdraw} from '../../utils/web3';
import {isPos, toBaseUnitBN} from '../../utils/number';
import {EXED, EXEDS} from "../../constants/tokens";
import {MAX_UINT256} from "../../constants/values";
import BigNumberInput from "../common/BigNumberInput";

type WithdrawDepositProps = {
  user: string
  balance: BigNumber,
  allowance: BigNumber,
  stagedBalance: BigNumber,
  status: number
};

function WithdrawDeposit({
  user, balance, allowance, stagedBalance, status
}: WithdrawDepositProps) {
  const [depositAmount, setDepositAmount] = useState(new BigNumber(0));
  const [withdrawAmount, setWithdrawAmount] = useState(new BigNumber(0));

  return (
    <div className='card'>
      <div className='card-body'>
        {allowance.comparedTo(MAX_UINT256) === 0 ?
          <div style={{display: 'flex', flexWrap: 'wrap'}}>
            {/* total Issued */}
            <div style={{flexBasis: '32%'}}>
              <BalanceBlock asset="Staged" balance={stagedBalance} suffix={"EXED"}/>
            </div>
            {/* Deposit EXED into DAO */}
            <div style={{flexBasis: '33%', paddingTop: '2%'}}>
              <div style={{display: 'flex'}}>
                <div style={{width: '60%', minWidth: '6em'}}>
                  <>
                    <BigNumberInput
                      adornment="EXED"
                      value={depositAmount}
                      setter={setDepositAmount}
                      disabled={status !== 0}
                    />
                    <MaxButton
                      onClick={() => {
                        setDepositAmount(balance);
                      }}
                    />
                  </>
                </div>
                <div style={{width: '40%', minWidth: '6em'}}>
                  <Button
                  className="btn btn-primary"
                    wide
                    icon={status === 0 ? <IconCirclePlus/> : <IconLock/>}
                    label="Deposit"
                    onClick={() => {
                      deposit(
                        EXEDS.addr,
                        toBaseUnitBN(depositAmount, EXED.decimals),
                      );
                    }}
                    disabled={status === 1 || !isPos(depositAmount) || depositAmount.isGreaterThan(balance)}
                  />
                </div>
              </div>
            </div>
            <div style={{flexBasis: '2%'}}/>
            {/* Withdraw EXED from DAO */}
            <div style={{flexBasis: '33%', paddingTop: '2%'}}>
              <div style={{display: 'flex'}}>
                <div style={{width: '60%', minWidth: '7em'}}>
                  <>
                    <BigNumberInput
                      adornment="EXED"
                      value={withdrawAmount}
                      setter={setWithdrawAmount}
                      disabled={status !== 0}
                    />
                    <MaxButton
                      onClick={() => {
                        setWithdrawAmount(stagedBalance);
                      }}
                    />
                  </>
                </div>
                <div style={{width: '40%', minWidth: '7em'}}>
                  <Button
                  className="btn btn-primary"
                    wide
                    icon={status === 0 ? <IconCircleMinus/> : <IconLock/>}
                    label="Withdraw"
                    onClick={() => {
                      withdraw(
                        EXEDS.addr,
                        toBaseUnitBN(withdrawAmount, EXED.decimals),
                      );
                    }}
                    disabled={status === 1 || !isPos(withdrawAmount) || withdrawAmount.isGreaterThan(stagedBalance)}
                  />
                </div>
              </div>
            </div>
          </div>
          :
          <div style={{display: 'flex', flexWrap: 'wrap'}}>
            {/* total Issued */}
            <div style={{flexBasis: '32%'}}>
              <BalanceBlock asset="Staged" balance={stagedBalance} suffix={"EXED"}/>
            </div>
            <div style={{flexBasis: '35%'}}/>
            {/* Approve DAO to spend EXED */}
            <div style={{flexBasis: '33%', paddingTop: '2%'}}>
              <Button
              className="btn btn-primary"
                wide
                icon={<IconCirclePlus />}
                label="Approve"
                onClick={() => {
                  approve(EXED.addr, EXEDS.addr);
                }}
                disabled={user === ''}
              />
            </div>
          </div>
        }
      </div>
    </div>
  );
}

export default WithdrawDeposit;
