const wordArray = (string = '') => {
    return string.split(" ");
};

levenshteinDistance = (groundTruth, predicted) => {
    if (groundTruth.length === 0 || predicted.length === 0) {
        return Math.max(groundTruth.split(" ").length, predicted.split(" ").length);
    }

    let [groundTruthWords, predictedWords] = [
        wordArray(groundTruth),
        wordArray(predicted)
    ];

    let [length, height] = [groundTruthWords.length, predictedWords.length];
    let matrix = [];

    for (let i = 0; i < height; i++) {
        matrix.push([]);
        for (let j = 0; j < length; j++) {
            matrix[i].push(-1);
        }
    }

    for (let column = 0; column < height; column++) {
        for (let row = 0; row < length; row++) {
            if (column === 0 && row === 0) {
                matrix[column][row] = (groundTruthWords[0] === predictedWords[0]) ? 0 : 1;
            } else if (row === 0) {
                matrix[column][row] = matrix[column - 1][0] + ((groundTruthWords[row] === predictedWords[column]) ? 0 : 1);
            } else if (column === 0) {
                matrix[column][row] = matrix[0][row - 1] + ((groundTruthWords[row] === predictedWords[column]) ? 0 : 1);
            } else {
                matrix[column][row] =
                    Math.min(
                        (matrix[column - 1][row] + 1),
                        (matrix[column][row - 1] + 1),
                        (matrix[column - 1][row - 1] + (groundTruthWords[row] === predictedWords[column] ? 0 : 1))
                    );
            }
        }
    }

    return {
        matrix,
        distance: matrix[height - 1][length - 1],
        groundTruthWords,
        predictedWords
    };
};

module.exports = {
    levenshteinDistance
};