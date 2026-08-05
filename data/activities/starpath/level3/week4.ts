import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { getStarMap, listStarMaps, mapLandmarks } from "@/data/activities/starpath/level2/star-maps";
import { positionDetectiveTask, relativeTask, whatIsHereTask } from "@/data/activities/starpath/level2/week4StarMaps";
import { explorerFacingTask, explorerAheadTask, explorerSideTask } from "./mapViewpoint";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const SYMBOLS = ["✦", "●", "◆", "▲", "■", "☾"];
const MAP_IDS = listStarMaps().map((map) => map.id);

function withKey(task: PracticeTask): PracticeTask {
  if (task.kind !== "starpathMapLocate") return task;
  return { ...task, legend: task.landmarks.map((landmark, index) => ({ symbol: SYMBOLS[index % SYMBOLS.length]!, landmarkId: landmark.id, label: landmark.label })) };
}

export function mapSymbolTask(round: number, target: number): PracticeTask {
  const map = getStarMap(MAP_IDS[round % MAP_IDS.length]!);
  const landmarks = mapLandmarks(map);
  const legend = landmarks.map((landmark, index) => ({ symbol: SYMBOLS[index % SYMBOLS.length]!, landmarkId: landmark.id, label: landmark.label }));
  const wanted = legend[(round + 1) % legend.length]!;
  const options = [wanted, ...legend.filter((item) => item.landmarkId !== wanted.landmarkId).slice(0, 3)]
    .map((item) => ({ id: item.landmarkId, label: item.label }));
  return {
    kind: "starpathMapLocate", mode: "symbol", prompt: `Use the key. What place does ${wanted.symbol} stand for?`, speakText: `Use the map key. What place does this symbol stand for?`, target,
    mapId: map.id, cols: map.cols, rows: map.rows, landmarks, legend, options: options.slice(round % options.length).concat(options.slice(0, round % options.length)), correctOptionId: wanted.landmarkId,
    feedback: { correct: `${wanted.symbol} stands for ${wanted.label}.`, wrong: "Match the symbol to the same symbol in the map key." },
  };
}

export const mapExplorerTask = (round: number, target: number) => withKey([whatIsHereTask, relativeTask, positionDetectiveTask][round % 3]!(round, target));

export const createMapSymbolsTaskSet = () => taskSet([mapSymbolTask, mapSymbolTask, mapSymbolTask], teaching("mapLocate", "Map Symbols", "A symbol stands for a real place.", "Use the key to match each map symbol to the landmark it represents."));
export const createExplorerViewTaskSet = () => taskSet([explorerFacingTask, explorerAheadTask, explorerSideTask], teaching("mapPositions", "Explorer's View", "See the map from the explorer's place.", "Stand where the explorer stands and face the way they face. Then read what is straight ahead, and what is on their left and right."), 20);
export const createMapExplorerTaskSet = () => taskSet([mapExplorerTask, mapExplorerTask, mapExplorerTask], teaching("mapPositions", "Map Explorer", "Use every part of the map.", "Read symbols, marked places and position clues to interpret the whole map."), 30);

export const MAP_SYMBOLS_CONTENT = lessonContent({ title: "Map Symbols", brief: "Decode the map by matching each symbol to the landmark named in its key.", criteria: ["find the map key", "match a symbol", "name its landmark"], activities: ["Symbol Match", "Key Check", "Symbol Master"], kinds: ["starpathMapLocate", "starpathMapLocate", "starpathMapLocate"], reflection: "What does a map symbol do?", reflectionOptions: ["It stands for a place", "The key explains it", "It keeps the map clear"], skills: ["Interpret symbols", "Use a map key", "Connect symbols and places"], next: "Find the Landmark", createTaskSet: createMapSymbolsTaskSet });
export const EXPLORER_VIEW_CONTENT = lessonContent({ title: "Explorer's View", brief: "Stand in the explorer's place and read directions from their point of view — the way they face, then what is on their left and right.", criteria: ["find the explorer", "face the way they face", "read left and right from their view"], activities: ["Which Way?", "Straight Ahead", "Left and Right"], kinds: ["starpathMapLocate", "starpathMapLocate", "starpathMapLocate"], reflection: "How did you read the explorer's left and right?", reflectionOptions: ["I faced the way they face", "Left and right change with the facing", "I looked from the explorer's place"], skills: ["Take an explorer's viewpoint", "Read directions from a facing", "Tell left and right from their view"], next: "Map Explorer", createTaskSet: createExplorerViewTaskSet });
export const MAP_EXPLORER_CONTENT = lessonContent({ title: "Map Explorer", brief: "Interpret symbols, marked positions, relative locations and two clues across the star map.", criteria: ["read the key", "use position words", "combine clues"], activities: ["Marked Spot", "Relative Place", "Two-Clue Explorer"], kinds: ["starpathMapLocate", "starpathMapLocate", "starpathMapLocate"], reflection: "What helped you interpret the map?", reflectionOptions: ["The symbols and key", "The landmark positions", "Using both clues"], skills: ["Interpret a map", "Reason relatively", "Combine map clues"], next: "Week 4 Voyage Quiz", createTaskSet: createMapExplorerTaskSet });
