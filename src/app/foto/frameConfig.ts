export type Slot = {
    [x: string]: number;
    x: number;
    y: number;
    w: number;
    h: number;
};

export type FrameConfig = {
    name: string;
    frameSrc: string;
    width: number;
    height: number;
    slots: Slot[];
};

export const FRAME_CONFIG: Record<string, FrameConfig> = {
    frame1: {
        name: "Purple Pastel",
        frameSrc: "/frame/frame1.png",
        width: 1024,
        height: 1536,
        slots: [
            { x: 217, y: 365, w: 589, h: 402 },
            { x: 217, y: 938, w: 594, h: 407 },


        ],
    },

    frame2: {
        name: "Lavender",
        frameSrc: "/frame/frame2.png",
        width: 1024,
        height: 1536,
        slots: [
            { x: 92, y: 240, w: 370, h: 294 },
            { x: 574, y: 240, w: 370, h: 294 },
            { x: 92, y: 581, w: 370, h: 294 },
            { x: 574, y: 581, w: 370, h: 294 },
            { x: 92, y: 920, w: 370, h: 294 },
            { x: 574, y: 920, w: 370, h: 294 },

        ],
    },

    frame3: {
        name: "Sakura",
        frameSrc: "/frame/frame3.png",
        width: 533,
        height: 1600,
        slots: [
            { x: 88, y: 282, w: 353, h: 412, rotate: -3 },
            { x: 105, y: 818, w: 353, h: 404, rotate: 3.3 },

        ],
    },

    frame4: {
        name: "Frame 4",
        frameSrc: "/frame/frame4.png",
        width: 600,
        height: 1800,
        slots: [
            { x: 91, y: 301, w: 435, h: 311, },
            { x: 83, y: 653, w: 433, h: 311, },
            { x: 77, y: 992, w: 434, h: 308, },
            { x: 82, y: 1338, w: 434, h: 308, },

        ],
    },

    // frame4 - frame7 tinggal tambahkan
};