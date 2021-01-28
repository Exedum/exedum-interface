import React, { useState, useEffect } from 'react';
import { LinkBase, Box } from '@aragon/ui';

import BigNumber from 'bignumber.js';
import { getTokenBalance } from '../../utils/infura';
import { toTokenUnitsBN } from '../../utils/number';

import TradePageHeader from './Header';
import {EXED, UNI, USDC} from "../../constants/tokens";
import IconHeader from "../common/IconHeader";


function UniswapPool({ user }: {user: string}) {
  const [pairBalanceESD, setPairBalanceESD] = useState(new BigNumber(0));
  const [pairBalanceUSDC, setPairBalanceUSDC] = useState(new BigNumber(0));

  useEffect(() => {
    let isCancelled = false;

    async function updateUserInfo() {
      const [
        pairBalanceESDStr, pairBalanceUSDCStr,
      ] = await Promise.all([
        getTokenBalance(EXED.addr, UNI.addr),
        getTokenBalance(USDC.addr, UNI.addr),
      ]);

      if (!isCancelled) {
        setPairBalanceESD(toTokenUnitsBN(pairBalanceESDStr, EXED.decimals));
        setPairBalanceUSDC(toTokenUnitsBN(pairBalanceUSDCStr, USDC.decimals));
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
      <IconHeader icon={<i className="fas fa-exchange-alt"/>} text="Trade"/>

      <TradePageHeader
        pairBalanceESD={pairBalanceESD}
        pairBalanceUSDC={pairBalanceUSDC}
        uniswapPair={UNI.addr}
      />

      <div style={{ padding: '1%', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flexBasis: '30%', marginRight: '3%', marginLeft: '2%'  }}>
          <MainButton
            title="Info"
            description="View EXED-USDC pool stats."
            icon={<i className="fas fa-chart-area"/>}
            href={"https://info.uniswap.org/pair/0xbAa3a4Eb65D46BFC94d21dd30228Ad7A94d708dd"}
          />
        </div>

        <div style={{ flexBasis: '30%' }}>
          <MainButton
            title="Trade"
            description="Trade Exedum tokens."
            icon={<i className="fas fa-exchange-alt"/>}
            href={"https://app.uniswap.org/#/swap?inputCurrency=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&outputCurrency=0x9baf5147505b980b2674aab556a51e03b3082efe"}
          />
        </div>

        <div style={{ flexBasis: '30%', marginLeft: '3%', marginRight: '2%' }}>
          <MainButton
            title="Supply"
            description="Supply and redeem liquidity."
            icon={<i className="fas fa-water"/>}
            href={"https://app.uniswap.org/#/add/0x9baf5147505b980b2674aab556a51e03b3082efe/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}
          />
        </div>
      </div>
    </>
  );
}

type MainButtonProps = {
  title: string,
  description: string,
  icon: any,
  href:string
}

function MainButton({
  title, description, icon, href,
}:MainButtonProps) {
  return (
    <LinkBase href={href} style={{ width: '100%' }}>
      <div className='card'>
        <div className='card-body'>
          <div style={{ padding: 10, fontSize: 18 }}>
            {title}
          </div>
          <span style={{ fontSize: 48 }}>
            {icon}
          </span>
          {/*<img alt="icon" style={{ padding: 10, height: 64 }} src={iconUrl} />*/}
          <div style={{ paddingTop: 5, opacity: 0.5 }}>
            {' '}
            {description}
            {' '}
          </div>
        </div>
      </div>
    </LinkBase>
  );
}

export default UniswapPool;
