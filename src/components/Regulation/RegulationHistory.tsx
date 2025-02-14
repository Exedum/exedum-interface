import React, {useEffect, useState} from 'react';
import { DataView } from '@aragon/ui';

import {getAllRegulations} from '../../utils/infura';
import {EXED, EXEDS} from "../../constants/tokens";
import {formatBN, toTokenUnitsBN} from "../../utils/number";
import BigNumber from "bignumber.js";

type RegulationHistoryProps = {
  user: string,
};

type Regulation = {
  type: string,
  data: RegulationEntry
}

type RegulationEntry = {
  epoch: string;
  price: string;
  deltaRedeemable: string;
  deltaDebt: string;
  deltaBonded: string;
}

function formatPrice(type, data) {
  return type === 'NEUTRAL' ? '1.00' : formatBN(toTokenUnitsBN(new BigNumber(data.price), EXED.decimals), 3);
}

function formatDeltaRedeemable(type, data) {
  return type === 'INCREASE' ?
    '+' + formatBN(toTokenUnitsBN(new BigNumber(data.newRedeemable), EXED.decimals), 2) :
    '+0.00';
}

function formatDeltaDebt(type, data) {
  return type === 'INCREASE' ?
    '-' + formatBN(toTokenUnitsBN(new BigNumber(data.lessDebt), EXED.decimals), 2) :
    type === 'DECREASE' ?
      '+' + formatBN(toTokenUnitsBN(new BigNumber(data.newDebt), EXED.decimals), 2) :
      '+0.00';
}

function formatDeltaBonded(type, data) {
  return type === 'INCREASE' ?
    '+' + formatBN(toTokenUnitsBN(new BigNumber(data.newBonded), EXED.decimals), 2) :
    '+0.00';
}

function renderEntry({ type, data }: Regulation): string[] {
  return [
    data.epoch.toString(),
    formatPrice(type, data),
    formatDeltaRedeemable(type, data),
    formatDeltaDebt(type, data),
    formatDeltaBonded(type, data),
  ]
}

function RegulationHistory({
  user,
}: RegulationHistoryProps) {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [page, setPage] = useState(0)
  const [initialized, setInitialized] = useState(false)

  //Update User balances
  useEffect(() => {
    let isCancelled = false;

    async function updateUserInfo() {
      const [allRegulations] = await Promise.all([
        getAllRegulations(EXEDS.addr),
      ]);

      if (!isCancelled) {
        setRegulations(allRegulations);
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
  }, [user]);

  return (
    <DataView
      emptyState={{
        default: {
          displayLoader: false,
          title: 'No data available.',
          subtitle: null,
          illustration: null,
          clearLabel: null,
        },
        loading: {
          displayLoader: false,
          title: '⏳',
          subtitle: null,
          illustration: null,
          clearLabel: null,
        },
        'empty-filters': {
          displayLoader: false,
          title: 'No results found.',
          subtitle: 'We can’t find any item matching your filter selection.',
          illustration: <img src="empty-state-illustration-red.png" alt="" />,
          clearLabel: 'Clear filters',
        },
        'empty-search': {
          displayLoader: false,
          title: 'No results found.',
          subtitle: 'We can’t find any item matching your search query.',
          illustration: <img src="empty-state-illustration-red.png" alt="" />,
          clearLabel: 'Clear filters',
        },
      }}
      fields={['Epoch', 'Price', 'Δ Redeemable', 'Δ Debt', 'Δ Bonded']}
      status={ initialized ? 'default' : 'loading' }
      entries={regulations}
      entriesPerPage={10}
      page={page}
      onPageChange={setPage}
      renderEntry={renderEntry}
    />
  );
}

export default RegulationHistory;
