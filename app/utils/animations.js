import { withSpring, withTiming } from 'react-native-reanimated';

/* Spring configurations */
export const SpringConfigs = {
    gentle: { damping: 20, stiffness: 90, mass: 0.5 },
    bouncy: { damping: 12, stiffness: 100, mass: 0.8 },
    snappy: { damping: 15, stiffness: 150, mass: 0.3 },
    smooth: { damping: 25, stiffness: 120, mass: 0.6 },
};

/* Timing configurations */
export const TimingConfigs = {
    fast: { duration: 150 },
    medium: { duration: 250 },
    slow: { duration: 400 },
};

/* Animation presets */
export const Animations = {
    buttonPress: (toValue = 0.96) => ({
        scale: withSpring(toValue, SpringConfigs.snappy),
    }),
    buttonRelease: () => ({
        scale: withSpring(1, SpringConfigs.bouncy),
    }),
    fadeIn: (duration = 300) => ({
        opacity: withTiming(1, { duration }),
    }),
    fadeOut: (duration = 300) => ({
        opacity: withTiming(0, { duration }),
    }),
    slideUp: (toValue = 0) => ({
        translateY: withSpring(toValue, SpringConfigs.smooth),
    }),
    shake: () => ({
        translateX: withSpring(0, { damping: 2, stiffness: 500, mass: 0.5 }),
    }),
};

/* Easing functions */
export const Easings = {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

/* Helpers */
export const spring = (toValue, config = SpringConfigs.smooth) => withSpring(toValue, config);
export const timing = (toValue, config = TimingConfigs.medium) => withTiming(toValue, config);

/* Default export for Expo Router compatibility */
export default Animations;
