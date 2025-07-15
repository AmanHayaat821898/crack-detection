import BezierEasing from 'bezier-easing';
import { gsap } from 'gsap';
import CustomEase from 'gsap/dist/CustomEase';

export enum EaseType {
  IN = 'easeIn',
  IN_SOFT = 'easeInSoft',
  OUT = 'easeOut',
  OUT_SOFT = 'easeOutSoft',
  IN_OUT = 'easeInOut',
  EMBELLISHMENT = 'embellishment',
  BASIC_BUTTER = 'basicButter',
  DEFAULT = 'default',
  MICRO_BOUNCE = 'microBounce',
}

const config: Readonly<Record<EaseType, number[]>> = {
  [EaseType.IN]: [0.49, 0.025, 0.65, 0.65],
  [EaseType.IN_SOFT]: [0.995, 0.005, 0.665, 1],
  [EaseType.OUT]: [0.28, 0.44, 0.49, 1],
  [EaseType.IN_OUT]: [0.49, 0.025, 0.49, 1],
  [EaseType.OUT_SOFT]: [0.38, 0.05, 0.015, 1.005],
  [EaseType.EMBELLISHMENT]: [0.42, 0, 0, 1],
  [EaseType.BASIC_BUTTER]: [0.42, 0, 0.28, 0.99],
  [EaseType.DEFAULT]: [0.25, 0.1, 0.25, 1],
  [EaseType.MICRO_BOUNCE]: [0, 0.44, 0.6, 1],
};

class Easing {
  private easingFunctions: Record<string, BezierEasing.EasingFunction>;

  constructor() {
    this.easingFunctions = {};
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(CustomEase);

      for (const [key, value] of Object.entries(config)) {
        if (value && value.length === 4) {
          this.easingFunctions[key] = BezierEasing(value[0], value[1], value[2], value[3]);

          CustomEase.create(key, value.join(','));
        } else {
          console.warn(`Invalid Bezier Curve '${key}'; Value: ${value}`);
        }
      }
    }
  }

  getEasingFunction(name: EaseType): BezierEasing.EasingFunction {
    return this.easingFunctions[name];
  }
}

const EasingInstance = new Easing();

export default EasingInstance;
