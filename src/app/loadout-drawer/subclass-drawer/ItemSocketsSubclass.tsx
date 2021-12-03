import BungieImage from 'app/dim-ui/BungieImage';
import PressTip from 'app/dim-ui/PressTip';
import { DimItem, DimSocket, DimSocketCategory } from 'app/inventory/item-types';
import { SocketOverrides } from 'app/inventory/store/override-sockets';
import { DimPlugTooltip } from 'app/item-popup/PlugTooltip';
import Socket from 'app/item-popup/Socket';
import { useD2Definitions } from 'app/manifest/selectors';
import { useSetting } from 'app/settings/hooks';
import { getSocketsByCategoryHash, getSocketsByIndexes } from 'app/utils/socket-utils';
import { DestinySocketCategoryStyle } from 'bungie-api-ts/destiny2';
import { SocketCategoryHashes, StatHashes } from 'data/d2/generated-enums';
import _ from 'lodash';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './ItemSocketsSubclass.m.scss';
import SubclassPlugDrawer from './SubclassPlugDrawer';

interface Props {
  subclass: DimItem;
  socketOverrides: SocketOverrides;
  updateSocketOverrides(socketOverrides: SocketOverrides): void;
}

export default React.memo(function ItemSocketsSubclass({
  subclass,
  socketOverrides,
  updateSocketOverrides,
}: Props) {
  const defs = useD2Definitions();
  const [plugDrawerOpen, setPlugDrawerOpen] = useState(false);

  if (!subclass.sockets || !defs) {
    return null;
  }

  return (
    <>
      {subclass.sockets.categories.map(
        (socketCategory) =>
          socketCategory && (
            <SocketCategory
              subclass={subclass}
              socketCategory={socketCategory}
              onSocketClick={() => setPlugDrawerOpen(true)}
            />
          )
      )}
      {plugDrawerOpen &&
        ReactDOM.createPortal(
          <SubclassPlugDrawer
            subclass={subclass}
            socketOverrides={socketOverrides}
            onClose={() => setPlugDrawerOpen(false)}
            onAccept={updateSocketOverrides}
          />,
          document.body
        )}
    </>
  );
});

function SocketCategory({
  subclass,
  socketCategory,
  onSocketClick,
}: {
  subclass: DimItem;
  socketCategory: DimSocketCategory;
  onSocketClick(): void;
}) {
  const isFragment = socketCategory.category.hash === SocketCategoryHashes.Fragments;
  let sockets = getSocketsByIndexes(subclass.sockets!, socketCategory.socketIndexes);

  if (isFragment) {
    const aspects = _.compact(
      getSocketsByCategoryHash(subclass.sockets!, SocketCategoryHashes.Aspects).map(
        (socket) => socket.plugged?.plugDef
      )
    );
    const availableFragments = _.sumBy(
      aspects,
      (aspect) =>
        aspect.investmentStats.find((stat) => stat.statTypeHash === StatHashes.AspectEnergyCapacity)
          ?.value || 0
    );

    sockets = sockets.slice(0, availableFragments);
  }

  if (!sockets.length) {
    return null;
  }

  return (
    <div className={styles.category}>
      <div className={styles.title}>{socketCategory.category.displayProperties.name}</div>
      <div className={styles.sockets}>
        {sockets.map((dimSocket) => (
          <div key={dimSocket.socketIndex} className={styles.socketCategory}>
            <SocketForCategory
              socketCategory={socketCategory}
              item={subclass}
              dimSocket={dimSocket}
              onClick={onSocketClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SocketForCategory({
  socketCategory,
  item,
  dimSocket,
  onClick,
}: {
  socketCategory: DimSocketCategory;
  item: DimItem;
  dimSocket: DimSocket;
  onClick(): void;
}) {
  const [itemSize] = useSetting('itemSize');
  if (
    socketCategory.category.categoryStyle === DestinySocketCategoryStyle.Supers &&
    dimSocket.plugged
  ) {
    const viewBoxMax = itemSize - 1;
    const viewBoxHalf = itemSize / 2 - 1;
    return (
      <PressTip tooltip={<DimPlugTooltip item={item} plug={dimSocket.plugged} />}>
        <div className={styles.super}>
          <BungieImage src={dimSocket.plugged.plugDef.displayProperties.icon} />
          <svg viewBox={`0 0 ${viewBoxMax} ${viewBoxMax}`} className={styles.superOutline}>
            <polygon
              strokeDasharray="265.87216"
              style={{ strokeDashoffset: 0 }}
              fillOpacity="0"
              stroke="#ddd"
              strokeWidth="1"
              points={`${viewBoxHalf},0 ${viewBoxMax},${viewBoxHalf} ${viewBoxHalf},${viewBoxMax} 0,${viewBoxHalf}`}
              strokeLinecap="butt"
            />
          </svg>
        </div>
      </PressTip>
    );
  }

  return (
    <div className={styles.socket}>
      <Socket item={item} socket={dimSocket} onClick={onClick} />
    </div>
  );
}
