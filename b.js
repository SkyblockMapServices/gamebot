const fs = require("fs")

const originalArray = [
    [{ x: 0, z: 0, block: 'black_carpet' }, { x: 1, z: 0, block: 'red_carpet' }],
    [{ x: 0, z: 1, block: 'red_carpet' }, { x: 1, z: 1, block: 'blue_carpet' }],
];

const newArray = [];

const numRows = 128;
const numCols = 128;

for (let i = 0; i <= numRows; i++) {
    const row = [];
    for (let j = 0; j <= numCols; j++) {
        // Use modulo to cycle through the original pattern
        const originalRow = originalArray[i % originalArray.length];
        const originalCell = originalRow[j % originalRow.length];

        // Clone the original cell and adjust its position
        const newCell = { x: j, z: i, block: originalCell.block };
        row.push(newCell);
    }
    newArray.push(row);
}

// Now newArray is a 128x128 array based on the original pattern

fs.writeFileSync("./data.json", JSON.stringify(newArray))
