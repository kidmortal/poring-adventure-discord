/**
 * Discord has no clickable inventory, so every listing shows the id the player
 * needs to type back into the follow-up command.
 */

const EMPTY_FIELD = '​';

export function itemLabel(item: InventoryItem) {
  const enhancement = item.enhancement > 0 ? ` +${item.enhancement}` : '';
  const stack = item.stack > 1 ? `${item.stack}x ` : '';
  const equipped = item.equipped ? ' *(equipped)*' : '';
  return `\`#${item.id}\` ${stack}${item.item?.name ?? 'Unknown'}${enhancement}${equipped}`;
}

export function silver(amount: number) {
  return `${(amount ?? 0).toLocaleString('en-US')} silver`;
}

export function healthBar(current: number, max: number, size = 10) {
  if (!max) return EMPTY_FIELD;
  const filled = Math.max(0, Math.min(size, Math.round((current / max) * size)));
  return `${'█'.repeat(filled)}${'░'.repeat(size - filled)} ${current}/${max}`;
}

/** Embed fields cap at 1024 chars, so long lists are trimmed rather than rejected. */
export function fieldValue(lines: string[], emptyMessage = 'Nothing here') {
  if (!lines?.length) return emptyMessage;

  const value: string[] = [];
  let length = 0;
  for (const line of lines) {
    if (length + line.length + 1 > 1000) {
      value.push('…');
      break;
    }
    value.push(line);
    length += line.length + 1;
  }
  return value.join('\n');
}
