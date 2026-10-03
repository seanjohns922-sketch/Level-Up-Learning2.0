/** Decorative context only. Never supplies a quantity, scale, or answer. */
export function number7ContextArt(prompt: string): 'tank'|'rope'|'jug'|'bottle'|'bag'|'notebook'|'ticket'|'parcel'|'lights'|null {
  if (/\btank\b/i.test(prompt)) return 'tank';
  if (/\brope\b/i.test(prompt)) return 'rope';
  if (/\bjug\b|concentrate|mixture|\bdrink\b/i.test(prompt)) return 'jug';
  if (/\bbottles?\b/i.test(prompt)) return 'bottle';
  if (/\bnotebooks?\b/i.test(prompt)) return 'notebook';
  if (/\bbag\b.*(?:off|delivery)|store [ab]/i.test(prompt)) return 'bag';
  if (/\btickets?\b|attend an event/i.test(prompt)) return 'ticket';
  if (/warehouse|\bkits\b|\bsupplies\b/i.test(prompt)) return 'parcel';
  if (/lights flash/i.test(prompt)) return 'lights';
  return null;
}
