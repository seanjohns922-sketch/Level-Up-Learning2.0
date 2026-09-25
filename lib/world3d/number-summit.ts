import { volcanoFloor } from './volcano-expedition';
import { crossroadsFloor } from './expedition-crossroads';
export type SummitPoint = [number, number, number];
// All six realms end at their lesson gate. No separate Number Nexus course.
export function summitFloor(x:number,z:number,_unlocked:number,volcanoOpen=false,_currentHeight?:number):number|null {
 void _unlocked; void _currentHeight;
 return volcanoFloor(x,z,volcanoOpen)??crossroadsFloor(x,z);
}
