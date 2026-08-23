// image size default and limit value
const IMG_MIN_WIDTH_PERCENT = 1;
const IMG_MAX_WIDTH_PERCENT = 100;
const IMG_DEFAULT_WIDTH_SIZE = 100;

// px 單位模式下的預設值/下限——跟 % 模式是各自獨立的範圍，px 沒有上限
// （固定像素本來就沒有「相對誰的 100%」這種概念）。
const IMG_MIN_SIZE_PX = 1;
const IMG_DEFAULT_WIDTH_PX = 500;
const IMG_DEFAULT_HEIGHT_PX = 500;

export {
    IMG_MIN_WIDTH_PERCENT,
    IMG_MAX_WIDTH_PERCENT,
    IMG_DEFAULT_WIDTH_SIZE,
    IMG_MIN_SIZE_PX,
    IMG_DEFAULT_WIDTH_PX,
    IMG_DEFAULT_HEIGHT_PX,
};
