"use strict";
/**
 * Test script to verify Wanderbeds search API
 * This can be run manually to test different hotel IDs and parameters
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSearch = testSearch;
const wanderbedsApi_1 = require("./vendors/wanderbeds/wanderbedsApi");
async function testSearch() {
    // Test 1: Hotel 2657 (the one we're having issues with)
    console.log('=== Test 1: Hotel 2657 (problematic hotel) ===');
    try {
        const result1 = await (0, wanderbedsApi_1.searchHotels)({
            hotels: [2657],
            checkin: '2026-02-02',
            checkout: '2026-02-07',
            rooms: [{ adt: 1 }],
            nationality: 'FR',
            timout: '20',
        });
        console.log('Result 1:', JSON.stringify(result1, null, 2));
    }
    catch (err) {
        console.error('Error 1:', err.message);
    }
    // Test 2: Hotel 1646 (from docs example - known to work)
    console.log('\n=== Test 2: Hotel 1646 (from docs example) ===');
    try {
        const result2 = await (0, wanderbedsApi_1.searchHotels)({
            hotels: [1646],
            checkin: '2026-05-10',
            checkout: '2026-05-12',
            rooms: [{ adt: 2, chd: 1, age: [6] }],
            nationality: 'AE',
            timout: '20',
        });
        console.log('Result 2:', JSON.stringify(result2, null, 2));
    }
    catch (err) {
        console.error('Error 2:', err.message);
    }
    // Test 3: Hotel 2657 with different dates (matching competitor exactly)
    console.log('\n=== Test 3: Hotel 2657 with competitor dates ===');
    try {
        const result3 = await (0, wanderbedsApi_1.searchHotels)({
            hotels: [2657],
            checkin: '2026-02-02',
            checkout: '2026-02-07',
            rooms: [{ adt: 1 }],
            nationality: 'FR',
            timout: '20',
        });
        console.log('Result 3:', JSON.stringify(result3, null, 2));
    }
    catch (err) {
        console.error('Error 3:', err.message);
    }
    // Test 4: Hotel 2657 as string (in case API expects strings)
    console.log('\n=== Test 4: Hotel 2657 as string ===');
    try {
        const result4 = await (0, wanderbedsApi_1.searchHotels)({
            hotels: ['2657'],
            checkin: '2026-02-02',
            checkout: '2026-02-07',
            rooms: [{ adt: 1 }],
            nationality: 'FR',
            timout: '20',
        });
        console.log('Result 4:', JSON.stringify(result4, null, 2));
    }
    catch (err) {
        console.error('Error 4:', err.message);
    }
    // Test 5: Multiple hotels including 2657
    console.log('\n=== Test 5: Multiple hotels including 2657 ===');
    try {
        const result5 = await (0, wanderbedsApi_1.searchHotels)({
            hotels: [2657, 1646],
            checkin: '2026-02-02',
            checkout: '2026-02-07',
            rooms: [{ adt: 1 }],
            nationality: 'FR',
            timout: '20',
        });
        console.log('Result 5:', JSON.stringify(result5, null, 2));
    }
    catch (err) {
        console.error('Error 5:', err.message);
    }
}
// Run if called directly
if (require.main === module) {
    testSearch()
        .then(() => {
        console.log('\n=== Tests completed ===');
        process.exit(0);
    })
        .catch((err) => {
        console.error('Test failed:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=test-wanderbeds-search.js.map