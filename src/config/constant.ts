export const RoleType = {
    ADMIN: 'ADMIN',
    USER: 'USER',
    DOCTOR: 'DOCTOR',
};

export const pageSize = 5;

export interface PriceRange {
    min?: number;
    max?: number;
}

/**
 * Phân tích chuỗi hoặc mảng khoảng giá, ví dụ:
 * - '100-300' ➔ { min: 100000, max: 300000 }
 * - '300-500' ➔ { min: 300000, max: 500000 }
 * - '500-1000' ➔ { min: 500000, max: 1000000 }
 * - 'tren-1000' / '>1000' / '1000+' ➔ { min: 1000000 }
 * Có thể truyền nhiều khoảng: '100-300,500-1000' hoặc ['100-300', '500-1000']
 */
export const parsePriceRanges = (input?: any): PriceRange[] => {
    if (!input) return [];

    const rawList: string[] = Array.isArray(input)
        ? input.map((i) => String(i))
        : String(input).split(',');

    const ranges: PriceRange[] = [];

    for (let item of rawList) {
        item = item.trim().toLowerCase();
        if (!item) continue;

        // Xử lý các dạng: "tren-1000", "tren-1000k", ">1000", "1000+", "over-1000"
        if (
            item.startsWith('tren-') ||
            item.startsWith('tren') ||
            item.startsWith('over-') ||
            item.startsWith('>') ||
            item.endsWith('+')
        ) {
            const numStr = item.replace(/[^0-9]/g, '');
            let min = Number(numStr);
            if (!isNaN(min) && min > 0) {
                if (min < 10000) min *= 1000; // 1000 -> 1,000,000đ
                ranges.push({ min });
            }
            continue;
        }

        // Xử lý khoảng "100-300", "300-500", "500-1000"
        if (item.includes('-')) {
            const parts = item.split('-');
            let min = Number(parts[0].trim().replace(/[^0-9]/g, ''));
            let max = Number(parts[1].trim().replace(/[^0-9]/g, ''));

            if (!isNaN(min) && !isNaN(max)) {
                if (min < 10000) min *= 1000; // 100 -> 100,000đ
                if (max < 10000) max *= 1000; // 300 -> 300,000đ
                ranges.push({ min, max });
            }
        }
    }

    return ranges;
};