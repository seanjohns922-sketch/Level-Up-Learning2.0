import type { GroundMeasurementVisual } from './groundMeasurementFiveForms';

/** Read visible diagram text in display order, with the same evidence as the picture. */
export function groundMeasurementVisualSpeech(v: GroundMeasurementVisual): string {
  switch (v.task) {
    case 'capacity': {
      const source = v.labels[v.source!];
      const receiver = v.labels[1 - v.source!];
      return `Pour from ${source} until ${receiver} is full. At first: ${source}, full. ${receiver}, empty. After pouring: ${source}, ${v.equal ? 'empty' : 'water left'}. ${receiver}, full.`;
    }
    case 'duration':
      return `Both start together. ${v.labels.join('. ')}. Each strip is labelled Finished when its activity ends. The strip stops growing when the activity finishes. Press Watch both activities to replay.`;
    case 'daypart':
      return `${v.scene} ${v.description}`;
    case 'weekday':
      return `${v.context}. ${v.days!.map(day => day === '?' ? 'Missing day' : day).join(', then ')}. ${v.description}`;
    case 'routine':
      return `${v.context}. ${[1, 2, 0].map(i => v.labels[i]).join('. ')}. Tap the answers below in order.`;
    default:
      return `${v.labels.join('. ')}. ${v.description}`;
  }
}
