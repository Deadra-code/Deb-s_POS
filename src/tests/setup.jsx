import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('framer-motion', () => {
    const isMotionProp = (prop) => [
        'initial', 'animate', 'exit', 'transition', 'variants',
        'layout', 'layoutId', 'whileHover', 'whileTap', 'whileDrag', 'whileFocus',
        'drag', 'dragConstraints', 'dragElastic', 'dragMomentum', 'dragPropagation', 'dragControls',
        'onDrag', 'onDragStart', 'onDragEnd', 'onLayoutAnimationStart', 'onLayoutAnimationComplete',
        'onAnimationStart', 'onAnimationComplete', 'onUpdate', 'onPan', 'onPanStart', 'onPanEnd',
        'transformTemplate', 'custom', 'inherit'
    ].includes(prop);

    const filterProps = (props) => {
        return Object.keys(props).reduce((acc, key) => {
            if (!isMotionProp(key)) {
                acc[key] = props[key];
            }
            return acc;
        }, {});
    };

    const mockComponent = (Tag) => {
        const Mock = ({ children, ...props }) => (
            <Tag {...filterProps(props)}>{children}</Tag>
        );
        Mock.displayName = `Mock${Tag}`;
        return Mock;
    };

    return {
        motion: {
            div: mockComponent('div'),
            button: mockComponent('button'),
            span: mockComponent('span'),
            article: mockComponent('article'),
            ul: mockComponent('ul'),
            li: mockComponent('li'),
            nav: mockComponent('nav'),
            h1: mockComponent('h1'),
            h2: mockComponent('h2'),
            p: mockComponent('p'),
            form: mockComponent('form'),
            label: mockComponent('label'),
            input: mockComponent('input'),
            section: mockComponent('section'),
            header: mockComponent('header'),
            footer: mockComponent('footer'),
            aside: mockComponent('aside'),
        },
        AnimatePresence: ({ children }) => <>{children}</>,
        useMotionValue: (v) => ({ get: () => v, set: () => { }, on: () => { }, destroy: () => { }, onChange: (cb) => { cb(v); return () => { }; } }),
        useTransform: (v) => v,
        useAnimation: () => ({ start: () => Promise.resolve(), set: () => { } }),
        useSpring: (v) => v,
        animate: () => ({ stop: () => { } }),
        useScroll: () => ({ scrollY: { get: () => 0, on: () => () => { } } }),
    };
});

// Mock haptics
vi.mock('../services/haptics', () => ({
    default: {
        tap: vi.fn(),
        success: vi.fn(),
        error: vi.fn(),
        notification: vi.fn(),
    }
}));
